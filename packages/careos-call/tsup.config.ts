import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/index.ts'],
  splitting: false,
  sourcemap: true,
  clean: false,
  onSuccess: 'pnpm run gen-types',
  // rxjs will be bundled together to avoid version conflict
  noExternal: ['rxjs'],
});
