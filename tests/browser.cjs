const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const baseUrl = process.env.PREVIEW_URL || 'http://localhost:4173';
const output = process.env.BROWSER_ARTIFACTS_DIR || path.join(__dirname, '..', 'docs', 'screenshots');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const runtimeErrors = [];
  const localFailures = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  page.on('response', response => { if (response.url().startsWith(baseUrl) && response.status() >= 400) localFailures.push(response.url()); });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('html').getAttribute('lang'), 'ka');
  const translationGaps = await page.evaluate(() => {
    const keys = new Set([...document.querySelectorAll('[data-i18n],[data-i18n-aria],[data-i18n-alt]')].map(element => element.dataset.i18n || element.dataset.i18nAria || element.dataset.i18nAlt));
    return ['ka', 'en', 'ru'].flatMap(language => [...keys].filter(key => !window.LEMURMURE_TRANSLATIONS[language][key]).map(key => language + ':' + key));
  });
  assert.deepEqual(translationGaps, [], 'All visible text and accessible labels have translations');
  assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].filter(link => !document.getElementById(link.getAttribute('href').slice(1))).map(link => link.getAttribute('href'))), []);
  for (const image of await page.locator('main img[src]').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(element => element.decode());
    assert.equal(await image.evaluate(element => element.naturalWidth > 0), true);
  }
  const layoutChecks = [];
  for (const language of ['ka', 'en', 'ru']) {
    await page.locator(`[data-lang="${language}"]`).click();
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const dimensions = await page.evaluate(() => ({ viewport: innerWidth, body: document.documentElement.scrollWidth }));
      if (dimensions.body > dimensions.viewport + 1) {
        console.log(await page.evaluate(() => [...document.querySelectorAll('main *,header *,footer *')].filter(element => element.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(element).position !== 'absolute').map(element => ({ tag: element.tagName, class: element.className, text: element.textContent.slice(0, 90), width: element.getBoundingClientRect().width, right: element.getBoundingClientRect().right })).slice(0, 20)));
        await page.screenshot({ path: path.join(output, `overflow-${language}-${width}.png`), fullPage: true });
      }
      assert.ok(dimensions.body <= dimensions.viewport + 1, `${language} at ${width}px overflows: ${JSON.stringify(dimensions)}`);
      const headingOverflow = await page.locator('h1,h2,h3').evaluateAll(elements => elements.filter(element => element.scrollWidth > element.clientWidth + 2).map(element => element.textContent));
      assert.deepEqual(headingOverflow, [], `${language} at ${width}px has overflowing headings`);
      if (width <= 540) {
        const collisions = await page.locator('.amenity').evaluateAll(elements => elements.filter(element => element.querySelector('h3').getBoundingClientRect().left < element.querySelector('.amenity-symbol').getBoundingClientRect().right + 8).map(element => element.textContent));
        assert.deepEqual(collisions, [], 'Mobile amenity text must clear its icon column');
      }
      layoutChecks.push(`${language}/${width}`);
    }
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('lang'), language);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.menu-toggle').click();
  assert.equal(await page.locator('#mobile-menu').evaluate(element => element.open), true);
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#mobile-menu').evaluate(element => element.open), false);
  await page.locator('.menu-toggle').click();
  await page.locator('#mobile-menu a[href="#amenities"]').click();
  assert.equal(await page.locator('#mobile-menu').evaluate(element => element.open), false);
  assert.equal(new URL(page.url()).hash, '#amenities');
  await page.locator('[data-gallery="0"]').click();
  assert.equal(await page.locator('#gallery-dialog').evaluate(element => element.open), true);
  await page.keyboard.press('ArrowRight');
  assert.match(await page.locator('#lightbox-image').getAttribute('src'), /bedroom/);
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  assert.match(await page.locator('#lightbox-image').getAttribute('src'), /living/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-gallery="0"]').evaluate(element => element === document.activeElement), true);
  await page.locator('[data-stay="extended"]').click();
  assert.equal(await page.locator('#stay-type').inputValue(), 'extended');
  const submit = page.locator('#reservation-form button[type="submit"]');
  await submit.click();
  assert.equal(await page.locator('#form-error').isVisible(), true);
  assert.equal(await page.locator('#guest-name').getAttribute('aria-invalid'), 'true');
  await page.locator('[data-lang="en"]').click();
  await page.locator('#form-error').evaluate(element => { if (element.textContent !== 'Please enter your full name.') throw Error('Error did not translate'); });
  await page.locator('#guest-name').fill('ნინო <script>alert(1)</script>');
  await page.locator('#guest-email').fill('guest@example.com');
  await page.locator('#guest-phone').fill('+995 555 123 456');
  await page.locator('#arrival').fill('2028-12-30');
  assert.equal(await page.locator('#departure').getAttribute('min'), '2028-12-31');
  await page.locator('#departure').fill('2028-12-30');
  await submit.click();
  assert.match(await page.locator('#form-error').textContent(), /after your arrival/);
  await page.locator('#departure').fill('2029-01-03');
  await page.locator('#guests').fill('1.5');
  await submit.click();
  assert.match(await page.locator('#form-error').textContent(), /whole number/);
  await page.locator('#guests').fill('2');
  await page.locator('#message').fill('Quiet room, please. & Thank you!');
  await submit.click();
  assert.equal(await page.locator('#enquiry-dialog').evaluate(element => element.open), true);
  assert.match(await page.locator('#enquiry-title').textContent(), /ready/);
  const mailto = await page.locator('#email-link').getAttribute('href');
  assert.match(mailto, /^mailto:businesshalllemurmure@gmail.com\?/);
  const body = new URLSearchParams(mailto.split('?')[1]).get('body');
  assert.match(body, /ნინო <script>alert\(1\)<\/script>/);
  assert.match(body, /not a confirmed reservation/);
  assert.match(body, /Quiet room, please\. & Thank you!/);
  assert.equal(await page.locator('#enquiry-preview script').count(), 0);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.locator('#copy-enquiry').click();
  await page.waitForFunction(() => document.getElementById('copy-status').textContent.length > 0);
  assert.match(await page.locator('#copy-status').textContent(), /copied/);
  await page.locator('#enquiry-close').click();
  await page.waitForFunction(() => !document.body.classList.contains('modal-open'));
  assert.equal(await page.locator('body').evaluate(element => element.classList.contains('modal-open')), false);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('[data-lang="en"]').click();
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await Promise.all([...document.querySelectorAll('main img')].map(image => { image.loading = 'eager'; return image.decode(); }));
    window.scrollTo(0, 0);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.screenshot({ path: path.join(output, 'desktop-en.png'), fullPage: true });
  await page.locator('[data-lang="ka"]').click();
  await page.screenshot({ path: path.join(output, 'desktop-ka.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(output, 'mobile-ka.png'), fullPage: true });

  const fallbackContext = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  await fallbackContext.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage unavailable'); };
    Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
    window.IntersectionObserver = undefined;
  });
  const fallbackPage = await fallbackContext.newPage();
  fallbackPage.on('pageerror', error => runtimeErrors.push(error.message));
  await fallbackPage.route('https://fonts.googleapis.com/**', route => route.abort());
  await fallbackPage.goto(baseUrl, { waitUntil: 'networkidle' });
  assert.equal(await fallbackPage.locator('html').getAttribute('lang'), 'ka');
  await fallbackPage.locator('[data-lang="en"]').click();
  assert.equal(await fallbackPage.locator('html').getAttribute('lang'), 'en');
  assert.equal(await fallbackPage.locator('.will-reveal').count(), 0);
  await fallbackPage.goto('file://' + path.join(__dirname, '..', 'index.html'), { waitUntil: 'load' });
  assert.equal(await fallbackPage.locator('html').getAttribute('lang'), 'ka');
  await fallbackPage.locator('[data-lang="ru"]').click();
  assert.equal(await fallbackPage.locator('html').getAttribute('lang'), 'ru');

  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto(baseUrl);
  assert.equal(await noJsPage.locator('h1').isVisible(), true);
  assert.equal(await noJsPage.locator('#about h2').isVisible(), true);
  assert.equal(await noJsPage.locator('noscript').isVisible(), true);
  const motionContext = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 1280, height: 900 } });
  const motionPage = await motionContext.newPage();
  motionPage.on('pageerror', error => runtimeErrors.push(error.message));
  await motionPage.goto(baseUrl, { waitUntil: 'networkidle' });
  assert.equal(await motionPage.locator('.hero-image').evaluate(element => getComputedStyle(element).animationName), 'hero-image');
  await motionPage.locator('#about .about-copy').scrollIntoViewIfNeeded();
  await motionPage.waitForFunction(() => document.querySelector('#about .about-copy').classList.contains('visible'));
  assert.deepEqual(runtimeErrors, []);
  assert.deepEqual(localFailures, []);
  console.log(JSON.stringify({ status: 'PASS', layoutChecks, translationGaps, runtimeErrors, localFailures, verified: ['Georgian default', 'language persistence', 'all section anchors', 'local images', 'mobile menu and Escape', 'gallery arrows and focus restoration', 'stay selection', 'localized validation', 'date boundaries', 'integer guests', 'encoded mailto and text escaping', 'clipboard copy', 'dialog scroll unlock', 'storage unavailable', 'font unavailable', 'IntersectionObserver unavailable', 'direct file preview', 'no JavaScript fallback', 'reduced motion'], screenshots: output }, null, 2));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
