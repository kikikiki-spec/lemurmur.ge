(function (root) {
  function localDate(date = new Date()) {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }

  function isDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
    const date = new Date(value + 'T12:00:00');
    return !Number.isNaN(date.getTime()) && localDate(date) === value;
  }

  function nextDay(value) {
    if (!isDate(value)) return '';
    const date = new Date(value + 'T12:00:00');
    date.setDate(date.getDate() + 1);
    return localDate(date);
  }

  function validateEnquiry(data, today = localDate()) {
    if (!String(data.name || '').trim()) return 'nameRequired';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email || '').trim())) return 'emailInvalid';
    if (!isDate(data.arrival) || !isDate(data.departure)) return 'datesRequired';
    if (data.arrival < today) return 'arrivalPast';
    if (data.departure <= data.arrival) return 'departureInvalid';
    const guestCount = Number(data.guests);
    if (!Number.isSafeInteger(guestCount) || guestCount < 1) return 'guestsInvalid';
    return null;
  }

  function createEmailBody(data, language) {
    return ['LE MURMURE — Reservation enquiry', '', 'Name: ' + String(data.name).trim(), 'Email: ' + String(data.email).trim(), 'Phone: ' + (data.phone || 'Not provided'), 'Arrival: ' + data.arrival, 'Departure: ' + data.departure, 'Guests: ' + data.guests, 'Stay: ' + (data.stay || 'general'), 'Message: ' + (data.message || 'None'), '', 'Website language: ' + language, '', 'This is an enquiry, not a confirmed reservation.'].join('\r\n');
  }

  function createEmailUrl(data, language) {
    return 'mailto:businesshalllemurmure@gmail.com?subject=' + encodeURIComponent('LE MURMURE — Reservation enquiry') + '&body=' + encodeURIComponent(createEmailBody(data, language));
  }

  const api = { localDate, nextDay, validateEnquiry, createEmailBody, createEmailUrl };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LeMurmureCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
