const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", ".expo/*"],
  },
  {
    settings: {
      // Resolve the "@/..." alias from jsconfig.json (the default only reads tsconfig.json).
      "import/resolver": { typescript: { project: "./jsconfig.json" } },
    },
    rules: {
      "no-console": "error",
    },
  },
]);
