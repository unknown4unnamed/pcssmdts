export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export type Logger = {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
  debug: (message: string, ...args: unknown[]) => void;
};

export const logger = (enable: boolean): Logger => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const noop = () => {};

  return {
    info: enable ? console.log : noop,
    warn: enable ? console.warn : noop,
    error: enable ? console.error : noop,
    debug: enable ? console.debug : noop,
  };
};
