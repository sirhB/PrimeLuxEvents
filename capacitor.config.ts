import type { CapacitorConfig } from '@capacitor/cli';

import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.primelux.admin',
  appName: 'PrimeLux Admin',
  webDir: 'out',
  server: {
    // Replace with your local IP (e.g., http://192.168.1.50:3000) for dev
    // or your production URL (e.g., https://primelux-admin.vercel.app) for release.
    url: 'http://localhost:3000',
    cleartext: true
  },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Body,
      style: KeyboardStyle.Dark,
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      overlaysWebView: true,
    },
  },
};

export default config;
