const { eleventyJsonPartials } = require('../../dist');

/**
 * This requires you to run `npm run build` first.
 * Then from this directory, run `npx eleventy --serve`
 */

module.exports = function (config) {
  const env = process.env.ELEVENTY_ENV || 'dev';

  config.addPlugin(eleventyJsonPartials);

  const settings = {
    dir: {
      input: './src/site',
      output: './dist',
      data: `./_data/${env}`,
    },
    templateFormats: ['njk', 'md', '11ty.js'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    passthroughFileCopy: true,
  };

  return settings;
};
