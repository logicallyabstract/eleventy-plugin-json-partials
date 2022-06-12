import { expect } from 'chai';
import { constructOutputPath } from './construct-output-path';

describe('constructOutputPath', () => {
  it('should replace index.html with index.json', () => {
    const result = constructOutputPath('/path/a/index.html');
    expect(result).to.equal('/path/a/index.json');
  });
});
