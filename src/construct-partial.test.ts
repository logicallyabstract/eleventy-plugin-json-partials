import { expect } from 'chai';
import { constructPartial } from './construct-partial';

describe('constructPartial', () => {
  it('should extract the content, title, and custom scripts for a page partial object', () => {
    const result = constructPartial(
      {
        additionalScriptsSelector: 'script[data-componentscript]',
        partialContentSelector: '#content',
      },
      HTML_A,
    );
    expect(result).to.deep.equal(HTML_A_RESULT);
  });
});

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

const HTML_A_RESULT = {
  content: '<h1>Content</h1>',
  scripts: ['script-a.js', 'script-b.js'],
  title: 'Title',
};
