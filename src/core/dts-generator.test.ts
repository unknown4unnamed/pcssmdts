import DtsCreator from 'typed-css-modules';
import { describe, it, expect, vi } from 'vitest';

import { createDtsGenerator } from './dts-generator';

vi.mock('typed-css-modules');

describe('DtsGenerator', () => {
  const mockDtsCreator = vi.mocked(DtsCreator);

  describe('generate', () => {
    it('should generate d.ts content with default options', async () => {
      const filePath = 'test.module.css';
      const mockContent = {
        formatted: 'export const test: string;',
        tokens: ['test'],
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
      });
      expect(mockCreate).toHaveBeenCalledWith(filePath);
      expect(result).toEqual({
        formatted: mockContent.formatted,
        isEmpty: false,
      });
    });

    it('should generate d.ts content with custom options', async () => {
      const filePath = 'test.module.css';
      const mockContent = {
        formatted: 'export const test: string;',
        tokens: ['test'],
        writeFile: vi.fn(),
      };

      const mockCreate = vi.fn().mockResolvedValue(mockContent);
      mockDtsCreator.mockImplementation(
        () => ({ create: mockCreate } as unknown as DtsCreator)
      );

      const generator = createDtsGenerator({
        camelCase: false,
        namedExports: true,
      });
      const result = await generator.generate(filePath);

      expect(mockDtsCreator).toHaveBeenCalledWith({
        camelCase: false,
        namedExports: true,
      });
      expect(mockCreate).toHaveBeenCalledWith(filePath);
      expect(result).toEqual({
        formatted: mockContent.formatted,
        isEmpty: false,
      });
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
