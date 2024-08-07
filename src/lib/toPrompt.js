import isString from 'lodash/isString';
import { map } from 'rxjs/operators';

const applyTemplate = templates => dict => (
  (
    isString(templates) 
    ? [['user', templates]] 
    : templates
  ).map(([role, t]) => ({
    role,
    content: Object.keys(dict).reduce((acc, k) => {
      const regex = new RegExp(`{{${k}}}`, 'g');
      return acc.replace(regex, dict[k]);
    }, t || '')
  }))
);

// template can be a Func or an array of [role, template]
const toPrompt = (templates) => source$ => source$.pipe(
  map(applyTemplate(templates))
);

export const testExports = {
  applyTemplate
};
export default toPrompt;