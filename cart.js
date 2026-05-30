/* ============================================================
   LOADRYX — Cart (localStorage)
   Persists across pages. Emits 'cart:change' on every mutation.
   ============================================================ */

(function (global) {
  "use strict";

  const MOBILE_TABLET_FIXES_ID = "loadryx-mobile-tablet-fixes";
  const MOBILE_TABLET_FIXES = `
@media (max-width: 980px) {
  .menu-backdrop {
    z-index: 45 !important;
  }

  .primary-nav {
    z-index: 60 !important;
  }

  .hero {
    height: 100svh !important;
    min-height: 720px !important;
  }

  .hero-content {
    top: 54% !important;
    bottom: auto !important;
    transform: translateY(-50%) !important;
    max-width: min(640px, calc(100vw - (var(--pad-x) * 2))) !important;
    padding-inline-end: 0 !important;
  }
}

@media (min-width: 641px) and (max-width: 980px) {
  .hero-content {
    inset-inline-start: 6vw !important;
    inset-inline-end: 6vw !important;
  }

  .hero-title {
    margin-bottom: 22px !important;
  }

  .hero-title__line--top {
    font-size: clamp(36px, 6vw, 52px) !important;
  }

  .hero-title__line--bot {
    font-size: clamp(52px, 8vw, 72px) !important;
  }

  .hero-subtitle {
    max-width: 580px !important;
    margin-bottom: 28px !important;
    font-size: 15.5px !important;
  }
}

@media (max-width: 640px) {
  .hero {
    height: 100svh !important;
    min-height: 100svh !important;
  }

  .hero-content {
    top: 56% !important;
    inset-inline-start: 0 !important;
    inset-inline-end: 0 !important;
    padding-inline: var(--pad-x) !important;
    max-width: 100% !important;
  }

  .hero-eyebrow {
    margin-bottom: 12px !important;
    font-size: 11px !important;
    letter-spacing: .16em !important;
  }

  .hero-title {
    display: block !important;
    width: 100% !important;
    margin: 0 0 18px !important;
    padding: 12px 18px !important;
  }

  .hero-title__line {
    white-space: normal !important;
  }

  .hero-title__line--top {
    font-size: clamp(28px, 8vw, 36px) !important;
  }

  .hero-title__line--bot {
    font-size: clamp(38px, 11vw, 50px) !important;
  }

  .hero-subtitle {
    max-width: 100% !important;
    margin: 0 0 22px !important;
    font-size: 14px !important;
    line-height: 1.75 !important;
  }

  .hero-cta {
    display: grid !important;
    grid-template-columns: minmax(0, 1.35fr) minmax(0, .9fr) !important;
    gap: 12px !important;
    width: 100% !important;
    align-items: stretch !important;
  }

  .hero-cta .btn {
    width: 100% !important;
    min-width: 0 !important;
    height: 50px !important;
  }

  .hero-cta .btn--primary {
    font-size: 14px !important;
  }

  .hero-cta .btn--ghost {
    justify-content: center !important;
    padding-inline: 8px !important;
  }
}

@media (max-width: 380px) {
  .hero-content {
    top: 55% !important;
  }

  .hero-title__line--top {
    font-size: 24px !important;
  }

  .hero-title__line--bot {
    font-size: 34px !important;
  }

  .hero-cta {
    grid-template-columns: 1fr !important;
  }
}
`;

  function injectMobileTabletFixes() {
    if (document.getElementById(MOBILE_TABLET_FIXES_ID)) return;
    const style = document.createElement("style");
    style.id = MOBILE_TABLET_FIXES_ID;
    style.textContent = MOBILE_TABLET_FIXES;
    document.head.appendChild(style);
  }

  if (document.head) injectMobileTabletFixes();
  else document.addEventListener("DOMContentLoaded", injectMobileTabletFixes, { once: true });

  const KEY = "loadryx_cart_v1";

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (_) {
      return [];
    }
  }

  function write(items) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch (_) {}
    emit();
  }

  function emit() {
    try {
      window.dispatchEvent(new CustomEvent("cart:change", { detail: { count: count(), total: total() } }));
    } catch (_) {}
  }

  function get() {
    return read();
  }

  function add(id, qty = 1) {
    if (!id) return;
    const items = read();
    const existing = items.find((it) => it.id === id);
    if (existing) existing.qty = Math.min((existing.qty || 0) + qty, 99);
    else items.push({ id, qty: Math.max(1, qty) });
    write(items);
  }

  function remove(id) {
    write(read().filter((it) => it.id !== id));
  }

  function setQty(id, qty) {
    const items = read();
    const it = items.find((x) => x.id === id);
    if (!it) return;
    it.qty = Math.max(1, Math.min(99, qty | 0));
    write(items);
  }

  function clear() {
    write([]);
  }

  function count() {
    return read().reduce((s, it) => s + (it.qty || 0), 0);
  }

  function total() {
    if (!global.LR_DATA) return 0;
    return read().reduce((s, it) => {
      const p = global.LR_DATA.getProduct(it.id);
      return s + (p ? p.price * it.qty : 0);
    }, 0);
  }

  /* sync across tabs */
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) emit();
  });

  global.LR_CART = { get, add, remove, setQty, clear, count, total };
})(window);
