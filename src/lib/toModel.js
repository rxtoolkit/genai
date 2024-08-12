import axios from 'axios';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import {from, of, merge, throwError, zip} from 'rxjs';
import {
  map, 
  mergeMap, 
  catchError, 
  takeLast,
  timeInterval,
  bufferCount
} from 'rxjs/operators';

import toAnthropic from '../internals/toAnthropic';
import toCohere from '../internals/toCohere';
import toOpenAI from '../internals/toOpenAI';
import getOperationMetadata from '../internals/getOperationMetadata';

const errors = {
  badResponse: (err, vendor, model) => new Error(
    `Bad response from ${vendor} (${model}): ${err.message}`
  ),
};

const operators = {
  'anthropic': toAnthropic,
  'openai': toOpenAI,
  'cohere': toCohere,
  // 'huggingface': toHuggingface,
  // aws: toAWS,
  // gcp: toGCP,
};

const toModel = ({
  vendor, 
  model,
  customOperator = null, // pass a custom operator. See existing examples (toAnthropic, toOpenAI, etc.)
},
  options = {
    llm: null,
    normalize: true,
    apiKey: null,
    name: null,
    runId: null, // for tracking purposes
    // batchSize: null, // TODO
    // collector: null, // TODO: collect useful data like langsmith does,
  }
) => source$ => {
  // TODO
  // const metadata = getOperationMetadata({
  //   runId,
  //   name,
  //   operator: 'toModel',
  //   vendor: options?.customOperator ? 'custom' : vendor,
  //   model: options?.customOperator && !model ? 'custom' : model,
  // });
  const toVendor = customOperator || operators?.[vendor];
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