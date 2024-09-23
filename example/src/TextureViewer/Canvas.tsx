import { useCallback, useEffect, useRef, useState } from "react";
import { downloadTexture, getTextureAsDataUrl } from "texture-baker";
import * as THREE from "three";
import { CanvasContainer, NameContainer } from "./styled";

const is3DRenderTarget = (
  fbo: THREE.WebGLRenderTarget | THREE.WebGL3DRenderTarget
): fbo is THREE.WebGL3DRenderTarget => {
  return (fbo as THREE.WebGL3DRenderTarget).isWebGL3DRenderTarget;
};

export function Canvas({
  fbo,
  gl,
}: {
  fbo: THREE.WebGLRenderTarget | THREE.WebGL3DRenderTarget;
  gl: THREE.WebGLRenderer;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  const drawTexture = useCallback(() => {
    if (!ctx) return;

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, w, h);

    const dataUrl = getTextureAsDataUrl(gl, fbo.texture);
    const image = new Image();
    image.src = dataUrl;
    image.onload = () => {
      ctx.drawImage(image, 0, 0, w, h);
    };
  }, [ctx, gl]);

  const onDownload = () => {
    // @ts-ignore
    const uuid = fbo.__texturePreview_name;
    const name = `texture-${uuid}.png`;
    downloadTexture(gl, fbo.texture, name);
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d")!;
    setCtx(ctx);
  }, []);

  useEffect(() => {
    drawTexture();

    let id = 0;
    const animate = () => {
      if (fbo["__texturePreview_needsUpdate"]) {
        drawTexture();
        fbo["__texturePreview_needsUpdate"] = false;
      }

      id = requestAnimationFrame(animate);
    };

    id = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(id);
  }, [drawTexture]);

  return (
    <CanvasContainer>
      <NameContainer>
        {/* @ts-ignore */}
        {fbo.__texturePreview_name}
        <button onClick={onDownload}>Download</button>
      </NameContainer>
      <canvas ref={canvasRef} />
    </CanvasContainer>
  );
}
