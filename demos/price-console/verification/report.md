# Verification report / 验证报告

Generated: 2026-11-24 08:14:29 UTC (16:14:29 Asia/Shanghai)
Runtime: Node v24.18.0 · Chrome 151.0.7922.137 · headless Playwright

## Node tests

Command: `node --test`

Result: **22 passed, 0 failed, 0 skipped**. Coverage includes fixture counts and synthetic URLs, normalization, matching and hard conflicts, conflict/review behavior, unmatched preservation, price history, the raw 20-case blind test, bilingual dictionaries, import validation, JSON/CSV exports, classic-bundle freshness and static no-network checks.

## Browser matrix

| Scenario | Viewport | Page width | Drawer width | Console errors | Page errors | Failed requests | External requests | Result |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `file://` desktop | 1440×1000 | 1440 | 1440 | 0 | 0 | 0 | 0 | Pass |
| Local server desktop | 1440×1000 | 1440 | 1440 | 0 | 0 | 0 | 0 | Pass |
| `file://` mobile | 390×844 | 390 | 390 | 0 | 0 | 0 | 0 | Pass |
| Local server mobile | 390×844 | 390 | 390 | 0 | 0 | 0 | 0 | Pass |

For every scenario:

- 30 SKU rows, 20 raw blind-test rows and one SVG price chart rendered.
- No element bounding box extended past the viewport.
- Language switch, search, conflict filter, evidence drawer, normalizer/matcher and fixture import passed.
- Desktop JSON and CSV downloads passed; JSON contained 30 clusters and 20 blind rows, CSV contained a header plus 90 offer rows.
- The app made only its four local asset requests; no external HTTP request occurred.

## Blind-test raw totals

TP 13 · FP 1 · FN 2 · TN 4
Precision **13/14 = 92.86%** · Recall **13/15 = 86.67%**

The UI and exports retain all three errors: B014 and B015 are false negatives; B016 is a low-confidence false positive.

## Artifacts

- Machine-readable results: [`browser-results.json`](browser-results.json)
- Desktop viewport: [`desktop-viewport.png`](desktop-viewport.png)
- 390px viewport: [`mobile-viewport.png`](mobile-viewport.png)
- Full-page captures: [`server-desktop.png`](server-desktop.png), [`server-mobile.png`](server-mobile.png)
- Browser export samples: [`price-evidence-server-desktop.json`](price-evidence-server-desktop.json), [`price-evidence-server-desktop.csv`](price-evidence-server-desktop.csv)
- Repeatable check: [`browser-check.mjs`](browser-check.mjs)

## Scope statement

All verification used synthetic local fixtures. No real platform, logged-in price, account, credential or purchase flow was involved.
