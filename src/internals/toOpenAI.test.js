import {expect} from 'chai';
// import sinon from 'sinon';
// import {marbles} from 'rxjs-marbles/mocha';

import toOpenAI, {parseResult} from './toOpenAI';

const fakeResponse = {
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "gpt-4o-mini",
  "usage": {
      "prompt_tokens": 13,
      "completion_tokens": 7,
      "total_tokens": 20
  },
  "choices": [
      {
          "message": {
              "role": "assistant",
              "content": "This is a test!"
          },
          "logprobs": null,
          "finish_reason": "stop",
          "index": 0
      }
  ]
};

describe('toOpenAI', () => {
  it('should normalize a valid response', () => {
      const completion = parseResult()({data: fakeResponse});
      expect(completion).to.deep.equal({
        id: 'chatcmpl-abc123',
        model: 'gpt-4o-mini',
        object: 'chat.completion',
        content: [
          {
            message: {
              role: 'assistant',
              content: 'This is a test!',
            }
          }
        ],
        usage: {
          prompt_tokens: 13,
          completion_tokens: 7,
          total_tokens: 20,
        },
      });
  });
});
