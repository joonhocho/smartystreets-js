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
import vcard from 'smartystreets-js';

const vcardContent = vcard({
  name: {
    familyName: 'Doe',
    givenName: 'John',
    middleName: 'Philip',
    prefix: 'Dr.',
    suffix: 'Jr.',
  },
```
