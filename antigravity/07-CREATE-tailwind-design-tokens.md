# TASK: Create Tailwind Design Tokens

## Priority: HIGH (Foundation)

## Problem
The tailwind.config.js is empty - no custom colors, fonts, or design tokens defined. This makes consistency impossible.

## File to Update
`kalasetu-frontend/tailwind.config.js`

## Current (empty) Config
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## New Config to Implement

Replace the entire file with:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand colors - Terracotta/Artisan theme
        brand: {
          50: '#fdf8f6',
          100: '#f9ebe5',
          200: '#f2d4c7',
          300: '#e8b59e',
          400: '#d4896a',
          500: '#A55233',  // Primary brand color
          600: '#8e462b',  // Hover state
          700: '#753a24',
          800: '#5c2e1c',
          900: '#432214',
          950: '#2a1510',
        },
        // Semantic colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        // Neutral with warm undertone (for artisan feel)
        warm: {
          50: '#fdfbf7',
          100: '#f7f3ed',
          200: '#ede5d8',
          300: '#d9cbb8',
          400: '#bfa98e',
          500: '#a08b6e',
          600: '#8a7560',
          700: '#6b5a4a',
          800: '#4a3e34',
          900: '#2d2520',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
      },
      borderRadius: {
        'button': '8px',
        'card': '12px',
        'modal': '16px',
        'input': '8px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        'dropdown': '0 10px 40px -5px rgba(0,0,0,0.15)',
        'modal': '0 25px 50px -12px rgba(0,0,0,0.25)',
        'button': '0 1px 2px rgba(0,0,0,0.05)',
        'button-hover': '0 4px 6px -1px rgba(0,0,0,0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
    },
  },
  plugins: [],
}
```

## Also Add Google Fonts

Update `kalasetu-frontend/index.html` to include fonts:

```html
<head>
  <!-- Add before </head> -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
</head>
```

## How to Use New Tokens

After this change, you can use:

```jsx
// Brand colors
<button className="bg-brand-500 hover:bg-brand-600">Primary</button>
<span className="text-brand-500">Accent text</span>

// Semantic colors
<div className="bg-success-100 text-success-700">Success message</div>
<div className="bg-error-100 text-error-700">Error message</div>

// Custom shadows
<div className="shadow-card hover:shadow-card-hover">Card</div>

// Custom border radius
<button className="rounded-button">Button</button>
<div className="rounded-card">Card</div>

// Fonts
<h1 className="font-display text-4xl">Artisan Heading</h1>
<p className="font-sans">Body text</p>

// Warm neutrals (artisan feel)
<div className="bg-warm-50">Warm background</div>

// Animations
<div className="animate-fade-in">Fades in</div>
<div className="animate-slide-up">Slides up</div>
```

## Steps

1. Replace tailwind.config.js with the new config
2. Add Google Fonts link to index.html
3. Restart the dev server (`npm run dev`)
4. Test that the new classes work

## Success Criteria
- `bg-brand-500` works and shows terracotta color
- `font-display` shows serif font (Playfair Display)
- `shadow-card` works
- `rounded-card` works
- No build errors

## Next Steps After This
Once design tokens are set up, you can:
1. Create Button component using `bg-brand-500`
2. Create Card component using `rounded-card shadow-card`
3. Gradually replace hardcoded colors with brand colors
