import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cashnoir.game',
  appName: 'CASH NOIR',
  webDir: 'dist',
  backgroundColor: '#050507',
  ios: { contentInset: 'never', allowsLinkPreview: false },
  android: { backgroundColor: '#050507' },
  plugins: { SystemBars: { insetsHandling: 'css', style: 'DARK' } },
};

export default config;
