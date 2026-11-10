import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from 'node:url';
import { blogPlugin } from './scripts/blog-plugin.mjs';

export default defineConfig({
  plugins: [vue(), tailwindcss(), blogPlugin()],
  build: {
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        projects: fileURLToPath(new URL('./projects/index.html', import.meta.url)),
        miniProjects: fileURLToPath(new URL('./mini-projects/index.html', import.meta.url)),
        blogs: fileURLToPath(new URL('./blogs/index.html', import.meta.url)),
      },
    },
  },
});
