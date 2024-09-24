import {
  Button,
  ChakraProvider,
  Heading,
  HStack,
  Input,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { useShaderBaker } from "texture-baker/react";
import { Canvas } from "./Canvas";

export function TextureViewer3D({ onRandomize }: { onRandomize: () => void }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const { bake, renderTargets } = useShaderBaker();
  const fbos = useMemo(() => Object.values(renderTargets), [renderTargets]);
  const inputRef = useRef<HTMLInputElement>(null);

  const shirtFbo = fbos[1];
  const skirtFbo = fbos[0];

  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    for (const [uuid, texture] of Object.entries(renderTargets)) {
      const obj = scene.getObjectByProperty("uuid", uuid);
      texture["__texturePreview_name"] = obj?.name || "Unknown";
    }
  }, [renderTargets]);

  const onRebake = () => {
    const size = parseInt(inputRef.current.value);
    bake(null, { size });
    for (const fbo of fbos) {
      fbo["__texturePreview_needsUpdate"] = true;
    }
  };

  return (
    <>
      <Html
        transform
        center
        scale={hidden ? 0 : 0.05}
        position={[0.5, 1.25, 0.2]}
      >
        <ChakraProvider>
          <Canvas fbo={shirtFbo} gl={gl} />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="200"
            height="100"
            viewBox="0 0 200 100"
            style={{
              position: "absolute",
              top: "50%",
              left: "0",
              transform: "translate(-100%, -50%)",
              zIndex: 1000,
            }}
          >
            <line
              x1="0"
              y1="50"
              x2="200"
              y2="50"
              stroke="white"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <circle cx="20" cy="50" r="20" fill="white" />
          </svg>
        </ChakraProvider>
      </Html>
      <Html
        transform
        center
        scale={hidden ? 0 : 0.05}
        position={[-0.6, 0.5, 0.2]}
      >
        <ChakraProvider>
          <Canvas fbo={skirtFbo} gl={gl} />

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="200"
            height="100"
            viewBox="0 0 200 100"
            style={{
              position: "fixed",
              top: "50%",
              right: "0",
              transform: "translate(100%, -50%)",
              zIndex: 1000,
            }}
          >
            <line
              x1="0"
              y1="50"
              x2="180"
              y2="50"
              stroke="white"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <circle cx="180" cy="50" r="20" fill="white" />
          </svg>
        </ChakraProvider>
      </Html>
      <Html transform center scale={hidden ? 0 : 0.1} position={[0, 1.75, 0.3]}>
        <ChakraProvider>
          <VStack>
            <Heading
              size="lg"
              fontFamily="monospace"
              as="a"
              color="black"
              href="https://github.com/FarazzShaikh/three-shader-baker"
              target="_blank"
              _hover={{ textDecoration: "underline", color: "blue" }}
            >
              three-shader-baker
            </Heading>
            <HStack>
              <Text color="black" whiteSpace="nowrap" fontFamily="monospace">
                Texture Size:
              </Text>
              <Input
                variant="filled"
                type="number"
                color="black"
                bgColor="whiteAlpha.400"
                placeholder="size"
                ref={inputRef}
                defaultValue={2048}
              />
            </HStack>
          </VStack>
        </ChakraProvider>
      </Html>
      <Html transform center scale={0.1} position={[0, 0.0, 0.3]}>
        <ChakraProvider>
          <VStack>
            {!hidden && (
              <Text bgColor="white" padding={2} borderRadius={5} color="black">
                Bake your Three.js shaders into textures!
              </Text>
            )}

            <HStack>
              <Button onClick={onRandomize}>Randomize 🎲</Button>
              <Button onClick={onRebake}>Bake! 🍰</Button>
              <Button onClick={() => setHidden((s) => !s)}>
                {hidden ? "Show" : "Hide"} UI {hidden ? "😊" : "🙂"}
              </Button>
            </HStack>
            {!hidden && (
              <Text color="white">
                Made with ❤️ by{" "}
                <Link
                  target="_blank"
                  href="https://www.x.com/cantbefaraz"
                  _hover={{ textDecoration: "underline", color: "cyan" }}
                >
                  Faraz Shaikh
                </Link>
              </Text>
            )}
          </VStack>
        </ChakraProvider>
      </Html>
    </>
  );
}
