import path from 'path';

import postcss, { AcceptedPlugin } from 'postcss';
import postcssrc from 'postcss-load-config';

import { GeneratorError } from '@/types/errors';
import type { CSSProcessor } from '@/types/index';
import { type Logger } from '@/utils/logger';

export const createCSSProcessor = (logger?: Logger): CSSProcessor => {
  let loadedPlugins: AcceptedPlugin[] | undefined;

  return {
    loadConfig: async (configPath: string) => {
      try {
        // If configPath is provided, use it directly
        // Otherwise, let postcss-load-config find the nearest config
        const searchPath = configPath === '.' ? process.cwd() : configPath;
        logger?.debug(`Loading PostCSS config from: ${searchPath}`);
        const { plugins, file } = await postcssrc(undefined, searchPath);
        loadedPlugins = plugins;
        logger?.debug(`Loaded ${plugins.length} PostCSS plugins`);

        return { plugins, configFile: file };
      } catch (error) {
        logger?.error(
          `Failed to load PostCSS config: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        throw new GeneratorError(
          `PostCSS config not found in project. Please ensure you have a PostCSS configuration file (postcss.config.js, .postcssrc, etc.) in your project.`
        );
      }
    },

    process: async (css: string, from: string): Promise<string> => {
      if (!loadedPlugins) {
        logger?.error('PostCSS plugins not loaded');
        throw new GeneratorError(
          'PostCSS plugins not loaded. Please call loadConfig first.'
        );
      }

      try {
        logger?.debug(`Processing CSS file: ${from}`);
        const result = await postcss(loadedPlugins).process(css, { from });

        // Check for warnings and errors
        if (result.warnings().length > 0) {
          const warnings = result
            .warnings()
            .map((w) => w.toString())
            .join('\n');
          logger?.warn(`CSS warnings for ${path.basename(from)}:\n${warnings}`);
          throw new Error(`CSS warnings:\n${warnings}`);
        }

        logger?.debug(`Successfully processed CSS file: ${from}`);
        return result.css;
      } catch (error) {
        // Enhance error message with file information
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger?.error(
          `Error processing CSS module ${path.basename(from)}: ${errorMessage}`
        );
        throw new GeneratorError(
          `Error processing CSS module ${path.basename(from)}: ${errorMessage}`
        );
      }
    },
  };
};
