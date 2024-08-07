import axios from 'axios';
import {from} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

export const parseResult = () => result => ({
  id: result.data?.id,
  model: result.data?.model,
  object: result.data?.type,
  content: [...result.data.content.map(m => ({
    message: {
      role: result.data.role,
      content: m.text,
    }
  }))],
  usage: {
    prompt_tokens: result.data?.usage?.input_tokens,
    completion_tokens: result.data?.usage?.output_tokens,
    total_tokens: result.data?.usage?.input_tokens + result.data?.usage?.output_tokens,
  },
});

const toAnthropic = (params, options = {}, internals = {_axios: axios}) => source$ => source$.pipe(
  mergeMap(messages => {
    const {model, apiKey} = params;
    const data$ = from(
      _axios({
        method: 'post',
        url: `https://api.anthropic.com/v1/messages/${model}`,
        data: { 
          model: model || 'claude-3-5-sonnet-20240620',
          messages,
          ...options
        },
        headers: {
          'x-api-key': options?.apiKey || process.env?.ANTHROPIC_API_KEY,
        }
      })
    );
    return data$.pipe(
      map(options?.normalize ? parseResult() : x => x)
    );
  }),
);

export default toAnthropic;