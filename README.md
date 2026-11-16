# LE MURMURE

A complete responsive one-page website based on the supplied LE MURMURE HTML and property details. Includes Georgian (default), English and Russian, mobile navigation, animated sections, an accessible gallery viewer, location and contact information, and a validated email enquiry form.

## Open and preview

**Quickest:** open this folder in Finder and double-click `index.html`. All website code and images are local; no build or installation is required. Google Fonts are optional and use system fallbacks when offline.

**Recommended:** open Terminal and run:

```sh
cd /Users/kiki/lemurmure
npm start
```

Then visit **http://localhost:4173** in Safari or Chrome. Keep Terminal open while previewing, and press Control+C to stop the server. Requires Node.js (already available on this computer). If the port is occupied, run `PORT=4174 npm start` and visit http://localhost:4174.

## Reservation enquiries

The form validates names, email addresses, whole-number guest counts and dates. Departure must be after arrival, and arrival cannot be in the past. Submission opens a review dialog, with the exact details and an **Open email app** button. The visitor sends the email from their own mail app. A copy-details fallback supports webmail or devices without a configured email app. No enquiry is silently sent or treated as a confirmed booking. The form does not transmit or store personal details on a server. Only the language preference is stored locally when browser storage is available.

The recipient is `businesshalllemurmure@gmail.com`. The email text uses English labels to help the property team and includes the visitor's chosen site language. A mail app or webmail account is needed to actually send an enquiry. Automatic email delivery would require a separate backend or email service.

## Content and assets

- `index.html`: semantic page structure and Georgian source copy.
- `styles.css`: responsive design, typography, motion and reduced-motion support.
- `translations.js`: English and Russian translations and Georgian validation messages. Georgian visible translations are captured from `index.html` before language switching.
- `core.js`: date checks, enquiry validation and safe email encoding.
- `app.js`: language preference, menus, gallery, form and animations.
- `assets/`: locally stored illustrative photos and provisional favicon. See `assets/README.md` for sources and replacement instructions.
- `server.js`: dependency-free local preview server.
- `scripts/build.js`: copies only website files and image/font assets into `dist/` for static deployment.
- `vercel.json`: version-controlled Vercel build and output settings.
- `tests/`: enquiry tests and browser QA script.

No identifiable LE MURMURE logo or property photographs were found in the accessible project locations. All four photographs are explicitly labelled illustrative placeholders, and the footer labels the provisional text wordmark. The decorative location graphic is labelled as an illustration, with a separate working Google Maps link to the supplied address. Replace the illustrative images and text logo with approved assets before a public launch.

The site retains the supplied 15-apartment count, 24-hour security, parking, workspaces, extended stays, address, phone numbers, email and coming-soon status. No room dimensions, prices, opening date, availability or ratings have been invented.

## Check the website

```sh
npm test
```

Browser QA is recorded in `docs/qa-report.md`. The browser script can be rerun with a locally available Playwright installation while the preview server is running:

```sh
PLAYWRIGHT_PATH=/absolute/path/to/playwright node tests/browser.cjs
```

## Deploy on Vercel

This is a **static website**, including its reservation enquiry flow. `server.js` is only a local preview tool; Vercel serves the built files directly. No serverless functions, API keys, environment variables or runtime npm dependencies are required. The existing mailto flow and copy-details fallback work the same way over Vercel HTTPS. Visitors still send the prepared enquiry from their own email app or webmail; no booking is automatically confirmed.

Import `kikikiki-spec/lemurmur.ge` in Vercel and use:

| Setting | Value |
| --- | --- |
| Application / Framework Preset | **Other** |
| Root Directory | Repository root (`.`) |
| Production Branch | `main` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | Empty / skip installation |
| Development Command (local Vercel CLI only) | `npm start` |
| Environment Variables | None |

`vercel.json` explicitly sets the preset (`framework: null` means Other), build command, output directory and skipped install command. Leave the dashboard consistent with these settings. Do not select a Node.js/Express application preset or use `npm start` as the Build Command: the production site does not run a persistent Node server.

The dependency-free build copies the HTML, CSS, client-side scripts and supported image/font assets without changing their contents. Development tools, documentation, tests, repository metadata and asset notes are excluded from the published directory. `dist/` is generated locally and during Vercel builds; it is not committed.

To verify and preview the exact deployment files locally:

```sh
npm test
npm run build
npm run preview
```

Open http://localhost:4173. `npm start` continues to preview the source files as before. Built files in `dist/` can also be uploaded to any static host.

The build, framework and output settings follow the [Vercel build documentation](https://vercel.com/docs/builds/configure-a-build) and [version-controlled configuration documentation](https://vercel.com/docs/project-configuration/vercel-json).
