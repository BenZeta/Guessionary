/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        bounceLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: 0 },
          '50%': { transform: 'translateX(10%)', opacity: 1 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        bounceRight: {
          '0%': { transform: 'translateX(100%)', opacity: 0 },
          '50%': { transform: 'translateX(-10%)', opacity: 1 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        bounceUp: {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '50%': { transform: 'translateY(-10%)', opacity: 1 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        bounceDown: {
          '0%': { transform: 'translateY(-100%)', opacity: 0 },
          '50%': { transform: 'translateY(10%)', opacity: 1 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
      animation: {
        bounceLeft: 'bounceLeft 1s ease-in-out',
        bounceRight: 'bounceRight 1s ease-in-out',
        bounceUp: 'bounceUp 1s ease-in-out',
        bounceDown: 'bounceDown 1s ease-in-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animated')
  ],
}