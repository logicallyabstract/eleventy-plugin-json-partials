import {
  registerImportMetaUrl,
  replace,
  reset,
  verify,
  when,
} from '../test-helpers/esbuild-loader.js';

describe('writePartialFile', () => {
  let fs: any;
  let subject: any;

  beforeEach(async () => {
    registerImportMetaUrl(import.meta.url);
    fs = await replace('fs/promises');

    subject = await import('./write-partial-file');
  });

  afterEach(() => {
    reset();
  });

  it('should write the file', async () => {
    when(fs.mkdir, 'path', { recursive: true }).thenResolve(undefined);

    when(
      fs.writeFile,
      'path/index.json',
      JSON.stringify(HTML_A_RESULT),
    ).thenResolve(undefined);

    await subject.writePartialFile('path/index.json', HTML_A_RESULT);

    verify(fs.writeFile, 'path/index.json', JSON.stringify(HTML_A_RESULT));
  });
});

const HTML_A_RESULT = {
  content: '<h1>Content</h1>',
  scripts: ['script-a.js', 'script-b.js'],
  title: 'Title',
};
