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
const parseResult = () => result => result?.choices?.[0]?.message?.content;

const toOpenAI = (params, options = {}) => {
  const {model, apiKey} = params;
  const data$ = from(
    axios({
      method: 'post',
      url: `https://api.openai.com/v1/chat/completions`,
      data: { 
        model: model || 'gpt-4o',
        messages,
        ...options
      },
      headers: {
        'Authorization': `Bearer ${apiKey || process.env?.OPENAI_API_KEY}`,
      }
    })
  );
  return data$.pipe(
    map(parseResult())
  );
};

export default toOpenAI;