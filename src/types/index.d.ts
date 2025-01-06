export type Params = {
  verbose?: boolean;
  configPath: string;
  namedExports?: boolean;
  keep?: boolean;
};

export type DtsGeneratorOptions = {
  camelCase?: boolean;
  namedExports?: boolean;
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
  writeDtsFile: (compiledPath: string, content: string) => Promise<string>;
  removeFile: (path: string) => Promise<void>;
  removeCompiledFiles: (cssPath: string, dtsPath: string) => Promise<void>;
};
