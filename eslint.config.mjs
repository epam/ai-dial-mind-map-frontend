import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import react from "eslint-plugin-react";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tailwindcss from "eslint-plugin-tailwindcss";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
});

export default defineConfig([
    {
        ignores: [".next/**", "next-env.d.ts"],
    },
    ...compat.extends(
        "next/core-web-vitals",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:tailwindcss/recommended",
    ),
    {
        plugins: {
            "@typescript-eslint": typescriptEslint,
            react,
            "simple-import-sort": simpleImportSort,
            tailwindcss,
        },

        languageOptions: {
            parser: tsParser,
        },

        settings: {
            react: {
                version: "detect",
            },
        },

        rules: {
            "react/react-in-jsx-scope": "off",
            "@typescript-eslint/no-explicit-any": "warn",
            "react/prop-types": "off",
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
            "tailwindcss/classnames-order": "error",
            "tailwindcss/enforces-shorthand": "error",
        },
    },
]);
