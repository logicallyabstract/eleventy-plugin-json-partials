import * as cheerio from 'cheerio';
import { EleventyPluginCreateJsonPartials } from './types';

const WHITESPACE_REGEX = /\n\s*/g;

export const constructPartial = (
  options: EleventyPluginCreateJsonPartials,
  content: string,
) => {
  const { additionalScriptsSelector, partialContentSelector } = options;

  const $ = cheerio.load(content);

  // Parse out the HTML from the #content div
  const rawContentHtml = $(partialContentSelector).html() || '';
  const parsedContentHtml = rawContentHtml?.replace(WHITESPACE_REGEX, '');

  // Grab the title in order for the SPA to update the title dynamically
  const title = $('title').text();

  /**
   * Grab additional scripts that were put onto the rendered HTML page.
   * These are usually supporting custom web components to prioritize
   * the HTML rendering, then progressively enhance the experience with
   * an additional script.
   *
   * However, not all custom elements are used on every page, so the build
   * should try to not load the entire script bundle onto every page. When
   * these partial JS bundles are found, we can put them into this list and
   * let the SPA router pull them in on pages that need them.
   */
  const additionalScriptNodes = $(additionalScriptsSelector);
  const additionalScriptSources: string[] = [];
  additionalScriptNodes.each((_, ele) => {
    const src = $(ele).attr('src');

    if (src) {
      additionalScriptSources.push(src);
    }
  });

  return {
    scripts: additionalScriptSources,
    content: parsedContentHtml,
    title,
  };
};
