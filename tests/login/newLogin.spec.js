const { test, expect, describe } = require('@playwright/test');

const testData = require('../../fixtures/loginFixture.json');
const testObj = require('../../pageObjects/login.po.js');

test.beforeEach(async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
});
describe('Swag Labs Login Positive Tests', () => {
  test('login with valid username and valid password', async ({ page }) => {
    const loginObj = new testObj.LoginPage(page);
    await loginObj.login(testData.validUser.username, testData.validUser.password);
  });
});

describe('Swag Labs Login Negative Tests', () => {
  test('login with invalid username and invalid password', async ({ page }) => {
    const loginObj = new testObj.LoginPage(page);
    await loginObj.login(testData.invalidUser.username, testData.invalidUser.password);
    await expect(page.locator('[data-test="error"]')).toBeVisible();
  });

  test('login with empty username and empty password', async ({ page }) => {
    const loginObj = new testObj.LoginPage(page);
    await loginObj.login(testData.emptyUser.username, testData.emptyPassword.password);
    await expect(page.locator('[data-test="error"]')).toBeVisible();
  });
});