const { expect } = require('@playwright/test');

class SwagLabsPage {
    constructor(page) {
        this.page = page;
        this.userNameInput = page.locator('#user-name');
        this.passwordInput = page.locator('#password');
        this.loginButton = page.locator('#login-button');
        this.sortDropdown = page.locator('//*[@id="header_container"]/div[2]/div/span/select');
        this.productNames = page.locator('.inventory_item_name');
        this.productPrices = page.locator('.inventory_item_price');
        this.shoppingCartLink = page.locator('.shopping_cart_link');
        this.cartItem = page.locator('.cart_item');
        this.removeButtonCSS = '[data-test="remove-sauce-labs-bike-light"]';
        this.removeButtonXPath = 'xpath=//*[@id="remove"]';
        this.inventoryItemName = page.locator('.inventory_item_name');
        this.backToProductsButton = page.locator('[data-test="back-to-products"]');
        this.completeHeader = page.locator('[data-test="complete-header"]');
        this.summaryInfoLabel = page.locator('[data-test="total-info-label"]');
        this.checkoutButton = page.locator('[data-test="checkout"]');
        this.firstNameInput = page.locator('[data-test="firstName"]');
        this.lastNameInput = page.locator('[data-test="lastName"]');
        this.postalCodeInput = page.locator('[data-test="postalCode"]');
        this.continueButton = page.locator('[data-test="continue"]');
        this.finishButton = page.locator('[data-test="finish"]');
        this.errorMessage = page.locator('.error-message-container');
    }

    async login(userName, password) {
        await this.userNameInput.fill(userName);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    async selectSortOption(option) {
        await this.page.waitForSelector('//*[@id="header_container"]/div[2]/div/span/select', { state: 'visible', timeout: 10000 });
        await this.page.selectOption('//*[@id="header_container"]/div[2]/div/span/select', { label: option });
    }

    async getProductNames() {
        const names = await this.productNames.allTextContents();
        return names.map(name => name.trim());
    }

    async getProductPrices() {
        const prices = await this.productPrices.allTextContents();
        return prices.map(price => price.trim());
    }

    async addItemToCart(itemSelector) {
        await this.page.click(itemSelector);
    }

    async viewProductDescription(itemXPath) {
        await this.page.click(`xpath=${itemXPath}`);
    }

    async removeItemFromCart() {
        await this.page.click(this.removeButtonCSS); // or use this.removeButtonXPath if needed
    }

    async goToCart() {
        await this.shoppingCartLink.click();
    }

    async proceedToCheckout() {
        await this.checkoutButton.click();
    }

    async fillCheckoutInformation(firstName, lastName, postalCode) {
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.postalCodeInput.fill(postalCode);
        await this.continueButton.click();
    }

    async completeCheckout() {
        await this.finishButton.click();
    }

    async verifyOrderComplete() {
        await expect(this.completeHeader).toHaveText('Thank you for your order!');
    }

    async verifyPriceTotal() {
        await expect(this.summaryInfoLabel).toHaveText('Price Total');
    }

    async verifyErrorMessage(expectedMessage) {
        await expect(this.errorMessage).toBeVisible();
        await expect(this.errorMessage).toHaveText(expectedMessage);
    }

    async goBackToProducts() {
        await this.backToProductsButton.click();
    }
}

module.exports = SwagLabsPage;
