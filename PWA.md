# PrimeLux Progressive Web App

PrimeLux runs as installable PWAs across three surfaces from a single Next.js deployment:

| Surface | Install URL | Manifest |
|---------|-------------|----------|
| Web store | `/` | `/manifest-store.webmanifest` |
| Client portal | `/account` | `/manifest-account.webmanifest` |
| Admin | `/admin` | `/manifest-admin.webmanifest` |

## Install on mobile

### Android / Chrome desktop
1. Open the surface you want (store, account, or admin).
2. Tap **Install app** when the banner appears, or use the browser menu → **Install app**.

### iOS Safari
1. Open the surface in Safari.
2. Tap **Share** → **Add to Home Screen**.
3. Launch PrimeLux from your home screen for the full-screen app experience.

## Offline behavior

A service worker caches static assets and shows `/offline` when navigation fails without a network connection. Admin mutations and live order data always require connectivity.

## Development

Serwist requires webpack for production builds:

```bash
npm run build
npm run start
```

PWA caching is disabled in development. Test install and offline behavior against a production build.

## QR scanning

Admin QR scanning uses the browser camera via `html5-qrcode`. Grant camera permission when prompted — this works in installed PWAs on supported mobile browsers.

## Replaced Capacitor

The previous Capacitor iOS wrapper has been removed. Mobile field use is handled through the installed admin PWA with the same bottom navigation, scan tools, and safe-area layout.
