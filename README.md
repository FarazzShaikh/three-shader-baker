<h1 align="center"><sup>THREE</sup> Shader Baker</h1>
<h3 align="center">Bake your Three.js shaders or materials into textures!</h3>

<br />

<p align="center">
  <a href="https://farazzshaikh.github.io/three-shader-baker/" target="_blank"><img width="100%" src="https://github.com/FarazzShaikh/three-shader-baker/blob/main/assets/example-screenshot.png?raw=true" alt="Shader Baker example" /></a>
</p>
</p>
<p align="middle">
  <i>Here, ThreeJS fragment shaders are exported out as textures which are then used in Blender. This demo is real! Give it a click.</i>
</p>

<br />

<p align="center">
  <a href="https://www.npmjs.com/package/three-shader-baker" target="_blank">
    <img src="https://img.shields.io/npm/v/three-shader-baker.svg?style=for-the-badge" />
  </a>
  <a href="https://www.npmjs.com/package/three-shader-baker" target="_blank">
    <img src="https://img.shields.io/npm/dt/three-shader-baker?style=for-the-badge&colorB=red" />
  </a>
  <br />
  <a href="https://github.com/sponsors/FarazzShaikh" target="_blank">
    <img src="https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors" />
  </a>
  <a href="https://twitter.com/CantBeFaraz" target="_blank">
    <img src="https://img.shields.io/twitter/follow/CantBeFaraz?style=for-the-badge&logo=x" alt="Chat on Twitter">
  </a>
</p>

Shader Baker lets you export your Three.js shaders or materials as textures. This is useful when you want to use the same shader in other 3D software like Blender, Unity, etc. You can also use the exported textures in other Three.js shaders/materials to save on performance.

**It supports both Vanilla and React!**

<details>
  <summary>Show Vanilla example</summary>

```js
import { ShaderBaker, getTextureAsDataUrl } from "three-shader-baker";

const mesh = new THREE.Mesh(...)

const baker = new ShaderBaker();
const fbo = baker.bake(renderer, mesh, {
  // Optional options
  scene: scene, // Scene that the mesh is in. If provided, the current env map will be used.
  size: 1024, // Number. Size of the baked texture
  target: null // THREE.WebGLRenderTarget. If provided, the baked texture will be rendered to this target.
})

// Your resulting texture
const dataUrl = getTextureAsDataUrl(renderer, fbo.texture);

```

</details>

<details>
  <summary>Show React example</summary>

```js
import {
  ShaderBaker,
  useShaderBaker,
  getTextureAsDataUrl,
} from "three-shader-baker/react";

function Mesh() {
  const { bake } = useShaderBaker();
  const meshRef = useRef();

  useEffect(() => {
    const fbos = bake();
    const targrtFbo = fbos[meshRef.uuid];

    // Your resulting texture
    const dataUrl = getTextureAsDataUrl(renderer, targetFbo.texture);
  }, []);

  return <mesh ref={meshRef}>...</mesh>;
}

<ShaderBaker>
  <Mesh />
</ShaderBaker>;
```

</details>

## Installation

```bash
npm install three-shader-baker
yarn add three-shader-baker
```

## Helpers **(React only)**

You can set the following helpers on `THREE.Mesh.userData` to control the baking process:

- `__shaderBaker_isExcluded` - Set this to `true` to exclude the mesh from baking.
- `__shaderBaker_size` - Set this to a number to override the size of the baked texture for this mesh. Can be used to bake different textures at different resolutions.

## Gotchas

- **(React only)** The `bake` functions from `const { bake } = useShaderBaker()` is memoized. Make sure to pass it as a dependency in your `useEffect` hook otherwise it will unnecessary state updates.
- **(React only)** The order of priority for the `size` prop is as follows:
  1. `__shaderBaker_size` on the mesh
  2. `size` parameter in the `bake` function
  3. `size` prop on the `<ShaderBaker />` component
- Lighting is baked from a single point of view (`[0, 0, -1]` looking towards `[0, 0, 0]`). This means specular highlights and reflections will not be accurate if the camera is dynamic. This is a limitation of texture baking in general.
- Any animated shaders will only be baked at the current frame. Unless you bake the texture at every frame, the animation will not be captured. See the [performance ](#performance) section for more details.

## Performance

Baking shaders is an expensive operation. It is recommended to bake the shaders only once and then use the resulting texture in your scene or export it out. The cost of baking is directly proportional to the `size` of the baked texture. The larger the texture, the more time it will take to bake.

If you have animated shaders, you will need to bake the texture at every frame to capture the animation. This can be done by calling the `bake` function at every frame. This is not recommended for real-time applications as it can be very expensive.

At the moment, baking is a synchronous operation. This means that the browser will freeze while the baking is happening. You will also see a flicker in the scene as the process is happening. I will be looking into making this asynchronous in the future.

For now, it is recommended to black out the screen or show a loading screen while the baking is happening.

## API Reference

<details>

<summary>Vanilla</summary>

#### `ShaderBaker`

#### `ShaderBaker.constructor()`

Creates a new instance of the ShaderBaker.

#### `ShaderBaker.bake(renderer: THREE.WebGLRenderer, mesh: THREE.Mesh, options: Object): THREE.WebGLRenderTarget`

Bakes the shader/material of the mesh into a render target.

- `renderer` - The renderer instance.
- `mesh` - The mesh whose shader/material you want to bake.
- `options` - Optional options.
  - `scene` - The scene that the mesh is in. If provided, the current env map will be used.
  - `size` - Number. Size of the baked texture. Default is 1024.
  - `target` - THREE.WebGLRenderTarget. If provided, the baked texture will be rendered to this target.
  - `dilation` - Number. Number of pixels to dilate the texture by. Default is 2. This is useful to prevent seam artifacts.

#### `ShaderBaker.dispose()`

Disposes of the ShaderBaker instance and its associated resources.

#### `getTextureAsDataUrl(renderer: THREE.WebGLRenderer, texture: THREE.Texture): string`

Converts a texture to a data URL.

#### `downloadTexture(renderer: THREE.WebGLRenderer, texture: THREE.Texture, filename: string): void`

Downloads a texture as a png file.

</details>

<details>

<summary>React</summary>

#### `<ShaderBaker />`

A provider component that provides the `useShaderBaker` hook. Any `THREE.Mesh` inside this component will be baked into separate render targets.

This props of this component are as follows:

- `size` - Number. Size of the baked texture. Default is 1024.
- `dilation` - Number. Number of pixels to dilate the texture by. Default is 2. This is useful to prevent seam artifacts.

#### `<ShaderBakerExclusion />`

A component that excludes a `THREE.Mesh` from being baked. Any `THREE.Mesh` inside this component will be excluded from baking.

You can manually exclude meshes by setting `THREE.Mesh.userData["__shaderBaker_isExcluded"] = true`.

#### `const obj = useShaderBaker()`

A hook that returns useful functions and data for baking. The object returned has the following properties:

- `bake(args): { [mesh.uuid]: THREE.WebGLRenderTarget }`
  - This function bakes all the meshes inside the `<ShaderBaker />` component.
  - The args are as follows:
    - `mesh: mesh: THREE.Mesh | THREE.Mesh[] | null` - The mesh(es) to bake. If not provided, all meshes inside the `<ShaderBaker />` component will be baked.
    - `options: Object`
      - `dialetion` - Number. Number of pixels to dilate the texture by. Default is 2. This is useful to prevent seam artifacts.
      - `size` - Number. Size of the baked texture. Default is 1024.
- `renderTargets: { [key: string]: THREE.WebGLRenderTarget }`
  - An object containing all the render targets of the baked meshes. Keyed by the their respective mesh's uuid.
- `textures: { [key: string]: THREE.Texture }`
  - An object containing all the textures of the baked meshes (`THREE.WebGLRenderTarget.texture`). Keyed by the their respective mesh's uuid.

#### `getTextureAsDataUrl(renderer: THREE.WebGLRenderer, texture: THREE.Texture): string`

Converts a texture to a data URL.

#### `downloadTexture(renderer: THREE.WebGLRenderer, texture: THREE.Texture, filename: string): void`

Downloads a texture as a png file.

</details>

## License

This project is licensed under the AGPL-3.0 License. **SOURCE CODE MUST BE MADE AVAILABLE WHEN THE LICENSED MATERIAL IS DISTRIBUTED**. See the [LICENSE](LICENSE) file for details.
