const SwagLabsPage = require('../pageObjects/swagLabs.po');
const testData = require('../fixtures/swagLabsFixture.json');

const users = testData.users;
const password = testData.password;
const itemsToAdd = testData.itemsToAdd;


//for reset the state only
async function loginAndAddItemsToCart(page) {
    const swagLabsPage = new SwagLabsPage(page);

    // Fill in the login form using fixtures for username and password
    await swagLabsPage.login(users[0], password); // Using the first user from the users array

    // Add items to the cart
    for (const item of itemsToAdd) {
        await swagLabsPage.addItemToCart(item);
    }

    // Open the menu and reset the cart
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.locator('[data-test="reset-sidebar-link"]').click();
    await page.getByRole('button', { name: 'Close Menu' }).click();
}

module.exports = { loginAndAddItemsToCart };