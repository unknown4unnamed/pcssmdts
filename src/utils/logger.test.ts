/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, it, expect, vi } from 'vitest';

import { logger } from './logger';

describe('Logger', () => {
  it('should return a logger object', () => {
    const log = logger(true);
    expect(typeof log).toBe('object');
    expect(log).toHaveProperty('info');
    expect(log).toHaveProperty('warn');
    expect(log).toHaveProperty('error');
    expect(log).toHaveProperty('debug');
  });

  it('should log messages when verbose is true', () => {
    const consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    };

    const log = logger(true);
    const testMessage = 'test message';

    log.info(testMessage);
    log.warn(testMessage);
    log.error(testMessage);
    log.debug(testMessage);

    expect(consoleSpy.log).toHaveBeenCalledWith(testMessage);
    expect(consoleSpy.warn).toHaveBeenCalledWith(testMessage);
    expect(consoleSpy.error).toHaveBeenCalledWith(testMessage);
    expect(consoleSpy.debug).toHaveBeenCalledWith(testMessage);

    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
    consoleSpy.debug.mockRestore();
  });

  it('should not log messages when verbose is false', () => {
    const consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    };

    const log = logger(false);
    const testMessage = 'test message';

    log.info(testMessage);
    log.warn(testMessage);
    log.error(testMessage);
    log.debug(testMessage);

    expect(consoleSpy.log).not.toHaveBeenCalled();
    expect(consoleSpy.warn).not.toHaveBeenCalled();
    expect(consoleSpy.error).not.toHaveBeenCalled();
    expect(consoleSpy.debug).not.toHaveBeenCalled();

    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
    consoleSpy.debug.mockRestore();
  });
});
