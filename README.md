# @rxtk/PACKAGE_NAME
> DESCRIPTION

FIXME - TODOS
- Replace all instances of `"PACKAGE_NAME"` (in this repository) with the name of your package
- Replace all instances of DESCRIPTION with your descrition of the package.
- Look for the items that say FIXME and fix them.  There are only a couple.
- Publish first to npm. Then GitHub can push to the registry: `yarn publish --access public`

## Installation
```bash
npm i @rxtk/PACKAGE_NAME
```

```bash
yarn add @rxtk/PACKAGE_NAME
```

## API
FIXME - write some docs so other devs know how the public API works.
### `myFunc`
```js
import {from} from 'rxjs';
import {myFunction} from '@rxtk/PACKAGE_NAME';

const string$ = from(['foo', 'bar']);
const output$ = string$.pipe(myFunction());
output$.subscribe(console.log); 
// Output:
// foo
// bar
```
