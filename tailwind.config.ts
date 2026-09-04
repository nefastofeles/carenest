import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        nest: {
          magenta: "#D61F7A",
          magentadark: "#B01864",
          gold: "#E4B13A",
          peach: "#F8D9C8",
          cream: "#FBF6F1",
          ink: "#374151",
        },
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
