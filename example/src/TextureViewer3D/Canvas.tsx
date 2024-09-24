import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { memo, useEffect, useRef, useState } from "react";
import { downloadTexture, getTextureAsDataUrl } from "texture-baker";
import * as THREE from "three";

export const Canvas = memo(
  ({
    fbo,
    gl,
  }: {
    fbo: THREE.WebGLRenderTarget | THREE.WebGL3DRenderTarget;
    gl: THREE.WebGLRenderer;
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null!);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

    const drawTexture = () => {
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
    };

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
      if (!ctx) return;

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
    }, [ctx]);

    return (
      <VStack>
        <Card borderRadius="lg">
          <CardBody>
            <Stack spacing="3">
              {/* @ts-ignore */}
              <Heading size="2xl">{fbo?.__texturePreview_name}</Heading>

              <Box w={300} h={300}>
                <canvas
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  ref={canvasRef}
                />
              </Box>
            </Stack>
          </CardBody>
        </Card>
        <Button
          w="full"
          h="5rem"
          fontSize="5xl"
          display="flex"
          justifyContent="center"
          alignItems="center"
          onClick={onDownload}
        >
          Download
        </Button>
      </VStack>
    );
  }
);
