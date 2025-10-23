import { defineConfig } from "vite";
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({

  build: {
    rollupOptions: {
      input: {
        background: 'src/background.js',
        content: 'src/content.js',
        'floating-window': 'floating-window.js',
        main: 'index.html'
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return '[name].css';
          }
          return '[name].[ext]';
        }
      }
    },
    outDir: 'dist'
  },
  
  plugins: [
    {
      name: 'copy-assets',
      writeBundle() {
        // Criar pasta img na dist se não existir
        const distImgPath = resolve('dist/img');
        if (!existsSync(distImgPath)) {
          mkdirSync(distImgPath, { recursive: true });
        }
        
        // Copiar imagens da pasta img para dist/img
        try {
          copyFileSync('img/copia-de.png', 'dist/img/copia-de.png');
          copyFileSync('img/img-copiar.png', 'dist/img/img-copiar.png');
          console.log('✅ Imagens copiadas para dist/img/');
        } catch (error) {
          console.error('❌ Erro ao copiar imagens:', error);
        }

        // Copiar manifest.json da pasta public para dist
        try {
          copyFileSync('public/manifest.json', 'dist/manifest.json');
          console.log('✅ Manifest.json copiado para dist/');
        } catch (error) {
          console.error('❌ Erro ao copiar manifest.json:', error);
        }
      }
    }
  ]
});
