# LE MURMURE implementation plan

Build a self-contained, locally previewable boutique hospitality website from the supplied HTML and business details. Preserve the property name, 15-apartment count, contact details, address and coming-soon status. Use Georgian by default, with complete English and Russian translations and stored language preference.

## Design

Ivory and beige editorial sections, near-black framing, champagne rules, large considered typography, full-bleed illustrative interior imagery and a provisional text wordmark. All placeholder imagery must be visibly identified in all languages. Do not invent room sizes, rates, reviews, opening dates or availability.

## Implementation

1. Write meaningful tests for date validation, guest counts and safely encoded enquiry emails, and confirm they fail before implementing the shared form helpers.
2. Create `index.html`, `styles.css`, `translations.js`, `core.js`, `app.js` and local assets. Build a responsive one-page experience with anchored sections, mobile navigation, translated content, accessible gallery lightbox, validated email enquiry and copy fallback.
3. Add a dependency-free Node preview server, npm scripts and README with exact preview and asset replacement instructions. The website must also work directly from `index.html`.
4. Run the unit suite and real-browser checks at mobile and desktop sizes in all three languages. Verify local assets, keyboard interaction, date rejection, email contents, storage failure fallback, reduced motion and absence of runtime errors. Fix observed failures and save a QA report.

## Delivery

Keep all new files in `/Users/kiki/lemurmure`; leave unrelated existing projects untouched. Deliver a local website and explicit opening instructions. No publication is required for this local project request.
