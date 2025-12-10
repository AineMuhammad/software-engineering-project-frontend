# Playwright E2E Tests

This directory contains end-to-end tests for the Mood Tracker frontend application using Playwright.

## Prerequisites

1. **Install Playwright browsers** (first time only):
   ```bash
   npx playwright install
   ```

2. **Ensure backend is running**:
   The tests expect the backend API to be running on `http://localhost:5000`

3. **Ensure frontend dev server is running** (or it will start automatically):
   The tests expect the frontend to be running on `http://localhost:5173`

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

## Test Files

- `signin.spec.js` - Tests for the sign-in page and authentication flow

## Writing New Tests

1. Create a new test file in the `tests/` directory with `.spec.js` extension
2. Import Playwright test utilities:
   ```javascript
   import { test, expect } from '@playwright/test';
   ```
3. Write your tests following the existing patterns

## Test Structure

Tests are organized by feature/page:
- Each test file covers a specific page or feature
- Tests are grouped using `test.describe()` blocks
- Use `test.beforeEach()` for setup that runs before each test

## Configuration

Test configuration is in `playwright.config.js` at the root of the frontend directory.

Key settings:
- **Base URL**: `http://localhost:5173`
- **Test Directory**: `./tests`
- **Browsers**: Chromium, Firefox, WebKit
- **Auto-start dev server**: Yes (via webServer config)

## Notes

- Tests automatically start the dev server if it's not running
- Tests run in parallel by default
- Screenshots are taken on test failures
- Traces are collected when tests are retried
- HTML reports are generated after test runs

## CI/CD Integration

For CI/CD pipelines:
- Set `CI=true` environment variable
- Tests will retry twice on failure
- Workers are limited to 1 in CI mode
- Use `npx playwright install --with-deps` in CI

