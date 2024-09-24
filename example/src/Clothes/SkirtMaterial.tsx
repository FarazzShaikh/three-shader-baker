import { useEffect, useMemo, useRef } from "react";

import { Color, MathUtils, MeshStandardMaterial } from "three";
import CSM from "three-custom-shader-material";

import { animate, AnimationControls } from "motion";
import colors from "nice-color-palettes";
import Perlin from "./shaders/perlin";

export function SkirtMaterial({ seed }: { seed: number }) {
  const palette = colors[2];

  const vertexShader = useMemo(
    () => /* glsl */ `
    varying vec3 vPosition;

    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }  
  `,
    []
  );

  const fragmentShader = useMemo(
    () => /* glsl */ `
    varying vec3 vPosition;
    uniform float uSeed;
    uniform vec3 uColorA;
    uniform vec3 uColorB;

    ${Perlin}

    void main() {
      float n = cnoise((vPosition + vec3(uSeed)) * 10.0);
      float n2 = cnoise((vPosition + vec3(n) + vec3(uSeed)) * 5.0);
      n2 = 1.0 - clamp(n2, 0.0, 1.0);
      n2 = smoothstep(0.9, 0.91, n2);

      vec3 color = mix(uColorA, uColorB, n2);
      csm_DiffuseColor = vec4(color, 1.0);
    }
  `,
    []
  );

  const uniforms = useMemo(
    () => ({
      uSeed: { value: 0 },
      uColorA: {
        value: new Color(palette[0]),
      },
      uColorB: {
        value: new Color(palette[1]),
      },
    }),
    []
  );

  const animationRef = useRef<AnimationControls | null>(null);
  const didRunFistTime = useRef(false);
  useEffect(() => {
    if (didRunFistTime.current) {
      const i1 = Math.floor((seed + 0.5) * palette.length);
      const i2 = (i1 + 1) % palette.length;

      if (animationRef.current) {
        animationRef.current.stop();
      }

      const targetA = new Color(palette[i1]);
      const targetB = new Color(palette[i2]);
      const currentSeed = uniforms.uSeed.value;
      animationRef.current = animate(
        (t) => {
          uniforms.uSeed.value = MathUtils.lerp(currentSeed, seed, t);
          uniforms.uColorA.value.lerp(targetA, t);
          uniforms.uColorB.value.lerp(targetB, t);
        },
        {
          easing: "ease-in-out",
          duration: 2,
        }
      );

      animationRef.current.finished.then(() => {
        animationRef.current = null;
      });
    } else {
      didRunFistTime.current = true;
    }
  }, [seed]);

  return (
    <CSM
      key={vertexShader + fragmentShader}
      baseMaterial={MeshStandardMaterial}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
    />
  );
}
