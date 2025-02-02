import path from 'path';

import { readFile, writeFile, rename, remove, mkdir } from 'fs-extra';
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
  mkdir: vi.fn().mockResolvedValue(undefined),
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
      vi.mocked(mkdir).mockResolvedValue();
      vi.mocked(remove).mockResolvedValue();

      await fileOps.writeDtsFile(compiledPath, content);

      expect(mkdir).toHaveBeenCalledWith('styles', { recursive: true });
      expect(writeFile).toHaveBeenCalledWith(
        'styles/_compiled.test.css.d.ts',
        content
      );
      expect(rename).toHaveBeenCalledWith(
        'styles/_compiled.test.css.d.ts',
        'styles/test.css.d.ts'
      );
    });

    it('should handle errors and clean up temp files', async () => {
      const content = 'export const styles = {};';
      const compiledPath = 'styles/_compiled.test.css';
      const error = new Error('Write failed');

      vi.mocked(writeFile).mockRejectedValue(error);
      vi.mocked(remove).mockResolvedValue();
      vi.mocked(mkdir).mockResolvedValue();

      await expect(fileOps.writeDtsFile(compiledPath, content)).rejects.toThrow(
        error
      );
      expect(remove).toHaveBeenCalledWith('styles/_compiled.test.css.d.ts');
    });

    it('should create output directory when specified', async () => {
      const content = 'export const styles = {};';
      const compiledPath = 'styles/_compiled.test.css';
      const outDir = 'dist/types';

      vi.mocked(writeFile).mockResolvedValue();
      vi.mocked(rename).mockResolvedValue();
      vi.mocked(mkdir).mockResolvedValue();
      vi.mocked(remove).mockResolvedValue();

      await fileOps.writeDtsFile(compiledPath, content, outDir);

      expect(mkdir).toHaveBeenCalledWith(outDir, { recursive: true });
      expect(mkdir).toHaveBeenCalledWith(outDir, { recursive: true });
      expect(writeFile).toHaveBeenCalledWith(
        'styles/_compiled.test.css.d.ts',
        content
      );
      expect(rename).toHaveBeenCalledWith(
        'styles/_compiled.test.css.d.ts',
        path.join(outDir, 'test.css.d.ts')
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
