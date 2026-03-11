# SmartCafe Admin Client

[![PR Validation](https://github.com/petro-konopelko/smartcafe-admin-client/actions/workflows/pr.yml/badge.svg)](https://github.com/petro-konopelko/smartcafe-admin-client/actions/workflows/pr.yml)
[![CI](https://github.com/petro-konopelko/smartcafe-admin-client/actions/workflows/ci.yml/badge.svg)](https://github.com/petro-konopelko/smartcafe-admin-client/actions/workflows/ci.yml)
[![CD](https://github.com/petro-konopelko/smartcafe-admin-client/actions/workflows/cd.yml/badge.svg)](https://github.com/petro-konopelko/smartcafe-admin-client/actions/workflows/cd.yml)

[![Angular](https://img.shields.io/badge/Angular-21-dd0031?logo=angular&logoColor=white)](https://angular.dev)
[![Nx](https://img.shields.io/badge/Nx-Monorepo-143055?logo=nx&logoColor=white)](https://nx.dev)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)
[![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![Storybook](https://img.shields.io/badge/Storybook-UI%20Docs-FF4785?logo=storybook&logoColor=white)](https://storybook.js.org)

Admin dashboard for the SmartCafe platform. Provides cafe owners and managers with tools to create and manage cafes, build menus with sections and items, upload images, and publish menus — all from a responsive, accessible web interface.

Built with Angular 21, Nx monorepo, NgRx Signal Store, and Angular Material.

## Prerequisites

- **Node.js** 24+ (see `.node-version`)
- **npm** 11+

## Getting Started

```bash
npm install
npm start          # serves at http://localhost:4200
```

## Development

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `npm start`         | Start dev server              |
| `npm run lint`      | Lint all projects             |
| `npm test`          | Run unit tests (admin)        |
| `npm run test:ci`   | Run all unit tests            |
| `npm run build`     | Build admin app               |
| `npm run storybook` | Start Storybook for shared UI |
| `npm run graph`     | Visualize Nx dependency graph |

## Project Structure

```
apps/admin/          → Main Angular application
libs/
  feature-cafes/     → Cafe management feature
  feature-menus/     → Menu management feature
  shared/
    ui/              → Reusable UI components
    models/          → Shared DTOs & interfaces
    data-access/     → Interceptors, guards, services
    config/          → App configuration
    utils/           → Pipes, directives, helpers
```

## CI/CD Pipeline

### [PR Validation](.github/workflows/pr.yml)

Runs on every pull request to `main`. Lints, tests, and builds **affected** projects only.

### [PR Title Validation](.github/workflows/pr-title.yml)

Enforces [Conventional Commits](https://conventionalcommits.org) format on PR titles (e.g., `feat: add cafe form`, `fix: resolve upload issue`). Required since squash-merge uses the PR title as the commit message on `main`.

### [CI](.github/workflows/ci.yml)

Runs on every push to `main`:

1. **Validate** — lint, test, and build all projects
2. **Release Please** — creates/updates a Release PR with changelog and version bump
3. **Publish Release** — when the Release PR is merged: attaches build artifact to the GitHub Release and publishes it

### [CD](.github/workflows/cd.yml)

Triggered when a GitHub Release is published. Downloads the build artifact from the release and deploys to Azure Static Web Apps.

### Release Flow

```
Feature PR → PR validation (affected) + PR title check
         ↓
Merge to main → CI validates all → release-please updates Release PR
         ↓
Merge Release PR → CI validates all → artifact uploaded → GitHub Release published
         ↓
CD deploys to Azure
```

## Commit Conventions

This project uses [Conventional Commits](https://conventionalcommits.org). Commit messages are validated locally via [commitlint](https://commitlint.js.org/) (husky `commit-msg` hook).

| Prefix      | Purpose                                                 |
| ----------- | ------------------------------------------------------- |
| `feat:`     | New feature (bumps minor version)                       |
| `fix:`      | Bug fix (bumps patch version)                           |
| `docs:`     | Documentation only                                      |
| `refactor:` | Code change that neither fixes a bug nor adds a feature |
| `perf:`     | Performance improvement                                 |
| `test:`     | Adding or updating tests                                |
| `build:`    | Build system or external dependencies                   |
| `ci:`       | CI/CD configuration                                     |
| `chore:`    | Other changes that don't modify src or test files       |

Adding `BREAKING CHANGE:` in the commit footer or `!` after the type (e.g., `feat!:`) bumps the major version.

## Testing

- **Unit/Integration tests**: [Vitest](https://vitest.dev/) — `npm run test:ci`
- **E2E tests**: [Playwright](https://playwright.dev/) — `npm run e2e`
- **Storybook tests**: `npm run test-storybook`
