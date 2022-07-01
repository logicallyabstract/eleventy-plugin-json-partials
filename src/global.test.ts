import { restore } from 'sinon';

/**
 * Restore the mocks after each test.
 */
afterEach(() => {
  restore();
});
