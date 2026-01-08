/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Permite activar el modo oscuro añadiendo la clase 'dark' al HTML
  theme: {
    extend: {
      // Puedes añadir colores o fuentes personalizadas aquí más adelante
    },
  },
  plugins: [],
}
