import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import "./styles.css";

import { ShaderBaker, useShaderBaker } from "texture-baker/react";

import { useEffect, useRef } from "react";
import Perlin from "./Perlin";
import { useTextureViewer } from "./TextureViewer";

import CSMReact from "three-custom-shader-material";

function Thing() {
  const { nodes } = useGLTF("/monkeys.glb") as any;
  const scene = useThree((state) => state.scene);
  const { bake, renderTargets } = useShaderBaker();

  const materialRef = useRef<any>();

  useTextureViewer(Object.values(renderTargets), () => {
    materialRef.current.uniforms.uSeed.value = Math.random();
  });

  useEffect(() => {
    for (const [uuid, texture] of Object.entries(renderTargets)) {
      const obj = scene.getObjectByProperty("uuid", uuid);
      texture["__texturePreview_name"] = obj?.name || "Unknown";
    }
  }, [renderTargets]);

  useEffect(() => {
    bake();
  }, []);

  return (
    <>
      <mesh
        name="Suzanne"
        castShadow
        receiveShadow
        geometry={nodes.Suzanne.geometry}
      >
        <CSMReact
          ref={materialRef}
          color="white"
          baseMaterial={THREE.MeshStandardMaterial}
          vertexShader={`
            varying vec3 vPosition;

            void main() {
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }  
          `}
          fragmentShader={`
            varying vec3 vPosition;

            uniform float uSeed;

            ${Perlin}

            void main() {
              float n = cnoise((vPosition + vec3(uSeed * 10000.0)) * 10.0);
              n = abs(n);
              csm_DiffuseColor = vec4(vec3(n), 1.0);
            }
          `}
          uniforms={{
            uSeed: { value: 0 },
          }}
        />
      </mesh>
    </>
  );
}

export default function App() {
  return (
    <>
      <Canvas shadows>
        <fog attach="fog" args={[0xffffff, 10, 90]} />

        <OrbitControls makeDefault />
        <PerspectiveCamera fov={39.6} position={[-2, 2, 5]} makeDefault />

        <axesHelper args={[10]} />

        <ShaderBaker>
          <Thing />
        </ShaderBaker>
        <Environment
          preset="city"
          blur={0.05}
          // files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/table_mountain_2_puresky_1k.hdr"
        />
      </Canvas>

      {/* <Leva collapsed /> */}
      {/* <Copy /> */}
    </>
  );
}
