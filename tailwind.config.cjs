/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-cyan': '#00f3ff',
        'brand-green': '#39ff14',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      boxShadow: {
        neon: '0 6px 30px rgba(0,243,255,0.08)',
      },
      backgroundImage: {
        'network-grid': 'radial-gradient(circle at 20% 0%, rgba(0,243,255,0.06), transparent 20%), radial-gradient(circle at 80% 100%, rgba(57,255,20,0.04), transparent 20%)',
      },
    },
  },
  plugins: [],
};
