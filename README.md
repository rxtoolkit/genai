# @rxtk/genai
> ⚡️ Generative AI toolkit for RxJS 

This package is inspired by Python's [Langchain](https://www.langchain.com) toolkit. It provides convenient operators for composing generative AI pipelines in a way that is:
- **Opinionated**: Pipelines use sensible defaults for common use cases to avoid repititious code.
- **Flexible**: Advanced configuration options and LLM controls are exposed for use cases that require them.
- **Concise**: Syntax allows pipelines to be composed with as few lines of code as possible.
- **Functional**: Rather than using complex class-based abstractions like Langchain, this package uses RxJS to provide underlying FP abstractions.
- **Vendor Agnostic**: The toolkit works with various GenAI vendors (OpenAI, Anthropic, etc) and normalizes the data. New vendors or custom services can be easily integrated! (Example provided below.)
- **DRY**: Stages of the pipeline can be easily abstracted away and reused.
- **Readable**: FP pipes and functional composition make pipelines easy to read and reason about quickly.
- **Decoupled**: Stages of a pipeline can be easily abstracted into one or more independent modules.

## Installation
```bash
npm i @rxtk/genai
```

```bash
yarn add @rxtk/genai
```

## Quick Examples
> 🔒 **Authentication**: These examples assume you already have an API key for each vendor and that it is stored in the conventional environment variable (e.g. OPENAI_API_KEY). You can also provide a key by passing `options.apiKey` to the `toModel` operator.

### Simple GenAI Pipeline
```js
import {of} from 'rxjs';
import {map} from 'rxjs/operators';
import {toPrompt,toModel,toCompletionString} from '@rxtk/genai';

const input = [
  {language: 'german', phrase: 'hello'},
  {language: 'french', phrase: 'goodbye'},
  {language: 'pirate', phrase: 'yes, my friend'},
  {language: 'doublespeak', phrase: 'They are saying rebellious things.'},
];
const completionString$ = of(...input).pipe(
  // inject variables into a prompt template
  toPrompt('Translate the phrase into the language: {{language}}.\nPhrase: {{phrase}}.\nTranslation: '),
  // send the prompt to the desired vendor and model
  toModel({vendor: 'openai', model: 'gpt-4o'}),
  // retrieve the string value of the completion
  toCompletionString()
);
completionString$.subscribe(console.log);
// Hallo
// au revoir
// Yarr matey
// They are saying quack speak
```

### With Templates for Multiple Roles
```js
import {of} from 'rxjs';
import {map} from 'rxjs/operators';
import {toPrompt,toModel,toCompletionString} from '@rxtk/genai';

const input = [
  {language: 'german', phrase: 'hello'},
  {language: 'french', phrase: 'goodbye'},
];
const completionString$ = of(...input).pipe(
  // inject variables into a prompt template
  toPrompt([
    ['system', 'Translate the phrase into the language: {{language}}'],
    ['user', '{{phrase}}'],
  ]),
  // send the prompt to the desired vendor and model
  toModel({vendor: 'openai', model: 'gpt-4o'}),
  // retrieve the string value of the completion
  toCompletionString()
);
completionString$.subscribe(console.log);
// Hallo
// au revoir
```

### Generate Completions from Multiple Vendors
```js
import {of} from 'rxjs';
import {map} from 'rxjs/operators';
import {toPrompt,toModel,toCompletionString} from '@rxtk/genai';

const pipelines = [
  {
    vendor: 'openai',
    model: 'gpt-4o',
  },
  {
    vendor: 'anthropic',
    model: 'claude-3-opus-20240229',
  },
  {
    vendor: 'cohere',
    model: 'r-plus',
  },
];

const input = [
  {language: 'german', phrase: 'hello'},
  {language: 'french', phrase: 'goodbye'}
];

const completionString$ = of(...input).pipe(
  // inject variables into a prompt template
  toPrompt([
    ['system', 'Translate the phrase into the language: {{language}}'],
    ['user', '{{phrase}}'],
  ]),
  // send the prompt to the desired vendor and model
  toModel({vendor: 'openai', model: 'gpt-4o'}),
  // retrieve the string value of the completion
  toCompletionString()
);
completionString$.subscribe(console.log);
// Hallo
// au revoir
```

### (Beta): Generate Completions from a Custom Model
```js
// If you want to use an LLM service that is not supported, you can write your own:
import axios from 'axios';
import {map,mergeMap} from 'rxjs/operators';

// This is just an RxJS operator
const toMyService = (params, options = {}) => source$ => source$.pipe(
  mergeMap(messages => {
    const {model, apiKey} = params;
    const data$ = from(
      axios({
        method: 'post',
        url: `https://api.myfancyllm.com/v1/messages/${model}`,
        data: { 
          model: model || 'default-model',
          messages,
          ...options
        },
        headers: {
          'Authorization': `Bearer ${options?.apiKey || process.env?.CUSTOM_LLM_API_KEY}`,
        }
      })
    );
    return data$.pipe(
      map(
        options?.normalize 
        // write a custom parser to normalize the response. 
        // for examples see ./src/internals/toOpenAI.js, ./src/internals/toAnthropic.js, etc.
        ? response => response.data 
        : x => x
      )
    );
  }),
);

const input = [
  {language: 'german', phrase: 'hello'},
  {language: 'french', phrase: 'goodbye'}
];
const completionString$ = of(...input).pipe(
  // inject variables into a prompt template
  toPrompt([
    ['system', 'Translate the phrase into the language: {{language}}'],
    ['user', '{{phrase}}'],
  ]),
  // send the prompt to your custom integration
  toModel({customOperator: toMyService}),
  // retrieve the string value of the completion
  toCompletionString()
);
completionString$.subscribe(console.log);
// Hallo
// au revoir
```

## API
### `toModel({vendor='openai', model='gpt-4o'}, options)([{role<String>,content<String>}])`
- `vendor!<String>`: Like `openai`, `anthropic`, `cohere`, or `huggingface`. Check `./lib/toModel.js` for the complete, up-to-date list.
- `model`: The vendor's name for the model being used. Example: `gpt-3.5-turbo`.
- `options.apiKey`: API key for the vendor. If not provided, the operator will attempt to find the environment variable for the vendor using the default name for the variable.
- `options.normalize`(default=`true`): whether to normalize responses or return raw responses.
-  `options.llm`: Configuration options to pass directly to the model (like `temperature`, etc).
-  `options.batchSize`: If provided, requests to the LLM will be batched and returned as an array of completions instead of individual completions.
```js
import {from} from 'rxjs';
import {map} from 'rxjs/operators';
import {toModel} from '@rxtk/genai';

// Note on API keys: Each model will look for the default environment variable for each vendor API key and other settings. Those can also be passed in using the apiKey configuration variable
const string$ = from(['hello', 'goodbye']);
const output$ = string$.pipe(
  map(str => [
    {role: 'system', content: 'Translate the input text into German.'},
    {role: 'user', content: str}
  ]),
  // accepts an array of messages
  toModel({vendor: 'openai', model: 'gpt-4o'})
);
output$.subscribe(console.log);
// Outputs the normalized response data from each api call
```

### `toPrompt(params)(dictionary{})`
- `params[[role<String>, template<String>]]`: can accept an array of messages with the shape [role<String>, template<String>] like `toPrompt([ ['user', 'Hello {{name}}'], ['system', 'Answer nicely but be cool and edgy.']])({name: 'Woody'})`
- `params<String>`: For simple use cases, roles do not need to be specified. If a string is passed, then it will simply be fed in as the user role. Example: `toPrompt("Hello {{name}}.")({name: 'Buzz'})`.
- `dictionary{}`: A set of key value pairs to interpolate into the template.

The content can wrap variable names in curly braces like `'Insert a variable here: {{myVar}}'`. If the object passed into the operator at each iteration contains any of those those keys, the template will inject the value of each key into the string.
```js
import {from} from 'rxjs';
import {toModel, toPrompt} from '@rxtk/genai';

const promptTemplate = [
  ['system', 'Translate the phrase into the language: {{language}}'],
  ['user', '{{phrase}}'],
];
const inputString$ = from([
  {language: 'german', phrase: 'hello'}, 
  {language: 'french', phrase: 'goodbye'},
]);
const output$ = string$.pipe(
  toPrompt(promptTemplate),
  toModel({vendor: 'openai', model: 'gpt-4o'})
);
output$.subscribe(console.log); 
// Output:
// foo
// bar
```

### `toCompletionString()(rawResponse)`
Outputs the completion string from a completion object.
```js
import {from} from 'rxjs';
import {toModel, toCompletionString} from '@rxtk/genai';

const prompt$ = from([
  {role: 'user', content: 'What is the capital of Michigan?'},
  {role: 'user', content: 'What is the capital of Ohio?'},
]);
const output$ = prompt$.pipe(
  toModel({vendor: 'anthropic'}),
  toCompletionString()
);
output$.subscribe(console.log);
// Output:
// The capital of Michigan is Lansing.
// Who really cares what the capital of Ohio is? Just kidding. That was mean.
```
