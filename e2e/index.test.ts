import { execSync } from 'child_process';
import { join, relative } from 'path';

import { readFile, pathExists, ensureDir, remove } from 'fs-extra';
import { expect, describe, it } from 'vitest';

type ExecError = {
  message: string;
  status: number;
  stdout: Buffer | null;
  stderr: Buffer | null;
};

const PROJECT_ROOT = join(__dirname, '..');
const FIXTURES_DIR = join(__dirname, 'fixtures');
const EXPECTED_DIR = join(__dirname, 'expected');
const STYLES_DIR = join(FIXTURES_DIR, 'styles');
const CONFIG_DIR = join(FIXTURES_DIR, 'configs');

const runCLI = async (args: string): Promise<string> => {
  try {
    const command = `node ./dist/index.js ${args}`;
    const output = execSync(command, {
      cwd: PROJECT_ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf-8',
      env: {
        ...process.env,
        DEBUG: 'true',
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
    return output;
  } catch (error) {
    const err = error as ExecError;
    const errorOutput =
      err.stderr?.toString() || err.stdout?.toString() || err.message;
    return errorOutput;
  }
};

describe('E2E CLI Tests', () => {
  it('should generate correct .d.ts files for valid CSS modules', async () => {
    const cssFile = relative(
      PROJECT_ROOT,
      join(STYLES_DIR, 'valid.module.css')
    );
    const configFile = relative(
      PROJECT_ROOT,
      join(CONFIG_DIR, 'postcss.config.js')
    );

    await runCLI(`"${cssFile}" --config "${configFile}"`);

    const dtsPath = join(STYLES_DIR, 'valid.module.css.d.ts');
    const exists = await pathExists(dtsPath);

    if (!exists) {
      throw new Error(`Generated file not found: ${dtsPath}`);
    }

    const generatedContent = await readFile(dtsPath, 'utf-8');
    const expectedPath = join(EXPECTED_DIR, 'valid.module.css.d.ts');
    const expectedContent = await readFile(expectedPath, 'utf-8');

    expect(generatedContent.trim()).toBe(expectedContent.trim());
  });

  it('should handle invalid CSS modules with detailed error output', async () => {
    const cssFile = relative(
      PROJECT_ROOT,
      join(STYLES_DIR, 'invalid.module.css')
    );
    const configFile = relative(
      PROJECT_ROOT,
      join(CONFIG_DIR, 'postcss.config.js')
    );

    const output = await runCLI(`"${cssFile}" --config "${configFile}"`);

    expect(output).toContain('An error occurred during generation');
    expect(output).toContain('Error processing CSS module');
    expect(output).toContain('Unclosed block');
  });

  it('should handle non-existent files gracefully', async () => {
    const cssFile = relative(
      PROJECT_ROOT,
      join(STYLES_DIR, 'non-existent.module.css')
    );
    const configFile = relative(
      PROJECT_ROOT,
      join(CONFIG_DIR, 'postcss.config.js')
    );

    const output = await runCLI(`"${cssFile}" --config "${configFile}"`);

    expect(output).toContain('An error occurred during generation');
    expect(output).toContain('No files were found to compile');
  });

  it('should fail when config file has non-standard name', async () => {
    const cssFile = relative(
      PROJECT_ROOT,
      join(STYLES_DIR, 'valid.module.css')
    );
    const nonStandardConfig = relative(
      PROJECT_ROOT,
      join(FIXTURES_DIR, 'custom-name.config.js')
    );

    const output = await runCLI(`"${cssFile}" --config "${nonStandardConfig}"`);

    expect(output).toContain('An error occurred during generation');
    expect(output).toContain('PostCSS config file not found or invalid');
    expect(output).toContain('custom-name.config.js');
  });

  it('should fail when PostCSS config is invalid', async () => {
    const cssFile = relative(
      PROJECT_ROOT,
      join(STYLES_DIR, 'valid.module.css')
    );
    const configFile = relative(
      PROJECT_ROOT,
      join(CONFIG_DIR, 'invalid', 'postcss.config.js')
    );

    const output = await runCLI(`"${cssFile}" --config "${configFile}"`);

    expect(output).toContain('An error occurred during generation');
    expect(output).toContain('PostCSS config file not found or invalid');
    expect(output).toContain('postcss.config.js');
  });

  it('should handle multiple file patterns', async () => {
    const pattern = relative(PROJECT_ROOT, join(STYLES_DIR, '*.module.css'));
    const configFile = relative(
      PROJECT_ROOT,
      join(CONFIG_DIR, 'postcss.config.js')
    );

    await runCLI(`"${pattern}" --config "${configFile}"`);

    const firstFileContent = await readFile(
      join(STYLES_DIR, 'valid.module.css.d.ts'),
      'utf-8'
    );
    const secondFileContent = await readFile(
      join(STYLES_DIR, 'another-valid.module.css.d.ts'),
      'utf-8'
    );

    expect(firstFileContent).toBeTruthy();
    expect(secondFileContent).toBeTruthy();
  });

  it('should handle empty CSS modules', async () => {
    const cssFile = relative(
      PROJECT_ROOT,
      join(STYLES_DIR, 'empty.module.css')
    );
    const configFile = relative(
      PROJECT_ROOT,
      join(CONFIG_DIR, 'postcss.config.js')
    );

    const output = await runCLI(
      `"${cssFile}" --config "${configFile}" --verbose`
    );

    expect(output).toContain('Empty file detected');
    expect(output).toContain('empty.module.css');
    expect(output).toContain('skipping');

    const dtsPath = join(STYLES_DIR, 'empty.module.css.d.ts');
    const exists = await pathExists(dtsPath);
    expect(exists).toBe(false);
  });

  it('should error if PostCSS uses a different config than specified', async () => {
    const tempDir = join(FIXTURES_DIR, 'temp-dir');
    const wrongConfigPath = join(tempDir, 'postcss.config.js');
    const cssFile = relative(
      PROJECT_ROOT,
      join(STYLES_DIR, 'valid.module.css')
    );

    try {
      await ensureDir(tempDir);
      const output = await runCLI(`"${cssFile}" --config "${wrongConfigPath}"`);

      expect(output).toContain('An error occurred during generation');
      expect(output).toContain('PostCSS config file not found or invalid');
      expect(output).toContain('postcss.config.js');
    } finally {
      await remove(tempDir);
    }
  });
});
