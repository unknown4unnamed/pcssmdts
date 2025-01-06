#!/usr/bin/env node

import path from 'path';

import chalk from 'chalk';
import fastGlob from 'fast-glob';
import { readFile, remove, rename, writeFile } from 'fs-extra';
import postcss from 'postcss';
import postcssrc from 'postcss-load-config';
import DtsCreator from 'typed-css-modules';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

type Params = {
  verbose: boolean;
  configPath?: string;
  keep?: boolean;
  namedExports: boolean;
};

const COMPILED_CSS_PREFIX = '__postcss__';
const TYPE_DEF_FILE_EXT = 'd.ts';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const logger = (enable: boolean) => (enable ? console.log : () => {});

const run = async (
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

void yargs(hideBin(process.argv))
  .group(['verbose', 'config', 'keep'], 'Basic options:')
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging',
  })
  .option('config', {
    alias: 'c',
    type: 'string',
    demandOption: false,
    description: 'Optionally provide custom path to your PostCSS config',
  })
  .option('keep', {
    alias: 'k',
    type: 'boolean',
    demandOption: false,
    description: 'Keep compiled css files',
  })
  .group(['namedExports'], 'typed-css-modules options:')
  .option('namedExports', {
    alias: 'n',
    type: 'boolean',
    default: false,
    description: 'Enables named export for generated d.ts files',
  })
  .command(
    '$0 <source> [options]',
    'Generate d.ts files for PostCSS powered css modules',
    (yargs) =>
      yargs.positional('source', {
        describe: 'source pattern to your css modules files location',
        type: 'string',
      }),
    async (argv) => {
      await run(argv.source, {
        verbose: argv.verbose,
        configPath: argv.config,
        keep: argv.keep,
        namedExports: argv.namedExports,
      });
    }
  )
  .example(
    'pcssmdts "src/**/*.module.css"',
    'Basic usage, in the end next to each found css file corresponding d.ts file will be generated\n\n'
  )
  .example(
    'pcssmdts "src/**/*.module.css" -k',
    'In this case compiled files will be preserved, all compiled files are prefixed by __postcss__\n\n'
  )
  .example(
    'pcssmdts "src/**/*.module.css" -c configs/postcss.config.js',
    'Custom PostCSS config location path\n\n'
  )
  .example(
    'pcssmdts "src/**/*.module.css" -n',
    'Named exports is used for generated files\n\n'
  )
  .parse();
