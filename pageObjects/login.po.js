const { expect } = require("@playwright/test");

exports.LoginPage = class LoginPage {
    constructor(page) {
        this.page = page;
        this.usernameInput = 'input[data-test="username"]';
        this.passwordInput = 'input[data-test="password"]';
        this.loginButton = 'input[data-test="login-button"]';
    }
    async login(username, password) {
        await this.page.locator(this.usernameInput).fill(username);
        await this.page.locator(this.passwordInput).fill(password);
        await this.page.locator(this.loginButton).click();
    }

}