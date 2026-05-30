/* ============================================================
   LOADRYX — Shared partials
   Injects header, footer, cart drawer, SVG sprites into every page.
   ============================================================ */

(function () {
  "use strict";

  /* Simple nav */
  const NAV = [
    { href: "index.html",     label: "الرئيسية" },
    { href: "products.html",  label: "المنتجات" },
    { href: "faq.html",       label: "الأسئلة الشائعة" },
    { href: "contact.html",   label: "تواصل معنا" },
  ];

  const CATEGORY_LINKS = [
    { href: "products.html", label: "جميع المنتجات" },
    { href: "products.html#ps5", label: "PS5 AI" },
    { href: "products.html#setting", label: "Setting AI" },
    { href: "products.html#script", label: "Script Xim Matrix" },
    { href: "products.html#accessories", label: "الملحقات" },
  ];

  /* ------------------------------------------------------------
     SVG sprite — SAR + 7 payment marks
     All payment marks rendered in currentColor (uniform monochrome).
     ------------------------------------------------------------ */
  const SVG_SPRITE = `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <defs>
        <!-- official Saudi Riyal symbol -->
        <symbol id="sar-symbol" viewBox="0 0 1124 1257">
          <path fill="currentColor" d="M699.62 1113.02h0c-20.06 44.48-33.32 92.75-38.4 143.37l424.51-90.24c20.06-44.47 33.31-92.75 38.4-143.37l-424.51 90.24z"/>
          <path fill="currentColor" d="M1085.73 895.8c20.06-44.47 33.32-92.75 38.4-143.37l-330.68 70.33v-135.2l292.27-62.11c20.06-44.47 33.32-92.75 38.4-143.37l-330.68 70.27V66.13c-50.67 28.45-95.67 66.32-132.25 110.99v403.35l-132.25 28.11V0c-50.67 28.44-95.67 66.32-132.25 110.99v525.69l-295.91 62.88c-20.06 44.47-33.33 92.75-38.42 143.37l334.33-71.05v170.26l-358.3 76.14c-20.06 44.47-33.32 92.75-38.4 143.37l375.04-79.7c30.53-6.35 56.77-24.4 73.83-49.24l68.78-101.97v-.02c7.14-10.55 11.3-23.27 11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28z"/>
        </symbol>

        <!-- mada — wordmark approximation -->
        <symbol id="pay-mada" viewBox="0 0 90 28">
          <text x="45" y="20" text-anchor="middle"
                font-family="Arial Black, Helvetica, sans-serif"
                font-weight="900" font-size="18"
                letter-spacing="0.5" fill="currentColor">mada</text>
        </symbol>

        <!-- VISA — characteristic italic uppercase -->
        <symbol id="pay-visa" viewBox="0 0 90 28">
          <text x="45" y="20" text-anchor="middle"
                font-family="Arial Black, Helvetica, sans-serif"
                font-weight="900" font-size="17" font-style="italic"
                letter-spacing="2.5" fill="currentColor">VISA</text>
        </symbol>

        <!-- Mastercard — overlapping circles -->
        <symbol id="pay-mc" viewBox="0 0 90 28">
          <circle cx="38" cy="14" r="10" fill="currentColor" opacity="0.55"/>
          <circle cx="52" cy="14" r="10" fill="currentColor" opacity="0.9"/>
        </symbol>

        <!-- Apple Pay — apple silhouette + Pay -->
        <symbol id="pay-apple" viewBox="0 0 90 28">
          <g fill="currentColor">
            <path d="M22.7 9.8c.9-1.1 1.6-2.6 1.4-4.2-1.3.1-2.9.9-3.9 2-.8.9-1.6 2.5-1.4 4 1.5.1 3-.7 3.9-1.8z"/>
            <path d="M28.5 19.4c-.4-1.1-.9-2.1-.6-3.4.2-1.4 1.2-2.7 2.3-3.5-.9-1.4-2.4-2.5-4-2.5-1.7-.1-3.4 1-4.3 1-1 0-2.3-1-3.8-1-2 0-3.9 1.2-4.9 3-2.1 3.6-.5 9 1.5 11.9.9 1.4 2 3 3.5 2.9 1.4-.1 2-.9 3.7-.9s2.2.9 3.7.9c1.5 0 2.5-1.4 3.5-2.8.7-1 1.1-1.8 1.6-2.9-1.7-.6-2.4-1.4-2.2-2.7z"/>
          </g>
          <text x="58" y="19" text-anchor="middle"
                font-family="-apple-system, Helvetica, Arial, sans-serif"
                font-weight="600" font-size="13"
                fill="currentColor">Pay</text>
        </symbol>

        <!-- STC Pay -->
        <symbol id="pay-stc" viewBox="0 0 100 28">
          <text x="22" y="20" text-anchor="middle"
                font-family="Arial Black, Helvetica, sans-serif"
                font-weight="900" font-size="17"
                letter-spacing="1" fill="currentColor">stc</text>
          <text x="68" y="20" text-anchor="middle"
                font-family="Arial, Helvetica, sans-serif"
                font-weight="600" font-size="13"
                letter-spacing="0.5" fill="currentColor">pay</text>
          <line x1="44" y1="8" x2="44" y2="22" stroke="currentColor" stroke-width="0.6" opacity="0.4"/>
        </symbol>

        <!-- tabby -->
        <symbol id="pay-tabby" viewBox="0 0 90 28">
          <text x="45" y="20" text-anchor="middle"
                font-family="Arial Black, Helvetica, sans-serif"
                font-weight="800" font-size="17"
                letter-spacing="-0.5" fill="currentColor">tabby</text>
        </symbol>

        <!-- tamara -->
        <symbol id="pay-tamara" viewBox="0 0 100 28">
          <text x="50" y="20" text-anchor="middle"
                font-family="Arial Black, Helvetica, sans-serif"
                font-weight="800" font-size="17"
                letter-spacing="-0.3" fill="currentColor">tamara</text>
        </symbol>

        <!-- shared little icons -->
        <symbol id="ic-shield" viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" stroke-width="1.4" d="M12 3 4 6v6c0 5 3.5 8.5 8 9.5 4.5-1 8-4.5 8-9.5V6l-8-3zM9 12l2 2 4-4"/>
        </symbol>
        <symbol id="ic-truck" viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" stroke-width="1.4" d="M3 7h13v10H3zM16 10h4l2 4v3h-6zM7 17a2 2 0 1 0 0 0.1zM19 17a2 2 0 1 0 0 0.1z"/>
        </symbol>
        <symbol id="ic-clock" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.4"/>
          <path d="M12 7v6l3 2" fill="none" stroke="currentColor" stroke-width="1.4"/>
        </symbol>
      </defs>
    </svg>
  `;

  const PAY_METHODS = [
    { id: "mada",   label: "mada",       sprite: "pay-mada" },
    { id: "visa",   label: "VISA",       sprite: "pay-visa" },
    { id: "mc",     label: "Mastercard", sprite: "pay-mc" },
    { id: "apple",  label: "Apple Pay",  sprite: "pay-apple" },
    { id: "stc",    label: "STC Pay",    sprite: "pay-stc" },
    { id: "tabby",  label: "tabby",      sprite: "pay-tabby" },
    { id: "tamara", label: "tamara",     sprite: "pay-tamara" },
  ];

  /* ------------------------------------------------------------
     Payment showcase HTML
     ------------------------------------------------------------ */
  function paymentShowcase() {
    return `
      <div class="pay-grid">
        ${PAY_METHODS.map((m) => `
          <div class="pay-tile" data-pay="${m.id}" aria-label="${m.label}">
            <svg class="pay-tile__logo" aria-hidden="true"><use href="#${m.sprite}"/></svg>
          </div>
        `).join("")}
      </div>
    `;
  }

  /* ------------------------------------------------------------
     Active link detection
     ------------------------------------------------------------ */
  function currentPath() {
    return (location.pathname.split("/").pop() || "index.html").toLowerCase();
  }
  function isActive(href) {
    const cur = currentPath();
    const target = href.toLowerCase();
    if (target === "index.html") return cur === "" || cur === "index.html";
    // products.html stays active for category & product detail too
    if (target === "products.html") return ["products.html", "category.html", "product.html"].includes(cur);
    return cur === target;
  }

  /* ------------------------------------------------------------
     Header
     ------------------------------------------------------------ */
  function renderHeader() {
    const categoryMenu = `
      <li class="nav-category" data-header-category-menu>
        <button class="nav-link nav-link--button" type="button" aria-haspopup="true" aria-expanded="false" data-header-category-toggle>
          تصنيفات
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="square"/></svg>
        </button>
        <div class="nav-category__menu" data-header-category-list hidden>
          ${CATEGORY_LINKS.map((item) => `<a href="${item.href}" class="nav-category__item">${item.label}</a>`).join("")}
        </div>
      </li>`;

    const links = NAV.map((n) => {
      const link = `<li><a href="${n.href}" class="nav-link${isActive(n.href) ? " is-active" : ""}" data-nav-link>${n.label}</a></li>`;
      return n.href === "products.html" ? link + categoryMenu : link;
    }).join("");

    return `
    <header class="site-header" role="banner">
      <div class="header-inner">
        <a href="index.html" class="brand" aria-label="LOADRYX">
          <img
            src="https://res.cloudinary.com/dmp1fo2j4/image/upload/v1779614344/LOADRYX_logo_transparent_4x_f01fwd.png"
            alt="LOADRYX" class="brand-logo" width="420" height="80" />
        </a>

        <nav class="primary-nav" id="primary-nav" aria-label="القائمة الرئيسية">
          <button class="nav-close" type="button" aria-label="إغلاق القائمة" data-menu-close>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/></svg>
          </button>
          <ul>${links}</ul>
        </nav>

        <div class="header-actions">
          <a href="account.html" class="icon-btn icon-btn--account" aria-label="حسابي">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4.5 20c0-3.6 3.4-6.5 7.5-6.5s7.5 2.9 7.5 6.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/></svg>
          </a>
          <button class="icon-btn icon-btn--cart" type="button" aria-label="السلة" data-cart-toggle>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h2.2l2 11.2A2 2 0 0 0 10.2 18h7.6a2 2 0 0 0 2-1.7l1.3-7.3H7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter"/><circle cx="10" cy="21" r="1.2" fill="currentColor"/><circle cx="18" cy="21" r="1.2" fill="currentColor"/></svg>
            <span class="cart-count" data-cart-count>0</span>
          </button>
          <button class="menu-toggle" type="button" aria-label="فتح القائمة" data-menu-open>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>`;
  }

  /* ------------------------------------------------------------
     Cart drawer
     ------------------------------------------------------------ */
  function renderCartDrawer() {
    return `
    <aside class="cart-drawer" id="cart-drawer" aria-label="سلة المشتريات" aria-hidden="true">
      <header class="cart-drawer__head">
        <div>
          <span class="cart-drawer__eyebrow">سلة المشتريات</span>
          <h3 class="cart-drawer__title">طلبك الحالي</h3>
        </div>
        <button class="icon-btn" type="button" aria-label="إغلاق السلة" data-cart-close>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/></svg>
        </button>
      </header>

      <div class="cart-drawer__body" data-cart-body></div>

      <footer class="cart-drawer__foot">
        <div class="cart-drawer__totals">
          <span>الإجمالي</span>
          <span class="cart-drawer__total">
            <span data-cart-total>0</span>
            <span class="price__currency"><svg class="sar-icon"><use href="#sar-symbol"/></svg></span>
          </span>
        </div>
        <div class="cart-drawer__actions">
          <a href="cart.html" class="btn btn--ghost-line">عرض السلة</a>
          <a href="checkout.html" class="btn btn--primary btn--solid">إتمام الطلب</a>
        </div>
      </footer>
    </aside>
    <div class="cart-backdrop" data-cart-close></div>
    `;
  }

  /* ------------------------------------------------------------
     Footer (with single payment showcase)
     ------------------------------------------------------------ */
  function renderFooter() {
    return `
    <footer class="site-footer" role="contentinfo">
      <div class="site-footer__pay-band">
        <div class="site-footer__pay-band-inner">
          <div class="site-footer__pay-head">
            <span class="site-footer__pay-eyebrow">طرق الدفع المتاحة</span>
            <span class="site-footer__pay-hint">دفع آمن — جميع البطاقات + تقسيط بدون فوائد</span>
          </div>
          ${paymentShowcase()}
        </div>
      </div>

      <div class="site-footer__inner">
        <div class="site-footer__brand">
          <img src="https://res.cloudinary.com/dmp1fo2j4/image/upload/v1779614344/LOADRYX_logo_transparent_4x_f01fwd.png" alt="LOADRYX" />
          <p>مُصمَّم للاستجابة. مبني للانتصار.<br/>سكربتات وأدوات ذكاء اصطناعي للاعبين المحترفين.</p>
          <div class="site-footer__socials">
            <a href="https://wa.me/966573534407" target="_blank" rel="noopener" aria-label="واتساب">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C7.03 3 3 7.03 3 12c0 1.58.42 3.07 1.14 4.36L3 21l4.78-1.12A8.96 8.96 0 0 0 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/></svg>
            </a>
            <a href="tel:+966573534407" aria-label="اتصال">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 4h4l1.5 5-2 1.5c1 2 3 4 5 5l1.5-2L20 15v4c0 .55-.45 1-1 1A15 15 0 0 1 4 5c0-.55.45-1 1-1z"/></svg>
            </a>
            <a href="mailto:support@loadryx.com" aria-label="بريد">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 6l9 7 9-7"/></svg>
            </a>
          </div>
        </div>

        <div class="site-footer__col">
          <h4>المتجر</h4>
          <ul>
            <li><a href="products.html">جميع المنتجات</a></li>
            <li><a href="category.html?cat=ps5">PS5 AI</a></li>
            <li><a href="category.html?cat=setting">Setting AI</a></li>
            <li><a href="category.html?cat=script">Script Xim Matrix</a></li>
            <li><a href="category.html?cat=accessories">الملحقات</a></li>
          </ul>
        </div>

        <div class="site-footer__col">
          <h4>الحساب</h4>
          <ul>
            <li><a href="account.html">حسابي</a></li>
            <li><a href="cart.html">السلة</a></li>
            <li><a href="checkout.html">إتمام الطلب</a></li>
            <li><a href="account.html#orders">الطلبات والفواتير</a></li>
          </ul>
        </div>

        <div class="site-footer__col">
          <h4>الدعم</h4>
          <ul>
            <li><a href="faq.html">الأسئلة الشائعة</a></li>
            <li><a href="contact.html">تواصل معنا</a></li>
            <li><a href="https://wa.me/966573534407" target="_blank" rel="noopener">واتساب</a></li>
            <li><a href="#policy">الشروط والخصوصية</a></li>
          </ul>
        </div>
      </div>

      <div class="site-footer__bottom">
        <span>© <span data-year></span> LOADRYX. جميع الحقوق محفوظة.</span>
        <span>مُصمَّم للاستجابة · مبني للانتصار</span>
      </div>
    </footer>`;
  }

  /* ------------------------------------------------------------
     Inject
     ------------------------------------------------------------ */
  function inject() {
    const sprite = document.createElement("div");
    sprite.innerHTML = SVG_SPRITE;
    document.body.prepend(sprite.firstElementChild);

    const headerSlot = document.querySelector("[data-slot='header']");
    if (headerSlot) headerSlot.outerHTML = renderHeader();
    else document.body.insertAdjacentHTML("afterbegin", renderHeader());

    const footerSlot = document.querySelector("[data-slot='footer']");
    if (footerSlot) footerSlot.outerHTML = renderFooter();
    else document.body.insertAdjacentHTML("beforeend", renderFooter());

    document.body.insertAdjacentHTML("beforeend", renderCartDrawer());

    // populate any inline payment-showcase slots
    document.querySelectorAll("[data-pay-showcase]").forEach((el) => el.innerHTML = paymentShowcase());

    document.querySelectorAll("[data-year]").forEach((el) => el.textContent = new Date().getFullYear());

    const categoryRoot = document.querySelector("[data-header-category-menu]");
    const categoryToggle = document.querySelector("[data-header-category-toggle]");
    const categoryList = document.querySelector("[data-header-category-list]");
    const closeCategoryMenu = () => {
      if (!categoryToggle || !categoryList) return;
      categoryList.hidden = true;
      categoryToggle.setAttribute("aria-expanded", "false");
    };
    if (categoryRoot && categoryToggle && categoryList) {
      categoryToggle.addEventListener("click", () => {
        const willOpen = categoryList.hidden;
        categoryList.hidden = !willOpen;
        categoryToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });
      categoryList.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeCategoryMenu));
      document.addEventListener("click", (event) => {
        if (!categoryRoot.contains(event.target)) closeCategoryMenu();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeCategoryMenu();
      });
    }

    const navEl = document.getElementById("primary-nav");
    const openBtn = document.querySelector("[data-menu-open]");
    const closeBtn = document.querySelector("[data-menu-close]");
    if (navEl && openBtn && !openBtn.dataset.menuBound) {
      openBtn.dataset.menuBound = "true";
      let backdrop = document.querySelector(".menu-backdrop");
      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.className = "menu-backdrop";
        document.body.appendChild(backdrop);
      }
      const openMenu = () => {
        navEl.classList.add("is-open");
        backdrop.classList.add("is-open");
        document.body.classList.add("is-menu-open");
      };
      const closeMenu = () => {
        navEl.classList.remove("is-open");
        backdrop.classList.remove("is-open");
        document.body.classList.remove("is-menu-open");
        closeCategoryMenu();
      };
      openBtn.addEventListener("click", openMenu);
      if (closeBtn) closeBtn.addEventListener("click", closeMenu);
      backdrop.addEventListener("click", closeMenu);
      navEl.addEventListener("click", (event) => {
        if (event.target.closest("a")) closeMenu();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject, { once: true });
  } else {
    inject();
  }

  window.LR_PARTIALS = { PAY_METHODS, paymentShowcase };
})();
