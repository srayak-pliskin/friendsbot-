/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'door-purple': '#6B2FA0',
        'deep-purple': '#3A1766',
        'lavender': '#C9A6E8',
        'soft-lilac': '#EDE3F7',
        'gold': '#F2C94C',
        'bright-gold': '#FFD700',
        'cream': '#FFF9F0',
        'charcoal': '#1E1B2E',
        'peach': '#F7C5A8',
        'frame-gold': '#D4A843',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Lora', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
