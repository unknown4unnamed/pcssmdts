import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Arguments, Options } from 'yargs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { run } from '@/core/generator';
import type { Params } from '@/types/index';

import { initCLI } from './index';

type CLIArguments = Arguments<{
  source: string;
  verbose?: boolean;
  config?: string;
  keep?: boolean;
  namedExports?: boolean;
  camelCase?: string;
  searchDir?: string;
  outDir?: string;
  dropExtension?: boolean;
  eol?: string;
}>;

// Mock dependencies
const mockYargsInstance = {
  group: vi.fn().mockReturnThis(),
  option: vi.fn().mockReturnThis(),
  command: vi.fn().mockReturnThis(),
  example: vi.fn().mockReturnThis(),
  parse: vi.fn(),
};

vi.mock('yargs', () => ({
  default: vi.fn(() => mockYargsInstance),
}));

vi.mock('yargs/helpers', () => ({
  hideBin: vi.fn((arr: string[]) => arr.slice(2)),
}));

vi.mock('@/core/generator', () => ({
  run: vi.fn(),
}));

describe('CLI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.argv = ['node', 'script.js'];
  });

  it('should initialize CLI with correct options', () => {
    initCLI();

    // Verify yargs setup
    expect(yargs).toHaveBeenCalled();
    expect(hideBin).toHaveBeenCalledWith(process.argv);

    // Verify option groups are set up
    expect(mockYargsInstance.group).toHaveBeenCalledWith(
      ['verbose', 'config', 'keep'],
      'Basic options:'
    );
    expect(mockYargsInstance.group).toHaveBeenCalledWith(
      [
        'namedExports',
        'camelCase',
        'searchDir',
        'outDir',
        'dropExtension',
        'eol',
      ],
      'typed-css-modules options:'
    );

    // Verify examples are added
    expect(mockYargsInstance.example).toHaveBeenCalledWith(
      'pcssmdts "src/**/*.module.css"',
      expect.stringContaining('')
    );
    expect(mockYargsInstance.example).toHaveBeenCalledWith(
      'pcssmdts "src/**/*.module.css" -k',
      expect.stringContaining('')
    );
    expect(mockYargsInstance.example).toHaveBeenCalledWith(
      'pcssmdts "src/**/*.module.css" -c configs/postcss.config.js',
      expect.stringContaining('')
    );
    expect(mockYargsInstance.example).toHaveBeenCalledWith(
      'pcssmdts "src/**/*.module.css" -n',
      expect.stringContaining('')
    );
    expect(mockYargsInstance.example).toHaveBeenCalledWith(
      'pcssmdts "src/**/*.module.css" --camelCase dashes',
      expect.stringContaining('')
    );
    expect(mockYargsInstance.example).toHaveBeenCalledWith(
      'pcssmdts "src/**/*.module.css" --outDir types',
      expect.stringContaining('')
    );
  });

  it('should set up all CLI options with correct configurations', () => {
    initCLI();

    const verboseOption: Partial<Options> = {
      alias: 'v',
      type: 'boolean',
      description: expect.stringContaining('') as string,
    };

    const configOption: Partial<Options> = {
      alias: 'c',
      type: 'string',
      demandOption: false,
      description: expect.stringContaining('') as string,
    };

    const keepOption: Partial<Options> = {
      alias: 'k',
      type: 'boolean',
      demandOption: false,
      description: expect.stringContaining('') as string,
    };

    const namedExportsOption: Partial<Options> = {
      alias: 'n',
      type: 'boolean',
      default: false,
      description: expect.stringContaining('') as string,
    };

    const camelCaseOption: Partial<Options> = {
      type: 'string',
      choices: ['true', 'false', 'dashes'],
      description: expect.stringContaining('') as string,
    };

    // Verify all options
    expect(mockYargsInstance.option).toHaveBeenCalledWith(
      'verbose',
      expect.objectContaining(verboseOption)
    );
    expect(mockYargsInstance.option).toHaveBeenCalledWith(
      'config',
      expect.objectContaining(configOption)
    );
    expect(mockYargsInstance.option).toHaveBeenCalledWith(
      'keep',
      expect.objectContaining(keepOption)
    );
    expect(mockYargsInstance.option).toHaveBeenCalledWith(
      'namedExports',
      expect.objectContaining(namedExportsOption)
    );
    expect(mockYargsInstance.option).toHaveBeenCalledWith(
      'camelCase',
      expect.objectContaining(camelCaseOption)
    );
  });

  it('should call run with correct parameters when source is provided', async () => {
    let commandHandler: ((args: CLIArguments) => Promise<void>) | undefined;

    mockYargsInstance.command.mockImplementation(
      (
        _cmd: string,
        _desc: string,
        _builder: unknown,
        handler: (args: CLIArguments) => Promise<void>
      ) => {
        commandHandler = handler;
        return mockYargsInstance;
      }
    );

    initCLI();

    expect(commandHandler).toBeDefined();

    if (commandHandler) {
      await commandHandler({
        source: 'src/**/*.module.css',
        verbose: true,
        config: 'custom.config.js',
        keep: true,
        namedExports: true,
        camelCase: 'dashes',
        searchDir: 'src',
        outDir: 'types',
        dropExtension: true,
        eol: '\n',
        $0: '',
        _: [],
      });

      expect(run).toHaveBeenCalledWith('src/**/*.module.css', {
        verbose: true,
        configPath: 'custom.config.js',
        keep: true,
        namedExports: true,
        camelCase: 'dashes',
        searchDir: 'src',
        outDir: 'types',
        dropExtension: true,
        EOL: '\n',
      } satisfies Params);
    }
  });

  it('should handle minimal parameters correctly', async () => {
    let commandHandler: ((args: CLIArguments) => Promise<void>) | undefined;

    mockYargsInstance.command.mockImplementation(
      (
        _cmd: string,
        _desc: string,
        _builder: unknown,
        handler: (args: CLIArguments) => Promise<void>
      ) => {
        commandHandler = handler;
        return mockYargsInstance;
      }
    );

    initCLI();

    expect(commandHandler).toBeDefined();

    if (commandHandler) {
      await commandHandler({
        source: 'src/**/*.module.css',
        $0: '',
        _: [],
        namedExports: false,
      });

      expect(run).toHaveBeenCalledWith('src/**/*.module.css', {
        verbose: undefined,
        configPath: undefined,
        keep: undefined,
        namedExports: false,
        camelCase: undefined,
        searchDir: undefined,
        outDir: undefined,
        dropExtension: undefined,
        EOL: undefined,
      } satisfies Params);
    }
  });
});
