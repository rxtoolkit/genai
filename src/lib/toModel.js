import axios from 'axios';
import {from,throwError} from 'rxjs';
import {mergeMap, catchError} from 'rxjs/operators';

import toAnthropic from '../internals/toAnthropic';
import toOpenAI from '../internals/toOpenAI';

const errors = {
  badResponse: (err, vendor, model) => new Error(
    `Bad response from ${vendor} (${model}): ${err.message}`
  ),
};

const operators = {
  'anthropic': toAnthropic,
  'openai': toOpenAI,
  // 'cohere': toCohere,
  // 'huggingface': toHuggingface,
}

const toModel = ({
  vendor, 
  model, 
  apiKey = null
},
  options = {}
) => source$ => {
  const toVendor = operators?.[vendor];
  if (!toVendor) return throwError('Unknown model vendor!');
  return source$.pipe(
    mergeMap(toVendor({model, apiKey}, options)),
    catchError(err => throwError(
      errors.badResponse(err, vendor, model)
    ))
  );
};

export default toModel;