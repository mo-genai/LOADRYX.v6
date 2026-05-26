/* ============================================================
   LOADRYX — Cart (localStorage)
   Persists across pages. Emits 'cart:change' on every mutation.
   ============================================================ */

(function (global) {
  "use strict";

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
