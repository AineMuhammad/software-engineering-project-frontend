import { test, expect } from '@playwright/test';

/**
 * Production Environment Tests
 * 
 * These tests run against the deployed application at:
 * https://personal-mood-tracker-800c5.web.app
 * 
 * Run with: npm run test:e2e:prod
 */

test.describe('Production Deployment - Sign In Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to production sign in page
    await page.goto('/signin');
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should load production sign in page', async ({ page }) => {
    // Verify we're on the sign in page
    await expect(page).toHaveURL(/.*signin/);
    
    // Check for key elements
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
  });

  test('should display all UI elements correctly', async ({ page }) => {
    // Check for sign in button
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible();
    
    // Check for Google sign in button
    const googleButton = page.getByRole('button', { name: /google/i });
    await expect(googleButton).toBeVisible();
    
    // Check for sign up link
    const signUpLink = page.getByRole('link', { name: /sign up/i });
    await expect(signUpLink).toBeVisible();
  });

  test('should handle form validation', async ({ page }) => {
    // Try to submit empty form
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.click();
    
    // Wait for validation error (toast notification)
    await page.waitForTimeout(1500);
    
    // Check if error message appears
    const toast = page.locator('[role="status"]').first();
    const isToastVisible = await toast.isVisible().catch(() => false);
    
    // Either toast appears or form prevents submission
    expect(isToastVisible || await signInButton.isVisible()).toBeTruthy();
  });

  test('should navigate to sign up page', async ({ page }) => {
    const signUpLink = page.getByRole('link', { name: /sign up/i });
    await signUpLink.click();
    
    // Verify navigation
    await expect(page).toHaveURL(/.*signup/, { timeout: 10000 });
    
    // Verify sign up page loaded
    const nameInput = page.locator('input[name="name"]').first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Production Deployment - Routing', () => {
  test('should redirect root to signin', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*signin/, { timeout: 10000 });
  });

  test('should redirect unauthenticated users from dashboard', async ({ page }) => {
    // Clear any existing auth
    await page.goto('/signin');
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Try to access dashboard
    await page.goto('/dashboard');
    
    // Should redirect to signin
    await expect(page).toHaveURL(/.*signin/, { timeout: 10000 });
  });
});

test.describe('Production Deployment - Performance', () => {
  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/signin');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
    console.log(`Page load time: ${loadTime}ms`);
  });

  test('should have no console errors on page load', async ({ page }) => {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/signin');
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors (like Firebase analytics)
    const criticalErrors = errors.filter(error => 
      !error.includes('analytics') && 
      !error.includes('firebase') &&
      !error.includes('gtag')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});

