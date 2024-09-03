module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'orbitron' : ['Orbitron', 'sans-serif'],
        'roboto' : ['Roboto', 'sans-serif'],
        '7segment' : ['7-Segment', 'monospace'],
        'BTTF' : ['Back to the Future', 'sans-serif'],
      },
      colors: {
        'main-background' : '#E8FCFB',
        'button-color' : '#B2E2E5',
        'textfield-color' : '#EBEBEB',
        'button-hover' : '#5ABEC5',
      }
    },
  },
  plugins: [],
};
