/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        'primary-brown': '#8B4513',
        'dark-brown': '#5C3A1F',
        'light-brown': '#92400E',
        'forest-green': '#2D7A3D',
        'mint-green': '#4CAF50',
        cream: '#F5F1EB',
        'light-green': '#E8F5E9',
        'light-beige': '#E8DDD5',
      },
      borderRadius: {
        DEFAULT: '16px',
      },
    },
  },
  plugins: [],
}
