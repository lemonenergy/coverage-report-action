# Lemon Action Template

Typescript action template with basic setup for GitHub Actions + release.

## Setup

- Format uses [Prettier](https://prettier.io/). Setup your editor to format on save with prettier.
- Lint uses [ESLint](https://eslint.org/). Setup your editor to enable eslint flat.

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "always"
  },
  "eslint.useFlatConfig": true
}
```

## Getting started

- make sure to setup pnpm
- update `package.json` with your action name, description, author, license, etc.
- update action metadata in `action.yml`
- add your logic in `src/`
- this repo is trunk based, so you can open any PR directly against `main` branch. On merge, it will be automatically released.
- typescript is built using [unbuild](https://github.com/unjs/unbuild). Check their repository README for details. Extra configuration can be done in `unbuild.config.ts` as needed.
- tests are run using [vitest](https://vitest.dev/). You can add your tests in `src/__tests__/`. The test command is `pnpm test`.
- remember to update the readme as well, so users know how to use your action.

## Tooling

A few packages are included by default to help with development:

- `tsx` - to run typescript files directly (i.e. `pnpm tsx src/file.ts`)
- `execa` - to run shell commands in a cross-platform way (see docs: [execa](https://github.com/sindresorhus/execa))
- `@actions/core` - to interact with GitHub Actions
- `@actions/github` - to interact with GitHub API
- `@actions/exec` - to run shell commands in GitHub Actions

## AI

Claude code config is not included by default, but we recommend you can add it to your project if you want to use AI features with the cli by calling `/init`.
