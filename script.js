/* ============================================================
   LOADRYX — main script
   - Tactical Signal Field canvas (grid + nodes + pings + crosshair)
   - HUD headline (3D tilt + continuous scan line, transform-only)
   - Section indicator: clickable smooth-scroll dots
   - Right-click disable on hero media
   - Cart drawer + counter sync
   - Mobile menu, smooth scroll, scroll-spy, accordion, reveal
   - Header scroll state
   ============================================================ */

(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarse      = window.matchMedia("(pointer: coarse)").matches;

  /* ============================================================
     1. Hero video — autoplay attempt + error fallback + no-save
     ============================================================ */
  const videoMedia = document.querySelector(".hero-media");
  const heroVideo  = document.querySelector(".hero-video");
  if (heroVideo && videoMedia) {
    const fail = () => videoMedia.classList.add("is-video-failed");
    heroVideo.addEventListener("error", fail, { once: true });
    heroVideo.addEventListener("stalled", () => { if (heroVideo.readyState < 2) fail(); });
    const p = heroVideo.play();
    if (p && typeof p.catch === "function") p.catch(() => {});

    // disable context menu / drag on the hero media to discourage saving
    const noMenu = (e) => e.preventDefault();
    videoMedia.addEventListener("contextmenu", noMenu);
    heroVideo.addEventListener("contextmenu", noMenu);
    const fb = document.querySelector(".hero-fallback");
    if (fb) {
      fb.addEventListener("contextmenu", noMenu);
      fb.addEventListener("dragstart", noMenu);
    }
    heroVideo.setAttribute("controlslist", "nodownload noplaybackrate noremoteplayback");
    heroVideo.setAttribute("disablepictureinpicture", "");
  }

  /* ============================================================
     2. TACTICAL SIGNAL FIELD — canvas
     A premium tactical/HUD background:
     - faint grid
     - fixed node points
     - occasional signal pings expanding from nodes
     - faint connection lines between close nodes
     - smooth crosshair tracker following the mouse
     All transform/draw-only, capped at ~60fps, paused on hidden tab.
     ============================================================ */
  const canvas = document.getElementById("hero-particles");
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext("2d", { alpha: true });
    let w = 0, h = 0, dpr = 1;
    let nodes = [];
    let pings = [];
    let rafId = 0, running = true, lastT = 0;
    let mx = -9999, my = -9999, tmx = -9999, tmy = -9999;
    let lastPingAt = 0;

    const GRID_SIZE = 64;
    const GRID_ALPHA = 0.045;
    const NODE_COUNT_TARGET = 14;
    const PING_LIFESPAN = 2200;       // ms
    const PING_MAX_R = 110;            // px
    const CONN_MAX = 170;              // px
    const CONN_MAX_SQ = CONN_MAX * CONN_MAX;
    const PING_INTERVAL = [900, 2200]; // ms range between pings

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    }

    function buildNodes() {
      // distribute nodes pseudo-evenly using a coarse 4×3 grid jitter
      const cols = 5, rows = 3;
      nodes = [];
      const targetCount = Math.min(NODE_COUNT_TARGET, cols * rows);
      const used = new Set();
      while (nodes.length < targetCount) {
        const c = Math.floor(Math.random() * cols);
        const r = Math.floor(Math.random() * rows);
        const key = `${c},${r}`;
        if (used.has(key)) continue;
        used.add(key);
        const cellW = w / cols, cellH = h / rows;
        nodes.push({
          x: cellW * c + cellW * (0.25 + Math.random() * 0.5),
          y: cellH * r + cellH * (0.25 + Math.random() * 0.5),
          baseAlpha: 0.35 + Math.random() * 0.35,
        });
      }
    }

    function drawGrid() {
      ctx.strokeStyle = `rgba(3, 131, 244, ${GRID_ALPHA})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = (w / 2) % GRID_SIZE; x < w; x += GRID_SIZE) {
        ctx.moveTo(x, 0); ctx.lineTo(x, h);
      }
      for (let y = (h / 2) % GRID_SIZE; y < h; y += GRID_SIZE) {
        ctx.moveTo(0, y); ctx.lineTo(w, y);
      }
      ctx.stroke();
    }

    function drawConnections() {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < CONN_MAX_SQ) {
            const k = 1 - d2 / CONN_MAX_SQ;
            ctx.strokeStyle = `rgba(3, 131, 244, ${(k * 0.08).toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    function drawNodes() {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        // outer faint ring
        ctx.strokeStyle = `rgba(3, 131, 244, ${(n.baseAlpha * 0.25).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(n.x, n.y, 3.5, 0, Math.PI * 2); ctx.stroke();
        // inner solid dot
        ctx.fillStyle = `rgba(3, 131, 244, ${n.baseAlpha.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2); ctx.fill();
      }
    }

    function spawnPing(now) {
      if (!nodes.length) return;
      const n = nodes[Math.floor(Math.random() * nodes.length)];
      pings.push({ x: n.x, y: n.y, t0: now });
    }

    function drawPings(now) {
      for (let i = pings.length - 1; i >= 0; i--) {
        const p = pings[i];
        const t = (now - p.t0) / PING_LIFESPAN;
        if (t >= 1) { pings.splice(i, 1); continue; }
        // ease-out
        const eased = 1 - Math.pow(1 - t, 2.4);
        const r = eased * PING_MAX_R;
        const a = (1 - t) * 0.55;
        ctx.strokeStyle = `rgba(3, 131, 244, ${a.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
      }
    }

    function drawCrosshair() {
      // smooth-follow mouse
      mx += (tmx - mx) * 0.18;
      my += (tmy - my) * 0.18;
      if (tmx < -1000) return;
      const x = mx, y = my;

      ctx.strokeStyle = "rgba(3, 131, 244, 0.55)";
      ctx.lineWidth = 1;

      // four small ticks around the cursor
      const gap = 10, len = 12;
      ctx.beginPath();
      ctx.moveTo(x - gap - len, y); ctx.lineTo(x - gap, y);
      ctx.moveTo(x + gap,        y); ctx.lineTo(x + gap + len, y);
      ctx.moveTo(x, y - gap - len);  ctx.lineTo(x, y - gap);
      ctx.moveTo(x, y + gap);        ctx.lineTo(x, y + gap + len);
      ctx.stroke();

      // tracking ring
      ctx.strokeStyle = "rgba(3, 131, 244, 0.30)";
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.stroke();

      // corner brackets (small offset square)
      const b = 22, bl = 6;
      ctx.strokeStyle = "rgba(3, 131, 244, 0.18)";
      ctx.beginPath();
      ctx.moveTo(x - b, y - b + bl); ctx.lineTo(x - b, y - b); ctx.lineTo(x - b + bl, y - b);
      ctx.moveTo(x + b - bl, y - b); ctx.lineTo(x + b, y - b); ctx.lineTo(x + b, y - b + bl);
      ctx.moveTo(x - b, y + b - bl); ctx.lineTo(x - b, y + b); ctx.lineTo(x - b + bl, y + b);
      ctx.moveTo(x + b - bl, y + b); ctx.lineTo(x + b, y + b); ctx.lineTo(x + b, y + b - bl);
      ctx.stroke();
    }

    function frame(t) {
      if (!running) { rafId = 0; return; }
      const dt = t - lastT;
      if (dt < 14) { rafId = requestAnimationFrame(frame); return; }
      lastT = t;

      ctx.clearRect(0, 0, w, h);
      drawGrid();
      drawConnections();
      drawPings(t);
      drawNodes();
      drawCrosshair();

      // schedule next ping
      if (t > lastPingAt) {
        spawnPing(t);
        lastPingAt = t + PING_INTERVAL[0] + Math.random() * (PING_INTERVAL[1] - PING_INTERVAL[0]);
      }

      rafId = requestAnimationFrame(frame);
    }

    function start() { if (rafId) return; running = true; lastT = 0; rafId = requestAnimationFrame(frame); }
    function stop()  { running = false; if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } }

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      tmx = e.clientX - rect.left;
      tmy = e.clientY - rect.top;
      if (mx < -1000) { mx = tmx; my = tmy; }
    }, { passive: true });
    window.addEventListener("pointerleave", () => { tmx = -9999; });
    document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else start(); });

    resize();
    start();
  }

  /* ============================================================
     3. HUD headline — 3D tilt + continuous scan line
     Pure transform animation, no reflow.
     ============================================================ */
  const title = document.querySelector("[data-tactical-title]");
  if (title && !reducedMotion && !isCoarse) {
    let pmx = 0, pmy = 0;          // target normalized -1..1
    let cur = { x: 0, y: 0 };
    let raf = 0;
    let active = false;

    function onMove(e) {
      const r = title.getBoundingClientRect();
      pmx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      pmy = Math.max(-1, Math.min(1, (e.clientY - (r.top  + r.height / 2)) / (r.height / 2)));
      if (!active) { active = true; raf = requestAnimationFrame(loop); }
    }
    function onLeave() { pmx = 0; pmy = 0; }

    function loop() {
      cur.x += (pmx - cur.x) * 0.10;
      cur.y += (pmy - cur.y) * 0.10;
      title.style.setProperty("--tx", cur.x.toFixed(3));
      title.style.setProperty("--ty", cur.y.toFixed(3));
      if (Math.abs(cur.x - pmx) > 0.001 || Math.abs(cur.y - pmy) > 0.001 || pmx || pmy) {
        raf = requestAnimationFrame(loop);
      } else {
        active = false;
        title.style.setProperty("--tx", 0);
        title.style.setProperty("--ty", 0);
      }
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
  }

  /* ============================================================
     4. Header scroll state
     ============================================================ */
  const header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (header) header.classList.toggle("is-scrolled", window.pageYOffset > 12);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ============================================================
     5. Mobile menu
     ============================================================ */
  const navEl   = document.getElementById("primary-nav");
  const openBtn = document.querySelector("[data-menu-open]");
  const closeBtn= document.querySelector("[data-menu-close]");

  if (navEl && openBtn) {
    const backdrop = document.createElement("div");
    backdrop.className = "menu-backdrop";
    document.body.appendChild(backdrop);

    const openMenu = () => {
      navEl.classList.add("is-open");
      backdrop.classList.add("is-open");
      document.body.classList.add("is-menu-open");
    };
    const closeMenu = () => {
      navEl.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      document.body.classList.remove("is-menu-open");
    };

    openBtn.addEventListener("click", openMenu);
    closeBtn && closeBtn.addEventListener("click", closeMenu);
    backdrop.addEventListener("click", closeMenu);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
    navEl.addEventListener("click", (e) => { if (e.target.matches("a")) closeMenu(); });
  }

  /* ============================================================
     6. Smooth scroll for in-page hash links
     ============================================================ */
  const headerOffset = () => (document.querySelector(".site-header")?.offsetHeight || 80) + 12;
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
    window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
  });

  /* ============================================================
     7. Section indicator — clickable dots
     ============================================================ */
  document.querySelectorAll("[data-indicator-dot]").forEach((dot) => {
    dot.style.cursor = "pointer";
    dot.addEventListener("click", () => {
      const id = dot.getAttribute("data-target");
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
      window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
    });
  });

  /* ============================================================
     8. Scroll-spy: active indicator dot
     ============================================================ */
  const sectionsToSpy = ["home","why","products","faq","contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const indicatorDots = document.querySelectorAll("[data-indicator-dot]");

  if ("IntersectionObserver" in window && sectionsToSpy.length) {
    const observer = new IntersectionObserver((entries) => {
      let best = null;
      entries.forEach((e) => {
        if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) best = e;
      });
      if (best) {
        const id = best.target.id;
        indicatorDots.forEach((d) => d.classList.toggle("is-active", d.getAttribute("data-target") === id));
      }
    }, {
      rootMargin: "-40% 0px -50% 0px",
      threshold: [0, .1, .25, .5, .75, 1]
    });
    sectionsToSpy.forEach((s) => observer.observe(s));
  }

  /* ============================================================
     9. Scroll reveal
     ============================================================ */
  if ("IntersectionObserver" in window) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          revealObs.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    document.querySelectorAll("[data-reveal]").forEach((el) => revealObs.observe(el));
  } else {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
  }

  /* ============================================================
    10. FAQ accordion (one open at a time)
     ============================================================ */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        faqItems.forEach((other) => { if (other !== item && other.open) other.open = false; });
      }
    });
  });

  /* ============================================================
    11. Product category tabs
     ============================================================ */
  const catTabs = document.querySelectorAll("[data-cat-tab]");
  const catPanels = document.querySelectorAll("[data-cat-panel]");
  function switchProductCategory(cat) {
    catTabs.forEach((t) => {
      const isActive = t.getAttribute("data-cat-tab") === cat;
      t.classList.toggle("is-active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    catPanels.forEach((p) => {
      const isMatch = p.getAttribute("data-cat-panel") === cat;
      if (isMatch) {
        p.removeAttribute("hidden");
        p.querySelectorAll("[data-reveal]").forEach((el) => {
          el.classList.remove("is-in");
          requestAnimationFrame(() => el.classList.add("is-in"));
        });
      } else {
        p.setAttribute("hidden", "");
      }
    });
  }
  catTabs.forEach((t) => t.addEventListener("click", () => switchProductCategory(t.getAttribute("data-cat-tab"))));

  /* ============================================================
    12. Add-to-cart (delegated)
     ============================================================ */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-to-cart]");
    if (!btn || !window.LR_CART) return;
    e.preventDefault();
    const id = btn.getAttribute("data-add-to-cart");
    const qty = parseInt(btn.getAttribute("data-qty") || "1", 10);
    window.LR_CART.add(id, qty);
    flashButton(btn, "✓ تمت الإضافة");
    openCartDrawer();
  });

  function flashButton(btn, text) {
    const original = btn.innerHTML;
    btn.classList.add("is-added");
    btn.innerHTML = `<span>${text}</span>`;
    setTimeout(() => {
      btn.classList.remove("is-added");
      btn.innerHTML = original;
    }, 1400);
  }

  /* ============================================================
    13. Cart drawer + counter sync
     ============================================================ */
  function refreshCartUI() {
    if (!window.LR_CART) return;
    const items = window.LR_CART.get();
    const count = window.LR_CART.count();
    const total = window.LR_CART.total();

    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = count;
      el.classList.toggle("is-empty", count === 0);
    });
    document.querySelectorAll("[data-cart-total]").forEach((el) => {
      el.textContent = window.LR_DATA ? window.LR_DATA.formatPrice(total) : total;
    });

    const body = document.querySelector("[data-cart-body]");
    if (body && window.LR_DATA) {
      if (!items.length) {
        body.innerHTML = `
          <div class="cart-empty">
            <div class="cart-empty__icon">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 7h3l2 14a2 2 0 0 0 2 1.5h10a2 2 0 0 0 2-1.5l1.5-9H9"/><circle cx="13" cy="26" r="1.4" fill="currentColor"/><circle cx="22" cy="26" r="1.4" fill="currentColor"/></svg>
            </div>
            <p>سلتك فارغة حالياً.<br/>تصفّح المنتجات وأضف ما يناسبك.</p>
            <a href="products.html" class="btn btn--primary btn--solid">تصفّح المنتجات</a>
          </div>`;
      } else {
        body.innerHTML = items.map((it) => {
          const p = window.LR_DATA.getProduct(it.id);
          if (!p) return "";
          return `
            <div class="cart-line" data-cart-line="${p.id}">
              <div class="cart-line__art product-art product-art--${p.art.kind}">
                ${p.art.lines.map((l, i) => `<span class="product-art__${i === 0 ? 'game' : 'legend'}">${l}</span>`).join("")}
              </div>
              <div class="cart-line__body">
                <div class="cart-line__cat">${(window.LR_DATA.getCategory(p.cat)||{}).name||""}</div>
                <h4 class="cart-line__name">${p.name}</h4>
                <div class="cart-line__qty">
                  <button type="button" data-qty-dec aria-label="ناقص">−</button>
                  <span data-qty>${it.qty}</span>
                  <button type="button" data-qty-inc aria-label="زائد">+</button>
                </div>
              </div>
              <div class="cart-line__price">
                <div class="price">
                  <span class="price__amount">${window.LR_DATA.formatPrice(p.price * it.qty)}</span>
                  <span class="price__currency"><svg class="sar-icon"><use href="#sar-symbol"/></svg></span>
                </div>
                <button type="button" class="cart-line__remove" data-remove aria-label="حذف">حذف</button>
              </div>
            </div>`;
        }).join("");
      }
    }
  }

  function openCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    if (!drawer) return;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-drawer-open");
  }
  function closeCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-drawer-open");
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-cart-toggle]")) { e.preventDefault(); openCartDrawer(); }
    if (e.target.closest("[data-cart-close]"))  { closeCartDrawer(); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCartDrawer(); });

  document.addEventListener("click", (e) => {
    const line = e.target.closest("[data-cart-line]");
    if (!line || !window.LR_CART) return;
    const id = line.getAttribute("data-cart-line");
    if (e.target.closest("[data-qty-inc]")) {
      const cur = window.LR_CART.get().find((x) => x.id === id);
      if (cur) window.LR_CART.setQty(id, cur.qty + 1);
    } else if (e.target.closest("[data-qty-dec]")) {
      const cur = window.LR_CART.get().find((x) => x.id === id);
      if (cur) window.LR_CART.setQty(id, Math.max(1, cur.qty - 1));
    } else if (e.target.closest("[data-remove]")) {
      window.LR_CART.remove(id);
    }
  });

  window.addEventListener("cart:change", refreshCartUI);
  setTimeout(refreshCartUI, 60);

})();
