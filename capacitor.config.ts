import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cashnoir.game',
  appName: 'CASH NOIR',
  webDir: 'dist',
  backgroundColor: '#050507',
  ios: { contentInset: 'never', allowsLinkPreview: false },
  android: { backgroundColor: '#050507' },
  plugins: {
    SystemBars: { insetsHandling: 'css', style: 'DARK' },
    // Le clavier rétrécit la WebView au lieu de faire défiler toute la page (en-tête sous l'horloge, bouton Envoyer raté).
    Keyboard: { resize: 'native', resizeOnFullScreen: true },
  },
};

export default config;
