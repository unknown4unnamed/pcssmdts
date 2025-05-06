import DtsCreator from 'typed-css-modules';
import { describe, it, expect, vi } from 'vitest';

import { createDtsGenerator } from './dts-generator';

vi.mock('typed-css-modules');

describe('DtsGenerator', () => {
  const mockDtsCreator = vi.mocked(DtsCreator);

  describe('generate', () => {
    it('should generate d.ts content with default options', async () => {
      const filePath = 'test.module.css';
      const mockTokens = ['test', 'anotherTest'];
      const mockContent = {
        formatted: '',
        tokens: mockTokens,
        writeFile: vi.fn(),
      };

      const mockCreate = vi.fn().mockResolvedValue(mockContent);
      mockDtsCreator.mockImplementation(
        () => ({ create: mockCreate } as unknown as DtsCreator)
      );

      const generator = createDtsGenerator();
      const result = await generator.generate(filePath);

      expect(mockDtsCreator).toHaveBeenCalledWith({
        camelCase: true,
        namedExports: undefined,
        outDir: undefined,
        EOL: undefined,
        loaderPlugins: undefined,
      });
      expect(mockCreate).toHaveBeenCalledWith(filePath);

      const expectedFormatted = `declare const styles: {\n  readonly "anotherTest": string;\n  readonly "test": string;\n};\nexport = styles;\n`;
      expect(result.formatted).toEqual(expectedFormatted);
      expect(result.isEmpty).toBe(false);
    });

    it('should generate d.ts content with custom options', async () => {
      const filePath = 'test.module.css';
      const mockTokens = ['test-class', 'another-class'];
      const mockContent = {
        formatted: '',
        tokens: mockTokens,
        writeFile: vi.fn(),
      };
      const EOL = '\r\n';

      const mockCreate = vi.fn().mockResolvedValue(mockContent);
      mockDtsCreator.mockImplementation(
        () => ({ create: mockCreate } as unknown as DtsCreator)
      );

      const generator = createDtsGenerator({
        camelCase: 'dashes',
        namedExports: true,
        outDir: 'types',
        EOL,
      });
      const result = await generator.generate(filePath);

      expect(mockDtsCreator).toHaveBeenCalledWith({
        camelCase: 'dashes',
        namedExports: true,
        outDir: 'types',
        EOL,
        loaderPlugins: undefined,
      });
      expect(mockCreate).toHaveBeenCalledWith(filePath);

      const expectedFormatted = `export const __esModule: true;${EOL}export const another-class: string;${EOL}export const test-class: string;${EOL}`;
      expect(result.formatted).toEqual(expectedFormatted);
      expect(result.isEmpty).toBe(false);
    });

    it('should handle empty CSS modules', async () => {
      const filePath = 'empty.module.css';
      const mockContent = {
        formatted: '',
        tokens: [],
        writeFile: vi.fn(),
      };

      const mockCreate = vi.fn().mockResolvedValue(mockContent);
      mockDtsCreator.mockImplementation(
        () => ({ create: mockCreate } as unknown as DtsCreator)
      );

      const generator = createDtsGenerator();
      const result = await generator.generate(filePath);

      expect(result).toEqual({
        formatted: '',
        isEmpty: true,
      });
    });
  });
});
