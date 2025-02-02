import path from 'path';

import { readFile, writeFile, rename, remove, mkdir } from 'fs-extra';

import {
  COMPILED_CSS_PREFIX,
  TYPE_DEF_FILE_EXT,
  type FileOperations,
} from '@/types/index';
import { type Logger } from '@/utils/logger';

export const createFileOperations = (logger?: Logger): FileOperations => ({
  readFile: async (filePath: string): Promise<string> => {
    logger?.debug(`Reading file: ${filePath}`);
    return readFile(filePath, 'utf-8');
  },

  writeCompiledCSS: async (
    originalPath: string,
    content: string
  ): Promise<string> => {
    const compiledPath = `${path.dirname(
      originalPath
    )}/${COMPILED_CSS_PREFIX}${path.basename(originalPath)}`;
    logger?.debug(`Writing compiled CSS to: ${compiledPath}`);
    await writeFile(compiledPath, content);
    return compiledPath;
  },

  writeDtsFile: async (
    compiledPath: string,
    content: string,
    outDir?: string
  ): Promise<string> => {
    const baseDtsPath = `${compiledPath.replace(
      COMPILED_CSS_PREFIX,
      ''
    )}.${TYPE_DEF_FILE_EXT}`;
    const tempDtsPath = `${compiledPath}.${TYPE_DEF_FILE_EXT}`;
    const dtsPath = outDir
      ? path.join(outDir, path.basename(baseDtsPath))
      : baseDtsPath;

    logger?.debug(`Writing d.ts file: ${dtsPath}`);

    if (outDir) {
      logger?.debug(`Creating output directory: ${outDir}`);
      await mkdir(outDir, { recursive: true });
    }

    try {
      await writeFile(tempDtsPath, content);
      await mkdir(path.dirname(dtsPath), { recursive: true });

      try {
        await remove(dtsPath);
      } catch {
        logger?.debug(`No existing d.ts file to remove at: ${dtsPath}`);
      }

      await rename(tempDtsPath, dtsPath);
      logger?.debug(`Successfully wrote d.ts file: ${dtsPath}`);
    } catch (error) {
      logger?.error(
        `Failed to write d.ts file: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      try {
        await remove(tempDtsPath);
      } catch {
        logger?.debug(`Failed to cleanup temporary file: ${tempDtsPath}`);
      }
      throw error;
    }

    return dtsPath;
  },

  removeFile: async (filePath: string): Promise<void> => {
    logger?.debug(`Removing file: ${filePath}`);
    await remove(filePath);
  },

  removeCompiledFiles: async (
    cssPath: string,
    dtsPath: string
  ): Promise<void> => {
    logger?.debug(`Removing compiled files: ${cssPath}, ${dtsPath}`);
    await Promise.all([remove(cssPath), remove(dtsPath)]);
  },
});
