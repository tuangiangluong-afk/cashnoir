import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // En-têtes de sécurité sur le serveur de dev (le micro reste autorisé pour la dictée).
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'microphone=(self), camera=(), geolocation=()',
    },
    proxy: {
      // /api/ollama est désormais servi par le backend Node (modèle autorisé +
      // contrôle d'origine), plus directement par Vite vers 11434.
      '/api': 'http://127.0.0.1:3001',
    },
  },
  preview: {
    proxy: {
      '/api': 'http://127.0.0.1:3001',
    },
  },
});
