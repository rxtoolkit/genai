import axios from 'axios';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import {from, of, merge, throwError, zip} from 'rxjs';
import {
  map, 
  mergeMap, 
  catchError, 
  takeLast,
  timeInterval
} from 'rxjs/operators';

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
  // aws: toAWS,
  // gcp: toGCP,
};

const toModel = ({
  vendor, 
  model
},
  options = {
    llm: null,
    normalize: true,
    apiKey: null,
  }
) => source$ => {
  const toVendor = operators?.[vendor];
  if (!toVendor) return throwError('Unknown model vendor!');
  const completion$ = source$.pipe(
    map(prompt => (
      isArray(prompt) ? prompt :
      isString(prompt) ? [{role: 'user', content: prompt}] :
      messages
    )),
    toVendor({model}, options),
    catchError(err => {
      console.log(err);
      return throwError( 
        errors.badResponse(err, vendor, model)
      )
    })
  );
  const timings$ = merge(of(0), completion$).pipe(
    timeInterval(),
    map(({interval}) => interval),
    takeLast(1)
  );
  const result$ = zip(completion$, timings$).pipe(
    map(([completion, time]) => ({...completion, timeElapsed: time}))
  );
  return result$;
};

export default toModel;