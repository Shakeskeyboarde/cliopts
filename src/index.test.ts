import { parseArgs } from './index.js';

test('parsed', () => {
  const args = parseArgs(['-a', '1', '-b', '0x2'], { a: { type: Number }, b: { type: Number } });
  expect(args.names).toStrictEqual(['a', 'b']);
  expect(args.positional).toStrictEqual([]);
  expect(args.getAll('a')).toStrictEqual([1]);
  expect(args.getAll('b')).toStrictEqual([2]);
});

test('flags', () => {
  const args = parseArgs(['-a', '1', '-b', '0x2'], { a: { type: true }, b: { type: false } });
  expect(args.names).toStrictEqual(['a', 'b']);
  expect(args.positional).toStrictEqual(['1', '0x2']);
  expect(args.getAll('a')).toStrictEqual([true]);
  expect(args.getAll('b')).toStrictEqual([false]);
});

test('multiple', () => {
  const args = parseArgs(['-a', '1', '-a', '0x2'], { a: { type: String } });
  expect(args.names).toStrictEqual(['a']);
  expect(args.positional).toStrictEqual([]);
  expect(args.getAll('a')).toStrictEqual(['1', '0x2']);
});

test('alias', () => {
  const args = parseArgs(['-a', '1', '-b', '0x2', '-c', '3', '-e', '4'], {
    a: { alias: ['b', 'c'], type: String },
    b: { type: Number },
    d: { alias: 'e', type: String },
  });
  expect(args.names).toStrictEqual(['a', 'b', 'd']);
  expect(args.positional).toStrictEqual([]);
  expect(args.getAll('a')).toStrictEqual(['1', '3']);
  expect(args.getAll('b')).toStrictEqual([2]);
  expect(args.getAll('d')).toStrictEqual(['4']);
});

test('--', () => {
  const args = parseArgs(['-a', '1', '--', '-a', '1'], { a: { type: String } });
  expect(args.positional).toStrictEqual(['-a', '1']);
});

test('shorthand', () => {
  const args = parseArgs(['-abc', '1', '-abc=2', '-ab'], { a: { type: true }, b: { type: true }, c: { type: String } });
  expect(args.getAll('a')).toStrictEqual([true, true, true]);
  expect(args.getAll('b')).toStrictEqual([true, true, true]);
  expect(args.getAll('c')).toStrictEqual(['1', '2']);
});

test('unknown', () => {
  expect(() => parseArgs(['-a'], { b: { type: String } })).toThrow();
});

test('extra value', () => {
  expect(() => parseArgs(['--abc=1'], { abc: { type: true } })).toThrow();
});

test('missing value', () => {
  expect(() => parseArgs(['-a'], { a: { type: String } })).toThrow();
});

test('get', () => {
  const args = parseArgs(['-a', '1', '-a', '2'], { a: { type: String } });
  expect(args.get('a')).toBe('2');
});

test('get', () => {
  const args = parseArgs(['-a', '1', '-a', '2'], { a: { type: String }, b: { type: String } });
  expect(args.getAll('a')).toStrictEqual(['1', '2']);
  expect(args.getAll('b')).toStrictEqual([]);
});

test('getRequired', () => {
  const args = parseArgs(['-a', '1', '-a', '2'], { a: { type: String }, b: { type: String } });
  expect(args.getRequired('a')).toBe('2');
  expect(() => args.getRequired('b')).toThrow();
});

test('has', () => {
  const args = parseArgs(['-a', '1', '-a', '2'], { a: { type: String }, b: { type: String } });
  expect(args.has('a')).toBe(true);
  expect(args.has('b')).toBe(false);
});
