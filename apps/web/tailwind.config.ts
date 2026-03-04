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
          purple: '#8B5CF6',
          blue: '#3B82F6',
          green: '#10B981',
        }
      }
    },
  },
  plugins: [],
}

export default config
