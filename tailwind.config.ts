import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        tokyo: '#dc2626',
        kanto: '#ea580c',
        deadline: '#b91c1c'
      }
    }
  },
  plugins: []
}

export default config
