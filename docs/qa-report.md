# LE MURMURE QA report

## Vercel preparation — 16 November 2026

- `npm test`: all 6 tests passed, including the original enquiry tests and new deployment tests.
- `npm run build`: passed; `dist/` contains only the website files and five runtime assets. Tests confirm all published HTML, CSS, JavaScript and images match their source bytes, every local HTML reference resolves, and stale output is removed on rebuild.
- `vercel.json` configures Other/static, `npm run build`, `dist`, no dependency installation and no serverless functions. `server.js` remains a local preview tool, with `npm run preview` serving the built output.
- The full Chrome suite passed against `npm run preview`, exercising the actual production output at all 15 language/viewport combinations. No translation gaps, runtime errors or missing local assets were found. Mobile navigation, gallery, email enquiry validation and preview, clipboard copy, language persistence, animations and fallback modes passed.
- Vercel QA screenshots were written to `/private/tmp/lemurmure-vercel-qa` to avoid replacing the tracked design screenshots.
- No design, translation, image or client-side application files were changed. The form remains a visitor-sent email enquiry with explicit booking-confirmation notices. No real email was sent during testing.
- Vercel account import and deployment are still to be performed using the documented settings; this verification covers the build and its served output locally.

Verified on 16 November 2026 using Node.js 24 and headless Google Chrome on this Mac.

## Results

- `npm test`: 4 tests passed; 0 failures. Covers month/year/leap-year boundaries, valid dates, past arrivals, strictly later departures, name/email validation, whole-number guests, multilingual text and safe mailto encoding.
- JavaScript syntax checks passed for `app.js`, `translations.js`, `core.js` and `server.js`.
- Real-browser layout checks passed at 320, 390, 768, 1024 and 1440 pixels in Georgian, English and Russian: 15 combinations, with no page overflow, overflowing headings or overlapping mobile amenities icons.
- No missing translation keys, uncaught JavaScript errors or failed local asset responses.
- Georgian is the default; all language buttons update visible text, accessible labels, image descriptions, page language, title, description and validation messages. Language selection survives reloads.
- All internal anchor targets exist. Mobile menu links, Escape, expanded state and dialog closing work. The external map link uses the supplied address. Both telephone numbers and the email address are linked.
- Gallery opens, next/previous controls wrap, keyboard arrows work, Escape closes and keyboard focus returns to the selected thumbnail.
- Apartment enquiry links select the intended stay category in the form.
- Form rejects missing names, same-day departure and fractional guests, focuses invalid fields and translates errors. Departure minimum updates when arrival changes.
- Enquiry dialog displays safely escaped details and an encoded mailto link to the supplied property email, with an explicit unconfirmed-reservation notice. Copy-details functionality passed. Dialog closing releases page scroll.
- Tested storage-denied, unavailable-font and unavailable-IntersectionObserver fallbacks. Direct `file://` opening supports language switching. Content and an email fallback remain available with JavaScript disabled.
- Normal-motion hero animation and scroll reveals work. Reduced-motion mode disables animations and keeps content visible.
- Desktop English, desktop Georgian and mobile Georgian screenshots were inspected. Typography, mobile amenities spacing and email wrapping were refined following browser and visual checks.

## Screenshots

- `screenshots/desktop-en.png`
- `screenshots/desktop-ka.png`
- `screenshots/mobile-ka.png`

`screenshots/overflow-ru-320.png` is an earlier diagnostic capture, retained as a record of the mobile issue subsequently fixed. The three screenshots listed above show the final layout.

## Verification limits

No actual enquiry email was sent. Email links and message contents were verified without invoking the user's mail application. Sending requires a configured email app or copying the prepared details into webmail. Booking confirmation remains with the property.

Chrome was tested; Safari and physical iOS/Android devices were not available to this automated run. Official branding and real property images still need to replace the explicitly labelled illustrative assets before a public launch.
