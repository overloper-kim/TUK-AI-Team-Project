import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";

type ConeProps = React.JSX.IntrinsicElements["group"] & {
  url?: string;
};

function Cone({ url = "cone.glb", ...props}: ConeProps): React.ReactElement {
  const { scene } = useGLTF(url);
  // GLTF는 하나의 scene 객체를 공유하므로 복제해서 각각 렌더링
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  return (
    <group {...props}>
      <primitive object={clonedScene} />
    </group>
  );
}
// 선택: 미리 로드
useGLTF.preload("cone.glb");

export default Cone;
