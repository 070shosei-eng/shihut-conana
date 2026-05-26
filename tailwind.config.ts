import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        surface: '#ffffff',
        ink: '#111827',
        muted: '#6b7280',
        line: '#e5e7eb',
        primary: '#2563eb',
        primarySoft: '#dbeafe'
      },
      boxShadow: {
        card: '0 10px 30px rgba(17, 24, 39, 0.08)',
        sheet: '0 -8px 32px rgba(17, 24, 39, 0.14)'
      },
      borderRadius: {
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
};

export default config;
