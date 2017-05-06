const statusCodes = {
  // A JSON array containing zero or more address matches for the input provided
  // with the request. If none of the submitted addresses validate, the array
  // will be empty ([]). The structure of the response is the same for both GET
  // and POST requests.
  200: 'OK',

  // (Malformed Payload): Inputs from the request could not be interpreted.
  // A GET request lacked a street field or the request body of a POST request
  // contained malformed JSON.
  400: 'Bad Request',

  // The credentials were provided incorrectly or did not match any existing,
  // active credentials.
  401: 'Unauthorized',

  // There is no active subscription for the account associated with the-
  // credentials submitted with the request.
  402: 'Payment Required',

  // Because the international service is currently in a limited release phase,
  // only approved accounts may access the service. Please contact us for your account to be granted access.
  403: 'Forbidden',

  // The maximum size for a request body to this API is 32K (32,768 bytes).
  413: 'Request Entity Too Large',

  // The value of the prefix input parameter was too long and could not be processed.
  422: 'Unprocessable Entity',

  // When using public "website key" authentication, we restrict the number of
  // requests coming from a given source over too short of a time.
  // If you use "website key" authentication, you can avoid this error by adding
  // your IP address as an authorized host for the website key in question.
  429: 'Too Many Requests',

  // Our own upstream data provider did not respond in a timely fashion and
  // the request failed. A serious, yet rare occurrence indeed.
  504: 'Gateway Timeout',
};

const isSet = (x) => x;

const toJSON = (res) => {
  const {status} = res;
  if (status >= 400) {
    const error = new Error(statusCodes[status] || res.statusText);
    error.code = status;
    throw error;
  }
  return res.json();
};

const matchAllowed = ['strict', 'range', 'invalid'];

export default ({
  authId,
  authToken,
  autoCorrectParams = false,
}) => {
  if (typeof fetch !== 'function') {
    throw new Error('global fetch() must be provided.');
  }

  if (!authId || !authToken) {
    throw new Error('Auth Id and Auth Token are required');
  }

  const maxChars = autoCorrectParams ?
    (val, maxLen) => {
      if (val == null) return null;
      if (typeof val !== 'string') {
        return null;
      }
      if (val.length > maxLen) {
        return val.substring(0, maxLen);
      }
      return val;
    } :
    (val, maxLen, name) => {
      if (val == null) return null;
      if (typeof val !== 'string') {
        throw new Error(`${name} must be string.`);
      }
      if (val.length > maxLen) {
        throw new Error(`${name} is too long. max=${maxLen}`);
      }
      return val;
    };

  const maxNum = autoCorrectParams ?
    (val, max) => {
      if (val == null) return null;
      if (typeof val !== 'number') {
        return null;
      }
      if (val > max) {
        return max;
      }
      return val;
    } :
    (val, max, name) => {
      if (val == null) return null;
      if (typeof val !== 'number') {
        throw new Error(`${name} must be number.`);
      }
      if (val > max) {
        throw new Error(`${name} is too large. max=${max}`);
      }
      return val;
    };

  const maxCharsList = autoCorrectParams ?
    (list, maxLen) => {
      if (list == null) return null;
      if (!Array.isArray(list)) {
        return null;
      }
      return list.map((val) => maxChars(val, maxLen)).filter(isSet);
    } :
    (list, maxLen, name) => {
      if (list == null) return null;
      if (!Array.isArray(list)) {
        throw new Error(`${name} must be array.`);
      }
      return list.map((val) => maxChars(val, maxLen, name)).filter(isSet);
    };

  const bool = autoCorrectParams ?
    (val) => {
      if (val == null) return null;
      return Boolean(val);
    } :
    (val, name) => {
      if (val == null) return null;
      if (typeof val !== 'boolean') {
        throw new Error(`${name} must be boolean.`);
      }
      return val;
    };

  const list = autoCorrectParams ?
    (val, allowed) => {
      if (val == null) return null;
      if (allowed.indexOf(val) === -1) {
        return null;
      }
      return val;
    } :
    (val, allowed, name) => {
      if (val == null) return null;
      if (allowed.indexOf(val) === -1) {
        throw new Error(`${name} is invalid.`);
      }
      return val;
    };

  const authIdAndAuthToken = `auth-id=${encodeURIComponent(authId)}&auth-token=${encodeURIComponent(authToken)}`;


  // street + city + state
  // street + zipcode
  // street (entire address in the street field - what we call a "freeform" input)
  const usStreetSingle = ({
    input_id,
    street,
    street2,
    secondary,
    city,
    state,
    zipcode,
    lastline,
    addressee,
    urbanization,
    candidates,
    match,
  }) => {
    // A unique identifier for this address used in your application;
    // this field will be copied into the output.
    input_id = maxChars(input_id, 36, 'input_id');

    // The street line of the address, or the entire address ("freeform" input).
    // Freeform inputs should NOT include any form of country information (like "USA").
    street = maxChars(street, 64, 'street');

    // Any extra address information (e.g., Leave it on the front porch.)
    street2 = maxChars(street2, 64, 'street2');

    // Apartment, suite, or office number (e.g., "Apt 52" or simply "52"; not "Apt52".)
    secondary = maxChars(secondary, 32, 'secondary');

    // The city name
    city = maxChars(city, 64, 'city');

    // The state name or abbreviation
    state = maxChars(state, 32, 'state');

    // The ZIP Code
    zipcode = maxChars(zipcode, 16, 'zipcode');

    // City, state, and ZIP Code combined
    lastline = maxChars(lastline, 64, 'lastline');

    // The name of the recipient, firm, or company at this address
    addressee = maxChars(addressee, 64, 'addressee');

    // Only used with Puerto Rico
    urbanization = maxChars(urbanization, 64, 'urbanization');

    // The maximum number of valid addresses returned when the input is ambiguous
    candidates = maxNum(candidates, 10, 'candidates');

    // The match output strategy to be employed for this lookup. Valid values are:
    // strict: The API will ONLY return candidates that are valid USPS addresses.
    // range: The API will return candidates that are valid USPS addresses,
    // as well as invalid addresses with primary numbers that fall within a valid range for the street.
    // invalid: The API will return a single candidate for every properly
    // submitted address, even if invalid or ambiguous.
    // Because range and invalid are not compatible with freeform address input,
    // the strict match output strategy will be employed in those cases
    // regardless of the provided match output strategy value.
    match = list(match, matchAllowed);

    const query = [
      authIdAndAuthToken,
      input_id && `input_id=${encodeURIComponent(input_id)}`,
      street && `street=${encodeURIComponent(street)}`,
      street2 && `street2=${encodeURIComponent(street2)}`,
      secondary && `secondary=${encodeURIComponent(secondary)}`,
      city && `city=${encodeURIComponent(city)}`,
      state && `state=${encodeURIComponent(state)}`,
      zipcode && `zipcode=${encodeURIComponent(zipcode)}`,
      lastline && `lastline=${encodeURIComponent(lastline)}`,
      addressee && `addressee=${encodeURIComponent(addressee)}`,
      urbanization && `urbanization=${encodeURIComponent(urbanization)}`,
      candidates && `candidates=${candidates}`,
      match && `match=${encodeURIComponent(match)}`,
    ].filter(isSet).join('&');

    return fetch(`https://us-street.api.smartystreets.com/street-address?${query}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Host: 'us-street.api.smartystreets.com',
      },
    }).then(toJSON);
  };


  // street + city + state
  // street + zipcode
  // street (entire address in the street field - what we call a "freeform" input)
  const usAutocomplete = ({
    prefix,
    suggestions,
    city_filter,
    state_filter,
    // prefer,
    // geolocate,
    // geolocate_precision,
  }) => {
    // Required. The part of the address that has already been typed. Maximum length is 128 bytes.
    prefix = maxChars(prefix, 128, 'prefix');

    // Maximum number of address suggestions, range [1, 10]. Default is 10.
    suggestions = maxNum(suggestions, 10, 'suggestions');

    // A list of city names, separated by commas, to which to limit the results.
    city_filter = maxCharsList(city_filter, 64, 'city_filter');

    // A list of state names (2-letter abbreviations), separated by commas, to which to limit the results.
    state_filter = maxCharsList(state_filter, 2, 'state_filter');

    // UNSUPPORTED
    // A list of cities/states to prefer at the top of the results. See preferencing for more information.
    // prefer = maxChars(prefer, 128, 'prefer');

    // UNSUPPORTED
    // Whether to prefer address suggestions in the user's city and state, based on their IP address.
    // geolocate = bool(geolocate, 128, 'geolocate');

    // UNSUPPORTED
    // If the geolocate field is set to true then setting this field to city causes
    // the geolocated results that bubble up to the top of the response to be from
    // the city/state corresponding to the sender's IP address.
    // Setting this field to state causes results from the sender's entire state to be preferred.
    // geolocate_precision = maxChars(geolocate_precision, 128, 'geolocate_precision');

    const query = [
      authIdAndAuthToken,
      prefix && `prefix=${encodeURIComponent(prefix)}`,
      suggestions && `suggestions=${suggestions}`,
      city_filter && city_filter.length && `city_filter=${encodeURIComponent(city_filter.join(','))}`,
      state_filter && state_filter.length && `state_filter=${encodeURIComponent(state_filter.join(','))}`,
    ].filter(isSet).join('&');

    return fetch(`https://us-autocomplete.api.smartystreets.com/suggest?${query}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Host: 'us-autocomplete.api.smartystreets.com',
      },
    }).then(toJSON);
  };


  // country + freeform
  // country + address1 + postal_code
  // country + address1 + locality + administrative_area
  const internationalStreetSingle = ({
    input_id,
    country,
    geocode,
    language,
    freeform,
    address1,
    address2,
    address3,
    address4,
    organization,
    locality,
    administrative_area,
    postal_code,
  }) => {
    // A unique identifier generated by you for this address for use within your application;
    // this field will be copied into the output.
    input_id = maxChars(input_id, 36, 'input_id');

    // (required) This must be entered with every address. Country Name or ISO classification (ISO-3, ISO-2 or ISO-N). Address validation will fail if this is missing.
    // (e.g., Brazil, BRA, BR, or 076)
    country = maxChars(country, 64, 'country');

    // Set to true to enable geocoding (disabled by default). See the examples section for, well, an example.
    geocode = bool(geocode, 'geocode');

    // When not set, the output language will match the language of the input values.
    // When set to native the results will always be in the language of the output country.
    // When set to latin the results will always be provided using a Latin character set.
    language = maxChars(language, 6, 'language');

    // The entire address in a single field (without the country).
    // If freeform is specified, all other address input fields (except country) will be ignored.
    // (e.g., Via Santa Maria di Costantinopoli, 72 46030-Tabellano MN)
    freeform = maxChars(freeform, 512, 'freeform');

    // The first address line
    // (e.g., Calle Proc. San Sebastián, 15)
    address1 = maxChars(address1, 64, 'address1');

    // The second address line (if any)
    address2 = maxChars(address2, 64, 'address2');

    // The third address line (if any)
    address3 = maxChars(address3, 64, 'address3');

    // The fourth address line (if any)
    address4 = maxChars(address4, 64, 'address4');

    // The name of the recipient, firm, or company at this address
    // (e.g., Robert Smith OR The Clean Oil Company)
    organization = maxChars(organization, 64, 'organization');

    // The city name
    // (e.g., Paris)
    locality = maxChars(locality, 64, 'locality');

    // The state or province name or abbreviation
    // (e.g., Alberta or AB)
    administrative_area = maxChars(administrative_area, 32, 'administrative_area');

    // The postal code
    // (e.g., 90210-2301)
    postal_code = maxChars(postal_code, 16, 'postal_code');

    const query = [
      authIdAndAuthToken,
      input_id && `input_id=${encodeURIComponent(input_id)}`,
      country && `country=${encodeURIComponent(country)}`,
      geocode && `geocode=${encodeURIComponent(geocode)}`,
      language && `language=${encodeURIComponent(language)}`,
      freeform && `freeform=${encodeURIComponent(freeform)}`,
      address1 && `address1=${encodeURIComponent(address1)}`,
      address2 && `address2=${encodeURIComponent(address2)}`,
      address3 && `address3=${encodeURIComponent(address3)}`,
      address4 && `address4=${encodeURIComponent(address4)}`,
      organization && `organization=${encodeURIComponent(organization)}`,
      locality && `locality=${encodeURIComponent(locality)}`,
      administrative_area && `administrative_area=${encodeURIComponent(administrative_area)}`,
      postal_code && `postal_code=${encodeURIComponent(postal_code)}`,
    ].filter(isSet).join('&');

    return fetch(`https://international-street.api.smartystreets.com/verify?${query}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Host: 'international-street.api.smartystreets.com',
      },
    }).then(toJSON);
  };

  return {
    usStreetSingle,
    usAutocomplete,
    internationalStreetSingle,
  };
};
