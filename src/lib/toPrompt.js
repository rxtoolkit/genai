import { map } from 'rxjs/operators';

const applyTemplate = templates => dict => (
  templates.map(t => 
    Object.keys(dict).reduce((acc, k) => {
      const regex = new RegExp(`{${k}}`, dict[k]);
      return acc.replace(regex, dict[k]);
    }, t || '')
  )
);

// template can be a Func or an array of [role, template]
const toPrompt = ({template}) => source$ => source$.pipe(
  map(applyTemplate(template))
);

export default toPrompt;