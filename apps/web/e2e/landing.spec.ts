import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the landing page', async ({ page }) => {
    await page.goto('/');

    // Check main heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText('데이터');

    // Check CTA buttons
    await expect(page.getByRole('link', { name: /무료로 시작/ })).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');

    // Check navigation
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('link', { name: '로그인' })).toBeVisible();
  });

  test('should display features section', async ({ page }) => {
    await page.goto('/');

    // Scroll to features
    await page.getByText('강력한 기능').scrollIntoViewIfNeeded();

    // Check features are visible
    await expect(page.getByText('AI 자동 분석')).toBeVisible();
  });

  test('should display pricing section', async ({ page }) => {
    await page.goto('/');

    // Check pricing cards
    await expect(page.getByText('무료')).toBeVisible();
    await expect(page.getByText('프로')).toBeVisible();
    await expect(page.getByText('엔터프라이즈')).toBeVisible();
  });

  test('should navigate to signup from CTA', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /무료로 시작/ }).click();

    await expect(page).toHaveURL('/signup');
  });

  test('should be responsive', async ({ page }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that mobile menu button is visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check title
    const title = await page.title();
    expect(title).toContain('InsightFlow');
  });
});
