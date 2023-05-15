const defaultTheme = require('tailwindcss/defaultTheme');
const rootTailWindConfig = require('../tailwind.config.cjs');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // share same color palette of Podman Desktop UI
      colors: rootTailWindConfig.theme.colors,
      backgroundImage: {
        'hero-pattern': 'url(/img/gradients.png)',
      },
      fontFamily: {
        sans: ['Montserrat', ...defaultTheme.fontFamily.sans],
      },
      extend: {},
    },
  },
  plugins: [],
};
