# Ammamma.shop — Audit Remediation Report

**Date:** 2026-10-19  
**Branch:** `audit/remediation-2026-10-19`  
**Production deployment:** Not performed  
**Readiness decision:** **NOT VERIFIED**

## Scope actually inspected

Inspected the `main` branch versions of `index.html`, `products.html`, `product.html`, `product-detail.js`, `catalog.js`, `cart.js`, `cart-v2.js`, `styles.css`, `mobile.css`, `product-detail.css`, `about.html`, `terms-and-conditions.html`, and `returns-and-refunds.html`. Confirmed the repository default branch is `main`; available branches also include `v2` and `feature/product-detail-pages`.

## Findings and changes

| ID | Severity | Finding / evidence | Remediation in this branch | Verification status |
|---|---|---|---|---|
| CART-01 | P1 | `cart.js` and `cart-v2.js` assigned generic prices (₹129/₹399/₹599) when a selected variant had no price. Those values are not valid for every product or pack size. | Removed generic fallback pricing. Add-to-cart now rejects unavailable selections and absent, non-numeric, zero, or negative prices. | Code inspected after update; browser regression test **BLOCKED**. |
| CART-02 | P1 | WhatsApp generation treated missing prices as ₹0 in the subtotal, potentially presenting a misleading order total. | Checkout blocks carts with invalid prices and labels the subtotal as subject to confirmation; message asks the business to confirm final prices, availability, and delivery charges. The WhatsApp handoff uses the configured business number. | Message construction inspected; no real WhatsApp message sent. Browser handoff test **BLOCKED**. |
| CART-03 | P2 | `localStorage` reads/writes were not fully guarded, and malformed saved data could enter cart state. | Cart loading now validates stored items and quantities; storage access failures are caught and surfaced to the user. | Code inspected; storage-denial scenarios **NOT RUN** in a browser. |
| CART-04 | P2 | Cart dialog did not move focus to its close control or restore focus to its opener, and Escape only closed the mobile menu. | Opening the cart moves focus to the close button; closing restores focus where possible; Escape closes the cart as well as the mobile menu. | Code inspected; full keyboard/focus-trap audit **NOT RUN**. |
| CATALOG-01 | P1 | Static listing markup includes hardcoded prices and can remain visible if the live catalog request fails, risking stale prices and purchase attempts. | Product listing is hidden while the live catalog is loading. If the API fails, the page shows a recovery message and retry button rather than presenting stale static prices as current. | Control flow inspected; API failure and retry not exercised in a real browser. |
| CATALOG-02 | P1 | Live catalog rendering could treat a variant with an invalid price as purchasable. | Listing now requires both availability and a finite positive price before enabling a variant. | Code inspected; live API response not independently validated in an authenticated backend environment. |
| PRODUCT-01 | P2 | Product detail page considered availability alone when deciding which variants could be purchased and represented invalid prices as zero. | Product-detail variants now require availability, a non-empty size, and a finite positive price; invalid values are displayed as unavailable price data rather than ₹0. Structured offers are generated only from valid purchasable variants. | Code inspected; structured data not validated with an external validator. |

## Tests and checks

- **PASS (repository inspection only):** Confirmed the target repository and default branch; fetched and reviewed the files listed above.
- **PASS (static source review only):** Confirmed the generic fallback-price map was removed from both cart scripts and price guards were added.
- **PASS (static source review only):** Confirmed catalog failure no longer deliberately falls back to the static, hardcoded-price listing.
- **BLOCKED:** Automated browser tests at 320, 360, 390, 768, 1024, and 1440 CSS pixels; no browser automation was available through this workflow.
- **BLOCKED:** End-to-end WhatsApp URL opening on desktop/mobile. No real customer message or order was sent.
- **NOT RUN:** Build, lint, unit tests, and CI. No `package.json` was found at the repository root, and no existing test runner was confirmed.
- **NOT RUN:** Lighthouse/Core Web Vitals measurements and external accessibility/structured-data validation.
- **BLOCKED:** Floot admin/database inspection and backend authorization checks; only the public storefront integration was visible.
- **NOT VERIFIED:** Effective production response headers, Cloudflare deployment configuration, redirect behavior, and production parity. Root-level `_headers`, `_redirects`, `wrangler.toml`, `robots.txt`, and `sitemap.xml` were not found at the inspected `main` branch paths. Their absence from those paths does not prove the hosting platform lacks equivalent controls.

## Outstanding work

1. Exercise the branch in a real browser and add regression automation for catalog failure, malformed storage, price validation, mobile navigation/cart, and WhatsApp message construction.
2. Reconcile existing saved carts with the latest backend prices and availability before allowing order handoff.
3. Complete a page-by-page SEO, WCAG 2.2 AA, security-header, dependency, and performance audit.
4. Verify the Floot API data model and live response, including variant availability and product publication behavior.
5. Deploy only after review and authorization, then test the deployed preview and production separately.

**Important:** These changes have been committed to a remediation branch only. They have not been merged or deployed, and this report does not claim production is fixed.
