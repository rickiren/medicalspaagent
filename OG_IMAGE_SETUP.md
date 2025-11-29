# OG Image Setup Instructions

## Generating the OG Image

The OG (Open Graph) image is used when sharing links on social media platforms like Facebook, Twitter, LinkedIn, etc.

### Option 1: Manual Screenshot (Recommended)

1. Open `public/og-image-generator.html` in your browser
2. Take a screenshot at exactly **1200x630 pixels** (the standard OG image size)
3. Save it as `public/og-image.png`
4. The image should show the Cynthia.ai widget interface

### Option 2: Using Browser DevTools

1. Open `public/og-image-generator.html` in Chrome/Edge
2. Open DevTools (F12)
3. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
4. Set custom dimensions: 1200x630
5. Take a screenshot using the browser's screenshot tool
6. Save as `public/og-image.png`

### Option 3: Using Online Tools

1. Use a service like [OG Image Generator](https://www.opengraph.xyz/) or similar
2. Upload the HTML file or recreate the design
3. Export at 1200x630px
4. Save as `public/og-image.png`

### Option 4: Automated (Using Puppeteer)

If you have Node.js installed, you can use this script:

```bash
npm install puppeteer --save-dev
```

Then create a script to generate the image automatically.

## Current Setup

- ✅ Favicon: `public/favicon.svg` (SVG format, works in modern browsers)
- ✅ Fallback favicon: `public/favicon.ico` (if it exists)
- ✅ OG Image HTML: `public/og-image-generator.html`
- ⚠️ OG Image PNG: `public/og-image.png` (needs to be generated)

## Meta Tags

The following meta tags are automatically set:
- Open Graph tags for Facebook, LinkedIn, etc.
- Twitter Card tags
- Standard meta description and title

All pages use the SEOHead component to dynamically update these tags.

