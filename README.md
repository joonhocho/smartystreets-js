# smartystreets-js
[![Build Status](https://travis-ci.org/joonhocho/smartystreets-js.svg?branch=master)](https://travis-ci.org/joonhocho/smartystreets-js)
[![Coverage Status](https://coveralls.io/repos/github/joonhocho/smartystreets-js/badge.svg?branch=master)](https://coveralls.io/github/joonhocho/smartystreets-js?branch=master)
[![npm version](https://badge.fury.io/js/smartystreets-js.svg)](https://badge.fury.io/js/smartystreets-js)
[![Dependency Status](https://david-dm.org/joonhocho/smartystreets-js.svg)](https://david-dm.org/joonhocho/smartystreets-js)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://doge.mit-license.org)


JS client for SmartyStreets API. Address autocomplete and verification.


### Install
```
npm install --save smartystreets-js
```


### Usage
```javascript
import smartystreets from 'smartystreets-js';

const {
  usStreetSingle,
  usAutocomplete,
  internationalStreetSingle,
} = smartystreets({
  authId: process.env.SMARTYSTREET_AUTH_ID,
  authToken: process.env.SMARTYSTREET_AUTH_TOKEN,
});

usStreetSingle({
  street: '3301 South Greenfield Rd',
  city: 'Gilbert',
  state: 'AZ',
  zipcode: '85297',
}).then((res) => {
  console.log(res);
});

usAutocomplete({
  prefix: '1600 amphitheatre pkwy',
}).then((res) => {
  console.log(res);
});

internationalStreetSingle({
  country: 'Japan',
  address1: 'きみ野 6-1-8',
  locality: '大和市',
  administrative_area: '神奈川県',
  postal_code: '242-0001',
}).then((res) => {
  console.log(res);
});
```
