/* ============================================================
   LOADRYX — main script
   - Hero proximity headline (transform-only, GPU, zero reflow)
   - Canvas particles (proofcore-inspired: sparse + connections)
   - Cart drawer + page-level cart sync
   - Mobile menu, smooth scroll, scroll-spy, accordion, reveal
   - Header scroll state
   ============================================================ */

(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarse      = window.matchMedia("(pointer: coarse)").matches;

  /* ============================================================
     1. Hero video error fallback
     ============================================================ */
  const videoMedia = document.querySelector(".hero-media");
  const heroVideo  = document.querySelector(".hero-video");
  if (heroVideo && videoMedia) {
    const fail = () => videoMedia.classList.add("is-video-failed");
    heroVideo.addEventListener("error", fail, { once: true });
    heroVideo.addEventListener("stalled", () => { if (heroVideo.readyState < 2) fail(); });
    const p = heroVideo.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }

  /* ============================================================
     2. Canvas particles — Proofcore-style
     - dense white micro particles
     - transparent canvas over hero
     - click pushes 4 particles
     - retina support + pause on hidden tab
     ============================================================ */
  const canvas = document.getElementById("hero-particles");
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext("2d", { alpha: true });
    let w = 0, h = 0, dpr = 1;
    let particles = [];
    let rafId = 0;
    let running = true;
    let lastT = 0;

    const PARTICLE_COLOR = "255, 255, 255";

    function random(min, max) {
      return min + Math.random() * (max - min);
    }

    function makeParticle(x = Math.random() * w, y = Math.random() * h) {
      const speed = random(0.10, 1.00);
      const angle = Math.random() * Math.PI * 2;

      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: random(0.40, 1.00),
        a: random(0.10, 1.00),
        pulse: Math.random() * Math.PI * 2
      };
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width || window.innerWidth;
      h = rect.height || window.innerHeight;

      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      build();
    }

    function build() {
      // قريب من إحساس Proofcore: كثافة عالية، لكن محدودة عشان ما يثقل المتجر
      const count = Math.max(260, Math.min(1200, Math.round((w * h) / 950)));
      particles = new Array(count);

      for (let i = 0; i < count; i++) {
        particles[i] = makeParticle();
      }
    }

    function step(t) {
      if (!running) { rafId = 0; return; }

      // cap around 60fps
      if (t - lastT < 14) {
        rafId = requestAnimationFrame(step);
        return;
      }
      lastT = t;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.035;

        // Proofcore-style out mode: إذا طلعت من الشاشة ترجع من الجهة الثانية
        if (p.x < -8) p.x = w + 8;
        else if (p.x > w + 8) p.x = -8;

        if (p.y < -8) p.y = h + 8;
        else if (p.y > h + 8) p.y = -8;

        const alpha = Math.max(0.05, Math.min(1, p.a * (0.65 + Math.sin(p.pulse) * 0.35)));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${PARTICLE_COLOR}, ${alpha.toFixed(3)})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(step);
    }

    function start() {
      if (rafId) return;
      running = true;
      lastT = 0;
      rafId = requestAnimationFrame(step);
    }

    function stop() {
      running = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    window.addEventListener("resize", resize, { passive: true });

    // نفس فكرة Proofcore: click mode push quantity 4
    window.addEventListener("click", (e) => {
      if (!canvas.closest(".hero")) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      for (let i = 0; i < 4; i++) particles.push(makeParticle(x, y));
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop(); else start();
    });

    resize();
    start();
  }

  /* ============================================================
     3. Hero proximity headline — Proofcore-style variable weight
     - mouse distance controls each title word weight
     - from 300 to 900
     - radius close to Proofcore behavior
     ============================================================ */
  const title = document.querySelector("[data-proximity-target]");
  if (title && !reducedMotion && !isCoarse) {
    const items = [...title.querySelectorAll(".prox-char")];
    let pointer = { x: -9999, y: -9999 };
    let raf = 0;

    const FROM = 300;
    const TO = 900;
    const RADIUS = 125;

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }

    function update() {
      raf = 0;

      for (const el of items) {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const distance = Math.hypot(pointer.x - cx, pointer.y - cy);

        const influence = clamp(1 - distance / RADIUS, 0, 1);
        const weight = Math.round(FROM + (TO - FROM) * influence);

        el.style.setProperty("--wght", weight);
        el.style.fontWeight = String(weight);
        el.style.fontVariationSettings = `"wght" ${weight}`;
      }
    }

    function requestUpdate() {
      if (!raf) raf = requestAnimationFrame(update);
    }

    window.addEventListener("pointermove", (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      requestUpdate();
    }, { passive: true });

    window.addEventListener("pointerleave", () => {
      pointer.x = -9999;
      pointer.y = -9999;
      requestUpdate();
    }, { passive: true });

    update();
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
     7. Scroll-spy: active section dot
     ============================================================ */
  const sectionsToSpy = ["home","why","products","faq","contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const indicatorDots = document.querySelectorAll("[data-indicator-dot]");
  const indicatorNum = document.querySelector("[data-indicator-num]");
  const sectionNums = { home: "01", why: "02", products: "03", faq: "04", contact: "05" };

  if ("IntersectionObserver" in window && sectionsToSpy.length) {
    const observer = new IntersectionObserver((entries) => {
      let best = null;
      entries.forEach((e) => {
        if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) best = e;
      });
      if (best) {
        const id = best.target.id;
        indicatorDots.forEach((d) => d.classList.toggle("is-active", d.getAttribute("data-target") === id));
        if (indicatorNum && sectionNums[id]) indicatorNum.textContent = sectionNums[id];
      }
    }, {
      rootMargin: "-40% 0px -50% 0px",
      threshold: [0, .1, .25, .5, .75, 1]
    });
    sectionsToSpy.forEach((s) => observer.observe(s));
  }

  /* ============================================================
     8. Scroll reveal
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
     9. FAQ accordion (one open at a time)
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
    10. Product category tabs (home + products page)
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
    11. Add-to-cart buttons (delegated)
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
    12. Cart drawer + counter sync
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

  // cart line qty controls (delegated, works on drawer & cart page)
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
  // initial UI refresh (after partials inject)
  setTimeout(refreshCartUI, 60);

})();
