# Northstar Components — synthetic business site

**合成演示数据｜非真实客户 / Synthetic demo data · not a real client**

This demo is an original, fictional manufacturer website created to show business-site structure, responsive layout, theme switching, and a safe mock inquiry flow. It does not represent a real company, customer, production result, certification, or system integration.

## Pages

- `index.html` — manufacturer overview, workflow files, evidence record, capabilities, and mock inquiry form.
- `case-study.html` — a single synthetic case file covering scope, workflow, sample observations, and limits.

Both pages are bilingual (English / Chinese), responsive, and use the same local `styles.css` and `app.js`.

## Themes

The HTML structure stays unchanged. CSS variables under `[data-theme="..."]` switch between:

- `editorial` — cool paper, cobalt, serif-led report layout.
- `technical` — graphite, mint, engineering-grid treatment.
- `warm` — oat, olive, softer serif treatment.

The selected theme is stored in `localStorage` under `northstar-theme-v1` and restored on reload and across the two pages. Language choice is stored under `northstar-language-v1`.

No fonts, images, analytics, or other assets are fetched from the network. Illustrations are original inline SVG and CSS. The page CSP sets `connect-src 'none'` and `form-action 'none'`.

## Mock inquiry form

Submitting the form:

1. Prevents native submission.
2. Stores at most the last five fictional entries in `localStorage` under `northstar-demo-inquiries-v1`.
3. Records `externalWrites: 0` with each entry.
4. Shows a mock success message and resets the form.

It never calls `fetch`, `XMLHttpRequest`, `sendBeacon`, an email service, a CRM, or any other network endpoint. The submit button is enabled only after the local JavaScript handler is attached.

## Run locally

From the repository root:

```bash
npm run build:pages
python3 -m http.server 8770 --bind 127.0.0.1 --directory public
```

Open:

- http://127.0.0.1:8770/demos/business-site/index.html
- http://127.0.0.1:8770/demos/business-site/case-study.html

## Verification

Verified with a local static server and Playwright:

| Scenario | Viewport | Horizontal overflow | Console errors | Failed requests | External requests |
|---|---|---|---|---|---|
| Home | 1440×1000 | 0 | 0 | 0 | 0 |
| Home | 390×844 | 0 | 0 | 0 | 0 |
| Case file | 1440×1000 | 0 | 0 | 0 | 0 |
| Case file | 390×844 | 0 | 0 | 0 | 0 |

Interaction checks also passed for all three themes, theme persistence after reload and across pages, English/Chinese switching, and a form submission that produced zero network requests while writing one `externalWrites: 0` entry to `localStorage`. The full theme matrix (3 themes × 2 pages × 2 viewports) also passed with no overflow, console errors, failed requests, or external requests.

Repository checks passed:

```bash
npm run build:pages
npm run scan
npm run scan:public
```
