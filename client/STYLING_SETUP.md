# Styling Setup

This project uses **Tailwind CSS** for styling.

## Dependencies

Make sure these are installed:
- `tailwindcss` (already in dependencies)
- `postcss` (added to devDependencies)
- `autoprefixer` (added to devDependencies)

## Configuration Files

1. **`tailwind.config.cjs`** - Tailwind configuration
2. **`postcss.config.js`** - PostCSS configuration for processing Tailwind
3. **`src/index.css`** - Main CSS file with Tailwind directives

## Installation

After pulling changes, run:
```bash
cd client
npm install
```

This will install `postcss` and `autoprefixer` which are required for Tailwind to work with Create React App.

## Build Process

Create React App 5.0+ automatically processes PostCSS, so Tailwind should work out of the box after installing dependencies.

If styles aren't loading:
1. Make sure `postcss` and `autoprefixer` are installed
2. Clear the build cache: `rm -rf node_modules/.cache`
3. Restart the dev server

