import * as THREE from "three";

export class DilationMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTexture: {
          value: null,
        },
        uDilation: {
          value: 2,
        },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;

        void main() {
          vUv = uv;

          vec3 pos = position;
          gl_Position = vec4(pos, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uTexture;
        uniform float uDilation;

        varying vec2 vUv;

        void main() {
          // Dilate the texture, extend the edges by uDilation pixels
          vec2 uv = vUv;
          vec2 pixel = 1.0 / vec2(textureSize(uTexture, 0));
          vec4 color = texture(uTexture, uv);
          for (float x = -uDilation; x <= uDilation; x++) {
            for (float y = -uDilation; y <= uDilation; y++) {
              vec2 offset = vec2(x, y) * pixel;
              color = max(color, texture(uTexture, uv + offset));
            }
          }

          gl_FragColor = color;
        }

      `,
    });
  }
}
