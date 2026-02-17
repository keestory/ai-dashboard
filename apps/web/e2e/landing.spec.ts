import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the landing page', async ({ page }) => {
    await page.goto('/');

    // Check main heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Upload');

    // Check CTA buttons
    await expect(page.getByRole('link', { name: /무료로 시작/ })).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');

    // Check navigation links exist (no navigation role in header)
    await expect(page.getByRole('link', { name: '로그인' })).toBeVisible();
    await expect(page.getByRole('link', { name: '무료 시작하기' })).toBeVisible();
  });

  test('should display features section', async ({ page }) => {
    await page.goto('/');

    // Scroll to features
    await page.getByText('주요 기능').scrollIntoViewIfNeeded();

    // Check features are visible
    await expect(page.getByRole('heading', { name: 'AI 인사이트' })).toBeVisible();
  });

  test('should display pricing section', async ({ page }) => {
    await page.goto('/');

    // Check pricing cards
    await expect(page.getByText('가격 플랜')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Free' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pro' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Business' })).toBeVisible();
  });

  test('should navigate to signup from CTA', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /무료로 시작/ }).first().click();

    await expect(page).toHaveURL('/signup');
  });

  test('should be responsive', async ({ page }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that heading is visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});
