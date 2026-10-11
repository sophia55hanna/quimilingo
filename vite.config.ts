import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Caminhos relativos: o build funciona tanto na raiz quanto em subpastas (ex.: GitHub Pages /quimilingo/).
  base: './',
});
