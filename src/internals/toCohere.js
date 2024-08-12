import axios from 'axios';
import {from, throwError} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';

export const parseResult = () => result => ({
  id: result.data?.generation_id,
  model: result.data?.model,
  object: 'message',
  content: result.data?.chat_history
    ?.filter((m, i) => i === result.data?.chat_history?.length - 1)
    .map(m => ({
      message: {
        role: m.role === 'CHATBOT' ? 'assistant' : m.role.toLowerCase(), 
        content: m.message
      }
    })),
  usage: {
    prompt_tokens: result.data?.meta?.tokens?.input_tokens,
    completion_tokens: result.data?.meta?.tokens?.output_tokens,
    total_tokens: result.data?.meta?.tokens?.input_tokens + result.data?.meta?.tokens?.output_tokens,
  },
});

const toCohere = (
  params, 
  options = {}, 
  _axios = axios
) => source$ => source$.pipe(
  mergeMap(messages => {
    const {model, apiKey} = params;
    const data$ = from(
      _axios({
        method: 'post',
        url: 'https://api.cohere.com/v1/chat',
        data: { 
          model: model || 'command-r-plus',
          message: messages
            .filter((m,i) => m.role === 'user' && i === messages.length - 1)
            ?.[0]?.content,
          chat_history: (
            messages.filter(m => m.role !== 'system').length > 1
            ? messages.filter((m, i) => m.role !== 'system' && i < messages.length - 1)
            : null
          ),
          preamble: (
            messages.find(m => m.role === 'system')?.content
            || null
          ),
          max_tokens: options?.llm?.max_tokens || 1024,
          // max_tokens_to_sample: options.max_tokens || 256,
          // stop_sequences: options.stop_sequences || [],
          // temperature: options.temperature || 0.7,
          // top_p: options.top_p || 0.95,
          ...(options?.llm || {})
        },
        headers: {
          'Authorization': `Bearer ${options?.apiKey || process?.env?.COHERE_API_KEY}`,
          'content-type': 'application/json',
        }
      }).pipe(
        map(response => ({data: {...response.data, model}}))
      )
    );
    return data$.pipe(
      map(options?.normalize ? parseResult() : x => x),
      catchError(err => {
        console.error(err?.data?.error || err);
        return throwError(err);
      })
    );
  }),
);

export default toCohere;