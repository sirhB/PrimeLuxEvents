import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.primelux.admin',
  appName: 'PrimeLux Admin',
  webDir: 'out',
  server: {
    // Replace with your local IP (e.g., http://192.168.1.50:3000) for dev
    // or your production URL (e.g., https://primelux-admin.vercel.app) for release.
    url: 'http://localhost:3000',
    cleartext: true
  }
};

export default config;
