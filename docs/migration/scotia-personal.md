# Migration analysis — Scotiabank "Personal Banking" → AEM Edge Delivery Services (DA)

- **Source**: https://www.scotiabank.com/ca/en/personal.html
- **Target (DA live site)**: https://main--eds-scotia-da--azouaoui-deloitte.aem.live/ca/en/personal
- **Content source**: Document Authoring (DA) — `https://da.live/#/azouaoui-deloitte/eds-scotia-da`
- **Boilerplate**: `adobe/aem-boilerplate` (DA flavour — NOT the xwalk/Universal-Editor one)
- **Method**: Adobe EDS `page-import` workflow (scrape → identify-page-structure → authoring-analysis → generate-import-html → preview-import) then `content-driven-development` / `building-blocks` per David's Model (minimise blocks, prefer default content, mobile-first CSS).

All evidence (screenshots, DOM, computed styles) lives in `import-work/` (git-ignored): `shots/`, `nav.json`, `tabs.json`, `content.json`, `header.html`, `footer.html`, plus the generator `tools/build-scotia.mjs` and the DA helper `tools/da-upload.sh`.

## 1. Two-approach demo (read this first)

This repo is **one of two** parallel Scotiabank builds, to demo both authoring models side by side:

| # | Approach | Repo | Authoring | Served |
|---|---|---|---|---|
| 1 | **DA authoring** (this repo) | `azouaoui-deloitte/eds-scotia-da` | Content in [da.live](https://da.live), no AEM instance | Live on `*.aem.live` |
| 2 | **AEM + Universal Editor** (other agent) | `azouaoui-deloitte/eds-scotia` | Content authored in a local AEM SDK (port 4802) via Universal Editor + crosswalk | Local AEM + `*.aem.page` |

This mirrors exactly what was done for TD Bank, where the same EDS code served a DA live site (branch `main`) and an AEM/UE site (branch `ue-xwalk`).

## 2. Source design system (measured)

| Element | Value |
|---|---|
| Body font | `Scotiabank-Regular` (Frutiger), 16px / 24px, `#333` |
| Headline font | `Scotiabank-Headline` (H1 46px/50.6px w500; H2 36px/45px) |
| Brand red | `#ec111a` (Sign In button, active underlines) |
| Link / accent | `#007eab` (ocean blue), card chevron links |
| Backgrounds | hero `#f2f2f2`, page sections `#f5f6f7`, cards white |
| Sign In button | white on `#ec111a`, radius 5px, padding 14×32 |
| Nav link | 14.4px `#333`, active → red + 3px red underline |

Fonts `Scotia_W_Rg/Bd/Lt/Headline.woff` copied into `/fonts` (internal POC). Icons rebuilt as inline SVG in `/icons` (location, phone, offers, lock, chevron, question, calendar, + social).

## 3. Page structure → EDS blocks

| # | Source section | Authoring decision | Block / content |
|---|---|---|---|
| 1 | Shell hero (3 brand circles, H1, copy, "Enrol me" / "Apply now", car photo) | Block | `hero` (content left, image right) |
| 2 | "You may be interested in" (3 credit-card image tiles) | Heading (default) + block | H2 + `cards (interest)` (image-overlay tiles) |
| 3 | "Featured" recommendation tabs (6 tabs × 6 marketing cards) | Block | `tabs` with nested `cards (marketing)` per panel |
| 4 | CDIC trademark line | Default content | image + paragraph, section style `trademark` |

Metadata (`title`, `description`, `nav`, `footer`) kept per source; `og:image` to add.

## 4. Header (`/ca/en/nav`) — interactive states

Desktop ≥ 1024px (see `shots/src-megamenu.png`): three rows — (a) line-of-business segments (Personal active + red underline, Business, Commercial, Global Markets, Global Wealth, About Us, Investors; right: More Sites, English); (b) logo + search + CTA icons (Location, Contact Us, Offers) + red Sign In + "New to Scotia OnLine? Activate Now"; (c) 10-item product nav (Bank Accounts … Rates & Fees) each opening a **mega-menu** (grouped columns Products/Services/Resources + "View all"). Overlay dim, close on Esc / outside click / re-hover.

Mobile < 1024px: 56px bar (hamburger + centred logo + Sign In). Hamburger opens a full-screen drawer; product items expand to accordions.

Authoring model: a single `/ca/en/nav` document with 4 sections (brand, segments, tools, menu). The menu section is `H2` (category) → `H3` (column title) → `UL` (links); `blocks/header/header.js` builds the desktop mega-menu and the mobile drawer from this structure.

## 5. Footer (`/ca/en/footer`)

3 support cards (Have a question? / Get support / Get advice, each icon + title + text + link), social row (Facebook, Instagram, LinkedIn, X, YouTube), legal link row (Careers, Bank your way, Security and Fraud, Legal, Location, Privacy, Accessibility), copyright. Built from a `/ca/en/footer` document with 4 sections by `blocks/footer/footer.js`.

## 6. Assets

43 media files downloaded, optimised to WebP, and referenced as `https://content.da.live/azouaoui-deloitte/eds-scotia-da/media/scotia/…`: hero tri-logo + Shell car photo, 3 interest tiles, 36 featured tiles, CDIC badge, Scotiabank logo (SVG).

## 7. Links

Relative Scotiabank paths kept as absolute `https://www.scotiabank.com/…` for non-migrated pages; the personal page itself and the logo point to `/ca/en/personal`. External links (secure.scotiabank.com, help.scotiabank.com, hello.scotiabank.com, maps/locator, social) preserved; social open in `_blank`.

## 8. Functional gaps (backend dependencies — degraded gracefully)

| Source function | Reason | EDS behaviour |
|---|---|---|
| Header search + trending suggestions | Scotiabank search API (cross-origin) | Form redirects to scotiabank.com search |
| "You may be interested in" + Featured tabs | Adobe Target / recommendation engine (personalised) | Static snapshot of the rendered state captured at migration time |
| Sign In / Activate / authenticated state | secure.scotiabank.com session | Links out only (unauthenticated view) |
| Cookie Settings (OneTrust) | OneTrust not installed | Link omitted / inert |
| Analytics (Adobe, GTM) | Out of POC scope | Not migrated |

## 9. Verification status

`npm run lint` passes. Per-viewport pixel measurement vs source and side-by-side screenshots are to be captured **after** the first publish (see blockers below), using `import-work/tools/measure.mjs` / `compare.mjs`.

## 10. Blockers requiring a human action

1. **DA IMS login** — run `da-auth-helper login` and complete the Adobe sign-in in the browser (token had expired; the automated attempt timed out).
2. **Repo ownership** — `eds-scotia-da` was created under `azizzouaouiaem` and a transfer to the user account `azouaoui-deloitte` was requested; it needs the owner to **accept the transfer** (GitHub notification/email).
3. **AEM Code Sync** — must be installed on the owning account for `eds-scotia-da` (already present on `azouaoui-deloitte` for `eds-td`; confirm it covers the new repo).

Once (1)–(3) are done: `cd import-work/tools && ./da-upload.sh publish` uploads media + docs, previews and publishes to `https://main--eds-scotia-da--azouaoui-deloitte.aem.live/ca/en/personal`.
