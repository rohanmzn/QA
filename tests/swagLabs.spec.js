const { test, expect } = require('@playwright/test');
const SwagLabsPage = require('../pageObjects/swagLabs.po');
const { loginAndAddItemsToCart } = require('../helpers/swagLabsHelper');
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
        const swagLabsPage = new SwagLabsPage(page);
        await swagLabsPage.login(user, password);

        if (user === 'locked_out_user') {
            await swagLabsPage.verifyErrorMessage('Epic sadface: Sorry, this user has been locked out.');
        } else {
            await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
            await expect(page.locator('.title')).toHaveText('Products');
        }
    });
});

// Test for empty username
test('Login with empty username and handle error', async ({ page }) => {
    const swagLabsPage = new SwagLabsPage(page);
    await swagLabsPage.login('', password);

    // Verify error message for empty username
    await swagLabsPage.verifyErrorMessage('Epic sadface: Username is required');
});

// Test for empty password
test('Login with empty password and handle error', async ({ page }) => {
    const swagLabsPage = new SwagLabsPage(page);
    await swagLabsPage.login('standard_user', '');

    // Verify error message for empty password
    await swagLabsPage.verifyErrorMessage('Epic sadface: Password is required');
});

// Test for wrong username
test('Login with wrong username and handle error', async ({ page }) => {
    const swagLabsPage = new SwagLabsPage(page);
    await swagLabsPage.login('wrong_user', password);

    // Verify error message for wrong username
    await swagLabsPage.verifyErrorMessage('Epic sadface: Username and password do not match any user in this service');
});

// Test for wrong password
test('Login with wrong password and handle error', async ({ page }) => {
    const swagLabsPage = new SwagLabsPage(page);
    await swagLabsPage.login('standard_user', 'wrong_password');

    // Verify error message for wrong password
    await swagLabsPage.verifyErrorMessage('Epic sadface: Username and password do not match any user in this service');
});

// Test for wrong password
test('Login with empty username and password', async ({ page }) => {
    const swagLabsPage = new SwagLabsPage(page);
    await swagLabsPage.login('', '');

    // Verify error message for wrong password
    await swagLabsPage.verifyErrorMessage('Epic sadface: Username is required');
});

test('Login with valid username and empty password', async ({ page }) => {
    const swagLabsPage = new SwagLabsPage(page);
    await swagLabsPage.login('standard_user', '');

    // Verify error message for wrong password
    await swagLabsPage.verifyErrorMessage('Epic sadface: Password is required');
});

// Add multiple items to cart, view product description, remove item, and complete checkout
test('Add multiple items to cart, view product description, remove item, and complete checkout', async ({ page }) => {
    const swagLabsPage = new SwagLabsPage(page);
    await swagLabsPage.login('standard_user', password);

    // Add items to the cart
    for (const item of itemsToAdd) {
        await swagLabsPage.addItemToCart(item);
    }

    await swagLabsPage.goToCart();
    await expect(swagLabsPage.cartItem).toHaveCount(6);

    // Remove one item from the cart using Playwright methods directly
    await page.click('xpath=//*[@id="remove-sauce-labs-bike-light"]'); // Adjust XPath as needed
    await expect(swagLabsPage.cartItem).toHaveCount(5);

    // View product description and remove an item
    await swagLabsPage.viewProductDescription('//*[@id="item_4_title_link"]/div');
    await page.screenshot({ path: '../test-result/debugging/cart_page.png' }); // Take a screenshot for debugging

    await page.click('xpath=//*[@id="remove"]'); // Adjust XPath as needed

    // Go back to the cart
    await swagLabsPage.goToCart();
    await expect(swagLabsPage.cartItem).toHaveCount(4); // Ensure 4 items are left in the cart

    // Proceed to checkout
    await swagLabsPage.proceedToCheckout();
    await swagLabsPage.fillCheckoutInformation(checkoutData.firstName, checkoutData.lastName, checkoutData.postalCode);

    // Verify checkout overview and price total label
    await expect(page).toHaveURL(/.*checkout-step-two.html/);
    await swagLabsPage.verifyPriceTotal();

    // Finish checkout
    await swagLabsPage.completeCheckout();
    await expect(page).toHaveURL(/.*checkout-complete.html/);
    await swagLabsPage.verifyOrderComplete();

    // Go back to the home page
    await swagLabsPage.goBackToProducts();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
});

// Logout test for standard_user
test('Logout after login', async ({ page }) => {
    const swagLabsPage = new SwagLabsPage(page);
    await swagLabsPage.login('standard_user', password);

    await page.click('#react-burger-menu-btn');
    await page.click('#logout_sidebar_link');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
});

// Visual regression test for visual_user
test('Visual regression for inventory page', async ({ page }) => {
    const swagLabsPage = new SwagLabsPage(page);
    await swagLabsPage.login('visual_user', password);

    await page.waitForSelector('.inventory_list');
    expect(await page.screenshot()).toMatchSnapshot('inventory_page.png');
});

// Performance test for performance_glitch_user
test('Check loading time for performance_glitch_user', async ({ page }) => {
    const swagLabsPage = new SwagLabsPage(page);
    const start = new Date();
    await swagLabsPage.login('performance_glitch_user', password);
    await page.waitForSelector('.inventory_list');
    const end = new Date();
    const loadTime = end - start;

    console.log(`Load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000); // Example threshold for acceptable load time
});

// Test for problem_user's image issue
test('Check image issue for problem_user', async ({ page }) => {
    const swagLabsPage = new SwagLabsPage(page);
    await swagLabsPage.login('problem_user', 'secret_sauce');

    // Use locator to find the image
    const brokenImageLocator = page.locator('img[src="/static/media/sl-404.168b1cce.jpg"]');

    // Assert that the image is visible
    await expect(brokenImageLocator).toBeVisible();
});

// Test for error_user
test('Login with error_user expected cart items (6) received cart items(3)', async ({ page }) => {
    const swagLabsPage = new SwagLabsPage(page);
    await swagLabsPage.login('error_user', password);

    // Attempt to add items to the cart
    for (const item of itemsToAdd) {
        try {
            await swagLabsPage.addItemToCart(item);
        } catch (error) {
            console.error(`Error adding item ${item}:`, error.message);
        }
    }

    await swagLabsPage.goToCart();
    await expect(swagLabsPage.cartItem).toHaveCount(itemsToAdd.length);
});

test('Login with error_user and handle checkout-> finish issues', async ({ page }) => {
    const swagLabsPage = new SwagLabsPage(page);
    await swagLabsPage.login('error_user', password);

    // Add only the first item from the itemsToAdd array
    const itemToAdd = itemsToAdd[0]; // Adjust this index if you want a specific item

    try {
        await swagLabsPage.addItemToCart(itemToAdd);
    } catch (error) {
        console.error(`Error adding item ${itemToAdd}:`, error.message);
    }

    await swagLabsPage.goToCart();
    await expect(swagLabsPage.cartItem).toHaveCount(1); // Expecting only 1 item in the cart

    // Proceed to checkout
    await swagLabsPage.proceedToCheckout();

    // Fill in checkout information, handle missing last name
    await swagLabsPage.fillCheckoutInformation(checkoutData.firstName, '', checkoutData.postalCode);

    // Verify that the Finish button is present and handle the click error
    try {
        await page.waitForSelector('[data-test="finish"]', { state: 'visible', timeout: 10000 });
        await swagLabsPage.completeCheckout();
    } catch (error) {
        console.error('Error during checkout:', error.message);
        await page.screenshot({ path: '../test-result/debugging/checkout_error_state.png' }); // Take a screenshot for inspection
        throw error; // Rethrow to mark the test as failed
    }

    // Verify the order completion
    await swagLabsPage.verifyOrderComplete();
    await swagLabsPage.goBackToProducts();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
});

test('Sorting functionality: A to Z, Z to A, low to high, high to low', async ({ page }) => {
    const swagLabsPage = new SwagLabsPage(page);
    await swagLabsPage.login('standard_user', password);

    const sortingOptions = {
        'Name (A to Z)': (a, b) => a.localeCompare(b),
        'Name (Z to A)': (a, b) => b.localeCompare(a),
        'Price (low to high)': (a, b) => parseFloat(a.replace('$', '')) - parseFloat(b.replace('$', '')),
        'Price (high to low)': (a, b) => parseFloat(b.replace('$', '')) - parseFloat(a.replace('$', ''))
    };

    for (const [optionLabel, sortFunction] of Object.entries(sortingOptions)) {
        await swagLabsPage.selectSortOption(optionLabel);

        // Extract product names or prices
        const productNames = await swagLabsPage.getProductNames();
        const productPrices = await swagLabsPage.getProductPrices();

        // Apply sorting function
        const sortedNames = [...productNames].sort(sortFunction);
        const sortedPrices = [...productPrices].sort(sortFunction);

        // Validate that the product names or prices are sorted correctly
        if (optionLabel.startsWith('Name')) {
            expect(productNames).toEqual(sortedNames);
        } else if (optionLabel.startsWith('Price')) {
            expect(productPrices).toEqual(sortedPrices);
        }
    }
});

test.describe('Social Media Links', () => {
    test('should open the correct social media pages in new popups', async ({ page }) => {
        const swagLabsPage = new SwagLabsPage(page);

        // Fill in the login form using fixtures for username and password
        await swagLabsPage.login(users[0], password); // Using the first user from the users array

        // Click the Twitter link and verify the URL in the new popup
        const twitterPromise = page.waitForEvent('popup');
        await page.locator('[data-test="social-twitter"]').click();
        const twitterPage = await twitterPromise;
        await twitterPage.waitForLoadState();
        expect(twitterPage.url()).toBe('https://x.com/saucelabs');

        // Click the Facebook link and verify the URL in the new popup
        const facebookPromise = page.waitForEvent('popup');
        await page.locator('[data-test="social-facebook"]').click();
        const facebookPage = await facebookPromise;
        await facebookPage.waitForLoadState();
        expect(facebookPage.url()).toBe('https://www.facebook.com/saucelabs');

        // Click the LinkedIn link and verify the URL in the new popup
        const linkedinPromise = page.waitForEvent('popup');
        await page.locator('[data-test="social-linkedin"]').click();
        const linkedinPage = await linkedinPromise;
        await linkedinPage.waitForLoadState();
        expect(linkedinPage.url()).toBe('https://www.linkedin.com/company/sauce-labs/');
    });
  });
test.only.describe('Reset the app state', () => {
    test('should reset the app state after adding items and verify all buttons are reset to "Add to cart"', async ({ page }) => {
        await loginAndAddItemsToCart(page);

        // Verify that all items have the "Add to cart" button instead of "Remove"
        for (const item of itemsToAdd) {
            const addButton = page.locator(item);
            await expect(addButton).toBeVisible(); // "Add to cart" button should be visible
        }
    });

    test('should reset the app state after adding items and verify the cart is empty', async ({ page }) => {
        await loginAndAddItemsToCart(page);

        // Verify that the cart is empty after resetting
        await page.locator('[data-test="shopping-cart-link"]').click();
        const cartItems = await page.locator('.cart_item').count();
        expect(cartItems).toBe(0); // Cart should be empty
    });
});
