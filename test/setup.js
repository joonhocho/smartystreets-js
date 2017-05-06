require('dotenv').config();
var chai = require('chai');
chai.use(require('chai-as-promised'));
global.fetch = require('node-fetch');
