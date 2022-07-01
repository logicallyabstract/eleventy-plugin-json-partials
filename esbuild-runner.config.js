module.exports = {
  type: 'bundle', // bundle or transform (see description above)
  esbuild: {
    // Any esbuild build or transform options go here
    target: 'es6',

    format: 'cjs',
  },
};
