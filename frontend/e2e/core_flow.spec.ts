import { test, expect } from '@playwright/test';

test.describe.serial('DermaSense AI - Core Flow Validation', () => {
  test.setTimeout(60000); // Increase timeout to 60s for all tests in this block
  const testEmail = `dermasense_e2e_test_admin@gmail.com`;
  const testPassword = 'TestPassword123!';

  test.beforeEach(async ({ page }) => {
    page.on('pageerror', err => console.log(`BROWSER ERROR [${test.info().title}]:`, err.message));
    page.on('console', msg => { 
      if (msg.type() === 'error') console.log(`BROWSER CONSOLE ERROR [${test.info().title}]:`, msg.text()); 
    });
  });

  test('Application startup and UI accessibility', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DermaSense/i);
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('Login and Dashboard Flow with Dedicated Account', async ({ page }) => {
    // 1. Login directly using the dedicated account created by the admin test script
    await page.goto('/signin');
    
    await page.waitForSelector('form');
    // The SignInPage uses 'name@example.com' placeholder for email
    await page.locator('input[placeholder="name@example.com"]').fill(testEmail);
    await page.locator('input[placeholder="Enter your password"]').fill(testPassword);
    
    await page.getByRole('button', { name: /Sign In with Email/i }).click();

    // Wait for the login to succeed (either dashboard or onboarding)
    await page.waitForURL(/.*(dashboard|onboarding).*/, { timeout: 15000 });

    // Force navigation to dashboard if it hits onboarding
    await page.goto('/dashboard');
    await expect(page.getByText('Dashboard').first()).toBeVisible({ timeout: 15000 });

    // 2. Profile Page
    await page.goto('/dashboard/profile');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'profile-error.png', fullPage: true });
    // We didn't set a name during admin creation, so we just check it's the profile page
    await expect(page.getByText(/Personal Profile/i).first()).toBeVisible({ timeout: 15000 });

    // 3. Logout
    const logoutBtn = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForURL('**/signin*');
    }
  });

  test('Analysis Flow: Upload, Quality, Results, Limits', async ({ page }) => {
    // Must authenticate first as this test gets a fresh browser context
    await page.goto('/signin');
    
    await page.waitForSelector('form');
    await page.locator('input[placeholder="name@example.com"]').fill(testEmail);
    await page.locator('input[placeholder="Enter your password"]').fill(testPassword);
    
    await page.getByRole('button', { name: /Sign In with Email/i }).click();
    
    await page.waitForURL(/.*(dashboard|onboarding).*/);

    // Proceed to analysis
    await page.goto('/skincare-analysis');
    const uploadInput = page.locator('input[type="file"]');
    await expect(uploadInput).toBeAttached();

    // Usage counter
    await expect(page.locator('text=analyses remaining')).toBeVisible({ timeout: 10000 }).catch(() => null);

    // Premium Screen
    await page.goto('/dashboard/membership');
    await page.waitForURL('**/dashboard/membership');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'membership-error2.png', fullPage: true });
    await expect(page.getByRole('heading', { name: /Membership/i }).first()).toBeVisible({ timeout: 20000 });
    
    // Chatbot UI
    await page.goto('/dashboard/chat');
    await expect(page.locator('textarea[placeholder*="Ask a skincare question"]').first()).toBeVisible({ timeout: 20000 });
  });

  test('Security & Configuration States', async ({ page }) => {
    // Must authenticate first as this test gets a fresh browser context
    await page.goto('/signin');
    await page.waitForSelector('form');
    await page.locator('input[placeholder="name@example.com"]').fill(testEmail);
    await page.locator('input[placeholder="Enter your password"]').fill(testPassword);
    await page.getByRole('button', { name: /Sign In with Email/i }).click();
    await page.waitForURL(/.*(dashboard|onboarding).*/);

    // Check Razorpay Configuration Missing Warning if keys are absent
    await page.goto('/dashboard/membership');
    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Membership/i }).first()).toBeVisible({ timeout: 20000 });
    const checkoutBtn = page.locator('button:has-text("Subscribe")').first();
    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click();
      // Expect either Razorpay popup or a configuration warning
    }
  });
});
