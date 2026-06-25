# Password In Your Hands - Personal Password Manager

*[Đọc bằng Tiếng Việt](README.md)*

A serverless Progressive Web App (PWA) password manager. All your data is stored directly in your personal **Google Sheets** and is protected by **AES-256** encryption running locally in your browser. Absolute privacy, Zero-Knowledge security, and 100% under your control.

## ✨ Key Features
- **Zero-Knowledge Security:** Passwords can only be decrypted on your local device using your Master Password. Even if your Google Sheet link is exposed, no one can read your data.
- **Serverless:** Uses your personal Google Sheets as a completely free database backend.
- **PWA Ready:** Installable as a native app on PC, iOS, and Android.
- **Fast Synchronization:** Export/Import an encrypted configuration file to switch devices in 3 seconds.
- **Multi-language:** Supports English and Vietnamese out of the box.

---

## 🚀 Quick Setup (3 Steps)

1. **Host the App:** Push this source code to your GitHub account and enable **GitHub Pages** (or host the static files anywhere). You will get a web link (e.g., `https://your-name.github.io/PasswordInYourHands`).
2. **Create Database:** Create a new, blank **Google Sheet** and copy its URL.
3. **Get Client ID:** 
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new Project -> Enable **Google Sheets API**.
   - Go to Credentials -> Create an **OAuth Client ID** (select Web application type). 
   - Under *Authorized JavaScript origins*, paste your website link from Step 1. 
   - Once created, Google will provide you with a **Client ID** string (looks like `xxxx.apps.googleusercontent.com`).

---

## 💻 First-Time Usage

1. Open the website (your hosted app link).
2. Paste the **Google Sheet URL** and **Client ID** (obtained above) into the Setup screen.
3. Sign in with your Google account to grant write access.
4. Create your own **Master Password** (Never forget this!).
5. Done! Start saving your passwords safely.

*(💡 **Tip:** On the main dashboard, click the 📥 **Export Config** button to download a backup file. When using a different device, just upload this backup file, enter your Master Password, and the app will automatically configure everything for you!)*
Demo on: https://phuangtrieu.github.io/LocalPasswordManager/
