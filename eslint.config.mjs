import js from "@eslint/js"
import nextPlugin from "@next/eslint-plugin-next"
import { defineConfig, globalIgnores } from "eslint/config"
import nextParser from "eslint-config-next/parser"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import globals from "globals"

export default defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "miniapp/**",
    "scripts/**/*.ts",
  ]),
  {
    files: [
      "app/**/*.{js,jsx,mjs,ts,tsx}",
      "components/**/*.{js,jsx,mjs,ts,tsx}",
      "hooks/**/*.{js,jsx,mjs,ts,tsx}",
      "lib/**/*.{js,jsx,mjs,ts,tsx}",
      "scripts/**/*.{js,mjs}",
      "*.{js,mjs}",
    ],
    languageOptions: {
      parser: nextParser,
      parserOptions: {
        requireConfigFile: false,
        sourceType: "module",
        allowImportExportEverywhere: true,
        babelOptions: {
          presets: ["next/babel"],
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    files: ["**/*.{js,mjs}"],
    rules: {
      ...js.configs.recommended.rules,
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
])
