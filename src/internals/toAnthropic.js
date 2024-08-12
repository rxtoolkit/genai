import axios from 'axios';
import {from, throwError} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';

export const parseResult = () => result => ({
  id: result.data?.completion?.id,
  model: result.data?.completion?.model,
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

// TODO: add AWS Bedrock support: https://docs.anthropic.com/en/api/claude-on-amazon-bedrock
// TODO: add GCP Vertex support: https://docs.anthropic.com/en/api/claude-on-vertex-ai
const toAnthropic = (
  params, 
  options = {}, 
  _axios = axios
) => source$ => source$.pipe(
  mergeMap(messages => {
    const {model, apiKey} = params;
    const data$ = from(
      _axios({
        method: 'post',
        url: 'https://api.anthropic.com/v1/messages',
        data: { 
          model: model || 'claude-3-5-sonnet-20240620',
          messages: messages.filter(m => m.role !== 'system'),
          system: (
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
          'x-api-key': options?.apiKey || process?.env?.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        }
      })
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

export default toAnthropic;