import React from "react";
import { useGLTF } from "@react-three/drei";

type ConeProps = React.JSX.IntrinsicElements["group"] & {
  url?: string;
};

function Cone({ url = "cone.glb", ...props}: ConeProps): React.ReactElement {
  const { scene } = useGLTF(url);
  return (
    <group {...props}>
      <primitive object={scene} />
    </group>
  );
}
// 선택: 미리 로드
useGLTF.preload("cone.glb");

export default Cone;