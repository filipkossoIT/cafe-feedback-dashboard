import { test, expect } from '@playwright/test'

const uniqueEmail = (i: number) => `owner${i}-${Date.now()}@example.com`

test('signup → submit feedback → dashboard reflects it → logout guard → re-login persists', async ({ page }) => {
  const email = uniqueEmail(1)

  // Sign up a new cafe
  await page.goto('/signup')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill('pw123456')
  await page.getByLabel(/cafe name/i).fill('Test Beans')
  await page.getByRole('button', { name: /create/i }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByText(/feedback dashboard/i)).toBeVisible()

  // Submit feedback on the public form
  await page.goto('/f/test-beans')
  await page.getByRole('button', { name: /4 stars/i }).click()
  await page.getByRole('combobox').selectOption('Product')
  await page.getByRole('textbox').fill('Lovely oat latte from a Playwright test.')
  await page.getByRole('button', { name: /send feedback/i }).click()
  await expect(page.getByText(/thanks so much/i)).toBeVisible()

  // Dashboard reflects it
  await page.goto('/dashboard')
  await expect(page.getByText('Lovely oat latte from a Playwright test.')).toBeVisible()
  await expect(page.getByTestId('stat-total')).toHaveText('1')

  // Logout → protected route redirects to login
  await page.goto('/settings')
  await page.getByRole('button', { name: /log ?out/i }).click()
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)

  // Log back in → the earlier feedback is still there (localStorage persisted)
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill('pw123456')
  await page.getByRole('button', { name: /log ?in/i }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByText('Lovely oat latte from a Playwright test.')).toBeVisible()
})

test('unknown cafe slug shows not-found', async ({ page }) => {
  await page.goto('/f/does-not-exist')
  await expect(page.getByText(/cafe not found/i)).toBeVisible()
})

test('try the demo shows the seeded cafe dashboard', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /try the demo/i }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByText(/best flat white/i)).toBeVisible()
})
