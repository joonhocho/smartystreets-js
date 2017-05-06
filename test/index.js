import {describe, it} from 'mocha';
import {expect} from 'chai';
import smartystreets from '../lib';

describe('smartystreets', () => {
  const {
    usStreetSingle,
    usAutocomplete,
    internationalStreetSingle,
  } = smartystreets({
    authId: process.env.SMARTYSTREET_AUTH_ID,
    // authToken: process.env.SMARTYSTREET_AUTH_TOKEN,
    referer: process.env.SMARTYSTREET_REFERER,
  });

  it('usStreetSingle', (done) => {
    usStreetSingle({
      street: '3301 South Greenfield Rd',
      city: 'Gilbert',
      state: 'AZ',
      zipcode: '85297',
    }).then((res) => {
      console.log(res);
      expect(res).to.have.length.of.at.least(1);
      expect(res[0].delivery_line_1).to.equal('3301 S Greenfield Rd');
      done();
    }, done);
  });

  it('usAutocomplete', (done) => {
    usAutocomplete({
      prefix: '1600 amphitheatre pkwy',
    }).then((res) => {
      console.log(res);
      expect(res.suggestions).to.have.length.of.at.least(1);
      expect(res.suggestions[0].text).to.equal('1600 Amphitheatre Pkwy, Mountain View CA');
      done();
    }, done);
  });

  it('internationalStreetSingle', (done) => {
    internationalStreetSingle({
      country: 'Japan',
      address1: 'きみ野 6-1-8',
      locality: '大和市',
      administrative_area: '神奈川県',
      postal_code: '242-0001',
    }).then((res) => {
      console.log(res);
      expect(res).to.have.length.of.at.least(1);
      expect(res[0].address2).to.equal('神奈川県大和市きみ野6-1-8');
      done();
    }, done);
  });
});
