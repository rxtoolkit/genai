import {expect} from 'chai';
// import sinon from 'sinon';
import {marbles} from 'rxjs-marbles/mocha';

import toAnthropic, {parseResult} from './toAnthropic';

const response = {
  "content": [
    {
      "text": "Hi! My name is Claude.",
      "type": "text"
    }
  ],
  "id": "msg_013Zva2CMHLNnXjNJJKqJ2EF",
  "model": "claude-3-5-sonnet-20240620",
  "role": "assistant",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "type": "message",
  "usage": {
    "input_tokens": 10,
    "output_tokens": 25
  }
};

describe('toAnthropic', () => {
  it('should normalize a valid response', () => {
      const completion = parseResult()({data: response});
      expect(completion).to.deep.equal({
        id: 'msg_013Zva2CMHLNnXjNJJKqJ2EF',
        model: 'claude-3-5-sonnet-20240620',
        object: 'message',
        content: [
          {
            message: {
              role: 'assistant',
              content: 'Hi! My name is Claude.',
            }
          }
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 25,
          total_tokens: 35,
        },
      });
  });
});
