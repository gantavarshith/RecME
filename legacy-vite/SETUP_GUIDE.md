# RecME Frontend Setup Guide

The `GooeyText` component requires Tailwind CSS, TypeScript, and shadcn/ui. Follow these steps to prepare your project.

## 1. Install Tailwind CSS

Tailwind is required for the styling of the component.

```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update your `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        foreground: "hsl(var(--foreground))",
      },
    },
  },
  plugins: [],
}
```

Add the Tailwind directives to your `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 2. Setup TypeScript

The component is written in `.tsx`. To support TypeScript in your Vite project:

```bash
npm install -D typescript @types/react @types/react-dom
touch tsconfig.json
```

Add a basic `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 3. Setup shadcn/ui Structure

Shadcn components typically live in `@/components/ui`.

1. Create the directories:
```bash
mkdir -p src/components/ui
mkdir -p src/lib
```

2. Add the `utils.ts` to `src/lib/utils.ts`:
```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

3. Install required utilities:
```bash
npm install clsx tailwind-merge lucide-react
```

## 4. Path Aliases

To support the `@/` alias in Vite, update `vite.config.js` (or `.ts` if renamed):

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```
