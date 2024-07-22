const { test, expect } = require('@playwright/test');
const SauceDemoPage = require('../pageObjects/sauceDemo.po');
const testData = require('../fixtures/sauceDemoFixture.json');

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
        const sauceDemoPage = new SauceDemoPage(page);
        await sauceDemoPage.login(user, password);

        if (user === 'locked_out_user') {
            await sauceDemoPage.verifyErrorMessage('Epic sadface: Sorry, this user has been locked out.');
        } else {
            await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
            await expect(page.locator('.title')).toHaveText('Products');
        }
    });
});

// Add multiple items to cart, view product description, remove item, and complete checkout
test('Add multiple items to cart, view product description, remove item, and complete checkout', async ({ page }) => {
    const sauceDemoPage = new SauceDemoPage(page);
    await sauceDemoPage.login('standard_user', password);

    // Add items to the cart
    for (const item of itemsToAdd) {
        await sauceDemoPage.addItemToCart(item);
    }

    await sauceDemoPage.goToCart();
    await expect(sauceDemoPage.cartItem).toHaveCount(6);

    // Remove one item from the cart using Playwright methods directly
    await page.click('xpath=//*[@id="remove-sauce-labs-bike-light"]'); // Adjust XPath as needed
    await expect(sauceDemoPage.cartItem).toHaveCount(5);

    // View product description and remove an item
    await sauceDemoPage.viewProductDescription('//*[@id="item_4_title_link"]/div');
    await page.screenshot({ path: '../test-result/debugging/cart_page.png' }); // Take a screenshot for debugging

    await page.click('xpath=//*[@id="remove"]'); // Adjust XPath as needed

    // Go back to the cart
    await sauceDemoPage.goToCart();
    await expect(sauceDemoPage.cartItem).toHaveCount(4); // Ensure 4 items are left in the cart

    // Proceed to checkout
    await sauceDemoPage.proceedToCheckout();
    await sauceDemoPage.fillCheckoutInformation(checkoutData.firstName, checkoutData.lastName, checkoutData.postalCode);

    // Verify checkout overview and price total label
    await expect(page).toHaveURL(/.*checkout-step-two.html/);
    await sauceDemoPage.verifyPriceTotal();

    // Finish checkout
    await sauceDemoPage.completeCheckout();
    await expect(page).toHaveURL(/.*checkout-complete.html/);
    await sauceDemoPage.verifyOrderComplete();

    // Go back to the home page
    await sauceDemoPage.goBackToProducts();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
});

// Logout test for standard_user
test('Logout after login', async ({ page }) => {
    const sauceDemoPage = new SauceDemoPage(page);
    await sauceDemoPage.login('standard_user', password);

    await page.click('#react-burger-menu-btn');
    await page.click('#logout_sidebar_link');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
});

// Visual regression test for visual_user
test.only('Visual regression for inventory page', async ({ page }) => {
    const sauceDemoPage = new SauceDemoPage(page);
    await sauceDemoPage.login('visual_user', password);

    await page.waitForSelector('.inventory_list');
    expect(await page.screenshot()).toMatchSnapshot('inventory_page.png');
});

// Performance test for performance_glitch_user
test('Check loading time for performance_glitch_user', async ({ page }) => {
    const sauceDemoPage = new SauceDemoPage(page);
    const start = new Date();
    await sauceDemoPage.login('performance_glitch_user', password);
    await page.waitForSelector('.inventory_list');
    const end = new Date();
    const loadTime = end - start;

    console.log(`Load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000); // Example threshold for acceptable load time
});

// Test for problem_user's image issue
test('Check image issue for problem_user', async ({ page }) => {
    const sauceDemoPage = new SauceDemoPage(page);
    await sauceDemoPage.login('problem_user', 'secret_sauce');

    // Use locator to find the image
    const brokenImageLocator = page.locator('img[src="/static/media/sl-404.168b1cce.jpg"]');

    // Assert that the image is visible
    await expect(brokenImageLocator).toBeVisible();
});

// Test for error_user
test('Login with error_user expected cart items (6) received cart items(3)', async ({ page }) => {
    const sauceDemoPage = new SauceDemoPage(page);
    await sauceDemoPage.login('error_user', password);

    // Attempt to add items to the cart
    for (const item of itemsToAdd) {
        try {
            await sauceDemoPage.addItemToCart(item);
        } catch (error) {
            console.error(`Error adding item ${item}:`, error.message);
        }
    }

    await sauceDemoPage.goToCart();
    await expect(sauceDemoPage.cartItem).toHaveCount(itemsToAdd.length);
});

test('Login with error_user and handle checkout-> finish issues', async ({ page }) => {
    const sauceDemoPage = new SauceDemoPage(page);
    await sauceDemoPage.login('error_user', password);

    // Add only the first item from the itemsToAdd array
    const itemToAdd = itemsToAdd[0]; // Adjust this index if you want a specific item

    try {
        await sauceDemoPage.addItemToCart(itemToAdd);
    } catch (error) {
        console.error(`Error adding item ${itemToAdd}:`, error.message);
    }

    await sauceDemoPage.goToCart();
    await expect(sauceDemoPage.cartItem).toHaveCount(1); // Expecting only 1 item in the cart

    // Proceed to checkout
    await sauceDemoPage.proceedToCheckout();

    // Fill in checkout information, handle missing last name
    await sauceDemoPage.fillCheckoutInformation(checkoutData.firstName, '', checkoutData.postalCode);

    // Verify that the Finish button is present and handle the click error
    try {
        await page.waitForSelector('[data-test="finish"]', { state: 'visible', timeout: 10000 });
        await sauceDemoPage.completeCheckout();
    } catch (error) {
        console.error('Error during checkout:', error.message);
        await page.screenshot({ path: '../test-result/debugging/checkout_error_state.png' }); // Take a screenshot for inspection
        throw error; // Rethrow to mark the test as failed
    }

    // Verify the order completion
    await sauceDemoPage.verifyOrderComplete();
    await sauceDemoPage.goBackToProducts();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
});
