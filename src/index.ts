type Options<TConfig extends Configs> = {
  readonly get: <TName extends keyof TConfig>(arg: TName) => Infer<TConfig[TName]> | undefined;
  readonly getAll: <TName extends keyof TConfig>(arg: TName) => readonly Infer<TConfig[TName]>[];
  readonly getRequired: <TName extends keyof TConfig>(arg: TName) => Infer<TConfig[TName]>;
  readonly has: (arg: keyof TConfig) => boolean;
  readonly names: readonly (keyof TConfig)[];
  readonly positional: readonly string[];
};
type Parse<TValue = unknown> = (arg: string) => TValue;
type Config = { readonly alias?: string | readonly string[]; readonly type: Parse | boolean };
type Configs = Record<string, Config>;
type Infer<TConfig extends Config> = TConfig['type'] extends Parse<infer TType> ? TType : TConfig['type'];
type Named = { readonly isShort: boolean; readonly name: string; readonly value?: string };

const getArray = <TValue>(value: TValue | readonly TValue[]): TValue[] => {
  return Array.isArray(value) ? [...value] : [value];
};

const getNamed = (arg: string): Named | undefined => {
  const match = arg.match(/^(?<dashes>-{1,2})(?<name>[^=]+)(?:=(?<value>.*))?$/su);

  return match?.groups && match.groups.dashes && match.groups.name
    ? { isShort: match.groups.dashes === '-', name: match.groups.name, value: match.groups.value }
    : undefined;
};

const parseArgs = <TConfigs extends Configs>(args: readonly string[], configs: TConfigs): Options<TConfigs> => {
  const aliases: Record<string, string> = Object.create(null);
  const parsers: Record<string, Parse<unknown> | boolean> = Object.create(null);
  const named: Record<string, readonly unknown[]> = Object.create(null);
  const positional: string[] = [];

  Object.getOwnPropertyNames(configs).forEach((name) => {
    const config = configs[name];

    if (config) {
      const { alias = [], type = true } = config;

      getArray(alias).forEach((aliasN) => (aliases[aliasN] = name));
      parsers[name] = type;
    }
  });

  const next = () => {
    const arg = args[0];
    args = args.slice(1);
    return arg;
  };

  let arg: string | undefined;

  while ((arg = next()) != null) {
    if (arg === '--') {
      positional.push(...args);
      break;
    }

    const option = getNamed(arg);

    if (!option) {
      positional.push(arg);
      continue;
    }

    if (option.isShort) {
      const chars = Array.from(option.name);

      if (chars.length > 1) {
        args = [...chars.map((char) => `-${char}`), ...(option.value ? [option.value] : []), ...args];
        continue;
      }
    }

    const name = option.name in configs ? option.name : aliases[option.name];
    const type = name != null ? parsers[name] : undefined;

    if (name == null || type == null) {
      throw new Error(`Option ${arg} is unknown`);
    }

    if (typeof type === 'boolean') {
      if (option.value != null) {
        throw new Error(`Option ${arg} does not accept a value`);
      }

      named[name] = [...(named[name] ?? []), type];
    } else {
      const value = option.value ?? next();

      if (value == null) {
        throw new Error(`Option ${arg} requires a value`);
      }

      named[name] = [...(named[name] ?? []), type(value)];
    }
  }

  const options = {
    get: (name: string): unknown => {
      return named[name]?.at(-1);
    },
    getAll: (name: string): unknown[] => {
      return [...(named[name] ?? [])];
    },
    getRequired: (name: string): unknown => {
      const values = named[name];

      if (!values || values.length === 0) {
        throw new Error(`Missing required argument ${JSON.stringify(name)}`);
      }

      return values.at(-1);
    },
    has: (name: string): boolean => {
      return Boolean(named[name]?.length);
    },
    names: Object.getOwnPropertyNames(configs),
    positional,
  };

  return options as Options<TConfigs>;
};

export { parseArgs };
