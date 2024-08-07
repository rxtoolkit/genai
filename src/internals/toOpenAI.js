import axios from 'axios';
import {pick} from 'lodash';
import {from} from 'rxjs';
import {map,mergeMap} from 'rxjs/operators';

export const parseResult = () => result => ({
  id: result.data?.id,
  model: result.data?.model,
  object: result.data?.object,
  content: result.data?.choices.map(c => pick(c, 'message')),
  usage: result.data?.usage,
});

const toOpenAI = (params, options = {}, internals = {_axios: axios}) => source$ => source$.pipe(
  mergeMap(messages => {
    const {model, apiKey} = params;
    const data$ = from(
      _axios({
        method: 'post',
        url: `https://api.openai.com/v1/chat/completions`,
        data: { 
          model: model || 'gpt-4o',
          messages,
          ...(options?.llm || {})
        },
        headers: {
          'Authorization': `Bearer ${options?.apiKey || process.env?.OPENAI_API_KEY}`,
        }
      })
    );
    return data$.pipe(
      map(options.normalize ? parseResult() : x => x)
    );
  })
);

export default toOpenAI;