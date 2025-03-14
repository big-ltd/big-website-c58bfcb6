
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs-extra';
import { exec } from 'child_process';
import type { ResolvedConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    {
      name: 'copy-htaccess',
      configResolved(config: ResolvedConfig) {
        console.log('Build outDir:', config.build.outDir);
      },
      closeBundle: async () => {
        try {
          console.log('Attempting to copy .htaccess file in closeBundle hook');
          
          // Log files in public folder to verify .htaccess exists
          const publicFiles = await fs.readdir('public');
          console.log('Files in public folder:', publicFiles);
          
          // Use a shell command to copy the file, which handles hidden files well
          exec('cp -f public/.htaccess dist/', (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return;
            }
            
            // Use ls command to verify the file exists with hidden files visible
            exec('ls -la dist', (lsError, lsStdout, lsStderr) => {
              if (lsError) {
                console.error(`ls exec error: ${lsError}`);
                return;
              }
              console.log('Files in dist folder (showing hidden files):');
              console.log(lsStdout);
              
              // Set permissions to ensure file is readable
              exec('chmod 644 dist/.htaccess', (chmodError) => {
                if (chmodError) {
                  console.error(`chmod error: ${chmodError}`);
                }
                console.log('Set permissions on .htaccess to 644');
              });
            });
            
            console.log('✅ .htaccess file written to dist folder');
          });
          
          // Write a success message to a log file we can check
          await fs.writeFile('dist/htaccess-copy-log.txt', 'Copy attempt completed at ' + new Date().toString(), 'utf8');
        } catch (error) {
          console.error('Error copying .htaccess file:', error);
          // Write error to log file
          await fs.writeFile('dist/htaccess-copy-error.txt', String(error), 'utf8');
        }
      }
    }
  ].filter(Boolean),
  build: {
    // Explicitly tell Vite not to clean the output directory
    emptyOutDir: false
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
