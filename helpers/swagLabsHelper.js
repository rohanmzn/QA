const SwagLabsPage = require('../pageObjects/swagLabs.po');
const testData = require('../fixtures/swagLabsFixture.json');

const users = testData.users;
const password = testData.password;
const itemsToAdd = testData.itemsToAdd;


//for reset the state only
async function loginAndAddItemsToCart(page) {
    const swagLabsPage = new SwagLabsPage(page);

    await swagLabsPage.login(users[0], password);

    for (const item of itemsToAdd) {
        await swagLabsPage.addItemToCart(item);
    }

    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.locator('[data-test="reset-sidebar-link"]').click();
    await page.getByRole('button', { name: 'Close Menu' }).click();
}

module.exports = { loginAndAddItemsToCart };