/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hh: {
          green: "#046634",
          "deep-green": "#033e22",
          "dark-green": "#022916",
          cream: "#f7f1dc",
          "cream-light": "#fdfbf5",
          "cream-dark": "#ebe3c8",
          pink: "#f00f77",
          yellow: "#f3d000",
          black: "#111111",
          muted: "#55554f",
          border: "#e2d9be",
          "border-dark": "#1d4429",
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'hh-sm': '2px 2px 0px #111111',
        'hh': '4px 4px 0px #111111',
        'hh-green': '4px 4px 0px #033e22',
        'hh-pink': '4px 4px 0px #f00f77',
        'hh-yellow': '4px 4px 0px #f3d000',
      },
      borderWidth: {
        '1.5': '1.5px',
      }
    },
  },
  plugins: [],
};
