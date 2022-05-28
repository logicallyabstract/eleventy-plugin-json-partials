import { dirname } from 'path';

export const constructOutputPath = (outputPath: string) => {
  const directory = dirname(outputPath);
  return `${directory}/index.json`;
};
