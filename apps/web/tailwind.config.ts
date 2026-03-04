import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        zyra: {
          olive: '#8C9A2E',
          'olive-light': '#A8B840',
          'olive-dark': '#6B7A22',
          warm: '#C4A84F',
          cream: '#E8E4D0',
        }
      }
    },
  },
  plugins: [],
}

export default config
