import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';

import viteTsconfigPaths from 'vite-tsconfig-paths';

const ENVIRONMENTS = ['staging', 'production', 'preprod'];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  env.mode = mode;

  const commitHash = process.env.COMMIT_SHA ?? '';

  const htmlPlugin = () => ({
    name: 'html-transform',
    transformIndexHtml(html: string) {
      return html.replace(/<%=(.*?)%>/g, (match, p1) => env[p1] ?? match);
    },
  });

  // expose .env as process.env instead of import.meta since jest does not import meta yet
  const envWithProcessPrefix = Object.entries(env).reduce(
    (prev, [key, val]) => ({
      ...prev,
      [`process.env.${key}`]: `"${val}"`,
    }),
    {}
  );

  return {
    plugins: [react(), htmlPlugin(), viteTsconfigPaths(), svgrPlugin()],
    build: {
      sourcemap: ENVIRONMENTS.includes(mode),
      outDir: 'build',
      assetsDir: 'static/assets',
      rollupOptions: {
        output: {
          chunkFileNames: `static/assets/[name]-[hash]-${commitHash}.js`,
        },
      },
    },
    server: {
      open: true,
      port: 3030,
    },
    clearScreen: false,
    define: { ...envWithProcessPrefix, __APP_VERSION__: `"${commitHash}"` },
    rollupOptions: {
      maxParallelFileOps: 2,
    },
  };
});
