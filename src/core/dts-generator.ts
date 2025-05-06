import DtsCreator from 'typed-css-modules';

import { type DtsGeneratorOptions } from '@/types/index';
import { type Logger } from '@/utils/logger';

export type DtsGenerator = {
  generate: (filePath: string) => Promise<{
    formatted: string;
    isEmpty: boolean;
  }>;
};

const createTokenLine = (token: string, namedExports?: boolean): string => {
  // Assuming `token` from DtsCreator.create().tokens is already processed by its camelCase option
  if (namedExports) {
    return `export const ${token}: string;`;
  }
  return `  readonly "${token}": string;`;
};

export const createDtsGenerator = (
  options: DtsGeneratorOptions = {},
  logger?: Logger
): DtsGenerator => {
  const creator = new DtsCreator({
    camelCase: options.camelCase ?? true, // Pass the option to DtsCreator, defaulting to true
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
      const originalTokens = content.tokens || [];
      const isEmpty = !originalTokens.length;

      if (isEmpty) {
        logger?.debug(`No CSS classes found in: ${filePath}`);
        return {
          formatted: '', // Return empty string for no tokens
          isEmpty,
        };
      }

      logger?.debug(`Generated d.ts content for: ${filePath}`);

      const sortedTokens = [...originalTokens].sort((a, b) =>
        a.localeCompare(b)
      );

      let formattedContent: string;
      const eol = options.EOL || '\n';

      if (options.namedExports) {
        const tokenLines = sortedTokens
          .map((token) => createTokenLine(token, true))
          .join(eol);
        // Ensure an extra EOL at the end if there are tokens, similar to original snapshots
        const trailingEol = tokenLines.length > 0 ? eol : '';
        formattedContent = `export const __esModule: true;${eol}${tokenLines}${trailingEol}`;
      } else {
        const tokenLines = sortedTokens
          .map((token) => createTokenLine(token, false))
          .join(eol);
        // Ensure an extra EOL at the end, similar to original snapshots
        formattedContent = `declare const styles: {${eol}${tokenLines}${eol}};${eol}export = styles;${eol}`;
      }

      return {
        formatted: formattedContent,
        isEmpty,
      };
    },
  };
};
