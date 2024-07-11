const { test, expect } = require('@playwright/test');
const testData = require('../../fixtures/amazonFixture.json');

test.describe('Amazon Positive Login Functionality', () => {

    test('should log in with valid credentials', async ({ page }) => {
      // Navigate to Amazon homepage
      await page.goto('https://www.amazon.com');
  
      // Click on the sign-in button
      await page.click('#nav-link-accountList');
  
      // Fill in the login form
      await page.fill('#ap_email', testData.validUser.username);
      await page.click('#continue');
      await page.fill('#ap_password', testData.validUser.password);
      await page.click('#signInSubmit');
  
      // Wait for the page to load and the account name to appear
      await page.waitForSelector('#nav-link-accountList-nav-line-1', { timeout: 5000 });
  
      // Verify login by checking if the account name is displayed
      const accountName = await page.$('#nav-link-accountList-nav-line-1');
      expect(accountName).not.toBeNull();
  
      // Log the inner text of the account name for debugging
      if (accountName) {
        const accountNameText = await accountName.innerText();
        console.log(`Logged in as: ${accountNameText}`);
      } else {
        console.log('Account name element not found.');
      }
    });

    test('should log in with valid credentials and remember me option', async ({ page }) => {
        // Navigate to Amazon homepage
        await page.goto('https://www.amazon.com');

        // Click on the sign-in button
        await page.click('#nav-link-accountList');

        // Fill in the login form with valid credentials
        await page.fill('#ap_email', testData.validUser.username);
        await page.click('#continue');
        await page.fill('#ap_password', testData.validUser.password);

        // Wait for the "Remember me" checkbox to be visible and check it
        const rememberMeCheckbox = page.locator('input[name="rememberMe"]');
        await rememberMeCheckbox.waitFor({ state: 'visible', timeout: 10000 });
        await rememberMeCheckbox.check();

        // Click on the sign-in button
        await page.click('#signInSubmit');

        // Wait for the account name element to be visible after login
        const accountNameLocator = page.locator('#nav-link-accountList-nav-line-1');
        await accountNameLocator.waitFor({ state: 'visible', timeout: 10000 });

        // Verify login by checking if the account name is displayed
        const accountNameText = await accountNameLocator.innerText();
        expect(accountNameText).toContain('Hello, Rohan');
    });

    test.only('should log in and then log out', async ({ page }) => {
        // Navigate to Amazon homepage
        await page.goto('https://www.amazon.com');

        // Click on the sign-in button
        await page.click('#nav-link-accountList');

        // Fill in the login form with valid credentials
        await page.fill('#ap_email', testData.validUser.username);
        await page.click('#continue');
        await page.fill('#ap_password', testData.validUser.username);
        await page.click('#signInSubmit');

        // Verify login by checking if the account name is displayed
        const accountName = await page.$('#nav-link-accountList-nav-line-1');
        // expect(accountName).not.toBeNull();

        // Click on the account list to log out
        await page.hover('#nav-link-accountList');
        await page.click('a[data-nav-role="signin"]');

        // Verify logout by checking if the sign-in button is displayed again
        const signInButton = await page.$('#nav-link-accountList');
        expect(signInButton).not.toBeNull();

        // Pause to solve CAPTCHA manually
        console.log('Please solve the CAPTCHA manually in the opened browser.');
        await page.waitForTimeout(60000); // Wait for 1 minute to solve the CAPTCHA

        // Wait for the account name element to be visible after login
        const accountNameLocator = page.locator('#nav-link-accountList-nav-line-1');
        await accountNameLocator.waitFor({ state: 'visible', timeout: 10000 });

        // Verify login by checking if the account name is displayed
        const accountNameText = await accountNameLocator.innerText();
        expect(accountNameText).toContain('Hello, Rohan');
    });

  
  });


test.describe.skip('Amazon Negative Login Test', () => {

    test('should not log in with an invalid password', async ({ page }) => {
        // Navigate to Amazon homepage
        await page.goto('https://www.amazon.com');

        // Click on the sign-in button
        await page.click('#nav-link-accountList');

        // Fill in the login form with an invalid password
        await page.fill('#ap_email', testData.validUser.username);
        await page.click('#continue');
        await page.fill('#ap_password', 'invalid-password');
        await page.click('#signInSubmit');

        // Verify that an error message is displayed
        const errorMessage = await page.$('.a-alert-heading');
        expect(errorMessage).not.toBeNull();
    });


    test.skip('should not log in with an invalid email', async ({ page }) => {
        // Navigate to Amazon homepage
        await page.goto('https://www.amazon.com');

        // Click on the sign-in button
        await page.click('#nav-link-accountList');

        // Fill in the login form with an invalid email
        await page.fill('#ap_email', 'invalid-email@example.com');
        await page.click('#continue');

        // Verify that an error message is displayed
        const errorMessage = await page.$('.a-alert-heading');
        expect(errorMessage).not.toBeNull();
    });

});
/*

test.describe('Amazon Add to Cart Functionality', () => {

    test('should add a product to the cart', async ({ page }) => {
        // Navigate to Amazon homepage
        await page.goto('https://www.amazon.com');

        // Search for a product
        await page.fill('#twotabsearchtextbox', 'laptop');
        await page.click('#nav-search-submit-button');

        // Click on the first product in the search results
        await page.click('.s-main-slot .s-result-item h2 a');

        // Add the product to the cart
        await page.click('#add-to-cart-button');

        // Verify that the cart has been updated
        const cartCount = await page.$('#nav-cart-count');
        const count = await cartCount.innerText();
        expect(count).toBe('1');
    });

});

test.describe('Amazon Product Details Page', () => {

    test('should display product details when a product is clicked', async ({ page }) => {
        // Navigate to Amazon homepage
        await page.goto('https://www.amazon.com');

        // Search for a product
        await page.fill('#twotabsearchtextbox', 'laptop');
        await page.click('#nav-search-submit-button');

        // Click on the first product in the search results
        await page.click('.s-main-slot .s-result-item h2 a');

        // Verify that product details are displayed
        const productTitle = await page.$('#productTitle');
        expect(productTitle).not.toBeNull();
    });

});

est.describe('Amazon Sign-Up Functionality', () => {

    test('should sign up with valid details', async ({ page }) => {
        // Navigate to Amazon homepage
        await page.goto('https://www.amazon.com');

        // Click on the sign-in button
        await page.click('#nav-link-accountList');

        // Click on the "Create your Amazon account" button
        await page.click('#createAccountSubmit');

        // Fill in the sign-up form
        await page.fill('#ap_customer_name', 'Test User');
        await page.fill('#ap_email', 'testuser@example.com');
        await page.fill('#ap_password', 'TestPassword123');
        await page.fill('#ap_password_check', 'TestPassword123');
        await page.click('#continue');

        // Verify that account creation confirmation is displayed
        const confirmationMessage = await page.$('.a-alert-heading');
        expect(confirmationMessage).not.toBeNull();
    });

});

test.describe('Amazon Search Functionality - No Results', () => {

    test('should display no results message for a non-existent product', async ({ page }) => {
        // Navigate to Amazon homepage
        await page.goto('https://www.amazon.com');

        // Search for a non-existent product
        await page.fill('#twotabsearchtextbox', 'nonexistentproduct12345');
        await page.click('#nav-search-submit-button');

        // Verify that a no results message is displayed
        const noResultsMessage = await page.$('.a-color-state');
        expect(noResultsMessage).not.toBeNull();
    });

});

test.describe('Amazon Remove Item from Cart', () => {

    test('should remove an item from the cart', async ({ page }) => {
        // Navigate to Amazon homepage
        await page.goto('https://www.amazon.com');

        // Search for a product and add it to the cart
        await page.fill('#twotabsearchtextbox', 'laptop');
        await page.click('#nav-search-submit-button');
        await page.click('.s-main-slot .s-result-item h2 a');
        await page.click('#add-to-cart-button');

        // Navigate to the cart
        await page.click('#nav-cart');

        // Remove the item from the cart
        await page.click('.sc-action-delete .a-declarative');

        // Verify that the cart is empty
        const cartEmptyMessage = await page.$('.sc-your-amazon-cart-is-empty');
        expect(cartEmptyMessage).not.toBeNull();
    });

});

test.describe('Amazon Empty Cart Validation', () => {

    test('should display empty cart message', async ({ page }) => {
        // Navigate to Amazon homepage
        await page.goto('https://www.amazon.com');

        // Navigate to the cart
        await page.click('#nav-cart');

        // Verify that the empty cart message is displayed
        const cartEmptyMessage = await page.$('.sc-your-amazon-cart-is-empty');
        expect(cartEmptyMessage).not.toBeNull();
    });

});

const { test, request } = require('@playwright/test');

test.describe('Amazon API Login Test - Valid Credentials', () => {

    test('should successfully login with valid credentials via API', async ({ request }) => {
        const response = await request.post('https://www.amazon.com/ap/signin', {
            data: {
                email: 'your-email@example.com',
                password: 'your-password'
            }
        });

        // Verify the response status is 200
        expect(response.status()).toBe(200);

        // Verify the response contains the expected data
        const data = await response.json();
        expect(data.accountName).toBeDefined();
    });

});


test.describe('Amazon API Test - Get User Profile After Login', () => {

    test('should get user profile after successful login via API', async ({ request }) => {
        // Login via API
        const loginResponse = await request.post('https://www.amazon.com/ap/signin', {
            data: {
                email: 'your-email@example.com',
                password: 'your-password'
            }
        });

        // Extract cookies or token from the login response
        const cookies = await loginResponse.cookies();

        // Use the cookies or token to get user profile
        const profileResponse = await request.get('https://www.amazon.com/user/profile', {
            headers: {
                'Cookie': cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
            }
        });

        // Verify the response status is 200
        expect(profileResponse.status()).toBe(200);

        // Verify the response contains the expected data
        const profileData = await profileResponse.json();
        expect(profileData.name).toBe('Your Name');
    });

});

test.describe('Amazon API Test - Logout After Successful Login', () => {

    test('should logout successfully after login via API', async ({ request }) => {
        // Login via API
        const loginResponse = await request.post('https://www.amazon.com/ap/signin', {
            data: {
                email: 'your-email@example.com',
                password: 'your-password'
            }
        });

        // Extract cookies or token from the login response
        const cookies = await loginResponse.cookies();

        // Use the cookies or token to logout
        const logoutResponse = await request.post('https://www.amazon.com/ap/logout', {
            headers: {
                'Cookie': cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
            }
        });

        // Verify the response status is 200
        expect(logoutResponse.status()).toBe(200);

        // Verify the response contains the expected data
        const logoutData = await logoutResponse.json();
        expect(logoutData.message).toBe('Logout successful');
    });

});
*/