import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/index.tsx'],
  splitting: false,
  sourcemap: true,
  clean: false,
  onSuccess: 'pnpm run gen-types',
});
