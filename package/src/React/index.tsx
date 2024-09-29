import { useThree } from "@react-three/fiber";
import * as React from "react";
import * as THREE from "three";
import { ShaderBaker as ShaderBakerImpl } from "..";

interface TextureBakerAPI {
  renderTargets: {
    [uuid: string]: THREE.WebGLRenderTarget;
  };
  textures: {
    [uuid: string]: THREE.Texture;
  };
  bake: (
    mesh?: THREE.Mesh | THREE.Mesh[],
    options?: {
      dilation?: number;
      size?: number;
    }
  ) => TextureBakerAPI["textures"];
}

const context = React.createContext<TextureBakerAPI>(null!);

interface TextureBakerProps {
  size?: number;
  dilation?: number;
}

export function ShaderBaker({
  size: propsSize = 1024,
  dilation = 2,
  children
}: React.PropsWithChildren<TextureBakerProps>) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const groupRef = React.useRef<THREE.Group>(null!);
  const baker = React.useMemo(() => new ShaderBakerImpl(), []);

  const [renderTargets, setRenderTargets] = React.useState<
    TextureBakerAPI["renderTargets"]
  >({});
  const [textures, setTextures] = React.useState<TextureBakerAPI["textures"]>(
    {}
  );

  const value = React.useMemo<TextureBakerAPI>(
    () => ({
      renderTargets,
      textures,
      bake: (mesh, options) => {
        const meshes: THREE.Mesh[] = mesh
          ? Array.isArray(mesh)
            ? mesh
            : [mesh]
          : [];
        if (!mesh) {
          groupRef.current.traverse((object) => {
            if (
              object instanceof THREE.Mesh &&
              !object.userData["__shaderBaker_isExcluded"] &&
              !object.parent?.userData["__shaderBaker_isExcluded"]
            ) {
              meshes.push(object);
            }
          });
        }

        const newRenderTargets: TextureBakerAPI["renderTargets"] = {};
        const newTextures: TextureBakerAPI["textures"] = {};
        let didSetNewRenderTarget = false;
        for (const mesh of meshes) {
          const _size =
            mesh.userData["__shaderBaker_size"] || options?.size || propsSize;
          const currentFbo = renderTargets[mesh.uuid];
          const fbo = baker.bake(gl, mesh, {
            target: currentFbo,
            size: _size,
            scene,
            dilation: options?.dilation || dilation
          });

          if (
            !currentFbo ||
            meshes.length !== Object.keys(renderTargets).length
          ) {
            didSetNewRenderTarget = true;
            newRenderTargets[mesh.uuid] = fbo;
            newTextures[mesh.uuid] = fbo.texture;
          }
        }

        if (didSetNewRenderTarget) {
          setRenderTargets(newRenderTargets);
          setTextures(newTextures);
        }

        return newTextures;
      }
    }),
    [dilation, scene, gl, propsSize, renderTargets, baker]
  );

  React.useEffect(
    () => () => {
      for (const fbo of Object.values(renderTargets)) {
        fbo.dispose();
      }
    },
    [renderTargets]
  );

  React.useEffect(
    () => () => {
      baker.dispose();
    },
    [baker]
  );

  return (
    <context.Provider value={value}>
      <group ref={groupRef}>{children}</group>
    </context.Provider>
  );
}

export function ShaderBakerExclusion({ children }: React.PropsWithChildren) {
  const groupRef = React.useRef<THREE.Group>(null!);

  React.useLayoutEffect(() => {
    groupRef.current.traverse((object) => {
      object.userData["__shaderBaker_isExcluded"] = true;
    });
  }, []);

  return (
    <group ref={groupRef} userData={{ __shaderBaker_isExcluded: true }}>
      {children}
    </group>
  );
}

export function useShaderBaker() {
  const contextValue = React.useContext(context);
  if (!contextValue) {
    throw new Error("useTextureBaker must be used within a TextureBaker");
  }
  return contextValue;
}

export * from "../utils";
