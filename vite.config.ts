
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs-extra';
import type { ResolvedConfig } from 'vite';

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
      configResolved(config: ResolvedConfig) {
        console.log('Build outDir:', config.build.outDir);
      },
      buildStart() {
        console.log('Starting build process, will copy .htaccess file');
      },
      writeBundle: async () => {
        try {
          console.log('Attempting to copy .htaccess file in writeBundle hook');
          
          if (await fs.pathExists('public/.htaccess')) {
            // Ensure dist directory exists
            if (!(await fs.pathExists('dist'))) {
              await fs.mkdir('dist');
              console.log('✅ Created dist folder');
            }
            
            // Copy the file directly
            await fs.copyFile('public/.htaccess', 'dist/.htaccess');
            console.log('✅ .htaccess file copied to dist folder using copyFile');
            
            // Verify the file exists and set permissions
            if (await fs.pathExists('dist/.htaccess')) {
              console.log('✅ Verified .htaccess exists in dist folder');
              
              // Change permissions to ensure visibility
              try {
                await fs.chmod('dist/.htaccess', 0o644);
                console.log('✅ Changed permissions on .htaccess file to 644');
                
                // Double check
                const stats = await fs.stat('dist/.htaccess');
                console.log('File stats:', stats);
              } catch (chmodError) {
                console.error('Error changing permissions:', chmodError);
              }
              
              // List files in dist for verification
              const distFiles = await fs.readdir('dist', { withFileTypes: true });
              console.log('Files in dist folder (including hidden):', 
                distFiles.map(dirent => ({
                  name: dirent.name,
                  isFile: dirent.isFile(),
                  isDirectory: dirent.isDirectory()
                }))
              );
            } else {
              console.error('❌ .htaccess was not found in dist folder after copy');
            }
          } else {
            console.error('❌ Source .htaccess file not found in public folder');
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
          // Check if this is the .htaccess file
          if (assetInfo.name === '.htaccess') {
            return '.htaccess';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    // Explicitly tell Vite not to clean the output directory
    emptyOutDir: false
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
