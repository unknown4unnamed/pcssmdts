import chalk from 'chalk';
import fastGlob from 'fast-glob';

import { GeneratorError } from '@/types/errors';
import { COMPILED_CSS_PREFIX, type Params } from '@/types/index';
import { logger } from '@/utils/logger';

import { createCSSProcessor } from './css-processor';
import { createDtsGenerator } from './dts-generator';
import { createFileOperations } from './file-operations';

export const run = async (
  source: string,
  {
    verbose = false,
    configPath,
    namedExports,
    keep = false,
    camelCase,
    searchDir,
    outDir,
    dropExtension,
    EOL,
  }: Params
): Promise<void> => {
  const log = logger(verbose);
  const fileOps = createFileOperations();
  const cssProcessor = createCSSProcessor();
  const dtsGenerator = createDtsGenerator({
    namedExports,
    camelCase,
    searchDir,
    outDir,
    dropExtension,
    EOL,
  });

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

    // Check if config file exists and load it
    try {
      if (configPath) {
        await fileOps.readFile(configPath);
        const { configFile } = await cssProcessor.loadConfig(configPath);
        log(chalk.cyan(`Using PostCSS config: ${configFile}`));
      } else {
        // Load config from project
        const { configFile } = await cssProcessor.loadConfig('.');
        log(chalk.cyan(`Using PostCSS config: ${configFile}`));
      }
    } catch (error) {
      throw new GeneratorError(
        `${error instanceof Error ? error.message : String(error)}${
          configPath ? ` at path: ${configPath}` : ''
        }\n\nPlease ensure you have a PostCSS configuration file in your project.\nCommon config files: postcss.config.js, .postcssrc, .postcssrc.json, .postcssrc.yaml`
      );
    }

    log(
      chalk.magenta(
        `Found ${cssModules.length} file${
          cssModules.length === 1 ? '' : 's'
        } to process`
      )
    );

    for (const cssModuleFilePath of cssModules) {
      try {
        const css = await fileOps.readFile(cssModuleFilePath);

        if (!css.trim()) {
          log(
            chalk.yellow(`Empty file detected: ${cssModuleFilePath}, skipping`)
          );
          // Skip empty files - no type definitions needed
          continue;
        }

        // Process CSS with PostCSS
        try {
          const compiledCss = await cssProcessor.process(
            css,
            cssModuleFilePath
          );
          if (!compiledCss.trim()) {
            log(
              chalk.yellow(
                `No CSS classes found in: ${cssModuleFilePath}, skipping`
              )
            );
            await fileOps.removeFile(`${cssModuleFilePath}.d.ts`);
            continue;
          }

          // Write compiled CSS
          const compiledCSSFilePath = await fileOps.writeCompiledCSS(
            cssModuleFilePath,
            compiledCss
          );

          // Generate and write d.ts file
          const dtsContent = await dtsGenerator.generate(compiledCSSFilePath);

          if (dtsContent.isEmpty) {
            log(
              chalk.yellow(`No CSS classes to export in: ${cssModuleFilePath}`)
            );
            // For empty modules, still generate an empty d.ts file
            await fileOps.writeDtsFile(
              compiledCSSFilePath,
              dtsContent.formatted,
              outDir
            );
            if (!keep) {
              await fileOps.removeFile(compiledCSSFilePath);
            }
            continue;
          }

          const dtsFilename = await fileOps.writeDtsFile(
            compiledCSSFilePath,
            dtsContent.formatted,
            outDir
          );

          if (!keep) {
            await fileOps.removeFile(compiledCSSFilePath);
          }

          log(chalk.green(`✓ Generated ${dtsFilename}`));
        } catch (error) {
          const errorMessage = `An error occurred during generation: Error processing CSS module ${cssModuleFilePath}: ${
            error instanceof Error ? error.message : String(error)
          }`;
          log(chalk.yellow(errorMessage));
          await fileOps.removeFile(`${cssModuleFilePath}.d.ts`);
          throw new GeneratorError(errorMessage);
        }
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
