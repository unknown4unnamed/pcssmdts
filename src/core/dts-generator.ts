import DtsCreator from 'typed-css-modules';

import { type DtsGeneratorOptions } from '@/types/index';
import { type Logger } from '@/utils/logger';

export type DtsGenerator = {
  generate: (filePath: string) => Promise<{
    formatted: string;
    isEmpty: boolean;
  }>;
};

export const createDtsGenerator = (
  options: DtsGeneratorOptions = {},
  logger?: Logger
): DtsGenerator => {
  const creator = new DtsCreator({
    camelCase: options.camelCase ?? true,
    namedExports: options.namedExports,
    outDir: options.outDir,
    EOL: options.EOL,
    loaderPlugins: options.loaderPlugins,
  });

  logger?.debug('Created DTS generator with options:', options);

  return {
    generate: async (filePath: string) => {
      logger?.debug(`Generating d.ts for file: ${filePath}`);
      const content = await creator.create(filePath);
      const isEmpty = !Object.keys(content.formatted).length;

      if (isEmpty) {
        logger?.debug(`No CSS classes found in: ${filePath}`);
      } else {
        logger?.debug(`Generated d.ts content for: ${filePath}`);
      }

      return {
        formatted: content.formatted,
        isEmpty,
      };
    },
  };
};
