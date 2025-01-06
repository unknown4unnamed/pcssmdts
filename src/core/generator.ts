import path from 'path';

import chalk from 'chalk';
import fastGlob from 'fast-glob';
import { readFile, remove, rename, writeFile } from 'fs-extra';
import postcss from 'postcss';
import postcssrc from 'postcss-load-config';
import DtsCreator from 'typed-css-modules';

import {
  COMPILED_CSS_PREFIX,
  TYPE_DEF_FILE_EXT,
  type Params,
} from '@/types/index';
import { logger } from '@/utils/logger';

export class GeneratorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeneratorError';
  }
}

export const run = async (
  source: string,
  { verbose, configPath, namedExports, keep = false }: Params
): Promise<void> => {
  const log = logger(verbose);

  log(chalk.greenBright(`\nGenerating d.ts for "${source}"\n`));

  if (keep) {
    log(
      chalk.bgYellowBright.red(
        '\nAttention, you are preserving compiled css files!\n'
      )
    );
  }

  try {
    const filesMatch = await fastGlob(source);
    const cssModules = filesMatch.filter(
      (p) => !p.includes(COMPILED_CSS_PREFIX)
    );

    if (!cssModules.length) {
      throw new GeneratorError(
        'No files were found to compile, please check your glob pattern'
      );
    }

    // Check if config file exists
    try {
      await readFile(configPath, 'utf-8');
    } catch (error) {
      throw new GeneratorError(
        `PostCSS config file not found at path: ${configPath}`
      );
    }

    const { plugins, file } = await postcssrc(undefined, configPath);

    // Normalize paths for comparison
    const normalizedConfigPath = path.resolve(configPath);
    const normalizedFile = path.resolve(file);

    if (normalizedConfigPath !== normalizedFile) {
      throw new GeneratorError(
        `Expected to use config at ${configPath}, but PostCSS used ${file} instead`
      );
    }

    log(chalk.cyan(`Loaded PostCSS config file from path: \n${file}`));
    log(
      chalk.bgMagenta(
        `\nFound ${cssModules.length} file${
          cssModules.length === 1 ? '' : 's'
        } to process\n`
      )
    );

    const creator = new DtsCreator({
      camelCase: true,
      namedExports,
    });

    for (const cssModuleFilePath of cssModules) {
      log(chalk.yellowBright(`\ncompiling ${cssModuleFilePath}`));

      try {
        const css = await readFile(cssModuleFilePath, 'utf-8');

        if (!css.trim()) {
          log(chalk.yellow(`\nEmpty file detected: ${cssModuleFilePath}`));
          log(chalk.dim('File content length:', css.length));
          log(chalk.dim('Raw content:', JSON.stringify(css)));
          log(chalk.yellow('Skipping file as it contains no CSS classes\n'));
          continue;
        }

        const compiledCSSFilePath = `${path.dirname(
          cssModuleFilePath
        )}/${COMPILED_CSS_PREFIX}${path.basename(cssModuleFilePath)}`;

        try {
          const compiled = await postcss(plugins).process(css, {
            from: cssModuleFilePath,
          });

          if (!compiled.css.trim()) {
            log(
              chalk.yellow(
                `No CSS classes found in compiled file: ${cssModuleFilePath}`
              )
            );
            // Clean up any existing .d.ts file
            const dtsFilename = `${cssModuleFilePath}.${TYPE_DEF_FILE_EXT}`;
            await remove(dtsFilename);
            continue;
          }

          await writeFile(compiledCSSFilePath, compiled.css);
        } catch (error) {
          throw new GeneratorError(
            `CSS syntax error in ${cssModuleFilePath}: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }

        log(chalk.magenta(`compiled ${compiledCSSFilePath}`));

        const dtsContent = await creator.create(compiledCSSFilePath);

        if (!Object.keys(dtsContent.formatted).length) {
          log(
            chalk.yellow(`No CSS classes to export in: ${cssModuleFilePath}`)
          );
          await remove(compiledCSSFilePath);
          // Clean up any existing .d.ts file
          const dtsFilename = `${cssModuleFilePath}.${TYPE_DEF_FILE_EXT}`;
          await remove(dtsFilename);
          continue;
        }

        await dtsContent.writeFile();

        if (!keep) {
          await remove(compiledCSSFilePath);
          log(
            chalk.grey(`compiled file has been removed ${compiledCSSFilePath}`)
          );
        }

        const dtsFilename = `${compiledCSSFilePath.replace(
          COMPILED_CSS_PREFIX,
          ''
        )}.${TYPE_DEF_FILE_EXT}`;

        await rename(
          `${compiledCSSFilePath}.${TYPE_DEF_FILE_EXT}`,
          dtsFilename
        );

        log(chalk.green(`generated d.ts ${dtsFilename}\n`));
      } catch (error) {
        throw new GeneratorError(
          `Error processing CSS module ${cssModuleFilePath}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  } catch (error) {
    const errorMessage = `An error occurred during generation: ${
      error instanceof Error ? error.message : String(error)
    }`;
    log(chalk.red(errorMessage));
    throw new GeneratorError(errorMessage);
  }
};
