import axios from 'axios';
import {from} from 'rxjs';
import {map} from 'rxjs/operators';

// {
//   "content": [
//     {
//       "text": "Hi! My name is Claude.",
//       "type": "text"
//     }
//   ],
//   "id": "msg_013Zva2CMHLNnXjNJJKqJ2EF",
//   "model": "claude-3-5-sonnet-20240620",
//   "role": "assistant",
//   "stop_reason": "end_turn",
//   "stop_sequence": null,
//   "type": "message",
//   "usage": {
//     "input_tokens": 10,
//     "output_tokens": 25
//   }
// }
const parseResult = () => result => result?.data?.content?.[0].text;

const toAnthropic = (params, options = {}) => {
  const {model, apiKey} = params;
  const data$ = from(
    axios({
      method: 'post',
      url: `https://api.anthropic.com/v1/messages/${model}`,
      data: { 
        model: model || 'claude-3-5-sonnet-20240620',
        messages,
        ...options
      },
      headers: {
        'x-api-key': apiKey || process.env?.ANTHROPIC_API_KEY,
      }
    })
  );
  return data$.pipe(
    map(parseResult())
  );
};

export default toAnthropic;