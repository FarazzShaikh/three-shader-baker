import react from "@vitejs/plugin-react";
import fs from "fs/promises";
import path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { name } from "./package.json";

function copyFiles() {
  return {
    name: "copy-license",
    closeBundle: async () => {
      await fs.copyFile("../LICENSE.md", "./dist/LICENSE.md");
      await fs.copyFile("../README.md", "./dist/README.md");

      // Write react package.json
      const reactJson = {
        main: `${name}.cjs.js`,
        module: `${name}.es.js`
      };
      await fs.writeFile(
        "./dist/react/package.json",
        JSON.stringify(reactJson, null, 2)
      );
    }
  };
}

export default defineConfig({
  build: {
    lib: {
      entry: {
        vanilla: path.resolve(__dirname, "src/index.ts"),
        react: path.resolve(__dirname, "src/React/index.tsx")
      },
      name,
      formats: ["es", "cjs"],
      fileName: (format, entry) => {
        switch (entry) {
          case "vanilla":
            return `${name}.${format}.js`;
          case "react":
            return `react/${name}.${format}.js`;
          default:
            return `${entry}.${format}.js`;
        }
      }
    },
    rollupOptions: {
      external: ["react", "three", "@react-three/fiber"]
    },
    sourcemap: true,
    emptyOutDir: true
  },
  plugins: [
    react(),
    dts({
      rollupTypes: true
    }),
    copyFiles()
  ]
});
