import fastGlob from 'fast-glob';
import type { Plugin as PostCSSPlugin } from 'postcss';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

import type { FileOperations, CSSProcessor } from '@/types/index';
import { logger } from '@/utils/logger';

import { createCSSProcessor } from './css-processor';
import { createDtsGenerator } from './dts-generator';
import { createFileOperations } from './file-operations';
import { run } from './generator';

// Mock dependencies
vi.mock('fast-glob');
vi.mock('chalk', () => ({
  default: {
    greenBright: (str: string): string => str,
    bgYellowBright: {
      red: (str: string): string => str,
    },
    cyan: (str: string): string => str,
    magenta: (str: string): string => str,
    yellow: (str: string): string => str,
    green: (str: string): string => str,
    red: (str: string): string => str,
  },
}));
vi.mock('@/utils/logger');
vi.mock('./css-processor');
vi.mock('./dts-generator');
vi.mock('./file-operations');

describe('Generator', () => {
  const mockFastGlob = vi.mocked(fastGlob);
  const mockLogger = vi.mocked(logger);
  const mockLog = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
  const mockFileOps: FileOperations = {
    readFile: vi.fn(),
    writeCompiledCSS: vi.fn(),
    writeDtsFile: vi.fn(),
    removeFile: vi.fn(),
    removeCompiledFiles: vi.fn(),
  };
  const mockCssProcessor: CSSProcessor = {
    loadConfig: vi.fn(),
    process: vi.fn(),
  };
  const mockDtsGenerator = {
    generate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogger.mockReturnValue(mockLog);
    vi.mocked(createFileOperations).mockReturnValue(mockFileOps);
    vi.mocked(createCSSProcessor).mockReturnValue(mockCssProcessor);
    vi.mocked(createDtsGenerator).mockReturnValue(mockDtsGenerator);

    // Setup default mock implementations
    (mockFileOps.readFile as Mock).mockResolvedValue('');
    (mockFileOps.writeCompiledCSS as Mock).mockResolvedValue('');
    (mockFileOps.writeDtsFile as Mock).mockResolvedValue('');
    (mockFileOps.removeFile as Mock).mockResolvedValue(undefined);
    (mockFileOps.removeCompiledFiles as Mock).mockResolvedValue(undefined);
    (mockCssProcessor.loadConfig as Mock).mockResolvedValue({
      plugins: [] as PostCSSPlugin[],
      configFile: 'postcss.config.js',
    });
    (mockCssProcessor.process as Mock).mockResolvedValue('');
    mockDtsGenerator.generate.mockResolvedValue({
      formatted: '',
      isEmpty: false,
    });
  });

  it('should throw error when no files match glob pattern', async () => {
    mockFastGlob.mockResolvedValue([]);

    await expect(run('src/**/*.css', { configPath: '.' })).rejects.toThrow(
      'No files were found to compile, please check your glob pattern'
    );
  });

  it('should throw error when PostCSS config is not found', async () => {
    mockFastGlob.mockResolvedValue(['test.css']);
    (mockFileOps.readFile as Mock).mockRejectedValue(
      new Error('File not found')
    );

    await expect(
      run('src/**/*.css', { configPath: 'invalid.config.js' })
    ).rejects.toThrow('File not found at path: invalid.config.js');
  });

  it('should handle empty CSS files', async () => {
    mockFastGlob.mockResolvedValue(['test.css']);
    (mockFileOps.readFile as Mock).mockResolvedValueOnce(''); // Config file
    (mockCssProcessor.loadConfig as Mock).mockResolvedValue({
      plugins: [] as PostCSSPlugin[],
      configFile: 'postcss.config.js',
    });
    (mockFileOps.readFile as Mock).mockResolvedValueOnce(''); // CSS file

    await run('src/**/*.css', { configPath: '.' });

    expect(mockLog.warn).toHaveBeenCalledWith(
      expect.stringContaining('Empty file detected')
    );
    expect(mockCssProcessor.process).not.toHaveBeenCalled();
  });

  it('should handle CSS files with no classes', async () => {
    mockFastGlob.mockResolvedValue(['test.css']);
    (mockFileOps.readFile as Mock).mockResolvedValueOnce(''); // Config file
    (mockCssProcessor.loadConfig as Mock).mockResolvedValue({
      plugins: [] as PostCSSPlugin[],
      configFile: 'postcss.config.js',
    });
    (mockFileOps.readFile as Mock).mockResolvedValueOnce('.class {}'); // CSS file
    (mockCssProcessor.process as Mock).mockResolvedValue('');

    await run('src/**/*.css', { configPath: '.' });

    expect(mockLog.warn).toHaveBeenCalledWith(
      expect.stringContaining('No CSS classes found in')
    );
    expect(mockFileOps.removeFile).toHaveBeenCalledWith('test.css.d.ts');
  });

  it('should keep compiled files when keep option is true', async () => {
    mockFastGlob.mockResolvedValue(['test.css']);
    (mockFileOps.readFile as Mock).mockResolvedValueOnce(''); // Config file
    (mockCssProcessor.loadConfig as Mock).mockResolvedValue({
      plugins: [] as PostCSSPlugin[],
      configFile: 'postcss.config.js',
    });
    (mockFileOps.readFile as Mock).mockResolvedValueOnce(
      '.class { color: red; }'
    ); // CSS file
    (mockCssProcessor.process as Mock).mockResolvedValue(
      '.class { color: red; }'
    );
    (mockFileOps.writeCompiledCSS as Mock).mockResolvedValue(
      '_compiled.test.css'
    );
    mockDtsGenerator.generate.mockResolvedValue({
      formatted: 'export const styles = { class: string };',
      isEmpty: false,
    });
    (mockFileOps.writeDtsFile as Mock).mockResolvedValue('test.css.d.ts');

    await run('src/**/*.css', { configPath: '.', keep: true });

    expect(mockFileOps.removeFile).not.toHaveBeenCalledWith(
      '_compiled.test.css'
    );
  });

  it('should handle errors during CSS processing', async () => {
    mockFastGlob.mockResolvedValue(['test.css']);
    (mockFileOps.readFile as Mock).mockResolvedValueOnce(''); // Config file
    (mockCssProcessor.loadConfig as Mock).mockResolvedValue({
      plugins: [] as PostCSSPlugin[],
      configFile: 'postcss.config.js',
    });
    (mockFileOps.readFile as Mock).mockResolvedValueOnce(
      '.class { color: red; }'
    ); // CSS file
    (mockCssProcessor.process as Mock).mockRejectedValue(
      new Error('Processing failed')
    );

    await expect(run('src/**/*.css', { configPath: '.' })).rejects.toThrow(
      'An error occurred during generation: Error processing CSS module test.css'
    );
    expect(mockFileOps.removeFile).toHaveBeenCalledWith('test.css.d.ts');
  });

  it('should log verbose output when verbose option is true', async () => {
    mockFastGlob.mockResolvedValue(['test.css']);
    (mockFileOps.readFile as Mock).mockResolvedValueOnce(''); // Config file
    (mockCssProcessor.loadConfig as Mock).mockResolvedValue({
      plugins: [] as PostCSSPlugin[],
      configFile: 'postcss.config.js',
    });
    (mockFileOps.readFile as Mock).mockResolvedValueOnce(
      '.class { color: red; }'
    ); // CSS file
    (mockCssProcessor.process as Mock).mockResolvedValue(
      '.class { color: red; }'
    );
    (mockFileOps.writeCompiledCSS as Mock).mockResolvedValue(
      '_compiled.test.css'
    );
    mockDtsGenerator.generate.mockResolvedValue({
      formatted: 'export const styles = { class: string };',
      isEmpty: false,
    });
    (mockFileOps.writeDtsFile as Mock).mockResolvedValue('test.css.d.ts');

    await run('src/**/*.css', { configPath: '.', verbose: true });

    // Verify all log messages in order
    expect(mockLog.info).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('Generating d.ts for "src/**/*.css"')
    );
    expect(mockLog.info).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('Using PostCSS config: postcss.config.js')
    );
    expect(mockLog.info).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('Found 1 file to process')
    );
    expect(mockLog.info).toHaveBeenNthCalledWith(
      4,
      expect.stringContaining('✓ Generated test.css.d.ts')
    );
  });

  it('should handle empty DTS content', async () => {
    mockFastGlob.mockResolvedValue(['test.css']);
    (mockFileOps.readFile as Mock).mockResolvedValueOnce(''); // Config file
    (mockCssProcessor.loadConfig as Mock).mockResolvedValue({
      plugins: [] as PostCSSPlugin[],
      configFile: 'postcss.config.js',
    });
    (mockFileOps.readFile as Mock).mockResolvedValueOnce(
      '.class { color: red; }'
    ); // CSS file
    (mockCssProcessor.process as Mock).mockResolvedValue(
      '.class { color: red; }'
    );
    (mockFileOps.writeCompiledCSS as Mock).mockResolvedValue(
      '_compiled.test.css'
    );
    mockDtsGenerator.generate.mockResolvedValue({
      formatted: '',
      isEmpty: true,
    });

    await run('src/**/*.css', { configPath: '.' });

    expect(mockLog.warn).toHaveBeenCalledWith(
      expect.stringContaining('No CSS classes to export in')
    );
    expect(mockFileOps.writeDtsFile).toHaveBeenCalledWith(
      '_compiled.test.css',
      '',
      undefined
    );
  });
});
