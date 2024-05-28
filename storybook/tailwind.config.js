import config from '../tailwind.config.cjs';

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...config,
  content: ['./src/**/*.{svelte,ts,css}', '../packages/ui/**/*.{svelte,ts,css}'],
};
