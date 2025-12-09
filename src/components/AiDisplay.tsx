import React, { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import Car from "./Car";
import Cone from "./Cone";
import { useObstacleStore } from "@/store/useObstacleStore";
import { useConfigureStore } from "@/store/useConfigreStore";
import { useCarStore } from "@/store/useCarStore";
import { toast } from "sonner";
// import { OrbitControls } from "@react-three/drei";
// import * as THREE from "three";

type DisplayProps = {
  carState: {
    x: number;
    y: number;
    stop: boolean;
  };
  laneCount: number;
};

// Canvas 안에서만 useFrame을 사용하기 때문에 별도 컴포넌트로 분리
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
  const moveForward = useObstacleStore((s) => s.moveForward);
  const clear = useObstacleStore((s) => s.clear);
  const setTargetLane = useCarStore((s) => s.setTargetLane);
  const learn = useConfigureStore((s) => s.learn);
  const setLearn = useConfigureStore((s) => s.setLearn);

  useFrame((_, delta) => {
    if (!running) return;
    // 일시정지/탭 비활성화 등으로 delta가 튈 때 점프하지 않게 클램프
    const cappedDelta = Math.min(delta, 0.1);
    moveForward(13 * cappedDelta);

    // 이동 이후 충돌 검사
    const obstacles = useObstacleStore.getState().obstacles;
    const carX = useCarStore.getState().x;
    const currentLane = Math.round(
      Math.min(
        laneCount - 1,
        Math.max(0, carX / laneWidth + (laneCount - 1) / 2)
      )
    );

    for (const o of obstacles) {
      // 같은 차선에 있고, 차량 앞쪽 근접 구간에서만 충돌로 처리
      if (o.lane !== currentLane) continue;
      // 차량보다 뒤(-)에 있거나 멀리 앞쪽이면 스킵
      if (o.z < carZ - 0.5 || o.z > carZ + 0.8) continue;
      const ox = laneCenterX(o.lane);
      const hitX = Math.abs(ox - carX) < 0.4; // 좌우 여유 더 축소
      const hitZ = Math.abs(o.z - carZ) < 0.4; // 앞뒤 여유 더 축소
      if (hitX && hitZ) {
        clear();
        setLearn(learn - 1);
        toast.error("충돌이 발생되었습니다.");
        break;
      }
    }

    // 간단한 회피: 동일 차선에 가까운 장애물이 있으면 비어있는 옆 차선으로 타겟 변경
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

// 차선을 부드럽게 이동시키는 컴포넌트
const CarController = ({
  laneCenterX,
  laneCount,
}: {
  laneCenterX: (laneIndex: number) => number;
  laneCount: number;
}) => {
  const running = useConfigureStore((s) => s.running);
  const laneChangeSpeed = 10; // units/sec, 더 빠르게 차선 변경

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
  const laneWidth = 4; // 차선 하나 폭 (X 방향)
  const roadLength = 250; // 앞으로 쭉 뻗는 길이 (Z 방향)
  const { laneCount } = props;
  const obstacles = useObstacleStore((s) => s.obstacles);
  const carX = useCarStore((s) => s.x);
  const carZ = useCarStore((s) => s.z);
  const setTargetLane = useCarStore((s) => s.setTargetLane);
  const setX = useCarStore((s) => s.setX);

  const centerOffset = (laneCount - 1) / 2; // 짝/홀 상관없이 중앙 기준
  const roadWidth = laneWidth * laneCount;

  // laneIndex(0~laneCount-1) → 차선 중앙 x좌표
  const laneCenterX = (laneIndex: number) =>
    (laneIndex - centerOffset) * laneWidth;

  // 차선 경계 인덱스(…, -0.5, 0.5, 1.5, …) → x좌표
  const laneBoundaryX = (boundaryIndex: number) =>
    (boundaryIndex - centerOffset) * laneWidth;

  // 도로와 장애물이 카메라 원점 주변에 보이도록 중앙 배치
  const roadZ = 0;

  // 차선 수가 바뀌면 차량을 중앙 차선으로 재배치
  React.useEffect(() => {
    const centerLane = (laneCount - 1) / 2;
    setTargetLane(centerLane);
    setX(laneCenterX(centerLane));
  }, [laneCount, setTargetLane, setX]);

  return (
    <div className="size-full p-3 bg-[#404040]">
      <Canvas
        camera={{
          position: [0, 10, 18], // 차 뒤·위
          fov: 45,
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 15, 10]} intensity={2} />

        {/* 이동 로직만 담당하는 헬퍼 */}
        <ObstacleMover
          carZ={carZ}
          laneCenterX={laneCenterX}
          laneCount={laneCount}
          laneWidth={laneWidth}
        />
        <CarController laneCenterX={laneCenterX} laneCount={laneCount} />

        {/* 도로: Z+ 방향으로 뻗는 평면 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, roadZ]}>
          {/* X: roadWidth, Z: roadLength */}
          <planeGeometry args={[roadWidth, roadLength]} />
          <meshStandardMaterial color="#585858" />
        </mesh>

        {/* 회색 차선 분리선 (laneCount-1개) */}
        {Array.from({ length: laneCount - 1 }, (_, i) => {
          // i번째 경계 = i + 0.5 (0.5, 1.5, 2.5, ...)
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

        {/* 장애물은 도로 메쉬 회전에 휘둘리지 않게 별도 배치 */}
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
