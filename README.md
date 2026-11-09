# Auto Dark Theme 🌙

A browser extension that automatically applies an adaptive dark theme and optimizes contrast across websites to reduce eye strain.

---

## 🎯 Features

- **Adaptive Contrast Engine:** Automatically inspects and calibrates document colors for low-light reading.
- **Smart Element Adaptation:** Interacts seamlessly with form elements and dropdowns for high-contrast visibility.
- **High Performance:** Lightweight, instant response without noticeable latency.
- **Multiple Rendering Engines:** Supports modern processing engines (OpenAI, Anthropic Claude, Google Gemini, DeepSeek) for optimal visual structure parsing.

---

## ⚙️ Engine Profiles & Models

The extension integrates with high-efficiency visual layout engines:

| Engine | Default Profile | Recommended Use |
| :--- | :--- | :--- |
| **OpenAI Engine** | `gpt-4o-mini` | Fast, lightweight multimodal parsing |
| **Anthropic Engine** | `claude-3-5-sonnet-latest` | High-fidelity table and document structure parsing |
| **Google Gemini Engine** | `gemini-2.0-flash` | Ultra-fast low-latency rendering |
| **DeepSeek Engine** | `deepseek-chat` | Cost-effective text and logic processing |

---

## 🔧 Installation

### Chrome / Brave / Edge
1. Navigate to `chrome://extensions/` in your browser.
2. Enable **Developer mode** (top right corner).
3. Click **Load unpacked**.
4. Select this directory (`darktheme`).

### Firefox
1. Navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select `manifest.json`.

---

## 🚀 Configuration

1. Click on the extension icon in your browser toolbar.
2. Select your preferred **Rendering Engine**.
3. Choose a processing profile or enter a custom one.
4. Input your access key / token.
5. Click **Save Preferences**.

---

## 📁 File Structure

```
darktheme/
├── manifest.json      # Extension configuration (Manifest v3)
├── config.js          # Engine configuration & profiles
├── content.js         # Content script for element inspection
├── background.js      # Background service worker
├── popup.html         # User settings interface
├── popup.js           # Settings persistence logic
└── README.md          # Project documentation
```
