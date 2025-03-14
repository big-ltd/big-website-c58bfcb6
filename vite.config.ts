
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
      configResolved(config) {
        console.log('Build outDir:', config.build.outDir);
      },
      buildStart() {
        console.log('Starting build process, will copy .htaccess file');
      },
      writeBundle: async () => {
        try {
          console.log('Attempting to copy .htaccess file');
          
          // Check if public folder exists
          if (!(await fs.pathExists('public'))) {
            console.error('❌ Public folder not found');
            return;
          }
          
          // List files in public folder for debugging
          const publicFiles = await fs.readdir('public');
          console.log('Files in public folder:', publicFiles);
          
          // Make sure the .htaccess file exists in the public folder
          if (await fs.pathExists('public/.htaccess')) {
            // Make sure dist folder exists
            if (!(await fs.pathExists('dist'))) {
              await fs.mkdir('dist');
              console.log('✅ Created dist folder');
            }
            
            // Copy .htaccess file to dist folder
            await fs.copy('public/.htaccess', 'dist/.htaccess', { overwrite: true });
            console.log('✅ .htaccess file copied to dist folder');
            
            // Verify the file was copied
            if (await fs.pathExists('dist/.htaccess')) {
              console.log('✅ Verified .htaccess exists in dist folder');
            } else {
              console.error('❌ .htaccess was not copied to dist folder');
            }
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
