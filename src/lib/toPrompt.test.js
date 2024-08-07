import {expect} from 'chai';
// import sinon from 'sinon';
// import {marbles} from 'rxjs-marbles/mocha';

import {testExports} from './toPrompt';
const {applyTemplate} = testExports;

// test that the applyTemplate function replaces the placeholders in the template
// with the values from the dictionary
describe('applyTemplate', () => {
  it('should replace placeholders in the template with values from the dictionary', () => {
    const templates = [
      ['user', 'Hello, {{name}}!'],
      ['system', 'Hi, {{anotherName}}!'],
    ];
    const dict = {name: 'Alice', anotherName: 'Peter'};
    const result = applyTemplate(templates)(dict);
    expect(result).to.deep.equal([
      {role: 'user', content: 'Hello, Alice!'},
      {role: 'system', content: 'Hi, Peter!'},
    ]);
  });

  it('should replace placeholders in the template with values from the dictionary when the template is passed as a string', () => {
    const templates = 'Hello, {{name}}!';
    const dict = {name: 'Alice'};
    const result = applyTemplate(templates)(dict);
    expect(result).to.deep.equal([{role: 'user', content: 'Hello, Alice!'}]);
  });
});
