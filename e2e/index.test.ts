import { readFile, rm } from 'fs/promises';
import { join } from 'path';

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { run } from '@/core/generator';

const FIXTURES_DIR = join(__dirname, 'fixtures');
const STYLES_DIR = join(FIXTURES_DIR, 'styles');
const CONFIGS_DIR = join(FIXTURES_DIR, 'configs');

describe('E2E', () => {
  beforeEach(async () => {
    await rm(join(STYLES_DIR, '*.d.ts')).catch(() => undefined);
    await rm(join(STYLES_DIR, '_compiled.*')).catch(() => undefined);
  });

  afterEach(async () => {
    await rm(join(STYLES_DIR, '*.d.ts')).catch(() => undefined);
    await rm(join(STYLES_DIR, '_compiled.*')).catch(() => undefined);
  });

  it('should generate d.ts files with default options', async () => {
    await run(join(STYLES_DIR, 'valid.module.css'), {
      configPath: join(CONFIGS_DIR, 'postcss.config.js'),
    });

    const dtsContent = await readFile(
      join(STYLES_DIR, 'valid.module.css.d.ts'),
      'utf-8'
    );
    expect(dtsContent).toMatchSnapshot();
  });

  it('should generate d.ts files with named exports', async () => {
    await run(join(STYLES_DIR, 'valid.module.css'), {
      configPath: join(CONFIGS_DIR, 'postcss.config.js'),
      namedExports: true,
    });

    const dtsContent = await readFile(
      join(STYLES_DIR, 'valid.module.css.d.ts'),
      'utf-8'
    );
    expect(dtsContent).toMatchSnapshot();
  });

  it('should generate d.ts files with dashes camelCase option', async () => {
    await run(join(STYLES_DIR, 'valid.module.css'), {
      configPath: join(CONFIGS_DIR, 'postcss.config.js'),
      camelCase: 'dashes',
    });

    const dtsContent = await readFile(
      join(STYLES_DIR, 'valid.module.css.d.ts'),
      'utf-8'
    );
    expect(dtsContent).toMatchSnapshot();
  });

  it('should generate d.ts files with custom EOL', async () => {
    await run(join(STYLES_DIR, 'valid.module.css'), {
      configPath: join(CONFIGS_DIR, 'postcss.config.js'),
      EOL: '\r\n',
    });

    const dtsContent = await readFile(
      join(STYLES_DIR, 'valid.module.css.d.ts'),
      'utf-8'
    );
    expect(dtsContent).toMatchSnapshot();
  });

  it('should generate d.ts files with custom outDir', async () => {
    const outDir = join(STYLES_DIR, 'types');
    await run(join(STYLES_DIR, 'valid.module.css'), {
      configPath: join(CONFIGS_DIR, 'postcss.config.js'),
      outDir,
    });

    const dtsContent = await readFile(
      join(outDir, 'valid.module.css.d.ts'),
      'utf-8'
    );
    expect(dtsContent).toMatchSnapshot();

    // Clean up the types directory
    await rm(outDir, { recursive: true, force: true });
  });

  it('should handle empty CSS modules', async () => {
    await run(join(STYLES_DIR, 'empty.module.css'), {
      configPath: join(CONFIGS_DIR, 'postcss.config.js'),
    });

    // For empty CSS modules, no d.ts file should be generated
    await expect(
      readFile(join(STYLES_DIR, 'empty.module.css.d.ts'), 'utf-8')
    ).rejects.toThrow();
  });

  it('should handle invalid CSS modules', async () => {
    await expect(
      run(join(STYLES_DIR, 'invalid.module.css'), {
        configPath: join(CONFIGS_DIR, 'postcss.config.js'),
      })
    ).rejects.toThrow();
  });

  it('should handle invalid PostCSS config', async () => {
    await expect(
      run(join(STYLES_DIR, 'valid.module.css'), {
        configPath: join(CONFIGS_DIR, 'invalid', 'postcss.config.js'),
      })
    ).rejects.toThrow();
  });

  it('should preserve PostCSS files when keep option is enabled', async () => {
    await run(join(STYLES_DIR, 'valid.module.css'), {
      configPath: join(CONFIGS_DIR, 'postcss.config.js'),
      keep: true,
    });

    // Check if both .d.ts and PostCSS file exist
    const dtsContent = await readFile(
      join(STYLES_DIR, 'valid.module.css.d.ts'),
      'utf-8'
    );
    expect(dtsContent).toMatchSnapshot();

    const compiledCssPath = join(STYLES_DIR, '_compiled.valid.module.css');
    const compiledCssContent = await readFile(compiledCssPath, 'utf-8');

    // Verify the compiled CSS content
    expect(compiledCssContent).toMatchSnapshot('compiled css content');

    // Clean up the PostCSS file
    await rm(compiledCssPath).catch(() => undefined);
  });
});
