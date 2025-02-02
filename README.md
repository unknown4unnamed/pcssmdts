[![Test](https://github.com/unknown4unnamed/pcssmdts/actions/workflows/test.yml/badge.svg)](https://github.com/unknown4unnamed/pcssmdts/actions/workflows/test.yml)
![Coverage](https://img.shields.io/badge/coverage-95.03%25-brightgreen)
[![npm](https://img.shields.io/badge/npm-v0.2.0-blue)](https://www.npmjs.com/package/pcssmdts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D16.19.1%20%3C21-brightgreen)](https://nodejs.org)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

# pcssmdts

A powerful TypeScript definition generator for PostCSS-powered CSS Modules, ensuring type safety and providing IDE intellisense for your CSS class names.

## Why pcssmdts?

### The Problem

When working with CSS Modules in TypeScript projects, especially in large design systems or component libraries, you often face these challenges:

1. **Type Safety Gaps**: CSS class names are essentially strings, making them prone to typos and runtime errors
2. **Poor IDE Support**: No autocomplete for CSS class names means developers need to constantly reference CSS files
3. **Refactoring Difficulties**: Renaming CSS classes becomes risky without TypeScript's refactoring support
4. **Design System Maintenance**: Ensuring consistent class usage across a large codebase is challenging

### The Solution

pcssmdts bridges these gaps by:

1. **Type Safety**: Automatically generates TypeScript definitions for your CSS Modules
2. **IDE Integration**: Provides full IntelliSense support for class names
3. **Refactoring Support**: Makes class names refactorable through TypeScript's tooling
4. **PostCSS Integration**: Works seamlessly with your existing PostCSS setup

### Comparison with IDE Solutions

While IDE plugins like `typescript-plugin-css-modules` can provide type support during development, pcssmdts offers several advantages:

1. **CI/CD Integration**:

   - Generate type definitions as part of your build process
   - Catch type errors in CI before they reach production
   - No reliance on developer IDE configuration

2. **Team Consistency**:

   - Ensures all team members have the same type definitions
   - Works regardless of IDE or editor preferences
   - No need to maintain plugin configurations across the team

3. **Build-time Validation**:

   - Validates CSS Modules during build time
   - Integrates with your existing TypeScript compilation
   - Prevents deployment of mismatched class names

4. **Source Control**:
   - Generated types can be committed (optional)
   - Enables type checking in environments without PostCSS setup
   - Perfect for consuming libraries in other projects

```typescript
// With IDE plugin only:
// - Types only available during development
// - Requires IDE configuration
// - May vary between team members

// With pcssmdts:
// - Types available everywhere
// - Part of your build process
// - Consistent across team and CI
import styles from './Button.module.css';
// TypeScript knows exactly what's available
const className = styles.button; // ✅ Type-safe
```

### PostCSS Configuration Flexibility

One of the key advantages of pcssmdts is its seamless integration with PostCSS, allowing you to:

1. **Use Your Existing Setup**:

   ```js
   // postcss.config.js
   module.exports = {
     plugins: [
       require('postcss-nested'),
       require('tailwindcss'),
       require('autoprefixer'),
       require('postcss-modules')({
         // your custom options
         generateScopedName: '[name]__[local]___[hash:base64:5]',
       }),
     ],
   };
   ```

2. **Support Modern CSS Features**:

   ```css
   /* Your CSS Module with modern syntax */
   .button {
     /* Nesting (via postcss-nested) */
     &:hover {
       background: theme('colors.blue.600');
     }

     /* Custom Media Queries */
     @media (--dark-mode) {
       background: theme('colors.gray.800');
     }

     /* CSS Custom Properties */
     --button-padding: 1rem;
     padding: var(--button-padding);
   }
   ```

3. **Framework Integration**:

   - Works with Tailwind CSS for utility-first styling
   - Compatible with CSS preprocessors (SASS/LESS) through PostCSS plugins
   - Integrates with popular frameworks:

     ```tsx
     // Next.js
     import styles from './Button.module.css';

     // React
     import styles from './Button.module.scss'; // With SASS

     // Vue with TypeScript
     import styles from './Button.module.css';
     ```

> **Note**: CSS Modules are different from CSS-in-JS solutions. While CSS-in-JS libraries like styled-components or emotion write styles in JavaScript, CSS Modules let you write traditional CSS files with local scope and static analysis. pcssmdts is specifically designed for CSS Modules, providing type safety without runtime overhead.

4. **Custom Naming Conventions**:
   ```js
   // postcss.config.js with custom class naming
   module.exports = {
     plugins: [
       require('postcss-modules')({
         generateScopedName: (name, filename, css) => {
           // Your custom naming logic
           return `myApp_${name}_${hashString(css)}`;
         },
       }),
     ],
   };
   ```

This flexibility means you can:

- Use modern CSS features while maintaining type safety
- Integrate with your existing build pipeline
- Customize class name generation to match your needs
- Support complex CSS transformations while keeping type definitions accurate

### Real-World Use Cases

#### 1. Design System Development

```tsx
// Before: No type safety or autocomplete
const Button = ({ variant }) => (
  <button className={`btn btn--${variant}`}>Click me</button>
);

// After: Full type safety and autocomplete
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary';

const Button = ({ variant }: { variant: ButtonVariant }) => (
  <button
    className={`${styles.btn} ${
      variant === 'primary' ? styles.btnPrimary : styles.btnSecondary
    }`}
  >
    Click me
  </button>
);
```

#### 2. Large-Scale Application Migration

When migrating a large application to use CSS Modules:

```tsx
// Before: Global CSS with potential naming conflicts
const Header = () => (
  <header className="app-header">
    <nav className="navigation">
      <a className="nav-link active">Home</a>
    </nav>
  </header>
);

// After: Scoped CSS Modules with type safety
import styles from './Header.module.css';

const Header = () => (
  <header className={styles.header}>
    <nav className={styles.navigation}>
      <a className={`${styles.link} ${styles.linkActive}`}>Home</a>
    </nav>
  </header>
);
```

#### 3. Component Library Development

When building a shared component library:

```tsx
// components/Card/Card.module.css
.card {
  /* styles */
}
.cardHeader {
  /* styles */
}
.cardContent {
  /* styles */
}
.cardFooter {
  /* styles */
}

// components/Card/Card.tsx
import styles from './Card.module.css';

export const Card = ({
  header,
  children,
  footer
}: CardProps) => (
  <div className={styles.card}>
    {header && <div className={styles.cardHeader}>{header}</div>}
    <div className={styles.cardContent}>{children}</div>
    {footer && <div className={styles.cardFooter}>{footer}</div>}
  </div>
);
```

### Benefits in Practice

1. **Development Speed**:

   - Immediate feedback on invalid class names
   - Autocomplete reduces need to reference CSS files
   - Faster onboarding for new team members

2. **Code Quality**:

   - Catch CSS class typos at compile time
   - Ensure consistent class usage across components
   - Make refactoring CSS class names safe and easy

3. **Maintenance**:
   - Track CSS class usage across the codebase
   - Safely remove unused classes
   - Easier code reviews with type checking

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

The CLI is powered by [typed-css-modules](https://github.com/Quramy/typed-css-modules) under the hood, providing robust TypeScript definition generation.

```
pcssmdts <source> [options]

Arguments:
  source                    Source pattern for CSS module files (e.g., "src/**/*.module.css")

Basic options:
  -v, --verbose            Enable verbose logging                      [boolean]
  -c, --config            Custom PostCSS config path                   [string]
  -k, --keep              Keep compiled CSS files                      [boolean]
  -w, --watch             Watch mode for file changes                  [boolean]

typed-css-modules options:
  -n, --namedExports      Use named exports in .d.ts files    [boolean] [default: false]
  --camelCase             Convert CSS class names to camelCase [choices: "true", "false", "dashes"]
  --outDir               Output directory for generated d.ts files. When specified, all generated .d.ts files will be placed in this directory, regardless of their original location. [string]
  --eol                  End of line character                   [string]

General:
  --help                  Show help information                        [boolean]
  --version              Show version number                          [boolean]
```

### Common Use Cases

1. **Basic Usage**
   By default, .d.ts files are generated next to their corresponding CSS modules:

   ```sh
   pcssmdts "src/**/*.module.css"
   ```

   Result:

   ```
   src/
   ├── components/
   │   └── Button/
   │       ├── styles.module.css
   │       └── styles.module.css.d.ts  (generated here)
   ```

2. **Using outDir**
   Place all generated .d.ts files in a specific directory:

   ```sh
   pcssmdts "src/**/*.module.css" --outDir types
   ```

   Result:

   ```
   src/
   ├── components/
   │   └── Button/
   │       └── styles.module.css
   └── types/
       └── styles.module.css.d.ts  (generated here)
   ```

   Note: When using `outDir`, all generated .d.ts files will be placed flat in the specified directory, regardless of their original location in the source tree.

3. **Keep Compiled Files for Debugging**
   Preserve PostCSS-processed files for debugging or inspection:

   ```sh
   pcssmdts "src/**/*.module.css" -k
   ```

   Result:

   ```
   src/
   ├── components/
   │   └── Button/
   │       ├── styles.module.css              (original)
   │       ├── _compiled.styles.module.css    (processed CSS)
   │       └── styles.module.css.d.ts         (generated types)
   ```

   The `_compiled.*.css` files contain the processed CSS after all PostCSS transformations. This is useful for:

   - Debugging CSS transformations
   - Verifying PostCSS plugin output
   - Inspecting final class names after scoping

4. **Watch Mode**

   ```sh
   pcssmdts "src/**/*.module.css" -w
   ```

5. **Custom PostCSS Config**

   ```sh
   pcssmdts "src/**/*.module.css" -c ./config/postcss.config.js
   ```

6. **Named Exports with Custom Output Directory**

   ```sh
   pcssmdts "src/**/*.module.css" -n --outDir types
   ```

7. **CamelCase with Dashes**

   ```sh
   pcssmdts "src/**/*.module.css" --camelCase dashes
   ```

8. **Keep Compiled Files with Custom EOL**

   ```sh
   pcssmdts "src/**/*.module.css" -k --eol "\n"
   ```

### Watch Mode

Watch mode (`-w` or `--watch`) automatically regenerates TypeScript definitions when your CSS modules change. Here's how to verify it's working:

1. **Start Watch Mode**

   ```sh
   pcssmdts "src/**/*.module.css" -w
   ```

2. **Verify Initial Generation**

   - Check that `.d.ts` files are generated for all your CSS modules
   - You should see console output indicating the initial generation

3. **Test File Changes**

   ```sh
   # 1. Open your CSS module in an editor
   # 2. Add a new class
   .new-class {
     color: red;
   }
   # 3. Save the file
   ```

   The watcher should automatically:

   - Detect the file change
   - Regenerate the `.d.ts` file
   - Show console output about the regeneration

4. **Verify Type Updates**

   ```tsx
   // Your component file
   import styles from './styles.module.css';

   // The new class should be available with TypeScript intellisense
   <div className={styles.newClass} />; // If using camelCase
   ```

5. **Common Watch Mode Issues**
   - If changes aren't detected, ensure you're watching the correct directory
   - Some IDEs may need to refresh the TypeScript server to pick up new definitions
   - Use `-v` flag for verbose logging to debug watch mode issues:
     ```sh
     pcssmdts "src/**/*.module.css" -w -v
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
   **/_compiled.*.css
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
