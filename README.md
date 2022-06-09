[![Release](https://github.com/unknown4unnamed/pcssmdts/actions/workflows/push.yaml/badge.svg?branch=main)](https://github.com/unknown4unnamed/pcssmdts/actions/workflows/push.yaml)
[![npm](https://img.shields.io/badge/npm-pcssmdts-CB3837.svg?style=flat-square)](https://www.npmjs.com/package/pcssmdts)

# pcssmdts

`pcssmdts` helps you ensure that you use `classNames` that actually exists when you write your PostCSS powered CSS Modules.

## Installation

It is faster to use this utility through `npx` without installation.

```sh
npx pcssmdts "src/**/*.module.css"
```

Alternatively you can add it as devDependency to your project and use it in the same way. Both options are fine.


```sh
yarn add pcssmdts -D
```

_In your package.json's scripts_

```json
{
  "scripts": {
    "generate:style-defs": "pcssmdts \"src/**/*.module.css\""
  }
}
```

## Motivation

Let's assume that you have your project setup with [PostCSS](https://github.com/postcss/postcss), [CSS modules](https://github.com/css-modules/css-modules) and [TypeScript](https://www.typescriptlang.org/). You want to write your css code using some nice features that provided by PostCSS plugins (like [postcss-nested](https://github.com/postcss/postcss-nested)) or use one of supported [PostCSS syntax](https://github.com/postcss/postcss#syntaxes).

During development you actually face with two issues:

- How to know which `classNames` are available in `styles.module.css` right in your IDE for faster development (get intellisense)?
- How to make sure that all used `classNames` actually exists and safe when you do type checking?

Of course you want `camelCased` classNames to avoid something like `styles['foo-bar']` and have `styles.fooBar` instead.

The first issue is solvable by [typescript-plugin-css-modules](https://www.npmjs.com/package/typescript-plugin-css-modules) typescript plugin that provides type information to `IDEs` and any other tools that work with [TypeScript language service plugins](https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin#whats-a-language-service-plugin).

However TypeScript at this time, does not support plugins during compilation. This means that `typescript-plugin-css-modules` plugin cannot provide errors during compilation.

But with `pcssmdts` dreams comes true, and from now on you can generate `*.module.d.ts` from your `*.module.css`.

```sh
npx pcssmdts "src/**/*.module.css"
```

By running command above command a few things will happen:

- Any `*.module.css` files under `src` folder will be compiled to normal css using `PostCSS` under the hood.
  - Optionally you can explicitly specify your `PostCSS` config location with `-c` option, [See CLI usage section](#cli-usage). By default PostCSS config is auto loaded via [postcss-load-config](https://github.com/postcss/postcss-load-config).
- TypeDefinitions are generated by [typed-css-modules](https://www.npmjs.com/package/typed-css-modules) from compiled `css` files.
- Compiled css files are deleted in the end of `d.ts` generation.

## Showcase

Let's imagine simple project, particularly some react component folder like `src/components/Component`:

```
  src/
  ├─ components/
  │  ├─ Component/
  │  │  ├─ styles.module.css
  │  │  ├─ Component.tsx
  │  │  ├─ index.ts
```

_styles.module.css_

```css
.foo {
  display: flex;

  &__bar {
    width: 10px;

    &--baz {
      color: blue;
    }
  }
}

.my-class-name {
  color: red;
}
```

_Component.tsx_

```tsx
import styles from './styles.module.css';

export const Component: FC = () => {
  return (
    <div className={styles.foo}>
      <span className={styles.fooBar}>
        <a className={styles.fooBarBaz} href="#">
          Link
        </a>
      </span>
      <p className={styles.myClassName}>Some text</p>
    </div>
  );
};
```

_index.ts_

```ts
export * from './Component.ts';
```

When you run `pcssmdts` new file, `styles.module.d.ts`, will be generated and added to your `Component`'s folder.

_styles.module.d.ts_

```ts
declare const styles: {
  readonly foo: string;
  readonly fooBar: string;
  readonly fooBarBaz: string;
  readonly myClassName: string;
};
export = styles;
```

In the end your folder structure will look like this:

```
  src/
  ├─ components/
  │  ├─ Component/
  │  │  ├─ styles.module.css.d.ts <- generated type definitions
  │  │  ├─ styles.module.css
  │  │  ├─ Component.tsx
  │  │  ├─ index.ts
```

So, when you run [`tsc`](https://www.typescriptlang.org/docs/handbook/compiler-options.html) for type checking it will pass because all `classNames` that you reference to in your component actually exists.

If you reference to `className` that doesn't exist on `styles.module.css`, like `styles.someAwesomeClassName`

```tsx
<div className={styles.someAwesomeClassName} />
```

You will get type error on `tsc` type check:

```sh
Property 'someAwesomeClassName' does not exist on type "{ readonly foo: string; readonly fooBar: string; readonly fooBarBaz: string; readonly myClassName: string; }"
```

If you want to keep compiled css files for some reason use `-k` option, [see CLI usage section](#cli-usage).

```sh
npx pcssmdts "src/**/*.module.css" -k
```

Your Component folder structure with `-k` option:

```
  src/
  ├─ components/
  │  ├─ Component/
  │  │  ├─ styles.module.css.d.ts <- generated type definitions
  │  │  ├─ __postcss__styles.module.css <- compiled css file
  │  │  ├─ styles.module.css
  │  │  ├─ Component.tsx
  │  │  ├─ index.ts
```

After `tsc` type check you may want remove all generated `*.module.css.d.ts`, it can be easily done with [rimraf](https://www.npmjs.com/package/rimraf):

```sh
npx rimraf \"src/**/*.css.d.ts\"
```

## CLI Usage

```
pcssmdts <source> [options]

Generate d.ts files for PostCSS powered css modules

Basic options:
  -v, --verbose  Run with verbose logging                              [boolean]
  -c, --config   Optionally provide custom path to your PostCSS config  [string]
  -k, --keep     Keep compiled css files                               [boolean]

typed-css-modules options:
  -n, --namedExports  Enables named export for generated d.ts files
                                                      [boolean] [default: false]

Positionals:
  source  source pattern to your css modules files location             [string]

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]

Examples:
  pcssmdts "src/**/*.module.css"            Basic usage, in the end next to each
                                            found css file corresponding d.ts
                                            file will be generated


  pcssmdts "src/**/*.module.css" -k         In this case compiled files will be
                                            preserved, all compiled files are
                                            prefixed by __postcss__


  pcssmdts "src/**/*.module.css" -c         Custom PostCSS config location path
  configs/postcss.config.js

  pcssmdts "src/**/*.module.css" -n         Named exports is used for generated
                                            files
```
