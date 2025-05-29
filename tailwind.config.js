/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2ecc71',
          secondary: '#27ae60',
          accent: '#1abc9c',
        },
        sidebar: '#0ea32b',
      },
    },
  },
  plugins: [],
}
