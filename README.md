# Lemon Frontend Coverage Report Action

A GitHub Action that generates coverage reports for frontend projects and posts them as PR comments with visual indicators and diff coverage analysis.

## Setup

### Basic Usage

Add this action to your workflow file (e.g., `.github/workflows/coverage.yml`):

```yaml
name: Coverage Report

on:
  pull_request:
    branches: [main]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Generate Coverage Report
        uses: lemonenergy/coverage-report-action@v1.1.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          coverage-json-path: './coverage/coverage-summary.json'
```

### Inputs

| Input                | Description                                       | Required | Default                            |
| -------------------- | ------------------------------------------------- | -------- | ---------------------------------- |
| `github-token`       | GitHub Token for authentication and PR commenting | Yes      | -                                  |
| `coverage-json-path` | Path to the coverage JSON summary file            | No       | `./coverage/coverage-summary.json` |

### Prerequisites

1. **Coverage JSON File**: Your test runner must generate a coverage summary in JSON format. This action expects the standard format used by tools like Vitest, Jest, NYC, or Istanbul.

2. **Test Script**: Ensure your `package.json` has a test script that generates coverage:

   ```json
   {
     "scripts": {
       "test:coverage": "vitest run --coverage --reporter=json-summary"
     }
   }
   ```

3. **Permissions**: The workflow needs write permissions to post comments on PRs:
   ```yaml
   permissions:
     contents: read
     pull-requests: write
   ```

### Example Coverage JSON Format

The action expects a coverage summary JSON file with this structure:

```json
{
  "total": {
    "lines": { "total": 100, "covered": 85, "pct": 85 },
    "statements": { "total": 120, "covered": 100, "pct": 83.33 },
    "functions": { "total": 20, "covered": 18, "pct": 90 },
    "branches": { "total": 40, "covered": 30, "pct": 75 }
  },
  "/path/to/file.js": {
    "lines": { "total": 50, "covered": 45, "pct": 90 },
    "statements": { "total": 60, "covered": 55, "pct": 91.67 },
    "functions": { "total": 10, "covered": 9, "pct": 90 },
    "branches": { "total": 20, "covered": 15, "pct": 75 }
  }
}
```

### Features

- **Overall Coverage Summary**: Displays total coverage metrics with color-coded status indicators
- **Diff Coverage**: Shows coverage only for files changed in the PR
- **Visual Indicators**: Uses emojis to quickly identify coverage levels:
  - 🔵 ≥90% (Excellent)
  - 🟢 ≥85% (Good)
  - 🟡 ≥70% (Fair)
  - 🟠 ≥50% (Poor)
  - 🔴 <50% (Critical)
- **Smart Path Handling**: Automatically handles test files and snapshots to show coverage for source files
- **Collapsible Reports**: Large reports (>10 files) are automatically collapsed for better readability

## Development

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
