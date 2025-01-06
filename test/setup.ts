import { join } from 'path';

import fastGlob from 'fast-glob';
import { pathExists, remove } from 'fs-extra';
import { beforeAll, afterAll } from 'vitest';

// Define paths
const E2E_FIXTURES_DIR = join(__dirname, '../e2e/fixtures');
const E2E_STYLES_DIR = join(E2E_FIXTURES_DIR, 'styles');
const E2E_CONFIG_DIR = join(E2E_FIXTURES_DIR, 'configs');

// Define patterns for cleanup
const PATTERNS_TO_CLEAN = [
  // TypeScript definition files
  join(E2E_STYLES_DIR, '*.d.ts'),
  // PostCSS temporary files
  join(E2E_STYLES_DIR, '_compiled.*'),
  join(E2E_STYLES_DIR, '__postcss__*'),
  // Temporary config files
  join(E2E_CONFIG_DIR, 'temp-*.js'),
  // Any other temporary test files
  join(E2E_FIXTURES_DIR, 'temp-*'),
];

// Cleanup function
const cleanup = async () => {
  for (const pattern of PATTERNS_TO_CLEAN) {
    try {
      const files = await fastGlob(pattern);

      for (const file of files) {
        try {
          await remove(file);
          console.log(`Cleaned up: ${file}`);
        } catch (error) {
          console.error(`Error removing file ${file}:`, error);
        }
      }

      // Double check if any files matching the pattern still exist
      const remainingFiles = await fastGlob(pattern);
      if (remainingFiles.length > 0) {
        console.warn(
          `Warning: Some files matching ${pattern} could not be removed:`,
          remainingFiles
        );
      }
    } catch (error) {
      console.error(`Error processing pattern ${pattern}:`, error);
    }
  }
};

// Run cleanup before all tests
beforeAll(async () => {
  await cleanup();
});

// Run cleanup after all tests
afterAll(async () => {
  await cleanup();
});
