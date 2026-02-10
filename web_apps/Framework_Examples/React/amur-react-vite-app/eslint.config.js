import { defineConfig } from "eslint/config";
import { typescriptConfig } from "@ni/eslint-config-typescript";

export default defineConfig([
  {
    files: ["**/*.ts"],
    extends: typescriptConfig,
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
