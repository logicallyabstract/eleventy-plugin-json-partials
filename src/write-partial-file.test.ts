// describe('writePartialFile', () => {
//   let fs: any;
//   let subject: any;

//   beforeEach(async () => {
//     registerImportMetaUrl(import.meta.url);
//     fs = await replace('fs/promises');

//     subject = await import('./write-partial-file');
//   });

//   afterEach(() => {
//     reset();
//   });

//   it('should write the file', async () => {
//     when(fs.mkdir, 'path', { recursive: true }).thenResolve(undefined);

//     when(
//       fs.writeFile,
//       'path/index.json',
//       JSON.stringify(HTML_A_RESULT),
//     ).thenResolve(undefined);

//     await subject.writePartialFile('path/index.json', HTML_A_RESULT);

//     verify(fs.writeFile, 'path/index.json', JSON.stringify(HTML_A_RESULT));
//   });
// });

import { expect } from 'chai';
import * as fs from 'fs/promises';
import { SinonStub, stub } from 'sinon';

import type * as m from './write-partial-file';

describe('writePartialFile', () => {
  let mkdirStub: SinonStub;
  let writeFileStub: SinonStub;

  let subject: typeof m;

  beforeEach(async () => {
    mkdirStub = stub(fs, 'mkdir');
    writeFileStub = stub(fs, 'writeFile');

    subject = await import('./write-partial-file');
  });

  it('should write the file', async () => {
    mkdirStub.withArgs('path', { recursive: true }).resolves(undefined);
    writeFileStub
      .withArgs('path/index.json', HTML_A_RESULT)
      .resolves(undefined);

    const { writePartialFile } = subject;

    await writePartialFile('path/index.json', HTML_A_RESULT);

    expect(mkdirStub.getCalls()).to.have.length(1);
    expect(writeFileStub.getCalls()).to.have.length(1);
  });
});

const HTML_A_RESULT = {
  content: '<h1>Content</h1>',
  scripts: ['script-a.js', 'script-b.js'],
  title: 'Title',
};
