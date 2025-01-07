import path from 'path';

import postcss from 'postcss';
import postcssrc from 'postcss-load-config';

import { GeneratorError } from '@/types/errors';
import { type CSSProcessor } from '@/types/index';

export const createCSSProcessor = (): CSSProcessor => {
  let loadedPlugins: any[] | undefined;

  return {
    loadConfig: async (configPath: string) => {
      try {
        // If configPath is provided, use it directly
        // Otherwise, let postcss-load-config find the nearest config
        const searchPath = configPath === '.' ? process.cwd() : configPath;
        const { plugins, file } = await postcssrc(undefined, searchPath);
        loadedPlugins = plugins;

        return { plugins, configFile: file };
      } catch (error) {
        throw new GeneratorError(
          `PostCSS config not found in project. Please ensure you have a PostCSS configuration file (postcss.config.js, .postcssrc, etc.) in your project.`
        );
      }
    },

    process: async (css: string, from: string): Promise<string> => {
      if (!loadedPlugins) {
        throw new GeneratorError(
          'PostCSS plugins not loaded. Please call loadConfig first.'
        );
      }

      try {
        const result = await postcss(loadedPlugins).process(css, { from });

        // Check for warnings and errors
        if (result.warnings().length > 0) {
          const warnings = result
            .warnings()
            .map((w) => w.toString())
            .join('\n');
          throw new Error(`CSS warnings:\n${warnings}`);
        }

        return result.css;
      } catch (error) {
        // Enhance error message with file information
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new GeneratorError(
          `Error processing CSS module ${path.basename(from)}: ${errorMessage}`
        );
      }
    },
  };
};
