import DtsCreator from 'typed-css-modules';

import { type DtsGeneratorOptions } from '@/types/index';

export type DtsGenerator = {
  generate: (filePath: string) => Promise<{
    formatted: string;
    isEmpty: boolean;
  }>;
};

export const createDtsGenerator = (
  options: DtsGeneratorOptions = {}
): DtsGenerator => {
  const creator = new DtsCreator({
    camelCase: options.camelCase ?? true,
    namedExports: options.namedExports,
  });

  return {
    generate: async (filePath: string) => {
      const content = await creator.create(filePath);
      return {
        formatted: content.formatted,
        isEmpty: !Object.keys(content.formatted).length,
      };
    },
  };
};
