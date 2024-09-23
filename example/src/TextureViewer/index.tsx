import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { useShaderBaker } from "texture-baker/react";
import * as THREE from "three";
import { Canvas } from "./Canvas";
import { TextureViewerContainer } from "./styled";

export function useTextureViewer(
  fbos: (THREE.WebGLRenderTarget | THREE.WebGL3DRenderTarget)[],
  onRandomize: () => void
) {
  const gl = useThree((state) => state.gl);
  const events = useThree((state) => state.events);
  const inputRef = useRef<HTMLInputElement>(null);

  const { bake } = useShaderBaker();

  const onRebake = () => {
    const size = parseInt(inputRef.current.value);
    bake(null, size);
    for (const fbo of fbos) {
      fbo["__texturePreview_needsUpdate"] = true;
    }
  };

  useEffect(() => {
    if (!events.connected) return;

    const parentElement = events.connected;
    const container = document.createElement("div");
    parentElement.parentElement.appendChild(container);

    const root = createRoot(container);
    root.render(
      <TextureViewerContainer>
        <h1>three-shader-baker</h1>
        <h2>Textures</h2>
        <form>
          <label>Seed:</label>
          <button
            onClick={(e) => {
              e.preventDefault();
              onRandomize();
            }}
          >
            Randomize
          </button>
          <label>Size:</label>
          <input
            type="number"
            placeholder="size"
            ref={(r) => {
              if (r) {
                inputRef.current = r;
                r.value = "1024";
              }
            }}
          />
        </form>
        <button onClick={onRebake}>Rebake</button>
        {fbos.map((fbo, index) => (
          <Canvas key={index} fbo={fbo} gl={gl} />
        ))}
      </TextureViewerContainer>
    );

    parentElement.parentElement.style.display = "flex";

    parentElement.style.flex = "1";
    parentElement.style.width = "50%";

    return () => {
      root.unmount();
      container.remove();
    };
  }, [fbos, events.connected]);
}
