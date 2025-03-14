
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
          
          // First check if we can read the source file content
          if (await fs.pathExists('public/.htaccess')) {
            try {
              // Read content to verify file is readable
              const content = await fs.readFile('public/.htaccess', 'utf8');
              console.log('.htaccess content length:', content.length);
              console.log('First few characters:', content.substring(0, 30));
              
              // Ensure dist directory exists
              if (!(await fs.pathExists('dist'))) {
                await fs.mkdir('dist');
                console.log('✅ Created dist folder');
              }
              
              // Write the file directly with the content we read
              await fs.writeFile('dist/.htaccess', content, { mode: 0o644 });
              console.log('✅ .htaccess file written directly to dist folder');
              
              // Verify the file exists
              if (await fs.pathExists('dist/.htaccess')) {
                console.log('✅ Verified .htaccess exists in dist folder');
                
                // Read the content back to verify it's correct
                const writtenContent = await fs.readFile('dist/.htaccess', 'utf8');
                console.log('Written content matches:', writtenContent === content);
                
                // Double check
                const stats = await fs.stat('dist/.htaccess');
                console.log('File stats:', stats);
                
                // List files in dist including hidden files
                console.log('Listing dist directory with ls -la via exec:');
                const { exec } = require('child_process');
                exec('ls -la dist', (error: any, stdout: string, stderr: string) => {
                  if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                  }
                  console.log(`stdout: ${stdout}`);
                  if (stderr) console.error(`stderr: ${stderr}`);
                });
              } else {
                console.error('❌ .htaccess was not found in dist folder after write');
              }
            } catch (readError) {
              console.error('Error reading source .htaccess file:', readError);
            }
          } else {
            console.error('❌ Source .htaccess file not found in public folder');
          }
        } catch (error) {
          console.error('Error handling .htaccess file:', error);
        }
      },
      closeBundle: async () => {
        // Add a second attempt in closeBundle as well
        console.log('Second attempt in closeBundle hook');
        if (await fs.pathExists('public/.htaccess') && await fs.pathExists('dist')) {
          try {
            // Directly copy the file again
            await fs.copyFile('public/.htaccess', 'dist/.htaccess');
            console.log('✅ Second copy attempt completed');
            
            // Set permissions explicitly
            await fs.chmod('dist/.htaccess', 0o644);
            
            // Verify if it exists
            if (await fs.pathExists('dist/.htaccess')) {
              console.log('✅ Final verification successful');
            }
          } catch (error) {
            console.error('Error in second copy attempt:', error);
          }
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
