import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Change Email', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the settings page
        await page.goto('http://localhost:3000/protected/settings');
    });

    test('should show email change form', async ({ page }) => {
        // Check if the email change form is visible
        const emailForm = await page.locator('[data-testid="change-email-form"]');
        await expect(emailForm).toBeVisible();

        // Check if the email input is visible
        const emailInput = await page.locator('[data-testid="new-email-input"]');
        await expect(emailInput).toBeVisible();

        // Check if the submit button is visible
        const submitButton = await page.locator('[data-testid="change-email-submit"]');
        await expect(submitButton).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
        const emailInput = await page.locator('[data-testid="new-email-input"]');
        const submitButton = await page.locator('[data-testid="change-email-submit"]');

        // Try invalid email format
        await emailInput.fill('invalid-email');
        await submitButton.click();

        // Wait for the form submission to complete and error state to be set
        await page.waitForFunction(() => {
            const errorElement = document.querySelector('[data-testid="email-error"]');
            return errorElement && errorElement.textContent === 'Invalid email address';
        }, { timeout: 10000 });

        // Check for error message
        const errorMessage = await page.locator('[data-testid="email-error"]');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText('Invalid email address');
    });

    test('should successfully change email', async ({ page }) => {
        const emailInput = await page.locator('[data-testid="new-email-input"]');
        const submitButton = await page.locator('[data-testid="change-email-submit"]');

        // Enter new email
        const newEmail = 'newemail@example.com';
        await emailInput.fill(newEmail);
        await submitButton.click();

        // Wait for the form submission to complete and success state to be set
        await page.waitForFunction(() => {
            const successElement = document.querySelector('[data-testid="email-success"]');
            return successElement && successElement.textContent === 'Email updated successfully';
        }, { timeout: 10000 });

        // Check for success message
        const successMessage = await page.locator('[data-testid="email-success"]');
        await expect(successMessage).toBeVisible();
        await expect(successMessage).toContainText('Email updated successfully');

        // Also check for the toast notification
        const toast = await page.locator('.toast-success');
        await expect(toast).toBeVisible();
        await expect(toast).toContainText('Email updated successfully! Please check your inbox to confirm.');
    });

    test('should handle server errors', async ({ page }) => {
        // Mock a server error response
        await page.route('**/api/change-email', async (route) => {
            await route.fulfill({
                status: 500,
                body: JSON.stringify({ error: 'Failed to update email' })
            });
        });

        const emailInput = await page.locator('[data-testid="new-email-input"]');
        const submitButton = await page.locator('[data-testid="change-email-submit"]');

        // Try to change email
        await emailInput.fill('newemail@example.com');
        await submitButton.click();

        // Check for error message
        const errorMessage = await page.locator('[data-testid="email-error"]');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText('Failed to update email');
    });
}); 