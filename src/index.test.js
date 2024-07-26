import {expect} from 'chai';
// import sinon from 'sinon';
// import {marbles} from 'rxjs-marbles/mocha';

import * as api from './index';

describe('index', () => {
  it('should export public API', () => {
    expect(Object.keys(api)).to.deep.equal([
      'myPublicFunction1', // FIXME
    ]);
  });
});
