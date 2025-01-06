import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

import { rimraf } from 'rimraf';
import { expect, describe, it, beforeAll, afterAll } from 'vitest';

type ExecError = {
  message: string;
  status: number;
  stdout: Buffer | null;
  stderr: Buffer | null;
};

const FIXTURES_DIR = join(__dirname, 'fixtures');
const EXPECTED_DIR = join(__dirname, 'expected');
const STYLES_DIR = join(FIXTURES_DIR, 'styles');
const CONFIG_DIR = join(FIXTURES_DIR, 'configs');

const runCLI = (args: string) => {
  try {
    return execSync(`node ../dist/index.js ${args}`, {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf-8',
    });
  } catch (error) {
    const err = error as ExecError;
    return err.stderr?.toString() || err.stdout?.toString() || err.message;
  }
};

describe('E2E CLI Tests', () => {
  beforeAll(() => {
    // Clean any existing .d.ts files and temporary files
    rimraf.sync(join(STYLES_DIR, '*.d.ts'));
    rimraf.sync(join(STYLES_DIR, '__postcss__*'));
    rimraf.sync(join(CONFIG_DIR, 'temp-*.js'));
  });

  afterAll(() => {
    // Clean up generated files
    rimraf.sync(join(STYLES_DIR, '*.d.ts'));
    rimraf.sync(join(STYLES_DIR, '__postcss__*'));
    // Clean up temporary config files
    rimraf.sync(join(CONFIG_DIR, 'temp-*.js'));
  });

  it('should generate correct .d.ts files for valid CSS modules', () => {
    // Run the CLI
    runCLI(
      '"./fixtures/styles/valid.module.css" --config ./fixtures/postcss.config.js'
    );

    // Read the generated file
    const generatedContent = readFileSync(
      join(STYLES_DIR, 'valid.module.css.d.ts'),
      'utf-8'
    );

    // Read the expected file
    const expectedContent = readFileSync(
      join(EXPECTED_DIR, 'valid.module.css.d.ts'),
      'utf-8'
    );

    // Compare the contents
    expect(generatedContent.trim()).toBe(expectedContent.trim());
  });

  it('should handle invalid CSS modules with detailed error output', () => {
    const output = runCLI(
      '"./fixtures/styles/invalid.module.css" --config ./fixtures/postcss.config.js'
    );

    console.log('\nActual error output:\n', output, '\n');

    expect(output).toContain('An error occurred during generation');
    expect(output).toContain('CSS syntax error in');
    expect(output).toContain('invalid.module.css');
  });

  it('should handle non-existent files gracefully', () => {
    const output = runCLI(
      '"./fixtures/styles/non-existent.module.css" --config ./fixtures/postcss.config.js'
    );

    expect(output).toContain('An error occurred during generation');
    expect(output).toContain('No files were found to compile');
  });

  it('should fail when config file has non-standard name', () => {
    const nonStandardConfig = './fixtures/custom-name.config.js';
    const output = runCLI(
      `"./fixtures/styles/valid.module.css" --config ${nonStandardConfig}`
    );

    console.log('\nActual error output:\n', output, '\n');

    expect(output).toContain('An error occurred during generation');
    expect(output).toContain('PostCSS config file not found at path');
    expect(output).toContain(nonStandardConfig);
  });

  it('should fail when PostCSS config is invalid', () => {
    const output = runCLI(
      '"./fixtures/styles/valid.module.css" --config ./fixtures/configs/invalid/postcss.config.js'
    );

    console.log('\nActual error output:\n', output, '\n');

    expect(output).toContain('An error occurred during generation');
    expect(output).toContain("Cannot find module 'non-existent-plugin'");
  });

  it('should handle multiple file patterns', () => {
    runCLI(
      '"./fixtures/styles/*.module.css" --config ./fixtures/postcss.config.js'
    );

    // Check if both files were processed
    const firstFileExists = readFileSync(
      join(STYLES_DIR, 'valid.module.css.d.ts'),
      'utf-8'
    );
    const secondFileExists = readFileSync(
      join(STYLES_DIR, 'another-valid.module.css.d.ts'),
      'utf-8'
    );

    expect(firstFileExists).toBeTruthy();
    expect(secondFileExists).toBeTruthy();
  });

  it('should handle empty CSS modules', () => {
    const output = runCLI(
      '"./fixtures/styles/empty.module.css" --config ./fixtures/postcss.config.js --verbose'
    );

    console.log('\nActual output:\n', output, '\n');

    // Should contain warning about empty file
    expect(output).toContain('Empty file detected');
    expect(output).toContain('empty.module.css');
    expect(output).toContain('Skipping file as it contains no CSS classes');

    // Make sure no .d.ts file was generated
    const dtsPath = join(FIXTURES_DIR, 'styles', 'empty.module.css.d.ts');
    console.log('\nChecking for file at:', dtsPath, '\n');
    expect(existsSync(dtsPath)).toBe(false);
  });

  it('should handle missing config file gracefully', () => {
    const nonExistentConfig = './fixtures/non-existent-config.js';
    const output = runCLI(
      `"./fixtures/styles/valid.module.css" --config ${nonExistentConfig}`
    );

    expect(output).toContain('An error occurred during generation');
    expect(output).toContain('PostCSS config file not found at path');
    expect(output).toContain(nonExistentConfig);
  });

  it('should error if PostCSS uses a different config than specified', () => {
    // Create a temporary directory with no config
    const tempDir = join(FIXTURES_DIR, 'temp-dir');
    const wrongConfigPath = join(tempDir, 'postcss.config.js');

    try {
      execSync(`mkdir -p "${tempDir}"`);
      const output = runCLI(
        `"./fixtures/styles/valid.module.css" --config ${wrongConfigPath}`
      );

      expect(output).toContain('An error occurred during generation');
      expect(output).toContain('PostCSS config file not found at path');
      expect(output).toContain(wrongConfigPath);
    } finally {
      rimraf.sync(tempDir);
    }
  });
});
