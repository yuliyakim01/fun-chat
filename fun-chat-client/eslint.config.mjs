// eslint.config.mjs
import js from '@eslint/js';
import plugin from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import unicorn from 'eslint-plugin-unicorn';

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        document: true,
        window: true,
        location: true,
        history: true,
        HTMLElement: true,
        HTMLInputElement: true,
        HTMLTextAreaElement: true,
        HTMLButtonElement: true,
        HTMLUListElement: true,
        HTMLDivElement: true,
        HTMLSpanElement: true,
        HTMLParagraphElement: true,
        setTimeout: true,
        console: true,
        crypto: true,
        localStorage: true,
        PopStateEvent: true,
        WebSocket: true,
      },
    },
    plugins: {
      '@typescript-eslint': plugin,
      unicorn,
    },
    rules: {
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      'max-lines-per-function': ['error', { max: 40 }],
    },
  },
];
