import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');

      await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
      await expect(page.getByPlaceholder('이메일을 입력하세요')).toBeVisible();
      await expect(page.getByPlaceholder('비밀번호를 입력하세요')).toBeVisible();
      await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/login');
      await page.getByRole('button', { name: '로그인' }).click();

      // Check that form doesn't submit with empty fields
      await expect(page).toHaveURL('/login');
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      await page.getByPlaceholder('이메일을 입력하세요').fill('invalid@test.com');
      await page.getByPlaceholder('비밀번호를 입력하세요').fill('wrongpassword');
      await page.getByRole('button', { name: '로그인' }).click();

      // Wait for error message
      await expect(page.locator('text=로그인에 실패했습니다')).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to signup page', async ({ page }) => {
      await page.goto('/login');
      await page.getByRole('link', { name: '회원가입' }).click();

      await expect(page).toHaveURL('/signup');
    });

    test('should have Google OAuth button', async ({ page }) => {
      await page.goto('/login');

      await expect(page.getByRole('button', { name: /Google/ })).toBeVisible();
    });
  });

  test.describe('Signup Page', () => {
    test('should display signup form', async ({ page }) => {
      await page.goto('/signup');

      await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible();
      await expect(page.getByPlaceholder('이름을 입력하세요')).toBeVisible();
      await expect(page.getByPlaceholder('이메일을 입력하세요')).toBeVisible();
      await expect(page.getByPlaceholder('비밀번호를 입력하세요')).toBeVisible();
    });

    test('should validate password length', async ({ page }) => {
      await page.goto('/signup');

      await page.getByPlaceholder('이름을 입력하세요').fill('Test User');
      await page.getByPlaceholder('이메일을 입력하세요').fill('test@example.com');
      await page.getByPlaceholder('비밀번호를 입력하세요').fill('short');
      await page.getByRole('button', { name: '회원가입' }).click();

      await expect(page.locator('text=8자 이상')).toBeVisible();
    });

    test('should navigate to login page', async ({ page }) => {
      await page.goto('/signup');
      await page.getByRole('link', { name: '로그인' }).click();

      await expect(page).toHaveURL('/login');
    });
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated users from analysis page', async ({ page }) => {
    await page.goto('/analysis');

    await expect(page).toHaveURL(/\/login/);
  });
});
