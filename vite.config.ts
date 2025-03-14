
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs-extra';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    {
      name: 'copy-htaccess',
      writeBundle: async () => {
        try {
          // Make sure the .htaccess file exists in the public folder
          if (await fs.pathExists('public/.htaccess')) {
            // Copy .htaccess file to dist folder
            await fs.copy('public/.htaccess', 'dist/.htaccess');
            console.log('✅ .htaccess file copied to dist folder');
          } else {
            console.error('❌ .htaccess file not found in public folder');
          }
        } catch (error) {
          console.error('Error copying .htaccess file:', error);
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
