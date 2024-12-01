/** @type {import('tailwindcss').Config} */
export default {
    important: "#root", // This will make Tailwind styles take precedence over other styles
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        container: {
            padding: {
                DEFAULT: "1rem", // 16px padding for small screens
            },
            screens: {
                DEFAULT: "100%", // Keeps max width at 100% for all screen sizes
            },
        },
        extend: {
            colors: {
                primary: "#002554",
                blue: "#0F62FE",
                green: "#00EBB2",
                purple: "#9747FF",
            },
        },
    },
    plugins: [],
};
