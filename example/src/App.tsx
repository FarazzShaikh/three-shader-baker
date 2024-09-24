import {
  AccumulativeShadows,
  Bounds,
  ContactShadows,
  Environment,
  OrbitControls,
  RandomizedLight,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import "./styles.css";

import {
  ShaderBaker,
  ShaderBakerExclusion,
  useShaderBaker,
} from "texture-baker/react";

import { useEffect, useState } from "react";

import { EffectComposer } from "@react-three/postprocessing";
import { isDesktop } from "react-device-detect";
import { MathUtils } from "three";
import { Clothes } from "./Clothes";
import { N8AO } from "./N8AO";
import { TextureViewer3D } from "./TextureViewer3D";

function Thing() {
  const { bake } = useShaderBaker();
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    bake();
  }, []);

  return (
    <>
      <Clothes seed={seed} />

      <ShaderBakerExclusion>
        <TextureViewer3D
          onRandomize={() => {
            setSeed(Math.random());
          }}
        />
      </ShaderBakerExclusion>
    </>
  );
}

export default function App() {
  return (
    <>
      <Canvas
        shadows
        camera={{
          position: [isDesktop ? -2 : 0, 1, 5],
        }}
      >
        <OrbitControls
          enablePan={false}
          minDistance={1}
          maxDistance={8}
          maxPolarAngle={MathUtils.degToRad(100)}
          minPolarAngle={MathUtils.degToRad(20)}
          minAzimuthAngle={MathUtils.degToRad(-90)}
          maxAzimuthAngle={MathUtils.degToRad(90)}
          makeDefault
          target={[0, 1, 0]}
        />

        <ContactShadows
          opacity={0.5}
          scale={10}
          blur={1}
          far={10}
          resolution={256}
          color="#000000"
        />

        <AccumulativeShadows
          temporal
          frames={100}
          scale={12}
          alphaTest={0.85}
          position={[0, 0.04, 0]}
        >
          <RandomizedLight
            amount={10}
            radius={10}
            ambient={0.2}
            position={[-5, 5, -5]}
            bias={0.001}
          />
        </AccumulativeShadows>

        <ShaderBaker>
          <Bounds fit clip observe margin={isDesktop ? 1.4 : 0.7}>
            <Thing />
          </Bounds>
        </ShaderBaker>
        <Environment
          preset="city"
          background
          backgroundBlurriness={0.7}
          environmentIntensity={2}
          backgroundRotation={[0, MathUtils.degToRad(80), 0]}
        />

        <EffectComposer enableNormalPass>
          <N8AO
            halfRes
            color="black"
            aoRadius={0.2}
            intensity={7}
            aoSamples={6}
            denoiseSamples={4}
          />
        </EffectComposer>
      </Canvas>

      {/* <Leva collapsed /> */}
      {/* <Copy /> */}
    </>
  );
}
