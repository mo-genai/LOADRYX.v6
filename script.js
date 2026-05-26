/* ============================================================
   LOADRYX — site interactivity
   - canvas particles + Variable Proximity (hero)
   - mobile menu toggle
   - smooth-scroll for nav links
   - scroll-spy: active nav link + section indicator
   - product category tabs
   - scroll-reveal observer
   - header scroll state
   - footer year
   - respects prefers-reduced-motion
   ============================================================ */

(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarse      = window.matchMedia("(pointer: coarse)").matches;
  const isRTL         = document.documentElement.dir === "rtl";

  /* ============================================================
     1. Footer year
     ============================================================ */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ============================================================
     2. Hero video fallback
     ============================================================ */
  const media = document.querySelector(".hero-media");
  const video = document.querySelector(".hero-video");
  if (video && media) {
    const markFailed = () => media.classList.add("is-video-failed");
    video.addEventListener("error", markFailed, { once: true });
    video.addEventListener("stalled", () => {
      if (video.readyState < 2) markFailed();
    });
    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    tryPlay();
  }

  /* ============================================================
     3. Canvas particles
     ============================================================ */
  const canvas = document.getElementById("hero-particles");
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1;
    let particles = [];
    let mouseX = -9999, mouseY = -9999;
    let rafId = 0;
    let running = true;

    const COLOR = "rgba(3, 131, 244, %a)";

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    }

    function buildParticles() {
      const target = Math.round((w * h) / 38000);
      const count = Math.max(18, Math.min(target, 48));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          r: Math.random() * 0.9 + 0.3,
          a: Math.random() * 0.28 + 0.08,
        });
      }
    }

    function frame() {
      if (!running) { rafId = 0; return; }
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 10000) {
          const f = (10000 - dist2) / 10000;
          p.x += (dx / Math.sqrt(dist2 + 0.001)) * f * 0.4;
          p.y += (dy / Math.sqrt(dist2 + 0.001)) * f * 0.4;
        }
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        if (p.y < -4) p.y = h + 4;
        if (p.y > h + 4) p.y = -4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = COLOR.replace("%a", p.a.toFixed(3));
        ctx.fill();
      }
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (rafId) return;
      running = true;
      rafId = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    }

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }, { passive: true });
    window.addEventListener("mouseleave", () => { mouseX = mouseY = -9999; });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop(); else start();
    });

    resize();
    start();
  }

  /* ============================================================
     4. Variable Proximity headline
     ============================================================ */
  if (!reducedMotion && !isCoarse) {
    const lines = document.querySelectorAll("[data-proximity-line]");
    if (lines.length) {
      const charsByLine = Array.from(lines).map((line) =>
        Array.from(line.querySelectorAll(".prox-char")).map((el) => ({
          el,
          baseWeight: parseInt(getComputedStyle(el).fontWeight, 10) || 400,
        }))
      );
      const RADIUS = 140;
      const RADIUS_SQ = RADIUS * RADIUS;
      let mx = -9999, my = -9999;
      let pending = false;

      function update() {
        pending = false;
        for (let li = 0; li < lines.length; li++) {
          const chars = charsByLine[li];
          for (let i = 0; i < chars.length; i++) {
            const { el, baseWeight } = chars[i];
            const r = el.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const dx = mx - cx;
            const dy = my - cy;
            const d2 = dx * dx + dy * dy;
            if (d2 < RADIUS_SQ) {
              const t = 1 - d2 / RADIUS_SQ;
              const weight = Math.round(baseWeight + t * (900 - baseWeight) * 0.55);
              el.style.fontWeight = weight;
              el.style.transform = `translateY(${(-t * 1.2).toFixed(2)}px)`;
            } else if (el.style.fontWeight) {
              el.style.fontWeight = "";
              el.style.transform = "";
            }
          }
        }
      }

      window.addEventListener("mousemove", (e) => {
        mx = e.clientX; my = e.clientY;
        if (!pending) { pending = true; requestAnimationFrame(update); }
      }, { passive: true });
      window.addEventListener("mouseleave", () => {
        mx = my = -9999;
        if (!pending) { pending = true; requestAnimationFrame(update); }
      });
    }
  }

  /* ============================================================
     5. Mobile menu
     ============================================================ */
  const navEl = document.getElementById("primary-nav");
  const openBtn = document.querySelector("[data-menu-open]");
  const closeBtn = document.querySelector("[data-menu-close]");

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
    navEl.addEventListener("click", (e) => {
      if (e.target.matches("a")) closeMenu();
    });
  }

  /* ============================================================
     6. Smooth scroll for hash links
     ============================================================ */
  const headerOffset = () => (document.querySelector(".site-header")?.offsetHeight || 80) + 12;
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href").slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
      window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });

      // if the link carries a data-cat, switch the products tab
      const cat = link.getAttribute("data-cat");
      if (cat) switchProductCategory(cat);
    });
  });

  /* ============================================================
     7. Header scroll state
     ============================================================ */
  const header = document.querySelector(".site-header");
  let lastScroll = 0;
  function onScrollHeader() {
    const y = window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 12);
    lastScroll = y;
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ============================================================
     8. Scroll-spy: active nav + section indicator
     ============================================================ */
  const sections = ["home","why","products","faq","contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = document.querySelectorAll("[data-nav-link]");
  const indicatorDots = document.querySelectorAll("[data-indicator-dot]");
  const indicatorNum = document.querySelector("[data-indicator-num]");
  const sectionNums = { home: "01", why: "02", products: "03", faq: "04", contact: "05" };

  function setActiveSection(id) {
    navLinks.forEach((a) => {
      const href = a.getAttribute("href");
      a.classList.toggle("is-active", href === "#" + id);
    });
    indicatorDots.forEach((d) => {
      d.classList.toggle("is-active", d.getAttribute("data-target") === id);
    });
    if (indicatorNum && sectionNums[id]) indicatorNum.textContent = sectionNums[id];
  }

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      // find the entry with the largest intersection ratio that is intersecting
      let best = null;
      entries.forEach((e) => {
        if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) {
          best = e;
        }
      });
      if (best) setActiveSection(best.target.id);
    }, {
      rootMargin: "-40% 0px -50% 0px",
      threshold: [0, .1, .25, .5, .75, 1]
    });
    sections.forEach((s) => observer.observe(s));
  }

  /* ============================================================
     9. Product category tabs
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
        // re-trigger reveal for cards inside
        p.querySelectorAll("[data-reveal]").forEach((el) => {
          el.classList.remove("is-in");
          requestAnimationFrame(() => el.classList.add("is-in"));
        });
      } else {
        p.setAttribute("hidden", "");
      }
    });
  }
  catTabs.forEach((t) => {
    t.addEventListener("click", () => switchProductCategory(t.getAttribute("data-cat-tab")));
  });

  /* ============================================================
    10. Scroll reveal
     ============================================================ */
  if ("IntersectionObserver" in window) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          revealObs.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    document.querySelectorAll("[data-reveal]").forEach((el) => revealObs.observe(el));
  } else {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
  }

  /* ============================================================
    11. FAQ — accordion: open one at a time (optional polish)
     ============================================================ */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item && other.open) other.open = false;
        });
      }
    });
  });

})();
