# 📋 Required HTML Structure

For the extension to work optimally, your page should have compatible elements:

```html
<div class="container-fluid">
  <!-- Main content area -->
  
  <div class="content">
    Your page content here...
  </div>
  
  <!-- Other optional elements -->
</div>

<!-- Theme will be applied here -->
<div class="count-container">Content</div>
```

## 📌 Explanations

| Element | Role | Required |
|---------|------|----------|
| `container-fluid` | Main container for theme application | ✅ YES |
| `content` | Content area to theme | ✅ YES |
| `count-container` | Area where theme is applied | ✅ YES |

## 🎯 Flow

1. User loads page
2. Extension detects `.container-fluid`
3. Applies dark theme to `.content`
4. Adjusts `.count-container` accordingly

## ⚠️ Notes

- The `.content` can be nested in `.container-fluid`
- The `.count-container` can be at any DOM level
- Theme applies automatically
- If elements not found, theme may not apply fully

## 🧪 Test Your HTML

If your site doesn't have this structure, you can:
1. Adapt the CSS selectors in `content.js`
2. Ou modifier le HTML de ton site

```javascript
// Dans content.js, modifier:
const contentDiv = document.querySelector('.content');
const countContainer = document.querySelector('.count-container');
```
