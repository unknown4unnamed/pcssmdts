[![Test](https://github.com/unknown4unnamed/pcssmdts/actions/workflows/test.yml/badge.svg)](https://github.com/unknown4unnamed/pcssmdts/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/pcssmdts.svg)](https://badge.fury.io/js/pcssmdts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D16.19.1%20%3C21-brightgreen)](https://nodejs.org)

# pcssmdts

A powerful TypeScript definition generator for PostCSS-powered CSS Modules, ensuring type safety and providing IDE intellisense for your CSS class names.

## Features

- 🚀 Fast and efficient d.ts generation
- 🔍 Full PostCSS support with custom plugins and configurations
- 🎯 Automatic camelCase class name conversion
- 💡 IDE intellisense support
- ✅ TypeScript compilation-time type checking
- 🛠 Configurable output formats
- 📦 Zero runtime overhead

## Requirements

- Node.js: `>=16.19.1 <21`
- PostCSS configuration file (optional, will use defaults if not provided)

## Installation

### Quick Start with npx (Recommended)

The fastest way to use this utility is through `npx` without installation:

```sh
npx pcssmdts "src/**/*.module.css"
```

### Local Installation

Add it as a development dependency to your project:

```sh
# npm
npm install pcssmdts --save-dev

# yarn
yarn add pcssmdts -D

# pnpm
pnpm add -D pcssmdts
```

Add to your package.json scripts:

```json
{
  "scripts": {
    "generate:style-defs": "pcssmdts \"src/**/*.module.css\"",
    "generate:style-defs:watch": "pcssmdts \"src/**/*.module.css\" --watch"
  }
}
```

## How It Works

pcssmdts operates in three main steps:

1. **CSS Module Detection**: Scans your project for CSS module files based on the provided glob pattern
2. **PostCSS Processing**: Processes your CSS files using your PostCSS configuration
3. **TypeScript Definition Generation**: Creates corresponding .d.ts files with type definitions

### Example Project Structure

```
src/
├── components/
│   └── Button/
│       ├── styles.module.css
│       ├── styles.module.css.d.ts  (generated)
│       └── Button.tsx
```

### CSS Module Example

```css
/* styles.module.css */
.button {
  display: flex;

  &--primary {
    background: blue;
  }

  &--secondary {
    background: gray;
  }
}

.icon-wrapper {
  margin-right: 8px;
}
```

### Generated TypeScript Definition

```typescript
// styles.module.css.d.ts
declare const styles: {
  readonly button: string;
  readonly buttonPrimary: string;
  readonly buttonSecondary: string;
  readonly iconWrapper: string;
};
export = styles;
```

### React Component Usage

```tsx
import styles from './styles.module.css';

export const Button: React.FC<{
  variant?: 'primary' | 'secondary';
}> = ({ variant = 'primary' }) => {
  return (
    <button
      className={`${styles.button} ${
        variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary
      }`}
    >
      <span className={styles.iconWrapper}>{/* Your icon here */}</span>
      Click me
    </button>
  );
};
```

## CLI Options

```
pcssmdts <source> [options]

Arguments:
  source                    Source pattern for CSS module files (e.g., "src/**/*.module.css")

Basic options:
  -v, --verbose            Enable verbose logging                      [boolean]
  -c, --config            Custom PostCSS config path                   [string]
  -k, --keep              Keep compiled CSS files                      [boolean]
  -w, --watch             Watch mode for file changes                  [boolean]

TypeScript options:
  -n, --namedExports      Use named exports in .d.ts files    [boolean] [default: false]

General:
  --help                  Show help information                        [boolean]
  --version              Show version number                          [boolean]
```

### Common Use Cases

1. **Basic Usage**

   ```sh
   pcssmdts "src/**/*.module.css"
   ```

2. **Watch Mode**

   ```sh
   pcssmdts "src/**/*.module.css" -w
   ```

3. **Custom PostCSS Config**

   ```sh
   pcssmdts "src/**/*.module.css" -c ./config/postcss.config.js
   ```

4. **Named Exports**

   ```sh
   pcssmdts "src/**/*.module.css" -n
   ```

5. **Keep Compiled Files**
   ```sh
   pcssmdts "src/**/*.module.css" -k
   ```

## PostCSS Configuration

pcssmdts uses [postcss-load-config](https://github.com/postcss/postcss-load-config) to load your PostCSS configuration. It supports all standard PostCSS config files:

- `postcss.config.js`
- `.postcssrc`
- `package.json` with `postcss` field

Example PostCSS config:

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-nested'),
    require('postcss-modules')({
      // your options here
    }),
    // other plugins...
  ],
};
```

## Best Practices

1. **Git Ignore**
   Add generated files to your .gitignore:

   ```
   **/*.module.css.d.ts
   **/__postcss__*.css
   ```

2. **CI Integration**
   Run type generation before TypeScript compilation:

   ```json
   {
     "scripts": {
       "build": "pcssmdts \"src/**/*.module.css\" && tsc"
     }
   }
   ```

3. **Development Workflow**
   Use watch mode during development:
   ```json
   {
     "scripts": {
       "dev": "concurrently \"pcssmdts 'src/**/*.module.css' -w\" \"your-dev-server\""
     }
   }
   ```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📝 [Documentation](https://github.com/unknown4unnamed/pcssmdts#readme)
- 🐛 [Issue Tracker](https://github.com/unknown4unnamed/pcssmdts/issues)
- 💬 [Discussions](https://github.com/unknown4unnamed/pcssmdts/discussions)
