import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Changed from 'error' to 'info' so the local dev URL is clearly visible
  // when running `npm run dev`.
  logLevel: 'info',
  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      // Disabled Base44 platform-editor features — these are only useful
      // when viewing the app inside Base44's hosted editor, not at localhost.
      hmrNotifier: false,
      navigationNotifier: false,
      analyticsTracker: false,
      visualEditAgent: false,
    }),
    react(),
  ],
});
