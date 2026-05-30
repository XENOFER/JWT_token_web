/* =====================================================================
   CipherToken — JWT engine (vanilla JS, Web Crypto API)
   Real HS256/384/512 signing & verification. No backend, no fakery.
   Exposed as window.JWT
   ===================================================================== */
(function (global) {
  "use strict";

  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const HASH = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" };

  /* ---------- base64url ---------- */
  function bytesToB64url(bytes) {
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function b64urlToBytes(str) {
    str = String(str).replace(/-/g, "+").replace(/_/g, "/").replace(/\s+/g, "");
    const pad = str.length % 4;
    if (pad) str += "=".repeat(4 - pad);
    const bin = atob(str);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  const strToB64url = (s) => bytesToB64url(enc.encode(s));
  const b64urlToStr = (s) => dec.decode(b64urlToBytes(s));
  const jsonToB64url = (o) => strToB64url(JSON.stringify(o));

  /* ---------- pretty print ---------- */
  function pretty(obj) {
    try { return JSON.stringify(obj, null, 2); }
    catch { return String(obj); }
  }

  /* ---------- decode (no verification) ---------- */
  function decode(token) {
    const result = {
      ok: false, raw: token, parts: [],
      header: null, payload: null, signature: "",
      headerJson: "", payloadJson: "", errors: [], warnings: []
    };
    if (!token || typeof token !== "string") {
      result.errors.push("No token provided.");
      return result;
    }
    const parts = token.trim().split(".");
    result.parts = parts;
    if (parts.length !== 3) {
      result.errors.push(
        `A JWT has 3 dot-separated parts; this one has ${parts.length}.`
      );
      if (parts.length < 2) return result;
    }
    try {
      result.header = JSON.parse(b64urlToStr(parts[0]));
      result.headerJson = pretty(result.header);
    } catch (e) { result.errors.push("Header is not valid Base64URL-encoded JSON."); }
    try {
      result.payload = JSON.parse(b64urlToStr(parts[1]));
      result.payloadJson = pretty(result.payload);
    } catch (e) { result.errors.push("Payload is not valid Base64URL-encoded JSON."); }
    result.signature = parts[2] || "";

    if (result.header) {
      const alg = result.header.alg;
      if (typeof alg === "string" && alg.toLowerCase() === "none") {
        result.warnings.push('Header declares alg:"none" — an unsigned token. Never accept this on a server.');
      }
      if (result.signature === "" && alg && alg.toLowerCase() !== "none") {
        result.warnings.push("Signature segment is empty while a signing algorithm is declared.");
      }
    }
    result.ok = result.errors.length === 0;
    return result;
  }

  /* ---------- claim validation ---------- */
  function validateClaims(payload, opts) {
    opts = opts || {};
    const now = Math.floor((opts.now || Date.now()) / 1000);
    const skew = opts.leeway || 0;
    const checks = [];
    if (!payload || typeof payload !== "object") {
      return [{ claim: "—", status: "warn", msg: "No readable payload to validate." }];
    }
    // exp
    if ("exp" in payload) {
      const exp = Number(payload.exp);
      const expired = now > exp + skew;
      checks.push({
        claim: "exp", value: fmtTime(exp), status: expired ? "fail" : "pass",
        msg: expired ? `Expired ${rel(now - exp)} ago.` : `Valid for ${rel(exp - now)} more.`
      });
    } else {
      checks.push({ claim: "exp", status: "warn", msg: "Missing — token never expires. Add a short expiry." });
    }
    // nbf
    if ("nbf" in payload) {
      const nbf = Number(payload.nbf);
      const notyet = now + skew < nbf;
      checks.push({
        claim: "nbf", value: fmtTime(nbf), status: notyet ? "fail" : "pass",
        msg: notyet ? `Not valid for another ${rel(nbf - now)}.` : "Active (not-before has passed)."
      });
    }
    // iat
    if ("iat" in payload) {
      const iat = Number(payload.iat);
      const future = iat > now + 60;
      checks.push({
        claim: "iat", value: fmtTime(iat), status: future ? "warn" : "pass",
        msg: future ? "Issued in the future — clock skew or forgery?" : `Issued ${rel(now - iat)} ago.`
      });
    }
    ["iss", "aud", "sub"].forEach((c) => {
      if (c in payload) checks.push({ claim: c, value: String(payload[c]), status: "info", msg: "Verify this against an allow-list on the server." });
    });
    return checks;
  }

  function fmtTime(s) {
    if (!isFinite(s)) return "invalid";
    return new Date(s * 1000).toUTCString();
  }
  function rel(secs) {
    secs = Math.abs(secs);
    if (secs < 60) return secs + "s";
    if (secs < 3600) return Math.round(secs / 60) + "m";
    if (secs < 86400) return Math.round(secs / 3600) + "h";
    return Math.round(secs / 86400) + "d";
  }

  /* ---------- HMAC sign / verify ---------- */
  async function hmacKey(secret, hash, usages) {
    return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash }, false, usages);
  }
  async function sign(header, payload, secret) {
    const alg = header.alg;
    if (alg && alg.toLowerCase() === "none") {
      return jsonToB64url(header) + "." + jsonToB64url(payload) + ".";
    }
    const hash = HASH[alg];
    if (!hash) throw new Error('Engine supports HS256/384/512 and "none". Got: ' + alg);
    const signingInput = jsonToB64url(header) + "." + jsonToB64url(payload);
    const key = await hmacKey(secret, hash, ["sign"]);
    const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(signingInput)));
    return signingInput + "." + bytesToB64url(sig);
  }
  async function verify(token, secret) {
    const parts = String(token).trim().split(".");
    if (parts.length < 2) return { valid: false, reason: "Malformed token." };
    let header;
    try { header = JSON.parse(b64urlToStr(parts[0])); }
    catch { return { valid: false, reason: "Unreadable header." }; }
    const alg = header.alg;
    if (typeof alg === "string" && alg.toLowerCase() === "none") {
      return { valid: false, reason: 'alg:"none" — there is nothing to verify. Reject outright.' };
    }
    const hash = HASH[alg];
    if (!hash) return { valid: false, reason: `This demo verifies HMAC only; "${alg}" needs a public key.` };
    if (!parts[2]) return { valid: false, reason: "No signature present." };
    try {
      const key = await hmacKey(secret, hash, ["verify"]);
      const ok = await crypto.subtle.verify("HMAC", key, b64urlToBytes(parts[2]), enc.encode(parts[0] + "." + parts[1]));
      return { valid: ok, reason: ok ? "Signature matches the secret." : "Signature does NOT match this secret." };
    } catch (e) {
      return { valid: false, reason: "Verification error: " + e.message };
    }
  }

  /* ---------- educational: dictionary attack on a weak HS256 secret ---------- */
  // Runs entirely client-side against a token YOU provide, using a small wordlist.
  async function dictionaryAttack(token, wordlist, onProgress) {
    const parts = String(token).trim().split(".");
    let header;
    try { header = JSON.parse(b64urlToStr(parts[0])); } catch { return { found: null, tried: 0, error: "Bad header" }; }
    if (!HASH[header.alg]) return { found: null, tried: 0, error: "Not an HMAC token" };
    let tried = 0;
    for (const word of wordlist) {
      tried++;
      const r = await verify(token, word);
      if (onProgress && tried % 4 === 0) onProgress(word, tried);
      if (r.valid) return { found: word, tried };
    }
    return { found: null, tried };
  }

  /* ---------- educational: forge a "none" token from an existing one ---------- */
  function forgeNone(token, mutate) {
    const d = decode(token);
    const header = Object.assign({}, d.header || { typ: "JWT" }, { alg: "none" });
    let payload = Object.assign({}, d.payload || {});
    if (typeof mutate === "function") payload = mutate(payload) || payload;
    return jsonToB64url(header) + "." + jsonToB64url(payload) + ".";
  }

  const PRESETS = {
    user: { alg: "HS256", typ: "JWT" },
    payload: { sub: "1234567890", name: "Ada Lovelace", role: "user", iat: 0, exp: 0 }
  };

  /* ---------- UI: color-code a token string into header/payload/signature ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  }
  function colorize(token) {
    const parts = String(token || "").split(".");
    const cls = ["h", "p", "s"];
    return parts.map((seg, i) => {
      const c = cls[i] || "s";
      const body = `<span class="tok ${c}">${escapeHtml(seg) || (i === 2 ? "<em style='opacity:.5'>(empty)</em>" : "")}</span>`;
      return i < parts.length - 1 ? body + '<span class="tok dot">.</span>' : body;
    }).join("");
  }

  global.JWT = {
    bytesToB64url, b64urlToBytes, strToB64url, b64urlToStr, jsonToB64url, pretty,
    decode, validateClaims, sign, verify, dictionaryAttack, forgeNone, colorize, escapeHtml,
    fmtTime, rel, HASH, PRESETS
  };
})(typeof window !== "undefined" ? window : globalThis);
