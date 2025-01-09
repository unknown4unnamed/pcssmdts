import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { run } from '@/core/generator';

export const initCLI = () => {
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
    .group(
      ['namedExports', 'camelCase', 'outDir', 'eol'],
      'typed-css-modules options:'
    )
    .option('namedExports', {
      alias: 'n',
      type: 'boolean',
      default: false,
      description: 'Enables named export for generated d.ts files',
    })
    .option('camelCase', {
      type: 'string',
      choices: ['true', 'false', 'dashes'],
      description: 'Convert CSS class names to camelCase',
    })
    .option('outDir', {
      type: 'string',
      description:
        'Output directory for generated d.ts files. When specified, all generated .d.ts files will be placed in this directory, regardless of their original location.',
    })
    .option('eol', {
      type: 'string',
      description: 'End of line character',
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
        try {
          const camelCase =
            argv.camelCase === 'true'
              ? true
              : argv.camelCase === 'false'
              ? false
              : argv.camelCase === 'dashes'
              ? 'dashes'
              : undefined;

          if (!argv.source) {
            throw new Error('Source pattern is required');
          }

          await run(argv.source, {
            verbose: argv.verbose,
            configPath: argv.config,
            keep: argv.keep,
            namedExports: argv.namedExports,
            camelCase,
            outDir: argv.outDir,
            EOL: argv.eol,
          });
        } catch (error) {
          console.error(error instanceof Error ? error.message : String(error));
          process.exit(1);
        }
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
    .example(
      'pcssmdts "src/**/*.module.css" --camelCase dashes',
      'Convert CSS class names to camelCase, preserving dashes\n\n'
    )
    .example(
      'pcssmdts "src/**/*.module.css" --outDir types',
      'Output d.ts files to a specific directory\n\n'
    )
    .parse();
};

// Initialize CLI if this file is being run directly
if (require.main === module) {
  initCLI();
}
