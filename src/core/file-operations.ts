import path from 'path';

import { readFile, writeFile, rename, remove } from 'fs-extra';

import {
  COMPILED_CSS_PREFIX,
  TYPE_DEF_FILE_EXT,
  type FileOperations,
} from '@/types/index';

export const createFileOperations = (): FileOperations => ({
  readFile: async (filePath: string): Promise<string> => {
    return readFile(filePath, 'utf-8');
  },

  writeCompiledCSS: async (
    originalPath: string,
    content: string
  ): Promise<string> => {
    const compiledPath = `${path.dirname(
      originalPath
    )}/${COMPILED_CSS_PREFIX}${path.basename(originalPath)}`;
    await writeFile(compiledPath, content);
    return compiledPath;
  },

  writeDtsFile: async (
    compiledPath: string,
    content: string
  ): Promise<string> => {
    const dtsPath = `${compiledPath.replace(
      COMPILED_CSS_PREFIX,
      ''
    )}.${TYPE_DEF_FILE_EXT}`;
    const tempDtsPath = `${compiledPath}.${TYPE_DEF_FILE_EXT}`;

    await writeFile(tempDtsPath, content);
    await rename(tempDtsPath, dtsPath);

    return dtsPath;
  },

  removeFile: async (filePath: string): Promise<void> => {
    await remove(filePath);
  },

  removeCompiledFiles: async (
    cssPath: string,
    dtsPath: string
  ): Promise<void> => {
    await Promise.all([remove(cssPath), remove(dtsPath)]);
  },
});
