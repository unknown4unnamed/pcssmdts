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
};

// Initialize CLI if this file is being run directly
if (require.main === module) {
  initCLI();
}
