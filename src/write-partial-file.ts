import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';

const writePartialFile = async (to: string, json: unknown) => {
  await mkdir(dirname(to), { recursive: true });
  await writeFile(to, JSON.stringify(json));
};

module.exports = {
  writePartialFile,
};
