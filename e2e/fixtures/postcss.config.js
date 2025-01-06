const path = require('path');

module.exports = {
  plugins: [
    require('tailwindcss')(path.join(__dirname, 'tailwind.config.js')),
    require('postcss-modules')({
      generateScopedName: '[local]',
      getJSON: () => {}, // We don't need the JSON output
    }),
  ],
};
