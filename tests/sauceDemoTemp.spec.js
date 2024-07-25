const { test, expect } = require('@playwright/test');
const testData = require('../fixtures/swagLabsFixture.json');

const users = testData.users;
const password = testData.password;
const itemsToAdd = testData.itemsToAdd;
const checkoutData = testData.checkout;

test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
});

// Login tests for all users
users.forEach(user => {
    test(`Login with ${user}`, async ({ page }) => {
        await page.fill('#user-name', user);
        await page.fill('#password', password);
        await page.click('#login-button');

        if (user === 'locked_out_user') {
            await expect(page.locator('.error-message-container')).toBeVisible();
            await expect(page.locator('.error-message-container')).toHaveText('Epic sadface: Sorry, this user has been locked out.');
        } else {
            await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
            await expect(page.locator('.title')).toHaveText('Products');
        }
    });
});

// Add item to cart, view product description, and remove item from cart for standard_user
test('Add multiple items to cart, view product description, remove item, and complete checkout', async ({ page }) => {
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', password);
    await page.click('#login-button');
  
    // Add items to the cart
    for (const item of itemsToAdd) {
      await page.click(item);
    }
  
    await page.click('.shopping_cart_link');
    await page.waitForSelector('.cart_item', { state: 'visible' });
    await expect(page.locator('.cart_item')).toHaveCount(6);
  
    // Remove one item from the cart
    await page.click('[data-test="remove-sauce-labs-bike-light"]');
    await expect(page.locator('.cart_item')).toHaveCount(5);
  
    // View product description of one item using XPath
    await page.waitForSelector('xpath=//*[@id="item_4_title_link"]/div', { state: 'visible' });
    await page.screenshot({ path: 'cart_page.png' }); // Take a screenshot for debugging
  
    const itemLocator = page.locator('xpath=//*[@id="item_4_title_link"]/div');
    await itemLocator.click(); // Click on the first item in the cart
    await expect(page).toHaveURL(/.*inventory-item.html/);
  
    // Remove an item from the description page using XPath
    await page.waitForSelector('xpath=//*[@id="remove"]', { state: 'visible' });
    await page.click('xpath=//*[@id="remove"]'); // Click the remove button for the item
  
    // Go back to the cart using XPath
    await page.click('xpath=//*[@id="shopping_cart_container"]/a');
    await expect(page.locator('.cart_item')).toHaveCount(4); // Ensure 4 items are left in the cart
  
    // Proceed to checkout
    await page.click('[data-test="checkout"]');
    await page.fill('[data-test="firstName"]', checkoutData.firstName);
    await page.fill('[data-test="lastName"]', checkoutData.lastName);
    await page.fill('[data-test="postalCode"]', checkoutData.postalCode);
    await page.click('[data-test="continue"]');
  
    // Verify checkout overview and price total label
    await expect(page).toHaveURL(/.*checkout-step-two.html/);
    await page.waitForSelector('.summary_info_label[data-test="total-info-label"]');
    await expect(page.locator('.summary_info_label[data-test="total-info-label"]')).toHaveText('Price Total');
  
    // Finish checkout
    await page.click('[data-test="finish"]');
    await expect(page).toHaveURL(/.*checkout-complete.html/);
  
    // Verify the completion message
    await page.waitForSelector('[data-test="complete-header"]');
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  
    // Go back to the home page
    await page.click('[data-test="back-to-products"]');
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  });

// Logout test for standard_user
test('Logout after login', async ({ page }) => {
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', password);
    await page.click('#login-button');

    await page.click('#react-burger-menu-btn');
    await page.click('#logout_sidebar_link');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
});

// Visual regression test for visual_user
test('Visual regression for inventory page', async ({ page }) => {
    await page.fill('#user-name', 'visual_user');
    await page.fill('#password', password);
    await page.click('#login-button');

    await page.waitForSelector('.inventory_list');
    expect(await page.screenshot()).toMatchSnapshot('inventory_page.png');
});

// Performance test for performance_glitch_user
test('Check loading time for performance_glitch_user', async ({ page }) => {
    const start = new Date();
    await page.fill('#user-name', 'performance_glitch_user');
    await page.fill('#password', password);
    await page.click('#login-button');
    await page.waitForSelector('.inventory_list');
    const end = new Date();
    const loadTime = end - start;

    console.log(`Load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000); // Example threshold for acceptable load time
});

// Test for problem_user's image issue
test('Check image issue for problem_user', async ({ page }) => {
    await page.fill('#user-name', 'problem_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    // Use locator to find the image
    const brokenImageLocator = page.locator('img[src="/static/media/sl-404.168b1cce.jpg"]');

    // Assert that the image is visible
    await expect(brokenImageLocator).toBeVisible();
});

// Test for error_user
test('Login with error_user and check error', async ({ page }) => {
    await page.fill('#user-name', 'error_user');
    await page.fill('#password', password);
    await page.click('#login-button');

    // Increased timeout and added debug information
    try {
        await page.waitForSelector('.error-message-container', { state: 'visible', timeout: 10000 });
        await expect(page.locator('.error-message-container')).toBeVisible();
        await expect(page.locator('.error-message-container')).toHaveText('Epic sadface: Username and password do not match any user in this service');
    } catch (error) {
        console.error('Error during login test:', error.message);
        await page.screenshot({ path: 'login_error_state.png' }); // Take a screenshot for inspection
        throw error; // Rethrow to mark the test as failed
    }
});


// without page objects