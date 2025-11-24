// Car.tsx
import React from "react";
import { useGLTF } from "@react-three/drei";

type CarProps = React.JSX.IntrinsicElements["group"] & {
  url?: string;
};

export default function Car({ url = "elantra_n.glb", ...props }: CarProps) {
  const { scene } = useGLTF(url);

  return (
    <group {...props}>
      <primitive object={scene} />
    </group>
  );
}

// 선택: 미리 로드
useGLTF.preload("elantra_n.glb");
