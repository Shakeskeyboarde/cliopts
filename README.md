# nanoargs

Simple Typescript args parser.

## Usage

Parse the process arguments into options.

```ts
const options = parseArgs(process.argv.slice(2), {
  true: { type: true }, // No value
  false: { type: false }, // No value
  string: { type: String }, // String value
  number: { type: Number, alias: 'b' }, // Number value
});
```

Read the options.

```ts
options.get('true'); // true | undefined
options.get('false'); // false | undefined;
options.getAll('string'); // string[]
options.getRequired('number'); // number (or throw)
options.names; // array of all parsed named options
options.positional; // All un-named (positional) options
```

The `get` method returns the last value if the argument is repeated.

```ts
const options = parseArgs(['--foo=1', '--foo=2'], {
  foo: { type: Number },
});

options.get('foo'); // 2
```

Errors are thrown...

- When unknown named options are encountered.
- When an option requires a value but a value is not given.
- When an option does not accept a value but a value is given.

```ts
// Throws because --foo is not an option.
const options = parseArgs(['--foo'], {
  bar: { type: String },
  baz: { type: true },
});

// Throws because --bar requires a value.
const options = parseArgs(['--bar'], {
  bar: { type: String },
  baz: { type: true },
});

// Throws because --baz does not accept a value.
const options = parseArgs(['--baz=1'], {
  bar: { type: String },
  baz: { type: true },
});
```

Any arguments following `--` are treated as positional options, even if they start with hyphens.

```ts
const options = parseArgs(['--foo', '--', '--bar'], {
  foo: { type: true },
  bar: { type: true }
});

options.has('bar'); // false
options.names; // ['foo']
options.positional; // ['--bar']
```
