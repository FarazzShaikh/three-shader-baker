import * as THREE from "three";
import { DilationMaterial } from "./DilationMaterial";
import { FullScreenQuad } from "./FullScreenQuad";

export interface BakeOptions {
  size?: number;
  target?: THREE.WebGLRenderTarget | null;
  scene?: THREE.Scene;
  dilation?: number;
}

export class ShaderBaker {
  _orthoCamera: THREE.OrthographicCamera;
  _fsQuad: FullScreenQuad;
  _bakeFbo: THREE.WebGLRenderTarget;

  _dilationMaterial: DilationMaterial;

  constructor() {
    this._orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this._fsQuad = new FullScreenQuad();
    this._dilationMaterial = new DilationMaterial();

    this._bakeFbo = new THREE.WebGLRenderTarget(1024, 1024, {
      depthBuffer: false,
      stencilBuffer: false,
      format: THREE.RGBAFormat,
    });
  }

  dispose() {
    this._fsQuad.dispose();
    this._dilationMaterial.dispose();
    this._bakeFbo.dispose();
  }

  bake(
    gl: THREE.WebGLRenderer,
    mesh: THREE.Mesh,
    options: BakeOptions
  ): THREE.WebGLRenderTarget {
    const size = options.size || 1024;
    const targetFbo =
      options.target ||
      new THREE.WebGLRenderTarget(size, size, {
        depthBuffer: false,
        stencilBuffer: false,
        format: THREE.RGBAFormat,
      });
    const scene = options.scene;
    const dilation = options.dilation || 2;

    targetFbo.setSize(size, size);
    this._bakeFbo.setSize(size, size);

    this._orthoCamera.left = size / -2;
    this._orthoCamera.right = size / 2;
    this._orthoCamera.top = size / 2;
    this._orthoCamera.bottom = size / -2;
    this._orthoCamera.updateProjectionMatrix();

    const material = mesh.material as THREE.Material & {
      envMap: THREE.Texture | null;
    };

    const prevOnBeforeCompile = material.onBeforeCompile;

    material.onBeforeCompile = (shader, renderer) => {
      prevOnBeforeCompile(shader, renderer);

      shader.vertexShader = shader.vertexShader.replace(
        "void main() {",
        `
          uniform mat4 uuModelMatrix;
          void main() {
        `
      );

      if (shader.vertexShader.includes("#include <project_vertex>")) {
        shader.vertexShader = shader.vertexShader.replace(
          "#include <project_vertex>",
          `
            #include <project_vertex>
            gl_Position = vec4(uv, 0.0, 1.0) * 2.0 - 1.0;
          `
        );
      } else {
        const glPositionIndex = shader.vertexShader.indexOf("gl_Position = ");
        const substring = shader.vertexShader.substring(glPositionIndex);
        const glPositionEndIndex = substring.indexOf(";");
        const glPosition = substring.substring(0, glPositionEndIndex);
        shader.vertexShader = shader.vertexShader.replace(
          glPosition,
          "gl_Position = vec4(uv, 0.0, 1.0) * 2.0 - 1.0;"
        );
      }
    };

    const prevEnvMap = material.envMap;
    const prevSide = material.side;
    if (scene) material.envMap = scene.environment;
    material.side = THREE.DoubleSide;

    gl.setRenderTarget(this._bakeFbo);
    gl.clear();
    gl.render(mesh, this._orthoCamera);
    gl.setRenderTarget(null);

    gl.setRenderTarget(targetFbo);
    this._fsQuad.material = this._dilationMaterial;
    this._dilationMaterial.texture = this._bakeFbo.texture;
    this._dilationMaterial.dilation = dilation;
    this._fsQuad.render(gl);
    gl.setRenderTarget(null);

    material.envMap = prevEnvMap;
    material.onBeforeCompile = prevOnBeforeCompile;
    material.side = prevSide;

    return targetFbo;
  }
}

export * from "./utils";
