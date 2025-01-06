import path from 'path';

import { readFile, writeFile, rename, remove } from 'fs-extra';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createFileOperations } from './file-operations';

// Mock fs-extra functions
vi.mock('fs-extra', () => ({
  readFile: vi.fn().mockImplementation((_, encoding: string) => {
    if (encoding === 'utf-8') return Promise.resolve('test content');
    return Promise.resolve(Buffer.from('test content'));
  }),
  writeFile: vi.fn(),
  rename: vi.fn(),
  remove: vi.fn(),
}));

describe('FileOperations', () => {
  const fileOps = createFileOperations();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('readFile', () => {
    it('should read file content', async () => {
      const content = 'test content';
      const result = await fileOps.readFile('test.css');

      expect(result).toBe(content);
      expect(readFile).toHaveBeenCalledWith('test.css', 'utf-8');
    });
  });

  describe('writeCompiledCSS', () => {
    it('should write compiled CSS to correct path', async () => {
      const content = '.class { color: red; }';
      const originalPath = 'styles/test.css';
      vi.mocked(writeFile).mockResolvedValue();

      await fileOps.writeCompiledCSS(originalPath, content);

      expect(writeFile).toHaveBeenCalledWith(
        path.join('styles', '_compiled.test.css'),
        content
      );
    });
  });

  describe('writeDtsFile', () => {
    it('should write and rename dts file', async () => {
      const content = 'export const styles = {};';
      const compiledPath = 'styles/_compiled.test.css';
      vi.mocked(writeFile).mockResolvedValue();
      vi.mocked(rename).mockResolvedValue();

      await fileOps.writeDtsFile(compiledPath, content);

      expect(writeFile).toHaveBeenCalledWith(
        'styles/_compiled.test.css.d.ts',
        content
      );
      expect(rename).toHaveBeenCalledWith(
        'styles/_compiled.test.css.d.ts',
        'styles/test.css.d.ts'
      );
    });
  });

  describe('removeCompiledFiles', () => {
    it('should remove both CSS and dts files', async () => {
      const cssPath = 'styles/_compiled.test.css';
      const dtsPath = 'styles/test.css.d.ts';
      vi.mocked(remove).mockResolvedValue();

      await fileOps.removeCompiledFiles(cssPath, dtsPath);

      expect(remove).toHaveBeenCalledWith(cssPath);
      expect(remove).toHaveBeenCalledWith(dtsPath);
    });
  });
});
