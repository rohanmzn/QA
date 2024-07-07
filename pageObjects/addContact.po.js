const { expect } = require("@playwright/test");

exports.PO = class PO {
    constructor(page) {
        this.page = page;  // Add this line to assign the page object
        
        this.usernameFieldXPath = '//*[@id="email"]';
        this.passwordFieldXPath = '//*[@id="password"]';
        this.loginButtonXPath = '//*[@id="submit"]';

        this.addNewContactXPath = '//*[@id="add-contact"]';
        
        this.firstNameXPath = '//*[@id="firstName"]';
        this.lastNameXPath = '//*[@id="lastName"]';
        this.submitButtonXPath = '//*[@id="submit"]';

        this.editButtonXPath = '//*[@id="edit-contact"]';
    }
    
    async login(username, password) {
        await this.page.locator(this.usernameFieldXPath).fill(username);
        await this.page.locator(this.passwordFieldXPath).fill(password);
        
        await this.page.locator(this.loginButtonXPath).click();
        
    }
    async addContact(firstName, lastName){
        
        await this.page.locator(this.addNewContactXPath).click();
        
        await this.page.locator(this.firstNameXPath).fill(firstName);
        await this.page.locator(this.lastNameXPath).fill(lastName);

        await this.page.locator(this.submitButtonXPath).click();

    }
}
