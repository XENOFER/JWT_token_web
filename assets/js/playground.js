/* =====================================================================
   CipherToken — Playground & Attack Demos
   All cryptography is real and runs in your browser. Every token here
   is fabricated for teaching. Nothing targets real systems.
   ===================================================================== */
(function () {
  "use strict";
  if (!window.JWT) { console.error("jwt.js not loaded"); return; }
  const J = window.JWT;
  const $ = (id) => document.getElementById(id);
  const now = () => Math.floor(Date.now() / 1000);

  // A deliberately strong demo secret + a deliberately weak one (in the wordlist).
  const STRONG = "C1ph3rT0k3n-Sup3r-S3cr3t-Key-No7-Guessable-2024!";
  const WEAK = "secret";
  const WORDLIST = ["123456", "password", "qwerty", "admin", "letmein", "welcome",
    "jwt", "token", "changeme", "secret", "root", "P@ssw0rd", "secret123", "key", "test"];

  /* ---------- shared renderers ---------- */
  function claimsTable(payload) {
    const checks = J.validateClaims(payload, { now: Date.now() });
    const icon = { pass: "✔", fail: "✘", warn: "▲", info: "•" };
    const color = { pass: "var(--ok)", fail: "var(--danger)", warn: "var(--warn)", info: "var(--accent)" };
    const rows = checks.map(c => `
      <tr>
        <td><code>${c.claim}</code></td>
        <td style="color:${color[c.status]};font-weight:600">${icon[c.status]} ${c.status}</td>
        <td>${c.value ? `<span class="muted">${J.escapeHtml(c.value)}</span><br>` : ""}${c.msg}</td>
      </tr>`).join("");
    return `<div class="table-wrap"><table><thead><tr><th>Claim</th><th>Status</th><th>Detail</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  function partCards(d) {
    if (!d.header && !d.payload) return "";
    return `<div class="part-cards">
      <div class="part-card h"><div class="pc-head"><i></i>HEADER · algorithm & type</div><pre>${J.escapeHtml(d.headerJson || "—")}</pre></div>
      <div class="part-card p"><div class="pc-head"><i></i>PAYLOAD · claims</div><pre>${J.escapeHtml(d.payloadJson || "—")}</pre></div>
      <div class="part-card s"><div class="pc-head"><i></i>SIGNATURE · verification</div><pre>${J.escapeHtml(d.signature || "(none)")}</pre></div>
    </div>`;
  }
  const ICON_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>';
  const ICON_BAD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>';
  const ICON_WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17v.5"/></svg>';
  function validityBanner(state, text) {
    const ic = state === "valid" ? ICON_OK : state === "invalid" ? ICON_BAD : ICON_WARN;
    return `<div class="validity ${state}">${ic}<span>${text}</span></div>`;
  }

  /* =================================================================
     BUILD TAB — live encoder
     ================================================================= */
  function initBuild() {
    const alg = $("b-alg"), payloadEl = $("b-payload"), secretEl = $("b-secret"),
          headerPrev = $("b-header-preview"), tokenEl = $("b-token"), claimsEl = $("b-claims"),
          secretField = $("b-secret-field");
    if (!alg) return;

    let timer;
    async function rebuild() {
      const algv = alg.value;
      const header = { alg: algv, typ: "JWT" };
      headerPrev.textContent = J.pretty(header);
      // none alg → no secret needed
      secretField.style.opacity = algv === "none" ? ".4" : "1";
      secretEl.disabled = algv === "none";

      let payload;
      try { payload = JSON.parse(payloadEl.value); }
      catch (e) {
        tokenEl.innerHTML = `<span style="color:var(--danger)">⚠ Payload is not valid JSON — ${J.escapeHtml(e.message)}</span>`;
        claimsEl.innerHTML = "";
        return;
      }
      try {
        const token = await J.sign(header, payload, secretEl.value);
        tokenEl.innerHTML = J.colorize(token);
        tokenEl.dataset.raw = token;
        claimsEl.innerHTML = claimsTable(payload);
      } catch (e) {
        tokenEl.innerHTML = `<span style="color:var(--danger)">${J.escapeHtml(e.message)}</span>`;
      }
    }
    const debounced = () => { clearTimeout(timer); timer = setTimeout(rebuild, 160); };
    [alg, payloadEl, secretEl].forEach(el => el.addEventListener("input", debounced));

    $("b-copy").addEventListener("click", function () {
      const raw = tokenEl.dataset.raw || "";
      if (navigator.clipboard) navigator.clipboard.writeText(raw);
      const s = this.querySelector("span"); const o = s.textContent;
      s.textContent = "Copied!"; this.classList.add("copied");
      setTimeout(() => { s.textContent = o; this.classList.remove("copied"); }, 1300);
    });
    $("b-send").addEventListener("click", () => {
      const raw = tokenEl.dataset.raw || "";
      const itok = $("i-token"), isec = $("i-secret");
      if (itok) { itok.value = raw; if (isec) isec.value = secretEl.value; }
      document.querySelector('[data-tab="inspect"]').click();
      inspectNow();
    });
    rebuild();
  }

  /* =================================================================
     INSPECT TAB — decode + verify
     ================================================================= */
  let inspectNow = () => {};
  function initInspect() {
    const tokenEl = $("i-token"), secretEl = $("i-secret"),
          decoded = $("i-decoded"), validity = $("i-validity"),
          claimsEl = $("i-claims"), warnEl = $("i-warn");
    if (!tokenEl) return;

    async function run() {
      const token = tokenEl.value.trim();
      if (!token) { decoded.innerHTML = ""; validity.innerHTML = ""; claimsEl.innerHTML = ""; warnEl.innerHTML = ""; return; }
      const d = J.decode(token);
      decoded.innerHTML = partCards(d);
      claimsEl.innerHTML = d.payload ? claimsTable(d.payload) : "";

      // errors / warnings
      let notes = "";
      d.errors.forEach(e => notes += `<div class="callout danger" style="margin-top:.6rem">${ICON_BAD}<p>${J.escapeHtml(e)}</p></div>`);
      d.warnings.forEach(w => notes += `<div class="callout warn" style="margin-top:.6rem">${ICON_WARN}<p>${J.escapeHtml(w)}</p></div>`);
      warnEl.innerHTML = notes;

      // verification
      if (!d.header) { validity.innerHTML = ""; return; }
      const alg = (d.header.alg || "").toLowerCase();
      if (alg === "none") {
        validity.innerHTML = validityBanner("invalid", 'Algorithm is "none" — this token is unsigned and must be rejected.');
      } else if (!J.HASH[d.header.alg]) {
        validity.innerHTML = validityBanner("unknown", `${d.header.alg} uses a public/private key — paste an HS* token to verify here.`);
      } else if (!secretEl.value) {
        validity.innerHTML = validityBanner("unknown", "Enter the secret to verify the HMAC signature.");
      } else {
        const r = await J.verify(token, secretEl.value);
        validity.innerHTML = validityBanner(r.valid ? "valid" : "invalid", r.reason);
      }
    }
    inspectNow = run;
    let t; const deb = () => { clearTimeout(t); t = setTimeout(run, 160); };
    tokenEl.addEventListener("input", deb);
    secretEl.addEventListener("input", deb);
    if ($("i-btn")) $("i-btn").addEventListener("click", run);
    run();
  }

  /* =================================================================
     DEMO 1 — none-algorithm forgery
     ================================================================= */
  async function initNoneDemo() {
    if (!$("none-src")) return;
    const valid = await J.sign({ alg: "HS256", typ: "JWT" },
      { sub: "1001", user: "ada", role: "user", iat: now() }, STRONG);
    $("none-src").value = valid;

    $("none-run").addEventListener("click", async () => {
      const out = $("none-out");
      const src = $("none-src").value.trim();
      const forged = J.forgeNone(src, p => { p.role = "admin"; return p; });
      // How a SECURE library responds:
      const secureCheck = await J.verify(forged, STRONG);
      out.innerHTML =
        `<span class="dim"># Original token (signed, role=user)</span>\n${trunc(src)}\n\n` +
        `<span class="accent"># Attacker rewrites the header to {"alg":"none"} and flips role→admin,</span>\n` +
        `<span class="accent"># then drops the signature entirely:</span>\n${trunc(forged)}\n\n` +
        `<span class="dim"># A NAÏVE server that trusts header.alg would skip verification and</span>\n` +
        `<span class="bad"># grant admin access. ← the vulnerability</span>\n\n` +
        `<span class="dim"># A SECURE server (this engine) refuses to verify alg:none:</span>\n` +
        `<span class="ok">→ ${secureCheck.valid ? "ACCEPTED (bad!)" : "REJECTED ✔ — " + secureCheck.reason}</span>`;
    });
  }

  /* =================================================================
     DEMO 2 — weak-secret dictionary attack
     ================================================================= */
  async function initWeakDemo() {
    if (!$("weak-src")) return;
    const weakToken = await J.sign({ alg: "HS256", typ: "JWT" },
      { sub: "42", user: "guest", role: "user", iat: now() }, WEAK);
    $("weak-src").value = weakToken;
    $("weak-list").textContent = WORDLIST.join("  ·  ");

    $("weak-run").addEventListener("click", async () => {
      const out = $("weak-out"); const btn = $("weak-run");
      btn.disabled = true;
      out.innerHTML = `<span class="dim"># Trying ${WORDLIST.length} common secrets against the signature…</span>\n`;
      const t0 = performance.now();
      const res = await J.dictionaryAttack(weakToken, WORDLIST, (word, tried) => {
        out.innerHTML += `<span class="dim">  [${tried}] ${J.escapeHtml(word)} … no</span>\n`;
        out.scrollTop = out.scrollHeight;
      });
      const ms = Math.round(performance.now() - t0);
      if (res.found) {
        out.innerHTML += `\n<span class="ok"># CRACKED in ${res.tried} guesses (${ms} ms): secret = "${J.escapeHtml(res.found)}"</span>\n`;
        out.innerHTML += `<span class="bad"># With the secret known, an attacker can mint ANY token they like.</span>\n`;
        out.innerHTML += `<span class="accent"># Fix: use a long, random, high-entropy secret (≥256 bits) so brute force is infeasible.</span>`;
      } else {
        out.innerHTML += `\n<span class="ok"># Not in this wordlist — a strong secret defeats the attack.</span>`;
      }
      btn.disabled = false;
    });
  }

  /* =================================================================
     DEMO 3 — payload tampering
     ================================================================= */
  async function initTamperDemo() {
    if (!$("tamper-src")) return;
    const valid = await J.sign({ alg: "HS256", typ: "JWT" },
      { sub: "7", user: "ada", role: "user", iat: now() }, STRONG);
    $("tamper-src").value = valid;

    $("tamper-run").addEventListener("click", async () => {
      const out = $("tamper-out");
      const parts = valid.split(".");
      const tamperedPayload = J.strToB64url(JSON.stringify(
        Object.assign(JSON.parse(J.b64urlToStr(parts[1])), { role: "admin" })));
      const tampered = parts[0] + "." + tamperedPayload + "." + parts[2]; // signature unchanged
      const check = await J.verify(tampered, STRONG);
      out.innerHTML =
        `<span class="dim"># Original payload role: </span><span class="ok">user</span>\n` +
        `<span class="dim"># Attacker edits the Base64URL payload to role: </span><span class="bad">admin</span>\n` +
        `<span class="dim"># …but cannot recompute the signature without the secret, so it stays the same.</span>\n\n` +
        `${trunc(tampered)}\n\n` +
        `<span class="dim"># Server verifies signature over the (now changed) header.payload:</span>\n` +
        `<span class="${check.valid ? "bad" : "ok"}">→ ${check.valid ? "ACCEPTED (bad!)" : "REJECTED ✔ — " + check.reason}</span>\n\n` +
        `<span class="accent"># This is exactly why the signature exists: it binds the claims to a key.</span>`;
    });
  }

  /* =================================================================
     DEMO 4 — expired token
     ================================================================= */
  async function initExpiredDemo() {
    if (!$("exp-src")) return;
    const expired = await J.sign({ alg: "HS256", typ: "JWT" },
      { sub: "9", user: "ada", role: "user", iat: now() - 7200, exp: now() - 3600 }, STRONG);
    $("exp-src").value = expired;

    $("exp-run").addEventListener("click", async () => {
      const out = $("exp-out");
      const sigOk = await J.verify(expired, STRONG);
      const d = J.decode(expired);
      const checks = J.validateClaims(d.payload, { now: Date.now() });
      const expCheck = checks.find(c => c.claim === "exp");
      out.innerHTML =
        `<span class="dim"># Signature check:</span> <span class="${sigOk.valid ? "ok" : "bad"}">${sigOk.valid ? "valid ✔" : "invalid"}</span>\n` +
        `<span class="dim"># A perfectly-signed token can STILL be unsafe to accept:</span>\n\n` +
        `<span class="dim">exp = ${J.fmtTime(d.payload.exp)}</span>\n` +
        `<span class="bad">→ ${expCheck.msg}</span>\n\n` +
        `<span class="accent"># Signature validity ≠ token validity. Always check exp (and nbf) after verifying the signature.</span>`;
    });
  }

  function trunc(s, n) { n = n || 96; return s.length > n ? s.slice(0, n) + "…" : s; }

  /* ---------- boot ---------- */
  function boot() {
    initBuild();
    initInspect();
    initNoneDemo();
    initWeakDemo();
    initTamperDemo();
    initExpiredDemo();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
