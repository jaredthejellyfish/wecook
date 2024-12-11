// app.config.ts
import { defineConfig } from '@tanstack/start/config';

const ReactCompilerConfig = {
  target: '18' // '17' | '18' | '19'
};

export default defineConfig({
  server: {
    preset: 'vercel',
  },
  react: {
    babel: {
      plugins: [
        ['babel-plugin-react-compiler', ReactCompilerConfig],
      ],
    },
  },
  vite: {
    resolve: {
      alias: {
        '@': '/app',
      },
    },
  },
});
