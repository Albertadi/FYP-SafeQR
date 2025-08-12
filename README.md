# FYP-25-S2-18 | SafeQR 👋

SafeQR is a React Native + Expo app that scans QR codes and checks them against Google Safe Browsing and an ML classifier hosted on Google Cloud Run, with a JS-free Safe Preview. Accounts & email flows run through Supabase + AWS SES.

Features:
- Scan QR codes from camera or gallery (Expo Camera / Image Picker)
- Safety checks
   - Google Safe Browsing URL reputation
   - ML classifier (safe vs. malicious) served via Cloud Run
- Safe Preview
- History of scans (status, timestamp, decoded content)
- Reporting suspicious links (feeds model retraining)
- Accounts: register/login via Supabase Auth, email via AWS SES
- Model Updates: Admin-triggered retrain & publish; clients fetch latest version info

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).
