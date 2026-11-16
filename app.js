(function () {
  const dictionaries = window.LEMURMURE_TRANSLATIONS;
  const core = window.LeMurmureCore;
  const languageKey = 'lemurmure-language';
  const htmlKeys = new Set(['heroTitle', 'aboutTitle', 'apartmentsTitle', 'amenitiesTitle', 'galleryTitle', 'locationTitle', 'bookingTitle', 'address']);
  document.querySelectorAll('[data-i18n]').forEach(element => {
    dictionaries.ka[element.dataset.i18n] = htmlKeys.has(element.dataset.i18n) ? element.innerHTML : element.textContent;
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(element => {
    dictionaries.ka[element.dataset.i18nAria] = element.getAttribute('aria-label');
  });
  document.querySelectorAll('[data-i18n-alt]').forEach(element => {
    dictionaries.ka[element.dataset.i18nAlt] = element.alt;
  });

  let currentLanguage = 'ka';
  let currentError = null;
  let currentEnquiry = null;
  let currentImage = 0;
  const form = document.getElementById('reservation-form');
  const errorElement = document.getElementById('form-error');
  const menu = document.getElementById('mobile-menu');
  const menuToggle = document.querySelector('.menu-toggle');
  const galleryDialog = document.getElementById('gallery-dialog');
  const enquiryDialog = document.getElementById('enquiry-dialog');
  const galleryImages = [
    { src: 'assets/lobby.jpg', alt: 'lobbyAlt' },
    { src: 'assets/bedroom.jpg', alt: 'bedroomAlt' },
    { src: 'assets/living.jpg', alt: 'livingAlt' }
  ];
  function translate(key) { return dictionaries[currentLanguage][key] || dictionaries.ka[key] || key; }
  function updateGallery() {
    const image = galleryImages[currentImage];
    document.getElementById('lightbox-image').src = image.src;
    document.getElementById('lightbox-image').alt = translate(image.alt);
    document.getElementById('lightbox-counter').textContent = ' / ' + String(currentImage + 1).padStart(2, '0') + ' — 03';
  }
  function updateEnquiry() {
    if (!currentEnquiry) return;
    document.getElementById('enquiry-preview').textContent = core.createEmailBody(currentEnquiry, currentLanguage);
    document.getElementById('email-link').href = core.createEmailUrl(currentEnquiry, currentLanguage);
    document.getElementById('copy-status').textContent = '';
  }
  function setLanguage(language) {
    if (!Object.hasOwn(dictionaries, language)) language = 'ka';
    currentLanguage = language;
    document.documentElement.lang = language;
    document.title = translate('pageTitle');
    document.querySelector('meta[name="description"]').content = translate('description');
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.dataset.i18n;
      if (htmlKeys.has(key)) element.innerHTML = translate(key);
      else element.textContent = translate(key);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(element => element.setAttribute('aria-label', translate(element.dataset.i18nAria)));
    document.querySelectorAll('[data-i18n-alt]').forEach(element => { element.alt = translate(element.dataset.i18nAlt); });
    document.querySelectorAll('[data-lang]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === language)));
    if (currentError) errorElement.textContent = translate(currentError);
    menuToggle.setAttribute('aria-label', translate(menu.open ? 'closeMenu' : 'openMenu'));
    updateGallery();
    updateEnquiry();
    try { localStorage.setItem(languageKey, language); } catch {}
  }
  let savedLanguage;
  try { savedLanguage = localStorage.getItem(languageKey); } catch {}
  setLanguage(savedLanguage || 'ka');
  document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
  document.getElementById('year').textContent = String(new Date().getFullYear());

  function syncScrollLock() { document.body.classList.toggle('modal-open', Boolean(document.querySelector('dialog[open]'))); }
  function openDialog(dialog) { dialog.showModal(); syncScrollLock(); }
  function closeMenu() { menu.close(); }
  menuToggle.addEventListener('click', () => {
    openDialog(menu);
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', translate('closeMenu'));
  });
  document.getElementById('menu-close').addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  menu.addEventListener('close', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', translate('openMenu'));
  });
  window.matchMedia('(min-width: 1101px)').addEventListener('change', event => { if (event.matches && menu.open) closeMenu(); });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('close', syncScrollLock);
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  });
  document.querySelectorAll('[data-stay]').forEach(link => link.addEventListener('click', () => { form.elements.stay.value = link.dataset.stay; }));
  document.querySelectorAll('[data-gallery]').forEach(button => button.addEventListener('click', () => {
    currentImage = Number(button.dataset.gallery);
    updateGallery();
    openDialog(galleryDialog);
  }));
  document.getElementById('gallery-close').addEventListener('click', () => galleryDialog.close());
  function advanceGallery(direction) { currentImage = (currentImage + direction + galleryImages.length) % galleryImages.length; updateGallery(); }
  document.getElementById('gallery-prev').addEventListener('click', () => advanceGallery(-1));
  document.getElementById('gallery-next').addEventListener('click', () => advanceGallery(1));
  galleryDialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      advanceGallery(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  function updateDates() {
    form.elements.arrival.min = core.localDate();
    form.elements.departure.min = core.nextDay(form.elements.arrival.value || core.localDate());
  }
  updateDates();
  window.addEventListener('focus', updateDates);
  form.elements.arrival.addEventListener('change', () => {
    updateDates();
    if (form.elements.departure.value && form.elements.departure.value <= form.elements.arrival.value) form.elements.departure.value = '';
  });
  form.addEventListener('input', () => {
    currentError = null;
    errorElement.hidden = true;
    form.querySelectorAll('[aria-invalid]').forEach(input => { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    updateDates();
    const data = Object.fromEntries(new FormData(form));
    currentError = core.validateEnquiry(data);
    if (currentError) {
      errorElement.textContent = translate(currentError);
      errorElement.hidden = false;
      const fields = { nameRequired: 'name', emailInvalid: 'email', datesRequired: !data.arrival ? 'arrival' : 'departure', arrivalPast: 'arrival', departureInvalid: 'departure', guestsInvalid: 'guests' };
      const field = form.elements[fields[currentError]];
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', 'form-error');
      field.focus();
      return;
    }
    currentEnquiry = data;
    updateEnquiry();
    openDialog(enquiryDialog);
  });
  document.getElementById('enquiry-close').addEventListener('click', () => enquiryDialog.close());
  document.getElementById('copy-enquiry').addEventListener('click', async () => {
    const details = 'To: businesshalllemurmure@gmail.com\r\nSubject: LE MURMURE — Reservation enquiry\r\n\r\n' + core.createEmailBody(currentEnquiry, currentLanguage);
    try {
      await navigator.clipboard.writeText(details);
      document.getElementById('copy-status').textContent = translate('copied');
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(document.getElementById('enquiry-preview'));
      selection.removeAllRanges();
      selection.addRange(range);
      document.getElementById('copy-status').textContent = translate('copyFailed');
    }
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(element => { element.classList.add('will-reveal'); observer.observe(element); });
    reducedMotion.addEventListener('change', event => { if (event.matches) document.querySelectorAll('.will-reveal').forEach(element => element.classList.add('visible')); });
  }
  const header = document.querySelector('.site-header');
  function updateHeader() { header.classList.toggle('scrolled', window.scrollY > 30); }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
})();
