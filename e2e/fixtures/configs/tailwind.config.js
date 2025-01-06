/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['../styles/**/*.{css,module.css}'],
  corePlugins: {
    preflight: false, // Disable preflight to avoid conflicts
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
