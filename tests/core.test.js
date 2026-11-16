const test = require('node:test');
const assert = require('node:assert/strict');
const { nextDay, validateEnquiry, createEmailUrl } = require('../core.js');

const valid = { name: 'ნინო Test', email: 'guest@example.com', phone: '+995 555 123 456', arrival: '2027-01-30', departure: '2027-02-02', guests: '2', stay: 'extended', message: 'Quiet room, please. & thanks!' };
test('departure minimum rolls across months and leap years', () => {
  assert.equal(nextDay('2027-01-31'), '2027-02-01');
  assert.equal(nextDay('2028-02-28'), '2028-02-29');
  assert.equal(nextDay('2027-12-31'), '2028-01-01');
});
test('enquiry requires future arrival and strictly later departure', () => {
  assert.equal(validateEnquiry(valid, '2027-01-01'), null);
  assert.equal(validateEnquiry({ ...valid, arrival: '2026-12-31' }, '2027-01-01'), 'arrivalPast');
  assert.equal(validateEnquiry({ ...valid, departure: valid.arrival }, '2027-01-01'), 'departureInvalid');
  assert.equal(validateEnquiry({ ...valid, arrival: '2027-02-30' }, '2027-01-01'), 'datesRequired');
});
test('enquiry rejects blank names, malformed emails and noninteger guests', () => {
  assert.equal(validateEnquiry({ ...valid, name: ' ' }), 'nameRequired');
  assert.equal(validateEnquiry({ ...valid, email: 'bad-address' }), 'emailInvalid');
  for (const guests of ['0', '-1', '1.5', 'abc', '']) assert.equal(validateEnquiry({ ...valid, guests }), 'guestsInvalid');
});
test('email preserves multilingual content and encodes user input as body text', () => {
  const emailUrl = createEmailUrl(valid, 'ka');
  assert.ok(emailUrl.startsWith('mailto:businesshalllemurmure@gmail.com?'));
  const params = new URLSearchParams(emailUrl.split('?')[1]);
  assert.equal(params.get('subject'), 'LE MURMURE — Reservation enquiry');
  assert.match(params.get('body'), /ნინო Test/);
  assert.match(params.get('body'), /Quiet room, please\. & thanks!/);
  assert.match(params.get('body'), /Website language: ka/);
  assert.match(params.get('body'), /not a confirmed reservation/);
  assert.equal([...params.keys()].length, 2);
});
