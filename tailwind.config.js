/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        kidoria: {
          // Terracotta accent — warm, editorial, distinctive (was pastel pink)
          rose: '#C85A2A',
          // Neutral warm surfaces (were pastels)
          peach: '#F0EBE4',
          mint: '#D4E4D8',
          sky: '#E2DED8',
          lavender: '#EDEAE5',
          // Page background — barely warm white
          cream: '#F8F6F2',
          // Typography
          text: '#1A1614',
          muted: '#706B65',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 24px rgba(26, 22, 20, 0.08)',
        card: '0 1px 6px rgba(26, 22, 20, 0.07), 0 0 0 1px rgba(26, 22, 20, 0.05)',
        book: '−2px 2px 0 rgba(0,0,0,0.08), 0 16px 56px rgba(26, 22, 20, 0.22)',
        lifted: '0 20px 60px rgba(26, 22, 20, 0.18)',
      },
      borderRadius: {
        lg: '10px',
        xl: '14px',
        '2xl': '18px',
        '3xl': '22px',
      },
    },
  },
  plugins: [],
}
