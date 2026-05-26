/* ============================================================
   LOADRYX — Shared partials
   Injects header, footer, cart drawer, SAR sprite into every page.
   Pages just include this file via <script src="partials.js" defer>.
   ============================================================ */

(function () {
  "use strict";

  const NAV = [
    { href: "index.html",                       label: "الرئيسية",         match: ["", "index.html"] },
    { href: "products.html",                    label: "المنتجات",         match: ["products.html"] },
    { href: "category.html?cat=ps5",            label: "PS5 AI",           match: ["category.html?cat=ps5"] },
    { href: "category.html?cat=script",         label: "Script Xim",       match: ["category.html?cat=script"] },
    { href: "category.html?cat=accessories",    label: "الملحقات",         match: ["category.html?cat=accessories"] },
    { href: "faq.html",                         label: "الأسئلة الشائعة",  match: ["faq.html"] },
    { href: "contact.html",                     label: "تواصل معنا",       match: ["contact.html"] },
  ];

  const PAYMENTS = ["مدى","VISA","Mastercard","Apple Pay","STC Pay","tabby","tamara"];

  /* ------------------------------------------------------------
     SAR symbol (official Saudi Riyal) — injected as inline sprite
     so any <svg><use href="#sar-symbol"/></svg> in markup works.
     ------------------------------------------------------------ */
  const SAR_SVG = `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <defs>
        <symbol id="sar-symbol" viewBox="0 0 1124 1257">
          <path fill="currentColor" d="M699.62 1113.02h0c-20.06 44.48-33.32 92.75-38.4 143.37l424.51-90.24c20.06-44.47 33.31-92.75 38.4-143.37l-424.51 90.24z"/>
          <path fill="currentColor" d="M1085.73 895.8c20.06-44.47 33.32-92.75 38.4-143.37l-330.68 70.33v-135.2l292.27-62.11c20.06-44.47 33.32-92.75 38.4-143.37l-330.68 70.27V66.13c-50.67 28.45-95.67 66.32-132.25 110.99v403.35l-132.25 28.11V0c-50.67 28.44-95.67 66.32-132.25 110.99v525.69l-295.91 62.88c-20.06 44.47-33.33 92.75-38.42 143.37l334.33-71.05v170.26l-358.3 76.14c-20.06 44.47-33.32 92.75-38.4 143.37l375.04-79.7c30.53-6.35 56.77-24.4 73.83-49.24l68.78-101.97v-.02c7.14-10.55 11.3-23.27 11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28z"/>
        </symbol>
      </defs>
    </svg>
  `;

  /* ------------------------------------------------------------
     Active link detection
     ------------------------------------------------------------ */
  function currentPath() {
    const path = (location.pathname.split("/").pop() || "index.html");
    return path + (location.search || "");
  }
  function isActive(linkHref) {
    const cur = currentPath().toLowerCase();
    const href = linkHref.toLowerCase();
    if (linkHref.startsWith("category.html?cat=")) {
      return cur === href;
    }
    if (linkHref === "index.html") {
      return cur === "" || cur === "index.html" || cur.startsWith("index.html");
    }
    return cur === href || cur.startsWith(href);
  }

  /* ------------------------------------------------------------
     Header
     ------------------------------------------------------------ */
  function renderHeader() {
    const links = NAV.map((n) => `
      <li><a href="${n.href}" class="nav-link${isActive(n.href) ? " is-active" : ""}" data-nav-link>${n.label}</a></li>
    `).join("");

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
          <a href="https://wa.me/966573534407" target="_blank" rel="noopener" class="btn btn--whats" aria-label="واتساب">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 3C7.03 3 3 7.03 3 12c0 1.58.42 3.07 1.14 4.36L3 21l4.78-1.12A8.96 8.96 0 0 0 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm5.17 12.77c-.22.61-1.06 1.13-1.74 1.27-.46.1-1.07.18-3.11-.66-2.59-1.07-4.27-3.71-4.4-3.88-.13-.18-1.06-1.42-1.06-2.71 0-1.29.68-1.92.92-2.18.21-.22.54-.32.86-.32h.42c.18.01.43-.07.66.5.24.59.81 2.05.88 2.2.07.15.12.32.02.51-.1.18-.15.3-.29.46-.14.16-.31.36-.44.49-.15.14-.3.3-.13.6.17.3.74 1.22 1.59 1.98 1.09.97 2 1.27 2.3 1.42.3.15.48.13.66-.08.18-.21.76-.89.97-1.19.21-.3.42-.25.71-.15.29.1 1.83.86 2.14.99.3.13.51.21.6.39.09.18.09.55-.04 1.07z"/></svg>
            <span>واتساب</span>
          </a>
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

      <div class="cart-drawer__body" data-cart-body>
        <!-- populated by JS -->
      </div>

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
        <div class="cart-drawer__pay">
          ${PAYMENTS.map((p) => `<span class="pay-chip${(p==="tabby"||p==="tamara")?" pay-chip--accent":""}">${p}</span>`).join("")}
        </div>
      </footer>
    </aside>
    <div class="cart-backdrop" data-cart-close></div>
    `;
  }

  /* ------------------------------------------------------------
     Footer
     ------------------------------------------------------------ */
  function renderFooter() {
    return `
    <footer class="site-footer" role="contentinfo">
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

      <div class="site-footer__pays-bar">
        <span class="site-footer__pays-label">طرق الدفع المتاحة:</span>
        <div class="site-footer__pays">
          ${PAYMENTS.map((p) => `<span class="pay-chip${(p==="tabby"||p==="tamara")?" pay-chip--accent":""}">${p}</span>`).join("")}
        </div>
      </div>

      <div class="site-footer__bottom">
        <span>© <span data-year></span> LOADRYX. جميع الحقوق محفوظة.</span>
        <span>مُصمَّم للاستجابة · مبني للانتصار</span>
      </div>
    </footer>`;
  }

  /* ------------------------------------------------------------
     Inject everything
     ------------------------------------------------------------ */
  function inject() {
    // SAR sprite first (referenced by everything that uses prices)
    const sprite = document.createElement("div");
    sprite.innerHTML = SAR_SVG;
    document.body.prepend(sprite.firstElementChild);

    // Header at top of <body>
    const headerSlot = document.querySelector("[data-slot='header']");
    if (headerSlot) headerSlot.outerHTML = renderHeader();
    else document.body.insertAdjacentHTML("afterbegin", renderHeader());

    // Footer at end
    const footerSlot = document.querySelector("[data-slot='footer']");
    if (footerSlot) footerSlot.outerHTML = renderFooter();
    else document.body.insertAdjacentHTML("beforeend", renderFooter());

    // Cart drawer at end of body
    document.body.insertAdjacentHTML("beforeend", renderCartDrawer());

    // Year
    document.querySelectorAll("[data-year]").forEach((el) => el.textContent = new Date().getFullYear());
  }

  /* Run immediately (script is loaded with defer so DOM is ready) */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject, { once: true });
  } else {
    inject();
  }

  /* expose payment list for pages that need it */
  window.LR_PARTIALS = { PAYMENTS };
})();
