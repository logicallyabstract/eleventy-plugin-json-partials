describe('eleventyPluginCreateJsonPartials', () => {
  let a: any;
  let b: any;
  let c: any;
  let subject: any;

  beforeEach(async () => {
    // a = await replace('./construct-partial');
    // b = await replace('./construct-output-path');
    // c = await replace('./write-partial-file');

    // subject = await import('./eleventy-plugin-json-partials');
    // console.log('subject', subject);
  });

  afterEach(() => {
    // reset();
  });

  // it('should call the plugin logic to create the partial file', async () => {
  //   const { eleventyPluginCreateJsonPartials } = subject;

  //   const options = {
  //     partialContentSelector: '#content',
  //     additionalScriptsSelector: 'script[data-componentscript]',
  //   };
  //   const outputPath = 'path/index.html';

  //   console.log(outputPath);

  //   when(a.constructPartial, options, HTML_A).thenReturn(HTML_A_RESULT);
  //   when(b.constructOutputPath, outputPath).thenReturn('path/index.json');
  //   when(c.writePartialFile, 'path/index.json', HTML_A_RESULT).thenResolve(
  //     undefined,
  //   );

  //   const fn = eleventyPluginCreateJsonPartials(options);
  //   const result = await fn(HTML_A, outputPath);

  //   verify(a.constructPartial, options, HTML_A);
  //   verify(b.constructOutputPath, outputPath);
  //   verify(c.writePartialFile, 'path/index.json', HTML_A_RESULT);
  //   expect(result).to.equal(HTML_A);
  // });
});

// const HTML_A_RESULT = {
//   content: '<h1>Content</h1>',
//   scripts: ['script-a.js', 'script-b.js'],
//   title: 'Title',
// };

// const HTML_A = `<html>
// <meta charset="utf-8">
// <meta name="viewport" content="width=device-width, initial-scale=1">
// <head><title>Title</title></head>
// <body>
// <head><p>Header</p></head>
// <main id="content">
// <h1>Content</h1>
// </main>
// <script src="script-a.js" data-componentscript></script>
// <script src="script-b.js" data-componentscript="true"></script>
// </body>
// </html>`;
