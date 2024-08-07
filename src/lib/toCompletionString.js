import { map } from 'rxjs/operators';

const mapToCompletionString = () => response => (
  response?.content?.[0]?.message?.content
);

const toCompletionString = (value) => source$ => source$.pipe(
  map(mapToCompletionString())
);

export default toCompletionString;