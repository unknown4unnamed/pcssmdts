# Contributing to pcssmdts

Thanks for your interest in contributing! Here's a quick guide to get you started.

## Quick Start

```sh
# Clone and setup
git clone https://github.com/your-username/pcssmdts.git
cd pcssmdts
pnpm install

# Start development
pnpm dev
```

## Development Requirements

- Node.js >=16.19.1 <21
- pnpm (preferred)

## Development Commands

```sh
pnpm dev            # Watch mode for development
pnpm test          # Run all tests (unit + e2e)
pnpm test:unit     # Run unit tests only
pnpm test:e2e      # Run e2e tests only
pnpm test:watch    # Run tests in watch mode
pnpm lint         # Fix code style issues
pnpm build         # Build for production
```

## Project Structure

```
src/
├── cli/     # CLI implementation
├── core/    # Core functionality
└── types/   # TypeScript types
```

## Making Changes

1. Create a branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test: `pnpm test` (uses [Vitest](https://vitest.dev))
4. Format code: `pnpm lint`
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat(scope): add new feature
   fix(scope): fix some bug
   docs(scope): update docs
   ```
6. Push and open a PR

## Need Help?

- 🐛 [Issues](https://github.com/unknown4unnamed/pcssmdts/issues)
- 💬 [Discussions](https://github.com/unknown4unnamed/pcssmdts/discussions)
- 📚 [Vitest Docs](https://vitest.dev)
- 📝 [Conventional Commits](https://www.conventionalcommits.org/)

## License

MIT - feel free to use this project as you wish.
