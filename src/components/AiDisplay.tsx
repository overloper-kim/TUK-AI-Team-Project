import React, { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import Car from "./Car";
import Cone from "./Cone";
import { useObstacleStore } from "@/store/useObstacleStore";
import { useConfigureStore } from "@/store/useConfigreStore";
import { useCarStore } from "@/store/useCarStore";
import { toast } from "sonner";

type DisplayProps = {
  carState: {
    x: number;
    y: number;
    stop: boolean;
  };
  laneCount: number;
};

type ObstacleMoverProps = {
  carZ: number;
  laneCenterX: (laneIndex: number) => number;
  laneCount: number;
  laneWidth: number;
};

const ObstacleMover = ({
  carZ,
  laneCenterX,
  laneCount,
  laneWidth,
}: ObstacleMoverProps) => {
  const running = useConfigureStore((s) => s.running);
  const setRunning = useConfigureStore((s) => s.setRunning);
  const moveForward = useObstacleStore((s) => s.moveForward);
  const clear = useObstacleStore((s) => s.clear);
  const setTargetLane = useCarStore((s) => s.setTargetLane);
  const learn = useConfigureStore((s) => s.learn);
  const setLearn = useConfigureStore((s) => s.setLearn);

  useFrame((_, delta) => {
    if (!running) return;
    // 백엔드에서 주는 위치를 그대로 사용하므로 전진 이동은 생략

    const obstacles = useObstacleStore.getState().obstacles;
    const carX = useCarStore.getState().x;
    const currentLane = Math.round(
      Math.min(
        laneCount - 1,
        Math.max(0, carX / laneWidth + (laneCount - 1) / 2)
      )
    );

    for (const o of obstacles) {
      if (o.lane !== currentLane) continue;
      if (o.z < carZ - 0.5 || o.z > carZ + 0.8) continue;
      const ox = laneCenterX(o.lane);
      const hitX = Math.abs(ox - carX) < 0.4;
      const hitZ = Math.abs(o.z - carZ) < 0.4;
      if (hitX && hitZ) {
        clear();
        const nextLearn = Math.max(0, learn - 1);
        setLearn(nextLearn);
        if (nextLearn === 0) {
          setRunning(false);
        }
        toast.error("충돌이 발생했습니다");
        break;
      }
    }

    const sameLane = obstacles
      .filter((o) => o.lane === currentLane && o.z > carZ)
      .sort((a, b) => a.z - b.z)[0];
    if (sameLane && sameLane.z - carZ < 14) {
      const candidates = [currentLane - 1, currentLane + 1].filter(
        (l) => l >= 0 && l < laneCount
      );
      const safeLane = candidates.find(
        (l) => !obstacles.some((o) => o.lane === l && Math.abs(o.z - carZ) < 8)
      );
      if (safeLane !== undefined) {
        setTargetLane(safeLane);
      }
    }
  });

  return null;
};

const CarController = ({
  laneCenterX,
  laneCount,
}: {
  laneCenterX: (laneIndex: number) => number;
  laneCount: number;
}) => {
  const running = useConfigureStore((s) => s.running);
  const laneChangeSpeed = 10; // units/sec

  useFrame((_, delta) => {
    if (!running) return;
    const { targetLane, x, setX } = useCarStore.getState();
    const clampedLane = Math.min(laneCount - 1, Math.max(0, targetLane));
    const targetX = laneCenterX(clampedLane);
    const dx = targetX - x;
    if (Math.abs(dx) < 0.01) {
      setX(targetX);
      return;
    }
    const step = Math.sign(dx) * laneChangeSpeed * delta;
    if (Math.abs(step) >= Math.abs(dx)) {
      setX(targetX);
    } else {
      setX(x + step);
    }
  });

  return null;
};

function AiDisplay(props: DisplayProps): React.ReactElement {
  const laneWidth = 4;
  const roadLength = 250;
  const { laneCount } = props;
  const obstacles = useObstacleStore((s) => s.obstacles);
  const carX = useCarStore((s) => s.x);
  const carZ = useCarStore((s) => s.z);
  const setTargetLane = useCarStore((s) => s.setTargetLane);
  const setX = useCarStore((s) => s.setX);
  const running = useConfigureStore((s) => s.running);
  const collisionRef = React.useRef(0);

  const centerOffset = (laneCount - 1) / 2;
  const roadWidth = laneWidth * laneCount;

  const laneCenterX = (laneIndex: number) =>
    (laneIndex - centerOffset) * laneWidth;

  const laneBoundaryX = (boundaryIndex: number) =>
    (boundaryIndex - centerOffset) * laneWidth;

  const roadZ = 0;

  React.useEffect(() => {
    const centerLane = (laneCount - 1) / 2;
    setTargetLane(centerLane);
    setX(laneCenterX(centerLane));
  }, [laneCount, setTargetLane, setX]);

  // WebSocket으로 RL 서버 상태를 수신
  React.useEffect(() => {
    if (!running) return;

    const ws = new WebSocket("ws://localhost:3000/ws_simulator");
    let intentionalClose = false;

    ws.onopen = () => {
      const { lane, obs, frequency, learn } = useConfigureStore.getState();
      ws.send(
        JSON.stringify({
          lane,
          obs,
          frequency,
          learn: Boolean(learn),
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === "init") {
          const { state } = data;
          if (state?.car_lane !== undefined) {
            useCarStore.getState().setTargetLane(state.car_lane);
          }
          if (Array.isArray(state?.obstacles)) {
            useObstacleStore.getState().syncFromBackend(state.obstacles);
          }
          collisionRef.current = 0;
          return;
        }

        if (data?.type !== "step") return;

        const { state, collisions } = data;

        if (state?.car_lane !== undefined) {
          useCarStore.getState().setTargetLane(state.car_lane);
        }

        if (Array.isArray(state?.obstacles)) {
          useObstacleStore.getState().syncFromBackend(state.obstacles);
        }

        if (
          typeof collisions === "number" &&
          collisions > collisionRef.current
        ) {
          toast.error(`충돌 발생 (누적 ${collisions}회)`);
        }
        if (typeof collisions === "number") {
          collisionRef.current = collisions;
        }
      } catch (err) {
        console.error("Invalid step payload:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("Simulation stream error:", err);
      if (!intentionalClose) {
        toast.error("시뮬레이션 스트림 오류");
      }
    };

    ws.onclose = (e) => {
      if (!intentionalClose) {
        console.warn("Simulation stream closed", e.code, e.reason);
      }
    };

    return () => {
      intentionalClose = true;
      ws.close();
    };
  }, [running]);

  return (
    <div className="size-full p-3 bg-[#404040]">
      <Canvas
        camera={{
          position: [0, 10, 18],
          fov: 45,
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 15, 10]} intensity={2} />

        <ObstacleMover
          carZ={carZ}
          laneCenterX={laneCenterX}
          laneCount={laneCount}
          laneWidth={laneWidth}
        />
        <CarController laneCenterX={laneCenterX} laneCount={laneCount} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, roadZ]}>
          <planeGeometry args={[roadWidth, roadLength]} />
          <meshStandardMaterial color="#585858" />
        </mesh>

        {Array.from({ length: laneCount - 1 }, (_, i) => {
          const boundaryIndex = i + 0.5;
          const x = laneBoundaryX(boundaryIndex);
          return (
            <mesh
              key={i}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[x, 0.01, roadZ]}
            >
              <planeGeometry args={[0.08, roadLength]} />
              <meshBasicMaterial color="#d7d7d7" />
            </mesh>
          );
        })}

        <Suspense fallback={null}>
          {obstacles.map((o) => {
            const x = laneCenterX(o.lane);
            return (
              <Cone
                key={o.id}
                position={[x, 0.35, o.z]}
                scale={0.05}
                rotation={[0, Math.PI, 0]}
                url="/cone.glb"
              />
            );
          })}
        </Suspense>

        <Suspense fallback={null}>
          <Car position={[carX, 0.4, carZ]} scale={130} rotation={[0, Math.PI, 0]} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default AiDisplay;
