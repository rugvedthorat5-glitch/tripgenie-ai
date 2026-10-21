# 📱 Running & Sharing TripGenie AI (College Project Guide)

This guide is designed for **you and your project team** so anyone with a **Windows laptop** and an **Android phone** can run the entire project with **1 click or 1 command**, even with **zero technical knowledge**.

---

## 👥 How to Share the Project With Your Friends (Windows Users)

### What they need installed once:
Only **Node.js** (LTS version from [nodejs.org](https://nodejs.org) - click Next, Next, Finish). They do NOT need to install MongoDB, Android Studio, or Java.

### The 1-Click Launch on Windows:
In the project folder, we created a file called:
👉 **`run_windows.bat`**

When your friend double-clicks **`run_windows.bat`**:
1. It automatically installs any missing packages.
2. It automatically starts the local backend server on port `5050` (using local MongoDB or automatic in-memory fallback).
3. It forwards ports for USB-connected Android phones (`adb reverse`).
4. It starts the frontend Expo server with mobile tunnel and prints a **QR Code**.
5. It opens the Web App in their browser at `http://localhost:8081`.

**Zero technical knowledge required!**

---

## 📱 How to Run on Their Android Phone (3 Best Approaches)

### 🥇 Approach 1: Share the Pre-Built APK (Already Created!)
The standalone Android APK has **already been generated** for you and is located at:
📁 **`TripGenie-AI.apk`** *(in the project root)*

1. Share this file to your phone or your friends via **WhatsApp**, **Google Drive**, **USB cable**, or **Nearby Share**.
2. On the Android mobile, tap **TripGenie-AI.apk** and click **Install**.
   *(If prompted by Android, tap "Settings" -> allow "Install unknown apps").*
3. The app is now installed on the home screen as a real native Android application!

*(If you ever make code changes and want to rebuild a new APK, just run: `npm run build:apk:local`)*

---

### 🥈 Approach 2: Instant Run via "Expo Go" (No APK Needed — 1 Minute)
If they want to run it right away without downloading an APK file:

1. Install **Expo Go** from the **Google Play Store** (Free).
2. When they double-click `run_windows.bat` on their Windows laptop, a **QR code** appears in the terminal.
3. Open Expo Go on their Android phone and scan the QR code.
4. The full app loads and runs natively on their phone!

---

## 🔌 How to Connect Mobile Phone to Local Backend (Without Cloud Hosting)

### ⚡ Method A: Via USB Cable (Zero Wi-Fi Needed)
If they have a USB cable plugged between their Android phone and Windows laptop:

1. On their Android phone, enable **USB Debugging**:
   - Go to **Settings** > **About Phone**.
   - Tap **Build Number** 7 times to enable Developer Options.
   - Go to **Settings** > **Developer Options** > Turn ON **USB Debugging**.
2. Plug the USB cable into the laptop.
3. In `run_windows.bat`, port forwarding is handled automatically:
   ```cmd
   adb reverse tcp:5050 tcp:5050
   ```
4. Now in the app, the mobile phone can access `http://localhost:5050/api` directly through the USB wire!

---

### 📶 Method B: Via Phone Hotspot / Same Wi-Fi (Most Common)
1. Turn on **Personal Hotspot** on the Android phone.
2. Connect the Windows laptop to the phone's hotspot.
3. On the Windows laptop, open Command Prompt and type `ipconfig` to find the `IPv4 Address` (e.g. `192.168.43.120`).
4. Open TripGenie on the mobile phone:
   - On the Login screen, tap **"Connect to Laptop via Wi-Fi ▼"**.
   - Enter: `http://192.168.43.120:5050/api`
   - Tap **Save IP**.
5. Tap **Demo user** or **Sign In** — phone is connected to laptop backend!

---

### 🛡️ Method C: Instant Demo Mode (100% Fail-Safe for Viva / Presentation)
If Wi-Fi or cables fail during the professor's examination:
- On the Login screen, tap **"Instant Demo (No Server Needed)"**.
- The app immediately unlocks with all **50 destinations, verified photos, AI itinerary planner, budget calculator, and itineraries** working 100% offline!

---

## 📋 Summary: What to Give to Your Friends

| Item | What to send them | How they run it |
| :--- | :--- | :--- |
| **Windows Laptop** | Project ZIP folder | Double-click **`run_windows.bat`** |
| **Android Phone** | `TripGenie.apk` (via Drive/WhatsApp) | Tap and click **Install** |
| **Or Expo Go** | Free on Google Play Store | Scan QR code from `run_windows.bat` |
