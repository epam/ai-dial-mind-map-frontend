// Theme tokens live in `src/app/globals.css` (`@theme`). This file is kept only for the
// `@tailwindcss/typography` overrides, which have no CSS-first equivalent yet.
/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--text-primary, #F3F4F6)',
            a: {
              color: 'var(--text-accent-primary, #5C8DEA)',
            },
            pre: {
              border: 'none',
              borderRadius: '0',
              backgroundColor: 'transparent',
              whiteSpace: 'pre-wrap',
            },
          },
        },
      },
    },
  },
};
export default config;
