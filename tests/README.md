# Playwright E2E Tests

This directory contains end-to-end tests for the Mood Tracker frontend application using Playwright.

## Prerequisites

1. **Install Playwright browsers** (first time only):
   ```bash
   npx playwright install
   ```

2. **For Local Tests**:
   - Ensure backend is running on `http://localhost:5000` (or the configured API URL)
   - Frontend dev server will start automatically if not running

3. **For Production Tests**:
   - No local server needed - tests run against https://personal-mood-tracker-800c5.web.app
   - Backend should be deployed and accessible at the configured API URL

## Running Tests

### Local Development Tests

#### Run all tests (against local dev server)
```bash
npm run test:e2e
```

#### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

#### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

#### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### Production Deployment Tests

#### Run tests against deployed application
```bash
npm run test:e2e:prod
```

#### Run production tests in UI mode
```bash
npm run test:e2e:prod:ui
```

#### Run production tests in headed mode
```bash
npm run test:e2e:prod:headed
```

### View Test Reports

```bash
npm run test:e2e:report
```

## Test Files

- `signin.spec.js` - Tests for the sign-in page and authentication flow (local development)
- `production.spec.js` - Tests for the deployed production application at https://personal-mood-tracker-800c5.web.app

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
- **Base URL**: 
  - Local: `http://localhost:5173` (default)
  - Production: `https://personal-mood-tracker-800c5.web.app` (via `PLAYWRIGHT_BASE_URL` env var)
- **Test Directory**: `./tests`
- **Browsers**: Chromium, Firefox, WebKit
- **Auto-start dev server**: Yes (only for local tests, via webServer config)

### Environment Variables

Set `PLAYWRIGHT_BASE_URL` to test against a different environment:
```bash
PLAYWRIGHT_BASE_URL=https://your-app.web.app npm run test:e2e
```

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

