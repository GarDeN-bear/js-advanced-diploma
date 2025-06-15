import js from "@eslint/js";
import jestPlugin from "eslint-plugin-jest";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        jest: true,
        browser: true,
        node: true,
        document: "readonly",
        window: "readonly",
        alert: "readonly",
        localStorage: "readonly",
        HTMLElement: "readonly",
      },
    },
    plugins: {
      jest: jestPlugin,
    },
    rules: {
      indent: ["error", 2],
      quotes: ["error", "single"],
      semi: ["error", "always"],
      "no-console": "warn",
    },
    ignores: ["node_modules/", "dist/", "coverage/"],
  },
];
