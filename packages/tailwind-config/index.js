/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        'success-tick':
          'url(' +
          '"' +
          "data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C19.98 4.48 15.52 0.02 10 0Z' fill='%232FCE82'/%3E%3Cpath d='M16.0901 6.25998C15.7501 5.90998 15.1901 5.90998 14.8501 6.24998C14.8501 6.24998 14.8501 6.24998 14.8401 6.25998L8.28009 12.83L5.52009 10.06C5.18009 9.70998 4.61009 9.69998 4.25009 10.05C3.89009 10.4 3.89009 10.97 4.23009 11.32C4.24009 11.33 4.26009 11.35 4.27009 11.36L7.65009 14.74C7.99009 15.09 8.55009 15.09 8.89009 14.75C8.89009 14.75 8.89009 14.75 8.90009 14.74L16.0801 7.55998C16.4401 7.22998 16.4601 6.66998 16.1301 6.31998C16.1201 6.28998 16.1101 6.27998 16.0901 6.25998Z' fill='white'/%3E%3C/svg%3E%0A" +
          '"' +
          ')',
        'checked':
          'url(' +
          '"' +
          "data:image/svg+xml,%3csvg width='10' height='8' viewBox='0 0 10 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M8.49373 0.729138C8.83831 0.384558 9.39698 0.384558 9.74156 0.729138C10.0861 1.07372 10.0861 1.63239 9.74156 1.97697L4.44745 7.27109C4.10287 7.61567 3.54419 7.61567 3.19961 7.27109L0.258435 4.32992C-0.0861451 3.98533 -0.0861451 3.42666 0.258435 3.08208C0.603015 2.7375 1.16169 2.7375 1.50627 3.08208L3.82353 5.39934L8.49373 0.729138Z' fill='rgb(233 236 239)'/%3e%3c/svg%3e" +
          '"' +
          ')',
      },
      fontSize: {
        small: '11px',
        'extra-lg': '21px',
        lg: '17px',
        '2lg': '1.375rem',
        medium: '15px',
        base: '13px',
        xs: '0.75rem',
        sm: '0.875rem',
        xl: '1.5rem',
      },
      fontFamily: {
        sans: [
          'Poppins',
          'Kanit',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
        heading: ['Poppins', 'Kanit'],
        body: ['Poppins', 'Kanit'],
      },
      colors: {
        primary: {
          light: '#f2f3fa',
          DEFAULT: '#005098',
          dark: '#003d74',
        },
        secondary: '#f78f1e',
        warning: '#f26641',
        error: '#ea4548',
        success: '#2fce82',
        rabbitGray: '#ced4da',
        muted: {
          300: '#f0f3fc',
          light: '#e9edf5',
          DEFAULT: '#e3e4ee',
          dark: '#a5aaC0',
          darker: '#4F4B66',
        },
        highlighted: {
          blue: '#dae3f0',
        },
        primaryColor: '#005098',
        font: '#4F4B66',
        tipColor: '#DEEEFD',
        borderColor: '#E9EDF5',
        lightgray: '#A5AAC0',
        borderLight: '#e9ecef',
        optionHover: '#F0F3FC',
        disabledColor: 'rgba(0, 0, 0, 0.12)',
      },
      spacing: {
        '15px': '0.9375rem',
        '60px': '3.75rem',
        '30px': '1.875rem',
      },
      width: {
        container: '960px',
        'logo-m': '64px',
      },
      boxShadow: {
        header: '0px 7px 15px rgba(42, 49, 203, 0.1)',
        stickyFooter: '0px -7px 9px rgb(42, 49, 203, 0.1)',
      },
      dropShadow: {
        radio: '0 0.4375rem 0.9375rem rgba(42,49,203,0.1)',
      },
      animation: {
        spinner: 'spin 0.75s linear infinite',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.overflow-anywhere': {
          overflowWrap: 'anywhere',
        },
      });
    },
  ],
};
