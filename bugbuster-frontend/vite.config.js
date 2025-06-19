import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src', // Permet d'utiliser '@' comme alias pour le dossier 'src'
    },
  },
  server: {
    port: 3001, // Définit le port du serveur de développement
    open: true, // Ouvre automatiquement le navigateur
  },
  build: {
    outDir: 'dist', // Dossier de sortie pour la build
  },
});