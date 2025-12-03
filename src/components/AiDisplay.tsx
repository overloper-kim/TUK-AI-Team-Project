import React, { Suspense } from "react";
import { Canvas, } from "@react-three/fiber";
import Car from "./Car";
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

function AiDisplay(props: DisplayProps): React.ReactElement {
  const laneWidth = 4;           // 차선 하나 폭 (X 방향)
  const roadLength = 250;        // 앞으로 쭉 뻗는 길이 (Z 방향)
  const { laneCount } = props;

  const centerOffset = (laneCount - 1) / 2; // 짝/홀 상관없이 중앙 기준
  const roadWidth = laneWidth * laneCount;

  // laneIndex(0~laneCount-1) → 차선 중앙 x좌표
  const laneCenterX = (laneIndex: number) =>
    (laneIndex - centerOffset) * laneWidth;

  // 차선 경계 인덱스(…, -0.5, 0.5, 1.5, …) → x좌표
  const laneBoundaryX = (boundaryIndex: number) =>
    (boundaryIndex - centerOffset) * laneWidth;

  // 🚗 차량이 속한 차선 (0 ~ laneCount-1 사이로 클램핑)
  const carLaneIndex = Math.min(
    laneCount - 1,
    Math.max(0, Math.round(props.carState.x)),
  );

  const roadZ = roadLength / 4;

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

        <Suspense fallback={null}>
          <Car position={[0, 0.4, 6]} scale={130} rotation={[0, Math.PI, 0]} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default AiDisplay;
