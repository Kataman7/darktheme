# Auto Dark Theme Extension 🌙

An extension that automatically applies a dark theme to websites to reduce eye strain and improve readability.

## 🎯 Features

- ✅ Automatically detects web pages and applies a dark theme
- ✅ Reduces eye strain during long browsing sessions
- ✅ Works on all websites without manual intervention
- ✅ Customizable theme settings
- ✅ Lightweight and discreet - no visible buttons
- ✅ Each user can configure their preferences

## 📋 Prerequisites

1. A modern web browser (Chrome, Firefox, Edge, etc.)

## 🔧 Installation

### Chrome / Brave / Edge

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked extension"
4. Select the `darktheme` folder

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load a temporary module"
3. Select the `manifest.json` file from the `darktheme` folder

## ⚙️ Initial Configuration

1. Click the extension icon in the toolbar
2. Configure your theme preferences
3. Click "Save"

## 🚀 Usage

1. Visit any website
2. The dark theme applies automatically
3. Enjoy reduced eye strain while browsing

## 📁 File Structure

```
darktheme/
├── manifest.json      # Extension configuration
├── content.js         # Script that runs on web pages
├── background.js      # Background service for theme management
├── popup.html         # Configuration interface
├── popup.js           # Popup logic
├── test.html          # Local test page
└── README.md          # This file
```

## 🧪 Local Test

Open [test.html](test.html) in your browser to test the dark theme application.

## 🔍 Troubleshooting

**Theme not applying:**
- Check that the extension is enabled
- Verify that the page has compatible elements
- Open the console (F12) to see any error messages

**Configuration issues:**
- Ensure settings are saved properly
- Try refreshing the page

## 🔐 Security

- Settings stored locally in the browser (chrome.storage.local)
- No sensitive data sent externally
- No additional costs

## 💡 How it works

1. Extension monitors page loads
2. Automatically applies dark theme styles
3. Adjusts colors and backgrounds for better readability
4. Works seamlessly in the background

All done discreetly! 🌙
