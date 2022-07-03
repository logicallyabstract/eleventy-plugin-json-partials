import { expect } from 'chai';
import { stub, SinonStub } from 'sinon';

import * as constructPartialModule from './construct-partial';
import * as constructOutputPathModule from './construct-output-path';
import * as writePartialFileModule from './write-partial-file';

import type * as m from './create-json-partials';

describe('eleventyPluginCreateJsonPartials', () => {
  let constructPartialStub: SinonStub;
  let constructOutputPathStub: SinonStub;
  let writePartialFileStub: SinonStub;

  let subject: typeof m;

  beforeEach(async () => {
    constructPartialStub = stub(constructPartialModule, 'constructPartial');
    constructOutputPathStub = stub(
      constructOutputPathModule,
      'constructOutputPath',
    );
    writePartialFileStub = stub(writePartialFileModule, 'writePartialFile');

    subject = await import('./create-json-partials');
  });

  it('should call the plugin logic to create the partial file', async () => {
    const { createJsonPartials } = subject;

    const options = {
      partialContentSelector: '#content',
      additionalScriptsSelector: 'script[data-componentscript]',
    };
    const outputPath = 'path/index.html';

    constructPartialStub.withArgs(options, HTML_A).returns(HTML_A_RESULT);
    constructOutputPathStub.withArgs(outputPath).returns('path/index.json');
    writePartialFileStub
      .withArgs('path/index.json', HTML_A_RESULT)
      .resolves(undefined);

    const fn = createJsonPartials(options);
    const result = await fn(HTML_A, outputPath);

    expect(result).to.equal(HTML_A);

    expect(constructPartialStub.getCalls()).to.have.length(1);
    expect(constructOutputPathStub.getCalls()).to.have.length(1);
    expect(writePartialFileStub.getCalls()).to.have.length(1);
  });
});

const HTML_A_RESULT = {
  content: '<h1>Content</h1>',
  scripts: ['script-a.js', 'script-b.js'],
  title: 'Title',
};

const HTML_A = `<html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<head><title>Title</title></head>
<body>
<head><p>Header</p></head>
<main id="content">
<h1>Content</h1>
</main>
<script src="script-a.js" data-componentscript></script>
<script src="script-b.js" data-componentscript="true"></script>
</body>
</html>`;
