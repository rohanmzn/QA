// @ts-check
// @ts-ignore
const { test, expect, describe } = require('@playwright/test');
const testData = require('../../fixtures/loginFixture.json');
const { PO } = require('../../pageObjects/addContact.po.js');
const apiToken = process.env.API_TOKEN; // Store your token in an environment variable

test.beforeEach(async ({ page }) => {
  await page.goto('https://thinking-tester-contact-list.herokuapp.com/');
  await expect(page).toHaveTitle(/Contact List App/);
});

describe('Thinking Tester Contact Login Positive Tests', () => {
  test('Adding Contact', async ({ page }) => {
    const pageObj = new PO(page);
    await pageObj.login(testData.addContact.username, testData.addContact.password);

    // await pageObj.addContact(testData.addContact.firstName,testData.addContact.lastName);
    // await pageObj.addContact(testData.addContact.firstName1,testData.addContact.lastName1);
    // await pageObj.addContact(testData.addContact.firstName2,testData.addContact.lastName2);
  });
});

describe('Thinking Tester Contact API Tests', () => {
  test('Edit Contact', async ({ page, request }) => {
    const pageObj = new PO(page);
    await pageObj.login(testData.addContact.username, testData.addContact.password);

    // Assuming you have a contact with the name 'Rohan' that you want to edit
    const contactToEdit = {
      firstName: 'Rohan',
      lastName: 'UpdatedLastName', // New last name
    };

    const response = await request.put(`https://thinking-tester-contact-list.herokuapp.com/api/contacts/${contactToEdit.firstName}`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        lastName: contactToEdit.lastName
      }
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.lastName).toBe(contactToEdit.lastName);
  });
});

