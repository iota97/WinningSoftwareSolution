const fs = require('fs');
const providerlink = fs.readFileSync("providerlink.secret").toString();
module.exports = {
  providerOptions: {fork: providerlink}
};