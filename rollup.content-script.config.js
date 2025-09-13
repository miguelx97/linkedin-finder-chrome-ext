import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default defineConfig({
  input: "src/content-script.ts",
  output: {
    file: "dist/content-script.js",
    format: "iife",
    sourcemap: false,
  },
  plugins: [
    nodeResolve(),
    typescript({
      tsconfig: "./tsconfig.app.json",
      sourceMap: false,
      compilerOptions: {
        module: "esnext",
        target: "es2017",
        lib: ["es2017", "dom"],
        moduleResolution: "node",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
    }),
  ],
});
