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
      throw new Error(
        'No files were found to compile, please check your glob pattern'
      );
    }

    const { plugins, file } = await postcssrc(undefined, configPath);

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

      const compiledCSSFilePath = `${path.dirname(
        cssModuleFilePath
      )}/${COMPILED_CSS_PREFIX}${path.basename(cssModuleFilePath)}`;

      const css = await readFile(cssModuleFilePath, 'utf-8');
      const compiled = await postcss(plugins).process(css, {
        from: undefined,
      });

      await writeFile(compiledCSSFilePath, compiled.css);

      log(chalk.magenta(`compiled ${compiledCSSFilePath}`));

      const dtsContent = await creator.create(compiledCSSFilePath);

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

      await rename(`${compiledCSSFilePath}.${TYPE_DEF_FILE_EXT}`, dtsFilename);

      log(chalk.green(`generated d.ts ${dtsFilename}\n`));
    }
  } catch (error) {
    log(
      chalk.red(
        `An error occurred during generation: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    );
    process.exit(1);
  }
};
