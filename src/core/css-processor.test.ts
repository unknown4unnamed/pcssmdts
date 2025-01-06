import postcss, { Plugin } from 'postcss';
import postcssrc from 'postcss-load-config';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GeneratorError } from '@/types/errors';

import { createCSSProcessor } from './css-processor';

vi.mock('postcss-load-config');
vi.mock('postcss');

describe('CSSProcessor', () => {
  const mockPostcssrc = vi.mocked(postcssrc);
  const mockPostcss = vi.mocked(postcss);
  const processor = createCSSProcessor();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadConfig', () => {
    it('should load PostCSS config successfully', async () => {
      const configPath = 'path/to/postcss.config.js';
      const mockPlugins = [{ postcssPlugin: 'test' }] as Plugin[];

      mockPostcssrc.mockResolvedValue({
        plugins: mockPlugins,
        file: configPath,
        options: {},
      });

      const result = await processor.loadConfig(configPath);

      expect(result).toEqual({
        plugins: mockPlugins,
        configFile: configPath,
      });
      expect(mockPostcssrc).toHaveBeenCalledWith(undefined, configPath);
    });

    it('should throw error when config paths mismatch', async () => {
      const configPath = 'path/to/postcss.config.js';
      const differentPath = 'different/path/postcss.config.js';

      mockPostcssrc.mockResolvedValue({
        plugins: [],
        file: differentPath,
        options: {},
      });

      await expect(processor.loadConfig(configPath)).rejects.toThrow(
        GeneratorError
      );
    });

    it('should throw error when config loading fails', async () => {
      const configPath = 'path/to/postcss.config.js';
      mockPostcssrc.mockRejectedValue(new Error('Config load failed'));

      await expect(processor.loadConfig(configPath)).rejects.toThrow(
        GeneratorError
      );
    });
  });

  describe('process', () => {
    it('should process CSS successfully', async () => {
      const css = '.test { color: red; }';
      const processedCss = '.test{color:red}';
      const from = 'test.css';
      const configPath = 'path/to/postcss.config.js';

      // First load the config
      mockPostcssrc.mockResolvedValue({
        plugins: [],
        file: configPath,
        options: {},
      });
      await processor.loadConfig(configPath);

      // Then process CSS
      const mockProcessor = {
        process: vi.fn().mockResolvedValue({
          css: processedCss,
          warnings: () => [], // Add empty warnings array
        }),
      };
      mockPostcss.mockReturnValue(
        mockProcessor as unknown as postcss.Processor
      );

      const result = await processor.process(css, from);

      expect(result).toBe(processedCss);
      expect(mockProcessor.process).toHaveBeenCalledWith(css, { from });
    });

    it('should throw error when processing fails', async () => {
      const css = '.test { color: red; }';
      const from = 'test.css';
      const configPath = 'path/to/postcss.config.js';

      // First load the config
      mockPostcssrc.mockResolvedValue({
        plugins: [],
        file: configPath,
        options: {},
      });
      await processor.loadConfig(configPath);

      // Then mock process failure
      const mockProcessor = {
        process: vi.fn().mockRejectedValue(new Error('Processing failed')),
      };
      mockPostcss.mockReturnValue(
        mockProcessor as unknown as postcss.Processor
      );

      await expect(processor.process(css, from)).rejects.toThrow(
        GeneratorError
      );
      await expect(processor.process(css, from)).rejects.toThrow(
        'Error processing CSS module test.css: Processing failed'
      );
    });

    it('should throw error when CSS has warnings', async () => {
      const css = '.test { color: red; }';
      const from = 'test.css';
      const configPath = 'path/to/postcss.config.js';

      // First load the config
      mockPostcssrc.mockResolvedValue({
        plugins: [],
        file: configPath,
        options: {},
      });
      await processor.loadConfig(configPath);

      // Then process CSS with warnings
      const mockProcessor = {
        process: vi.fn().mockResolvedValue({
          css: '.test{color:red}',
          warnings: () => [
            {
              toString: () => 'Warning: something is wrong',
            },
          ],
        }),
      };
      mockPostcss.mockReturnValue(
        mockProcessor as unknown as postcss.Processor
      );

      await expect(processor.process(css, from)).rejects.toThrow(
        'Error processing CSS module test.css: CSS warnings:\nWarning: something is wrong'
      );
    });
  });
});
