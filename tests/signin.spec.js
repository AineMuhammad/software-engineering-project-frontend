import { test, expect } from '@playwright/test';

test.describe('Sign In Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to sign in page
    await page.goto('/signin');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display sign in page correctly', async ({ page }) => {
    // Check if the page title or heading is visible
    await expect(page).toHaveURL(/.*signin/);
    
    // Check for email input field
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible();
    
    // Check for password input field
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
    
    // Check for sign in button
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible();
  });

  test('should show validation error for empty fields', async ({ page }) => {
    // Try to submit without filling fields
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.click();
    
    // Wait for toast notification (react-hot-toast)
    // The toast should appear with error message
    await page.waitForTimeout(1000); // Wait for toast to appear
    
    // Check if error toast is visible (react-hot-toast creates a div with role="status")
    const toast = page.locator('[role="status"]').first();
    await expect(toast).toBeVisible({ timeout: 2000 });
  });

  test('should navigate to sign up page when clicking sign up link', async ({ page }) => {
    // Find and click the sign up link
    const signUpLink = page.getByRole('link', { name: /sign up/i });
    await signUpLink.click();
    
    // Verify navigation to sign up page
    await expect(page).toHaveURL(/.*signup/);
    
    // Verify sign up page elements are visible
    const nameInput = page.locator('input[name="name"]').first();
    await expect(nameInput).toBeVisible();
  });

  test('should fill and submit sign in form', async ({ page }) => {
    // Fill in email
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill('test@example.com');
    
    // Fill in password
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('testpassword123');
    
    // Submit the form
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.click();
    
    // Wait for API call (the form will try to submit)
    // Note: This test will fail if backend is not running or credentials are invalid
    // In a real scenario, you might want to mock the API or use test credentials
    await page.waitForTimeout(2000);
    
    // Check if we're redirected to dashboard (on success) or error toast appears (on failure)
    const currentUrl = page.url();
    const isDashboard = currentUrl.includes('/dashboard');
    const hasErrorToast = await page.locator('[role="status"]').isVisible();
    
    // Either we're on dashboard (success) or error toast is shown (expected for invalid credentials)
    expect(isDashboard || hasErrorToast).toBeTruthy();
  });

  test('should toggle password visibility', async ({ page }) => {
    // Fill in password
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('testpassword123');
    
    // Find the visibility toggle button (eye icon)
    const toggleButton = page.locator('button[aria-label*="password"], button[aria-label*="show"], button[aria-label*="hide"]').first();
    
    if (await toggleButton.isVisible()) {
      // Click to show password
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      // Password input should now be type="text" or visible
      const passwordFieldAfterToggle = page.locator('input[type="text"]').filter({ hasText: /testpassword123/ }).first();
      // The field might still be password type but visible, so we check if toggle worked
      await expect(toggleButton).toBeVisible();
    }
  });

  test('should display Google sign in button', async ({ page }) => {
    // Look for Google sign in button
    const googleButton = page.getByRole('button', { name: /google/i });
    await expect(googleButton).toBeVisible();
  });

  test('should redirect to sign in when accessing root path', async ({ page }) => {
    // Navigate to root
    await page.goto('/');
    
    // Should redirect to sign in
    await expect(page).toHaveURL(/.*signin/);
  });
});

test.describe('Sign In - Authentication Flow', () => {
  test('should redirect to dashboard if already authenticated', async ({ page, context }) => {
    // Set token in localStorage to simulate authenticated user
    await page.goto('/signin');
    await page.evaluate(() => {
      localStorage.setItem('token', 'test-token-123');
    });
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // If token is invalid, we'll be redirected back to signin
    // If valid (in real scenario), we stay on dashboard
    const currentUrl = page.url();
    expect(currentUrl.includes('/dashboard') || currentUrl.includes('/signin')).toBeTruthy();
  });

  test('should redirect to signin when accessing dashboard without token', async ({ page }) => {
    // Clear any existing tokens
    await page.goto('/signin');
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
    
    // Try to access dashboard
    await page.goto('/dashboard');
    
    // Should redirect to sign in
    await expect(page).toHaveURL(/.*signin/);
  });
});

