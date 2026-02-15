import { test as base, Page } from '@playwright/test';

// Define test fixtures for authenticated user
export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }: { page: Page }, use: (page: Page) => Promise<void>) => {
    // Set up authentication state
    // This would typically:
    // 1. Set localStorage/sessionStorage with auth tokens
    // 2. Or use API to get test credentials
    // 3. Or mock the auth provider

    // Example: Set mock auth state in localStorage
    await page.goto('/');
    await page.evaluate(() => {
      // Mock auth state for testing
      localStorage.setItem('sb-auth-token', JSON.stringify({
        access_token: 'test-token',
        refresh_token: 'test-refresh-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
      }));
    });

    await use(page);

    // Clean up
    await page.evaluate(() => {
      localStorage.clear();
    });
  },
});

export { expect } from '@playwright/test';
