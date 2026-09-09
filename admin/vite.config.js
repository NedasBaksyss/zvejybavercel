import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  preview: {
    port: 81,
    host: true,
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
  server: {
    port: 81,
    strictPort: true,
    host: true,
    origin: "http://localhost:81",
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    // proxy: {
    //   '/api': {
    //     // when running inside Docker, target the api service by name
    //     target: 'http://api:3000',
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  },

  // base: '/admin',

  build: {
    manifest: true, // For integration with Nginx
  },
});
