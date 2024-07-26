# @rxtk/genai
> Generative AI tools for RxJS

- Publish first to npm. Then GitHub can push to the registry: `yarn publish --access public`

## Installation
```bash
npm i @rxtk/genai
```

```bash
yarn add @rxtk/genai
```

## API

### `toModel({vendor='openai', model='gpt-4o'})`
```js
import {from} from 'rxjs';
import {map} from 'rxjs/operators';
import {toModel} from '@rxtk/genai';

const string$ = from(['hello', 'goodbye']);
const output$ = string$.pipe(
  map(str => [
    ['system', 'Translate the input text into German.'],
    ['user', str]
  ]),
  // accepts an array of messages
  toModel({vendor: 'openai', model: 'gpt-4o'})
);
output$.subscribe(console.log); 
// Output:
// {}
// {}
```

### `toPrompt(promptTemplate)`
```js
import {from} from 'rxjs';
import {toModel} from '@rxtk/genai';

const string$ = from(['foo', 'bar']);
const output$ = string$.pipe(myFunction());
output$.subscribe(console.log); 
// Output:
// foo
// bar
```

### `parseCompletion()`
```js
import {from} from 'rxjs';
import {toModel} from '@rxtk/genai';

const string$ = from(['foo', 'bar']);
const output$ = string$.pipe(myFunction());
output$.subscribe(console.log); 
// Output:
// foo
// bar
```
