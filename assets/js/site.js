/* =====================================================================
   CipherToken — site engine
   Renders shared chrome on every page and wires global interactions.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- icon set ---------- */
  const I = {
    logo: '<svg class="mark" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="lg" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#46e0e0"/><stop offset=".5" stop-color="#7c8cff"/><stop offset="1" stop-color="#c08cff"/></linearGradient></defs><rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#lg)" stroke-width="2"/><path d="M11 16.5l3.2 3.2L21 12.5" stroke="url(#lg)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2V5z"/><path d="M18 3v18"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8" cy="8" r="4"/><path d="M11 11l9 9M17 17l2-2M14 20l2-2"/></svg>',
    flow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="7" height="5" rx="1.5"/><rect x="14" y="15" width="7" height="5" rx="1.5"/><path d="M6.5 9v4a2 2 0 002 2h5.5"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l8 3v6c0 5-3.4 7.8-8 9-4.6-1.2-8-4-8-9V6l8-3z"/></svg>',
    bug: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="7" width="8" height="11" rx="4"/><path d="M12 7V4M8 11H3M21 11h-5M8 16l-3 2M16 16l3 2M8 9L5 7M16 9l3-2"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M10 9l5 3-5 3V9z" fill="currentColor"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 8l-4 4 4 4M15 8l4 4-4 4"/></svg>',
    compare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v18M5 7l-2 3 2 3M5 7h6M19 14l2 3-2 3M19 20h-6"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 15l6-6M10 6l1-1a4 4 0 016 6l-1 1M14 18l-1 1a4 4 0 01-6-6l1-1"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>',
    sun: '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/></svg>',
    moon: '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M21 12.8A8.5 8.5 0 1111.2 3a6.6 6.6 0 009.8 9.8z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12l5 5 9-10"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 5h5v5M19 5l-8 8M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"/></svg>'
  };

  /* ---------- site map (also the search index) ---------- */
  const GROUPS = [
    { title: "Get Started", num: "01", items: [
      { t: "Home", href: "index.html", ic: "book", kw: "introduction overview start", built: true },
      { t: "What is JWT?", href: "pages/what-is-jwt.html", ic: "book", kw: "stateless session authentication lifecycle", built: false },
      { t: "Token Structure", href: "pages/structure.html", ic: "layers", kw: "header payload signature base64url claims decode", built: true },
      { t: "Algorithms", href: "pages/algorithms.html", ic: "key", kw: "hs256 rs256 es256 eddsa hmac rsa ecdsa none symmetric asymmetric", built: false }
    ]},
    { title: "Authentication", num: "02", items: [
      { t: "Auth Flow", href: "pages/auth-flow.html", ic: "flow", kw: "login access refresh token bearer rotation expiration", built: false },
      { t: "OAuth vs JWT", href: "pages/oauth-vs-jwt.html", ic: "compare", kw: "oauth2 openid connect session comparison", built: false }
    ]},
    { title: "Security", num: "03", items: [
      { t: "Vulnerabilities", href: "pages/vulnerabilities.html", ic: "bug", kw: "none algorithm confusion kid jku jwk tampering weak secret replay xss csrf", built: false },
      { t: "Best Practices", href: "pages/best-practices.html", ic: "shield", kw: "secrets rotation expiration httponly samesite cookie validation logout", built: false },
      { t: "Attack Demos", href: "pages/playground.html#demos", ic: "target", kw: "none weak secret tamper expired signature mismatch sandbox", built: true }
    ]},
    { title: "Practice", num: "04", items: [
      { t: "Playground", href: "pages/playground.html", ic: "play", kw: "encoder decoder verify sign hs256 interactive", built: true },
      { t: "Libraries", href: "pages/libraries.html", ic: "code", kw: "node express flask django php spring go dotnet jsonwebtoken pyjwt", built: false }
    ]},
    { title: "Reference", num: "05", items: [
      { t: "Resources", href: "pages/resources.html", ic: "link", kw: "owasp portswigger rfc 7519 jwt.io books github", built: false },
      { t: "Roadmaps", href: "pages/roadmaps.html", ic: "map", kw: "beginner advanced api security learning path", built: false }
    ]}
  ];
  const NAV_TOP = [
    { t: "Learn", href: "pages/structure.html" },
    { t: "Security", href: "pages/playground.html#demos" },
    { t: "Playground", href: "pages/playground.html" }
  ];

  /* ---------- path helpers (works at root and in /pages/) ---------- */
  const inPages = /\/pages\//.test(location.pathname);
  const BASE = inPages ? "../" : "";
  const resolve = (href) => {
    if (/^https?:|^#/.test(href)) return href;
    return BASE + href;
  };
  const here = location.pathname.split("/").pop() || "index.html";
  const isActive = (href) => {
    const file = href.split("#")[0].split("/").pop();
    return file === here && !href.includes("#");
  };

  // Route links to unwritten chapters → a friendly "coming soon" page (no 404s).
  const BUILT = {}; const TITLE = {};
  GROUPS.forEach(g => g.items.forEach(it => { const f = it.href.split("#")[0]; BUILT[f] = it.built; TITLE[f] = it.t; }));
  function route(href) {
    if (/^https?:|^#/.test(href)) return href;
    const file = href.split("#")[0];
    if (BUILT[file] === false) return resolve("pages/soon.html") + "?t=" + encodeURIComponent(TITLE[file] || "This chapter");
    return resolve(href);
  }

  /* ---------- tiny DOM helper ---------- */
  function h(tag, attrs, html) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* ---------- build: atmosphere ---------- */
  function atmosphere() {
    const a = h("div", { class: "atmosphere", "aria-hidden": "true" });
    a.innerHTML = '<div class="grid"></div><div class="glow g1"></div><div class="glow g2"></div><div class="glow g3"></div>';
    document.body.prepend(a);
  }

  /* ---------- build: navbar ---------- */
  function navbar() {
    const nav = h("nav", { class: "nav", "aria-label": "Primary" });
    const links = NAV_TOP.map(l => `<a href="${resolve(l.href)}">${l.t}</a>`).join("");
    nav.innerHTML = `
      <div class="container">
        <button class="icon-btn hamburger" aria-label="Open navigation" aria-expanded="false">${I.menu}</button>
        <a class="brand" href="${resolve("index.html")}">${I.logo}<span>Cipher<b>Token</b></span></a>
        <div class="nav-links">${links}</div>
        <div class="nav-spacer"></div>
        <div class="nav-tools">
          <button class="search-btn" aria-label="Search (Ctrl K)">${I.search}<span class="label">Search</span> <kbd>⌘K</kbd></button>
          <a class="icon-btn" href="https://github.com" target="_blank" rel="noopener" aria-label="GitHub repository">${I.ext}</a>
          <button class="icon-btn theme-toggle" aria-label="Toggle color theme">${I.sun}${I.moon}</button>
        </div>
      </div>`;
    document.body.prepend(nav);

    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    nav.querySelector(".theme-toggle").addEventListener("click", toggleTheme);
    nav.querySelector(".search-btn").addEventListener("click", () => openSearch());
    nav.querySelector(".hamburger").addEventListener("click", toggleSidebar);
  }

  /* ---------- build: sidebar (docs pages only) ---------- */
  function sidebar(docs) {
    const aside = h("aside", { class: "sidebar", id: "sidebar", "aria-label": "Documentation" });
    aside.innerHTML = GROUPS.map(g => `
      <div class="side-group">
        <div class="side-title"><span class="num">${g.num}</span>${g.title}</div>
        ${g.items.map(it => {
          if (!it.built) return `<span class="side-link soon">${it.t}<span class="tag-soon">soon</span></span>`;
          return `<a class="side-link${isActive(it.href) ? " active" : ""}" href="${resolve(it.href)}">${it.t}</a>`;
        }).join("")}
      </div>`).join("");
    docs.prepend(aside);

    const scrim = h("div", { class: "scrim", id: "scrim" });
    document.body.appendChild(scrim);
    scrim.addEventListener("click", () => toggleSidebar(false));
  }

  function toggleSidebar(force) {
    const sb = document.getElementById("sidebar");
    const sc = document.getElementById("scrim");
    const ham = document.querySelector(".hamburger");
    if (!sb) return;
    const open = typeof force === "boolean" ? force : !sb.classList.contains("open");
    sb.classList.toggle("open", open);
    if (sc) sc.classList.toggle("open", open);
    if (ham) ham.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open && window.innerWidth <= 860 ? "hidden" : "";
  }

  /* ---------- build: table of contents + scrollspy ---------- */
  function toc(article, container) {
    const heads = article.querySelectorAll("h2[id], h3[id]");
    if (heads.length < 2) { container.remove(); return; }
    const nav = h("nav", { class: "toc", "aria-label": "On this page" });
    let html = '<div class="toc-title">On this page</div>';
    heads.forEach(hd => {
      html += `<a href="#${hd.id}" class="lvl-${hd.tagName === "H3" ? 3 : 2}">${hd.textContent}</a>`;
    });
    nav.innerHTML = html;
    container.replaceWith(nav);

    const links = nav.querySelectorAll("a");
    const map = {};
    links.forEach(a => map[a.getAttribute("href").slice(1)] = a);
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(a => a.classList.remove("active"));
          if (map[en.target.id]) map[en.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-80px 0px -70% 0px" });
    heads.forEach(hd => spy.observe(hd));
  }

  /* ---------- build: footer ---------- */
  function footer() {
    const f = h("footer", { class: "footer" });
    const col = (title, items) => `<div class="foot-col"><h4>${title}</h4>${items.map(i => `<a href="${route(i.href)}">${i.t}</a>`).join("")}</div>`;
    f.innerHTML = `
      <div class="container">
        <div class="foot-grid">
          <div class="foot-brand">
            <a class="brand" href="${resolve("index.html")}">${I.logo}<span>Cipher<b>Token</b></span></a>
            <p>An open educational academy for understanding JSON Web Tokens — their structure, cryptography, weaknesses, and secure defenses. Built for defensive security learning.</p>
          </div>
          ${col("Learn", [{t:"Token Structure",href:"pages/structure.html"},{t:"Algorithms",href:"pages/algorithms.html"},{t:"Auth Flow",href:"pages/auth-flow.html"}])}
          ${col("Security", [{t:"Vulnerabilities",href:"pages/vulnerabilities.html"},{t:"Best Practices",href:"pages/best-practices.html"},{t:"Attack Demos",href:"pages/playground.html#demos"}])}
          ${col("Practice", [{t:"Playground",href:"pages/playground.html"},{t:"Libraries",href:"pages/libraries.html"},{t:"Resources",href:"pages/resources.html"}])}
        </div>
        <div class="foot-bottom">
          <span>© ${new Date().getFullYear()} CipherToken Academy · For educational & defensive use only.</span>
          <span class="mono">Built with HTML · CSS · Vanilla JS</span>
        </div>
      </div>`;
    document.body.appendChild(f);
  }

  /* ---------- theme ---------- */
  function getStored() { try { return localStorage.getItem("ct-theme"); } catch { return null; } }
  function setStored(v) { try { localStorage.setItem("ct-theme", v); } catch {} }
  function applyTheme(t) { document.documentElement.setAttribute("data-theme", t); }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    const next = cur === "dark" ? "light" : "dark";
    applyTheme(next); setStored(next);
  }
  function initTheme() {
    const stored = getStored();
    if (stored) return applyTheme(stored);
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(prefersLight ? "light" : "dark");
  }

  /* ---------- search ---------- */
  let searchState = { idx: 0, results: [] };
  function buildSearchIndex() {
    const list = [];
    GROUPS.forEach(g => g.items.forEach(it => list.push({
      title: it.t, group: g.title, href: it.href, ic: it.ic, kw: it.kw, built: it.built
    })));
    return list;
  }
  function searchModal() {
    const ov = h("div", { class: "search-overlay", id: "search-overlay", role: "dialog", "aria-modal": "true", "aria-label": "Search" });
    ov.innerHTML = `
      <div class="search-modal">
        <div class="s-top">${I.search}<input type="text" id="search-input" placeholder="Search topics — try 'none algorithm' or 'refresh token'" autocomplete="off" spellcheck="false"></div>
        <div class="s-results" id="search-results"></div>
        <div class="s-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener("click", e => { if (e.target === ov) closeSearch(); });
    const input = ov.querySelector("#search-input");
    input.addEventListener("input", () => renderResults(input.value));
    input.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") { e.preventDefault(); openResult(searchState.idx); }
      else if (e.key === "Escape") closeSearch();
    });
  }
  function renderResults(q) {
    const all = buildSearchIndex();
    q = (q || "").trim().toLowerCase();
    const results = !q ? all : all.filter(r =>
      r.title.toLowerCase().includes(q) || r.group.toLowerCase().includes(q) || r.kw.toLowerCase().includes(q));
    searchState = { idx: 0, results };
    const box = document.getElementById("search-results");
    if (!results.length) { box.innerHTML = '<div class="s-empty">No matches. Try “signature”, “cookie”, or “rs256”.</div>'; return; }
    box.innerHTML = results.map((r, i) => `
      <div class="s-result${i === 0 ? " active" : ""}" data-i="${i}">
        <span class="sr-ic">${I[r.ic] || I.book}</span>
        <span><span class="sr-title">${r.title}</span><br><span class="sr-sub">${r.group}</span></span>
        ${r.built ? `<span class="sr-soon" style="color:var(--ok);border-color:var(--ok)">live</span>` : '<span class="sr-soon">soon</span>'}
      </div>`).join("");
    box.querySelectorAll(".s-result").forEach(el => {
      el.addEventListener("click", () => openResult(+el.dataset.i));
      el.addEventListener("mousemove", () => setActive(+el.dataset.i));
    });
  }
  function setActive(i) {
    searchState.idx = i;
    document.querySelectorAll(".s-result").forEach((el, k) => el.classList.toggle("active", k === i));
  }
  function move(dir) {
    const n = searchState.results.length; if (!n) return;
    setActive((searchState.idx + dir + n) % n);
    const el = document.querySelectorAll(".s-result")[searchState.idx];
    if (el) el.scrollIntoView({ block: "nearest" });
  }
  function openResult(i) {
    const r = searchState.results[i]; if (!r) return;
    if (!r.built) { flashSoon(); return; }
    location.href = resolve(r.href);
  }
  function flashSoon() {
    const el = document.querySelectorAll(".s-result")[searchState.idx];
    if (el) { el.style.transition = "background .15s"; el.style.background = "var(--warn-dim)"; setTimeout(() => el.style.background = "", 350); }
  }
  function openSearch() {
    document.getElementById("search-overlay").classList.add("open");
    const input = document.getElementById("search-input");
    input.value = ""; renderResults(""); setTimeout(() => input.focus(), 30);
  }
  function closeSearch() { document.getElementById("search-overlay").classList.remove("open"); }

  /* ---------- code blocks: wrap + copy + highlight ---------- */
  function enhanceCode() {
    document.querySelectorAll("pre > code").forEach(code => {
      const pre = code.parentElement;
      if (pre.closest(".codewrap")) return; // already enhanced
      const lang = code.className.match(/language-(\w+)/);
      const file = pre.getAttribute("data-file") || (lang ? lang[1] : "code");
      const wrap = h("div", { class: "codewrap" });
      const top = h("div", { class: "code-top" });
      top.innerHTML = `<span class="dots"><i></i><i></i><i></i></span><span class="fname">${file}</span>
        <button class="copy" type="button" aria-label="Copy code">${I.copy}<span>Copy</span></button>`;
      pre.replaceWith(wrap);
      wrap.appendChild(top);
      wrap.appendChild(pre);
      top.querySelector(".copy").addEventListener("click", function () {
        copyText(code.textContent, this);
      });
    });
    if (window.Prism) window.Prism.highlightAll();
  }
  function copyText(text, btn) {
    const done = () => {
      if (!btn) return;
      const orig = btn.querySelector("span").textContent;
      btn.classList.add("copied"); btn.querySelector("span").textContent = "Copied";
      setTimeout(() => { btn.classList.remove("copied"); btn.querySelector("span").textContent = orig; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch {}
    document.body.removeChild(ta);
  }

  /* ---------- scroll reveal ---------- */
  function reveal() {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  }

  /* ---------- animated counters ---------- */
  function counters() {
    const els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        const el = en.target, target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || "";
        const dur = 1200, t0 = performance.now();
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          const e = 1 - Math.pow(1 - p, 3);
          el.textContent = (Number.isInteger(target) ? Math.round(target * e) : (target * e).toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    els.forEach(el => io.observe(el));
  }

  /* ---------- accordions & tabs (event-delegated) ---------- */
  function interactive() {
    document.addEventListener("click", e => {
      const head = e.target.closest(".acc-head");
      if (head) {
        const item = head.closest(".acc-item");
        const body = item.querySelector(".acc-body");
        const open = item.classList.toggle("open");
        body.style.maxHeight = open ? body.scrollHeight + "px" : "0";
      }
      const tab = e.target.closest(".tab");
      if (tab && tab.dataset.tab) {
        const group = tab.closest("[data-tabs]");
        group.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        group.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
        tab.classList.add("active");
        const panel = group.querySelector(`.panel[data-panel="${tab.dataset.tab}"]`);
        if (panel) panel.classList.add("active");
      }
    });
  }

  /* ---------- global key handler ---------- */
  function keys() {
    document.addEventListener("keydown", e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
      else if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
      else if (e.key === "Escape") closeSearch();
    });
    window.addEventListener("resize", () => { if (window.innerWidth > 860) toggleSidebar(false); });
  }

  /* ---------- init ---------- */
  function init() {
    initTheme();
    atmosphere();
    navbar();
    const docs = document.querySelector(".docs");
    if (docs) {
      sidebar(docs);
      const article = docs.querySelector(".content");
      const tocSlot = docs.querySelector("#toc-slot");
      if (article && tocSlot) toc(article, tocSlot);
    }
    searchModal();
    footer();
    enhanceCode();
    reveal();
    counters();
    interactive();
    keys();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
