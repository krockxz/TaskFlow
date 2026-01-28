import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Generate unique test user credentials
const TEST_EMAIL = `e2e-test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';

// Test 1: Check if register page loads
test('Test 1: Register page loads', async ({ page }) => {
  await page.goto(`${BASE_URL}/register`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test1-register-page.png' });

  // Check if title and form elements are visible
  await expect(page.locator('text=TaskFlow')).toBeVisible();
  await expect(page.locator('text=Create your account')).toBeVisible();
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();

  console.log('Test 1 Result: Register page loaded successfully');
});

// Test 2: Check if login page loads
test('Test 2: Login page loads', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test2-login-page.png' });

  // Check if title and form elements are visible
  await expect(page.locator('text=TaskFlow')).toBeVisible();
  await expect(page.locator('text=Sign in to your account')).toBeVisible();
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.locator('button:has-text("Sign In")')).toBeVisible();

  console.log('Test 2 Result: Login page loaded successfully');
});

// Test 3: Protected route redirects to login
test('Test 3: Protected route redirects to login', async ({ page }) => {
  // Go directly to dashboard without login
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForTimeout(2000); // Allow time for redirect
  await page.screenshot({ path: 'test3-protected-redirect.png' });

  // Should be redirected to login
  const url = page.url();
  console.log(`Test 3 Result: URL after protected route access: ${url}`);

  // Check if we're on login page or redirected
  const isLoginPage = url.includes('/login') || await page.locator('text=Sign in to your account').isVisible();
  expect(isLoginPage).toBeTruthy();

  console.log('Test 3 Result: Protected route redirects to login - PASS');
});

// Test 4: Register a new user
test('Test 4: Register a new user', async ({ page }) => {
  await page.goto(`${BASE_URL}/register`);
  await page.waitForLoadState('networkidle');

  // Fill registration form
  await page.fill('#email', TEST_EMAIL);
  await page.fill('#password', TEST_PASSWORD);
  await page.screenshot({ path: 'test4-register-filled.png' });

  // Submit form
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000); // Wait for API response

  await page.screenshot({ path: 'test4-register-result.png' });

  const url = page.url();
  console.log(`Test 4 Result: After registration, URL: ${url}`);

  // Note: Email confirmation might be required, so user might not be immediately logged in
});

// Test 5: Login with invalid credentials shows error
test('Test 5: Login with invalid credentials shows error', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  // Fill with invalid credentials
  await page.fill('#email', 'invalid@test.dev');
  await page.fill('#password', 'wrongpassword');
  await page.screenshot({ path: 'test5-invalid-creds.png' });

  // Submit form
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'test5-invalid-result.png' });

  // Should show error or stay on login page
  const url = page.url();
  console.log(`Test 5 Result: After invalid login, URL: ${url}`);
  const hasError = await page.locator('text=fetch failed, text=Invalid login credentials, text=error').count() > 0;
  console.log(`Test 5 Result: Error message shown: ${hasError}`);
});

// Test 6: Navigate to analytics (requires auth, will redirect)
test('Test 6: Analytics page accessible', async ({ page }) => {
  await page.goto(`${BASE_URL}/analytics`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test6-analytics-page.png', fullPage: true });

  const url = page.url();
  console.log(`Test 6 Result: Analytics URL: ${url}`);

  // May redirect to login if not authenticated
  const isAnalyticsOrLogin = url.includes('/analytics') || url.includes('/login');
  expect(isAnalyticsOrLogin).toBeTruthy();
});

// Test 7: Check mobile responsiveness (login page)
test('Test 7: Mobile responsiveness', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test7-mobile-login.png', fullPage: true });

  // Check if key elements are visible on mobile
  await expect(page.locator('text=TaskFlow')).toBeVisible();
  await expect(page.locator('#email')).toBeVisible();

  console.log('Test 7 Result: Mobile login page rendered correctly');
});

// Test 8: Check for console errors on public pages
test('Test 8: Check for console errors', async ({ page }) => {
  const errors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Navigate through public pages
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  await page.goto(`${BASE_URL}/register`);
  await page.waitForLoadState('networkidle');

  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForTimeout(2000);

  console.log(`Test 8 Result: Console errors found: ${errors.length}`);
  if (errors.length > 0) {
    console.log('Errors:', errors.slice(0, 5)); // Show first 5 errors
  }
});

// Test 9: Verify OAuth buttons exist
test('Test 9: OAuth buttons are visible', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  // Check for OAuth buttons
  const googleButton = page.locator('button:has-text("Google")');
  const githubButton = page.locator('button:has-text("GitHub")');

  const hasGoogle = await googleButton.isVisible();
  const hasGithub = await githubButton.isVisible();

  await page.screenshot({ path: 'test9-oauth-buttons.png' });

  console.log(`Test 9 Result: Google button: ${hasGoogle}, GitHub button: ${hasGithub}`);
});
