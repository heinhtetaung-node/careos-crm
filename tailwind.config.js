module.exports = {
  theme: {
    extend: {
      boxShadow: {
        toast: '0px 0px 30px rgba(42, 49, 203, 0.2)',
      },
      borderRadius: {
        '10px': '10px',
      },
      colors: {
        fieldHighlight: '#fbdada',
        inputBorder: '#e9edf5',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  plugins: [],
  /* eslint-disable global-require */
  presets: [require('@alphafounders/tailwind-config')],
};
