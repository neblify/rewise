import { test, expect } from '@playwright/test';

test.describe('Teacher Flow - Create and Publish Test', () => {
  test('should login as teacher, create a test, and publish it', async ({
    page,
  }) => {
    // Step 1: Navigate to home page first (where DevTools is available)
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Click "Login as Teacher" button in DevTools (bottom-right overlay)
    await page.getByRole('button', { name: 'Login as Teacher' }).click();

    // Wait for redirect to teacher dashboard
    await page.waitForURL('**/teacher**', { timeout: 10000 });

    // Verify we're on the teacher dashboard
    await expect(page).toHaveURL(/.*teacher.*/);

    // Step 2: Click "Create New Test" (it's a link, not a button)
    await page.getByRole('link', { name: 'Create New Test' }).click();

    // Wait for the choose-test-type page
    await page.waitForURL(/.*\/teacher\/create-test\/choose.*/, {
      timeout: 10000,
    });

    // Step 2b: Choose "Create my own test" and continue
    await page.getByRole('radio', { name: /Create my own test/ }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Wait for the create test form to load
    await page.waitForURL(/.*\/teacher\/create-test.*/, { timeout: 10000 });

    // Step 3: Fill in test details
    // Title
    await page
      .getByPlaceholder('e.g. Science Mid-Term')
      .fill('E2E Automated Test');

    // Subject
    await page.getByPlaceholder('e.g. Mathematics').fill('Math');

    // Step 4: Add a question
    await page
      .getByRole('button', { name: /Add Question to Section A/i })
      .click();

    // Wait for question form to appear
    await page.waitForTimeout(1000);

    // Fill question text
    await page
      .locator('textarea[placeholder^="Question"]')
      .fill('What is 2+2?');

    // Select question type - Choose Options (MCQ)
    // After adding a question, a new select appears for the question type
    const questionTypeSelect = page.locator('select').last();
    await questionTypeSelect.selectOption({ label: 'Choose Options' });

    // Wait for option inputs to appear
    await page.waitForTimeout(500);

    // Fill in the options
    const optionInputs = page.locator('input[placeholder*="Option"]');
    await optionInputs.nth(0).fill('3');
    await optionInputs.nth(1).fill('4');
    await optionInputs.nth(2).fill('5');
    await optionInputs.nth(3).fill('6');

    // Select the correct answer (option 2, which is "4")
    // For MCQ type, there's a "Correct Option (Exact Match)" input
    await page
      .locator('input[placeholder="Correct Option (Exact Match)"]')
      .fill('4');

    // Step 5: Publish the test
    const publishButton = page.getByRole('button', {
      name: /Update Test|Publish/i,
    });
    await publishButton.click();

    // Step 6: Verify success
    // Wait for navigation back to dashboard or success message
    await page.waitForURL('**/teacher**', { timeout: 5000 });

    // Verify the test appears in the list (use .first() in case of multiple runs)
    await expect(page.getByText('E2E Automated Test').first()).toBeVisible();
  });
});
