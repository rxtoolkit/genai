import {expect} from 'chai';
// import sinon from 'sinon';
import {marbles} from 'rxjs-marbles/mocha';

import toCohere, {parseResult} from './toCohere';

const response = {
  "generation_id": "foobarid",
  "model": "command-r-plus",
  "chat_history": [
    {
      "message": "Hello!",
      "role": "USER"
    },
    {
      "message": "Hi! My name is Command R+.",
      "role": "CHATBOT"
    }
  ],
  "finish_reason": "COMPLETE",
  "meta": {
      "api_version": {
          "version": "1"
      },
      "billed_units": {
          "input_tokens": 17,
          "output_tokens": 12
      },
      "tokens": {
          "input_tokens": 83,
          "output_tokens": 12
      }
  }
};

describe('toCohere', () => {
  it('should normalize a valid response', () => {
      const completion = parseResult()({data: response});
      expect(completion).to.deep.equal({
        id: 'foobarid',
        model: 'command-r-plus',
        object: 'message',
        content: [
          {
            message: {
              role: 'assistant',
              content: 'Hi! My name is Command R+.',
            }
          }
        ],
        usage: {
          prompt_tokens: 83,
          completion_tokens: 12,
          total_tokens: 95,
        },
      });
  });
});
