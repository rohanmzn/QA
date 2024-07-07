const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../fixtures/loginFixture.json');

fs.access(filePath, fs.constants.F_OK, (err) => {
  if (err) {
    console.error(`${filePath} does not exist.`);
  } else {
    console.log(`${filePath} exists.`);
    
    // Attempt to require the JSON file
    try {
      const testData = require(filePath);
      console.log('File content:', testData);
    } catch (e) {
      console.error('Error requiring JSON file:', e);
    }
  }
});
