module.exports = {
  theme: {
    extend: {
      fontFamily: {
        heading: ['Poppins', 'Kanit'],
        body: ['Poppins', 'Kanit'],
      },
      keyframes: {
        progressBar: {
          '0%': {
            opacity: 0,
            left: '-20%',
            width: '25%',
          },
          '20%': {
            opacity: 0.5,
            left: '0%',
            width: '40%',
          },
          '50%': {
            opacity: 1,
            left: '30%',
            width: '60%',
          },
          '100%': {
            opacity: 0,
            left: '110%',
            width: '25%',
          },
        },
      },
      animation: {
        'progress-bar': 'progressBar 1s ease-in-out infinite',
      },
      boxShadow: {
        closeBtn: '0px 7px 15px 0px #2A31CB1A',
        'custom-shadow': '0px 7px 15px rgba(42, 49, 203, 0.1)',
      },
      colors: {
        slate: {
          950: '#A5AAC0',
        },
        primary: '#005098',
        line: '#E9EDF5',
        danger: '#EA4548',
        disabled: '#F2F3FA',
        body: '#4F4B66',
      },
      borderRadius: {
        10: '10px',
      },
      transitionProperty: {
        display: 'display',
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
