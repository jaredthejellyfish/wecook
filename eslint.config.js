import { includeIgnoreFile } from '@eslint/compat';
import pluginRouter from '@tanstack/eslint-plugin-router';
import eslintPluginTypescript from '@typescript-eslint/eslint-plugin';
import parserTypescript from '@typescript-eslint/parser';
import reactCompiler from 'eslint-plugin-react-compiler';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

export default [
  {
    files: ['app/**/*.{js,jsx,ts,tsx}'], // Add files pattern to target /app/ directory
    ignores: ['**/dist/**', '**/node_modules/**'], // Common ignores
    languageOptions: {
      parser: parserTypescript,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json', // Point to your TypeScript configuration
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': eslintPluginTypescript,
      'react-compiler': reactCompiler,
    },
    rules: {
      // Disable the core ESLint rule
      'no-unused-vars': 'off',
      // Enable the TypeScript-specific rule
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  ...pluginRouter.configs['flat/recommended'],
  includeIgnoreFile(gitignorePath),
];
