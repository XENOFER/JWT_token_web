# CipherToken — The JWT Security Academy

An interactive, multi-page static website for learning **JSON Web Tokens** end to end: their structure, the cryptography that signs them, the vulnerabilities that break them, and the defenses that stop those attacks. Built for **defensive security education** — every token is fabricated and all cryptography runs client-side.

Built with **plain HTML, CSS, and vanilla JavaScript**. No frameworks, no build step, no backend. Deploys to GitHub Pages (or any static host) as-is.

---

## What's in this build (Phase 1)

This is the foundation release. It includes the complete design system, the shared site chrome, a **real JWT engine**, and three fully live pages. The remaining chapters appear in the sidebar marked *“soon”* and are being written next.

**Live now**
- **Home** (`index.html`) — hero, animated stats, topic cards, a live in-page token decoder, roadmap, and security teaser.
- **Token Structure** (`pages/structure.html`) — header/payload/signature explained, with an **interactive decoder** you can paste any token into.
- **Playground** (`pages/playground.html`) — build & sign tokens (HS256/384/512), inspect & verify them, plus four **sandboxed attack demos**: `alg:none`, weak-secret brute force, payload tampering, and expired tokens.

**Coming next** (currently route to a friendly *coming soon* page, no broken links)
What is JWT · Algorithms · Auth Flow · Vulnerabilities · Best Practices · Libraries & Frameworks · OAuth vs JWT · Resources · Roadmaps.

---

## The JWT engine is real

`assets/js/jwt.js` implements genuine JWT operations on top of the browser’s **Web Crypto API** (`crypto.subtle`):

- Base64URL encode/decode (UTF-8 safe)
- `decode()` — parse a token with structured errors & warnings
- `sign()` / `verify()` — real **HMAC-SHA256/384/512** signing and verification
- `validateClaims()` — `exp` / `nbf` / `iat` / `iss` / `aud` / `sub` checks
- `dictionaryAttack()` — client-side weak-secret recovery (for the demo)
- `forgeNone()` — educational `alg:none` forgery

The signing was verified byte-for-byte against the canonical `jwt.io` HS256 reference token, so the output matches standard libraries.

---

## Project structure

```
jwt-academy/
├── index.html              # Homepage
├── pages/
│   ├── structure.html      # Live — interactive decoder
│   ├── playground.html     # Live — encoder/verifier + attack demos
│   └── soon.html           # Placeholder for chapters in production
├── assets/
│   ├── css/style.css       # Full design system (dark/light, components)
│   ├── js/
│   │   ├── jwt.js          # JWT engine (Web Crypto)
│   │   ├── site.js         # Shared chrome + interactions (the "components")
│   │   └── playground.js   # Playground & attack-demo logic
│   └── img/
│       ├── favicon.svg
│       └── og.svg          # Social share image
├── robots.txt
├── sitemap.xml
└── README.md
```

### Shared “components”
Rather than duplicating the navbar/sidebar/footer markup across every page, they are rendered from a single source — **`assets/js/site.js`** — which also powers theme switching, search (⌘K / Ctrl-K), the mobile menu, code copy buttons, scroll reveals, the table of contents, accordions, and tabs. The site map lives in the `GROUPS` array at the top of that file.

---

## Run locally

Because pages load shared assets, open the site through a local web server (not `file://`):

```bash
# Python 3
python3 -m http.server 8000

# or Node
npx serve .
```

Then visit **http://localhost:8000**.

---

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository.
2. Repo **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Select your branch (e.g. `main`) and the `/ (root)` folder, then **Save**.
5. Your site goes live at `https://<username>.github.io/<repo>/` within a minute or two.

All internal links are **relative**, so the site works whether it's served from a domain root or a `/<repo>/` subpath. No configuration needed.

> Optional: add an empty `.nojekyll` file to the root to skip Jekyll processing (not required here, but slightly faster).

---

## Before you ship — two small notes

1. **Canonical & OG URLs** use `https://example.com/` placeholders in each page’s `<head>` and in `sitemap.xml`. Find-and-replace them with your real domain for correct SEO and link previews.
2. **Social image**: `assets/img/og.svg` looks great in-app, but several social platforms don’t render SVG previews. For reliable previews, export it to a `1200×630` PNG (e.g. `og.png`) and point the `og:image` / `twitter:image` tags at it.

---

## Add a new chapter

1. Create `pages/your-page.html`. Copy the `<head>` and the `<main class="docs">…<div id="toc-slot"></div></main>` shell from `structure.html`.
2. Write your content inside `<article class="content">` using `h2[id]` / `h3[id]` for sections (the table of contents builds itself from those).
3. In `assets/js/site.js`, find the page’s entry in `GROUPS` and flip `built: false` → `built: true`. It will instantly appear as a real link in the sidebar, search, and footer.

Use `<pre data-file="example.js"><code class="language-js">…</code></pre>` for code blocks — they’re auto-wrapped with a filename bar, a copy button, and syntax highlighting.

---

## License & intent

For **educational and defensive** use. The attack demonstrations operate only on tokens generated locally in your browser and are intended to teach how to recognize and prevent these issues. Do not use these techniques against systems you do not own or lack explicit permission to test.
