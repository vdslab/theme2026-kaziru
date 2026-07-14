import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            react,
            "react-hooks": reactHooks,
        },
        rules: {
            // React 推奨ルール
            ...react.configs.recommended.rules,
            // React Hooks ルール
            ...reactHooks.configs.recommended.rules,
            // JSX でも React を import しなくてよい（React 17+）
            "react/react-in-jsx-scope": "off",
            // JSX では PropTypes によるバリデーションを行わない
            "react/prop-types": "off",
            // 未使用変数の警告（_ で始まる引数は除外）
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
    {
        ignores: ["dist/", "node_modules/"],
    },
];
