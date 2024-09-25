import * as THREE from "three";

const exportPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2, 1, 1),
  new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null }
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        uv.y = 1.0 - uv.y;
        gl_FragColor = texture2D(tDiffuse, uv);

        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `
  })
);

export function getTextureAsDataUrl(
  gl: THREE.WebGLRenderer,
  texture: THREE.Texture
) {
  exportPlane.material.uniforms.tDiffuse.value = texture;

  const dpr = window.devicePixelRatio;
  const width = texture.image.width / dpr;
  const height = texture.image.height / dpr;

  const camera = new THREE.OrthographicCamera(
    -width / 2,
    width / 2,
    height / 2,
    -height / 2,
    0,
    1
  );

  const prevSize = new THREE.Vector2();
  gl.getSize(prevSize);

  gl.setSize(width, height, false);
  gl.setRenderTarget(null);
  gl.render(exportPlane, camera);

  const url = gl.domElement.toDataURL();

  gl.setSize(prevSize.x, prevSize.y, false);

  return url;
}

export function downloadTexture(
  gl: THREE.WebGLRenderer,
  texture: THREE.Texture,
  name: string
) {
  const a = document.createElement("a");
  a.href = getTextureAsDataUrl(gl, texture);
  a.download = name;
  a.click();
}
