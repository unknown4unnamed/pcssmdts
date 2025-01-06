export type Params = {
  verbose?: boolean;
  configPath: string;
  namedExports?: boolean;
  keep?: boolean;
  camelCase?: CamelCaseOption;
  searchDir?: string;
  outDir?: string;
  dropExtension?: boolean;
  EOL?: string;
};

export type CamelCaseOption = boolean | 'dashes';

export type DtsGeneratorOptions = {
  /** Directory to search for CSS Modules (default: undefined) */
  searchDir?: string;
  /** Output directory for generated d.ts files (default: undefined) */
  outDir?: string;
  /** Camelcase class names (default: true) */
  camelCase?: CamelCaseOption;
  /** Use named exports instead of default export (default: false) */
  namedExports?: boolean;
  /** Drop the input file extension in the output file name (default: false) */
  dropExtension?: boolean;
  /** End of line character (default: OS default) */
  EOL?: string;
  /** PostCSS plugins to use during processing */
  loaderPlugins?: import('postcss').Plugin[];
};

export type CSSProcessor = {
  loadConfig: (configPath: string) => Promise<{
    plugins: import('postcss-load-config').ResultPlugin[];
    configFile: string;
  }>;
  process: (css: string, from: string) => Promise<string>;
};

export type FileOperations = {
  readFile: (path: string) => Promise<string>;
  writeCompiledCSS: (originalPath: string, content: string) => Promise<string>;
  writeDtsFile: (
    compiledPath: string,
    content: string,
    outDir?: string
  ) => Promise<string>;
  removeFile: (path: string) => Promise<void>;
  removeCompiledFiles: (cssPath: string, dtsPath: string) => Promise<void>;
};
