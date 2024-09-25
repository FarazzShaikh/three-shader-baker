import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/three-shader-baker/",
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "texture-baker/react": path.resolve(
        __dirname,
        "../package/src/React.tsx"
      ),
      "texture-baker": path.resolve(__dirname, "../package/src/index.ts")
    }
  }
});
