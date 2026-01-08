# PrimeLux iOS Application

This project has been enhanced with **Capacitor**, turning your Next.js admin dashboard into a native iOS application.

## Prerequisites
- macOS with **Xcode** installed.
- CocoaPods installed (`sudo gem install cocoapods`).

## Development Workflow

### 1. Build the Web App
**CRITICAL**: You must build your project so that Capacitor has content to display. Without this, you will see `window.Capacitor` errors in Xcode.
```bash
npm run build
```
*Note: I have enabled `output: "export"` in your `next.config.mjs` to ensure compatibility.*

### 2. Sync with iOS
Update the native iOS project with your latest web assets:
```bash
npx cap sync
```

### 3. Open in Xcode
To run the app on a simulator or physical device:
```bash
npx cap open ios
```

## Configuration

The iOS application is configured as a **Hybrid Wrapper**. Because your app uses dynamic features (API Routes, Server Actions), it cannot be fully static. It must connect to a running Next.js server.

### 1. Set Your Server URL
Open `capacitor.config.ts` and update the `server.url` to point to your backend:

- **Development**: Use your Mac's local IP (e.g., `http://192.168.1.50:3000`).
  - *Tip: Ensure your iPhone is on the same Wi-Fi.*
- **Production**: Use your live URL (e.g., `https://primelux-admin.vercel.app`).

### 2. Verify Connection
If the app shows "App Not Configured", it means it's falling back to the offline shell because it can't reach the server.

## Native Features Enabled
- **Premium App Icon**: Custom luxury 'P' logo generated and placed in `public/icons`.
- **Camera Access**: Configured in `Info.plist` for future QR scanning.
- **Photo Library**: Configured for signature and image uploads.
- **iOS Viewport**: Optimized for notched displays (iPhone XR/11/12/13/14/15/16).
