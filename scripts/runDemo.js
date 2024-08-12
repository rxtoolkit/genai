const {concat,of} = require('rxjs');
const {map} = require('rxjs/operators');
const {toModel,toPrompt,toCompletionString} = require('../dist/index.js');

const pipelines = [
  {
    name: 'gpt-4o', 
    config: {
      vendor: 'openai',
      model: 'gpt-4o',
    },
  },
  // {
  //   name: 'gpt-4', 
  //   config: {
  //     vendor: 'openai',
  //     model: 'gpt-4o',
  //   },
  // },
  // {
  //   name: 'gpt-4o-mini', 
  //   config: {
  //     vendor: 'openai',
  //     model: 'gpt-4o',
  //   },
  // },
  {
    name: 'claude-3-5-sonnet',
    config: {
      vendor: 'anthropic',
      model: 'claude-3-5-sonnet-20240620',
    },
  },
  // {
  //   name: 'claude-3-haiku',
  //   config: {
  //     vendor: 'anthropic',
  //     model: 'claude-3-haiku-20240307',
  //   },
  // },
  {
    name: 'command-r-plus',
    config: {
      vendor: 'cohere',
      model: 'command-r-plus',
    },
  },
];

const run = () => {
  const inputs = [
    {phrase: 'Hello there!'},
    {phrase: 'That is a fine ship!'},
    {phrase: 'Hand over your gold!'},
    {phrase: 'Would you fancy some rum?'},
  ];
  const input$ = of(...inputs);
  const observables = pipelines.map(p => input$.pipe(
    toPrompt([
      ['system', 'The user will say something. Respond using phrases that sounds like things a pirate would say.'],
      ['user', '{{phrase}}'],
    ]),
    toModel(p.config),
    toCompletionString(),
    map(c => `name=${p.name}, vendor=${p.config.vendor}, model=${p.config.model}, completion='${c}'`)
  ));
  const completionString$ = concat(...observables);
  completionString$.subscribe(console.log);
};

run();