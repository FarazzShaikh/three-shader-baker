import { useGLTF } from "@react-three/drei";
import glbSrc from "../assets/skirt_and_t-shirt.glb?url";

import { ShirtMaterial } from "./ShirtMaterial";
import { SkirtMaterial } from "./SkirtMaterial";

export function Clothes({ seed }: { seed: number }) {
  const { nodes, materials } = useGLTF(glbSrc) as any;

  return (
    <group>
      <mesh
        name="Skirt"
        castShadow
        receiveShadow
        geometry={nodes.Object_4.geometry}
        material={materials.skirt}
      >
        <SkirtMaterial seed={seed} />
      </mesh>
      <mesh
        name="Shirt"
        castShadow
        receiveShadow
        geometry={nodes.Object_5.geometry}
      >
        <ShirtMaterial seed={seed} />
      </mesh>
    </group>
  );
}
