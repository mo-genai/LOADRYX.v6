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

    // يمنع خراب تموضع الفيديو عند فتح/إغلاق DevTools أو تغيير حجم النافذة
    let mediaResizeTimer = 0;
    const repaintHeroVideo = () => {
      clearTimeout(mediaResizeTimer);
      mediaResizeTimer = setTimeout(() => {
        videoMedia.style.transform = "translateZ(0)";
        heroVideo.style.transform = getComputedStyle(heroVideo).transform;
        requestAnimationFrame(() => {
          videoMedia.style.transform = "";
          heroVideo.style.transform = "";
          if (heroVideo.paused) {
            const play = heroVideo.play();
            if (play && typeof play.catch === "function") play.catch(() => {});
          }
        });
      }, 140);
    };
    window.addEventListener("resize", repaintHeroVideo, { passive: true });
    window.addEventListener("orientationchange", repaintHeroVideo, { passive: true });
  }

  /* ============================================================
     2. Canvas particles — proofcore-inspired (sparse + soft)
     - small particles, soft blue
     - optional thin connection lines for very close pairs
     - light mouse parallax
     - rAF capped to 60fps, paused on visibility hidden
     ============================================================ */
  const canvas = document.getElementById("hero-particles");
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext("2d", { alpha: true });
    let w = 0, h = 0, dpr = 1;
    let particles = [];
    let mx = -9999, my = -9999;
    let rafId = 0;
    let running = true;
    let lastT = 0;

    const BASE_COLOR = "3, 131, 244";   // matches --blue
    const TARGET_DENSITY = 1 / 22000;   // particles per px²

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      const count = Math.max(18, Math.min(Math.round(w * h * TARGET_DENSITY), 56));
      particles = new Array(count);
      for (let i = 0; i < count; i++) {
        particles[i] = {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.10,
          vy: (Math.random() - 0.5) * 0.10,
          r: Math.random() * 0.9 + 0.5,
          a: Math.random() * 0.28 + 0.10,
        };
      }
    }

    function step(t) {
      if (!running) { rafId = 0; return; }
      // throttle to ~60fps
      const dt = t - lastT;
      if (dt < 14) { rafId = requestAnimationFrame(step); return; }
      lastT = t;

      ctx.clearRect(0, 0, w, h);

      // draw connection lines first (under dots)
      const CONN_MAX = 110;
      const CONN_MAX_SQ = CONN_MAX * CONN_MAX;
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < CONN_MAX_SQ) {
            const k = 1 - d2 / CONN_MAX_SQ;
            ctx.strokeStyle = `rgba(${BASE_COLOR}, ${(k * 0.07).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // update + draw dots
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        // soft mouse repulsion
        const dx = p.x - mx, dy = p.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < 9000) {
          const f = (9000 - d2) / 9000 * 0.45;
          const inv = 1 / Math.sqrt(d2 + 0.01);
          p.x += dx * inv * f;
          p.y += dy * inv * f;
        }
        // wrap
        if (p.x < -4) p.x = w + 4; else if (p.x > w + 4) p.x = -4;
        if (p.y < -4) p.y = h + 4; else if (p.y > h + 4) p.y = -4;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${BASE_COLOR}, ${p.a.toFixed(3)})`;
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
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    }

    let canvasResizeTimer = 0;
    const scheduleCanvasResize = () => {
      clearTimeout(canvasResizeTimer);
      canvasResizeTimer = setTimeout(resize, 120);
    };
    window.addEventListener("resize", scheduleCanvasResize, { passive: true });
    window.addEventListener("orientationchange", scheduleCanvasResize, { passive: true });
    window.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    }, { passive: true });
    window.addEventListener("pointerleave", () => { mx = my = -9999; });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop(); else start();
    });

    resize();
    start();
  }

  /* ============================================================
     3. Hero proximity headline — transform-only, no reflow
     - reads pointer once per rAF
     - writes two CSS variables (--mx, --my) on the title
     - each word uses transform: translate3d(calc(...), calc(...), 0)
     - zero font-weight or letter-spacing animation (no reflow)
     ============================================================ */
  const title = document.querySelector("[data-proximity-target]");
  if (title && !reducedMotion && !isCoarse) {
    let pmx = 0, pmy = 0;          // pointer relative to title (-1..1)
    let cur = { x: 0, y: 0 };      // smoothed
    let raf = 0;
    let active = false;
    const SMOOTH = 0.12;           // easing toward target

    function onMove(e) {
      const r = title.getBoundingClientRect();
      const px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      pmx = Math.max(-1.4, Math.min(1.4, px));
      pmy = Math.max(-1.4, Math.min(1.4, py));
      if (!active) { active = true; raf = requestAnimationFrame(loop); }
    }

    function onLeave() {
      pmx = 0; pmy = 0;
    }

    function loop() {
      cur.x += (pmx - cur.x) * SMOOTH;
      cur.y += (pmy - cur.y) * SMOOTH;
      title.style.setProperty("--mx", cur.x.toFixed(3));
      title.style.setProperty("--my", cur.y.toFixed(3));
      if (Math.abs(cur.x - pmx) > 0.001 || Math.abs(cur.y - pmy) > 0.001 || pmx !== 0 || pmy !== 0) {
        raf = requestAnimationFrame(loop);
      } else {
        active = false;
        title.style.setProperty("--mx", 0);
        title.style.setProperty("--my", 0);
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
