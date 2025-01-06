import { describe, expect, it, vi } from 'vitest';

import { logger } from './logger';

describe('Logger', () => {
  it('should return a function', () => {
    const log = logger(true);
    expect(typeof log).toBe('function');
  });

  it('should log messages when verbose is true', () => {
    const consoleSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const log = logger(true);

    log('test message');

    expect(consoleSpy).toHaveBeenCalledWith('test message');
    consoleSpy.mockRestore();
  });

  it('should not log messages when verbose is false', () => {
    const consoleSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const log = logger(false);

    log('test message');

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
