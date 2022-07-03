import { constructOutputPath } from './construct-output-path';
import { constructPartial } from './construct-partial';
import { EleventyPluginCreateJsonPartialsOptions } from './types';
import { writePartialFile } from './write-partial-file';

export const DEFAULTS: EleventyPluginCreateJsonPartialsOptions = {
  partialContentSelector: '#content',
  additionalScriptsSelector: 'script[data-componentscript]',
};

export const createJsonPartials =
  (opts: EleventyPluginCreateJsonPartialsOptions) =>
  async (content: string, outputPath?: string) => {
    /**
     * If the page has "permalink" set to false, do not
     * render a JSON file.
     *
     * https://www.11ty.dev/docs/permalinks/#permalink-false
     */
    if (!outputPath) {
      return content;
    }

    /**
     * If we do not recognize the outputPath format, do not
     * render a JSON file.
     */
    const unrecognizedOutputPath = !outputPath.endsWith('/index.html');
    if (unrecognizedOutputPath) {
      return content;
    }

    const parsedOptions = {
      ...DEFAULTS,
      ...opts,
    };

    const partial = constructPartial(parsedOptions, content);
    const partialOutputPath = constructOutputPath(outputPath);
    await writePartialFile(partialOutputPath, partial);

    return content;
  };
