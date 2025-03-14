
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
      closeBundle: async () => {
        try {
          console.log('Attempting to copy .htaccess file in closeBundle hook');
          
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
            
            // Use fs.writeFile instead of copy to ensure the file is created
            const htaccessContent = await fs.readFile('public/.htaccess', 'utf8');
            await fs.writeFile('dist/.htaccess', htaccessContent);
            console.log('✅ .htaccess file written to dist folder');
            
            // Verify the file was written
            if (await fs.pathExists('dist/.htaccess')) {
              console.log('✅ Verified .htaccess exists in dist folder');
              
              // List files in dist folder to confirm
              const distFiles = await fs.readdir('dist');
              console.log('Files in dist folder after copying:', distFiles);
              
              // Try to make the file visible by changing permissions
              try {
                await fs.chmod('dist/.htaccess', 0o644);
                console.log('✅ Changed permissions on .htaccess file');
              } catch (chmodError) {
                console.error('Error changing permissions:', chmodError);
              }
            } else {
              console.error('❌ .htaccess was not written to dist folder');
            }
          } else {
            console.error('❌ .htaccess file not found in public folder');
          }
        } catch (error) {
          console.error('Error handling .htaccess file:', error);
        }
      }
    }
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Make sure .htaccess is treated as an asset and copied
          if (assetInfo.name === '.htaccess') {
            return '.htaccess';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
