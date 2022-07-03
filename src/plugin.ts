import { createJsonPartials, DEFAULTS } from './create-json-partials';

const PLUGIN_IDENT = 'eleventy-json-partials';

export function eleventyJsonPartials(
  eleventyConfig: any,
  passedOptions = DEFAULTS,
) {
  const options = {
    ...DEFAULTS,
    ...passedOptions,
  };

  eleventyConfig.addTransform(PLUGIN_IDENT, createJsonPartials(options));
}
