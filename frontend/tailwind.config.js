/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                hyrox: {
                    bg: '#121212',
                    orange: '#FF4500',
                }
            }
        },
    },
    plugins: [],
}
