/* ============================================================
   LOADRYX — Renderers
   Generates product cards, category panels, detail pages, etc.
   ============================================================ */

(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else fn();
  }

  function waitForData(cb, tries = 50) {
    if (window.LR_DATA) return cb();
    if (tries <= 0) return;
    setTimeout(() => waitForData(cb, tries - 1), 30);
  }

  /* -- SVG helpers ----------------------------------------------- */
  const SVG = {
    cart: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h2.2l2 11.2A2 2 0 0 0 10.2 18h7.6a2 2 0 0 0 2-1.7l1.3-7.3H7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/><circle cx="10" cy="21" r="1.2" fill="currentColor"/><circle cx="18" cy="21" r="1.2" fill="currentColor"/></svg>`,
    arrow: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H6M11 6 5 12l6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/></svg>`,
  };

  /* -- product card HTML ----------------------------------------- */
  function cardHTML(p, opts = {}) {
    const isFeatured = !!opts.featured || (p.featured && opts.allowFeatured !== false);
    const cat = window.LR_DATA.getCategory(p.cat);
    const badge = p.badge
      ? `<span class="badge ${p.badge.kind === "reserve" ? "badge--reserve" : "badge--featured"}">${p.badge.text}</span>`
      : "";
    const isUltimate = p.art.kind === "ultimate";
    const artInner = isUltimate
      ? `<span class="product-art__title">${p.art.lines[0]}</span><span class="product-art__sub">${p.art.lines[1] || ""}</span>`
      : p.art.lines.map((l, i) => `<span class="product-art__${i === 0 ? "game" : "legend"}">${l}</span>`).join("");
    const desc = p.short ? `<p class="product-card__desc">${p.short}</p>` : "";

    return `
    <article class="product-card${isFeatured ? " product-card--featured" : ""}" data-reveal>
      <a class="product-card__media-link" href="product.html?id=${p.id}" aria-label="${p.name}">
        <div class="product-card__media">
          ${badge}
          <div class="product-art product-art--${p.art.kind}">${artInner}</div>
        </div>
      </a>
      <div class="product-card__body">
        <div class="product-card__cat">${cat ? cat.name : p.cat}</div>
        <h3 class="product-card__name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
        ${desc}
        <div class="product-card__price-row">
          <div class="price">
            <span class="price__amount">${window.LR_DATA.formatPrice(p.price)}</span>
            <span class="price__currency"><svg class="sar-icon"><use href="#sar-symbol"/></svg></span>
          </div>
        </div>
        <div class="product-card__actions">
          <button class="product-card__buy" type="button" data-add-to-cart="${p.id}">
            ${SVG.cart}<span>أضف للسلة</span>
          </button>
          <a class="product-card__details" href="product.html?id=${p.id}">
            <span>التفاصيل</span>${SVG.arrow}
          </a>
        </div>
      </div>
    </article>`;
  }

  /* -- empty state ---------------------------------------------- */
  function emptyHTML(title, desc) {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="square" aria-hidden="true">
            <rect x="3" y="9" width="26" height="14" rx="6"/>
            <path d="M10 16h4M12 14v4M21 14v.01M24 17v.01"/>
          </svg>
        </div>
        <h3 class="empty-state__title">${title}</h3>
        <p class="empty-state__desc">${desc}</p>
      </div>`;
  }

  /* -- home: per-category panels --------------------------------- */
  function renderHomeProducts(host) {
    const cats = ["ps5", "setting", "script", "accessories", "games"];
    host.innerHTML = cats.map((slug, idx) => {
      const products = window.LR_DATA.productsByCategory(slug);
      const cat = window.LR_DATA.getCategory(slug);
      const hidden = idx === 0 ? "" : "hidden";
      if (!products.length) {
        return `<div class="products-grid products-grid--empty" data-cat-panel="${slug}" ${hidden}>${emptyHTML(`${cat.name} — قريباً`, "نعمل على إضافة منتجات هذا القسم. تابعنا للحصول على آخر التحديثات.")}</div>`;
      }
      const cardsHTML = products.map((p, i) => cardHTML(p, { featured: i === 0 && p.featured })).join("");
      return `<div class="products-grid" data-cat-panel="${slug}" ${hidden}>${cardsHTML}</div>`;
    }).join("");
  }

  /* -- all products page ---------------------------------------- */
  function renderAllProducts(host) {
    const grid = window.LR_DATA.PRODUCTS.map((p) => cardHTML(p, { allowFeatured: false })).join("");
    host.innerHTML = `<div class="products-grid">${grid}</div>`;
  }

  /* -- category page -------------------------------------------- */
  function renderCategoryPage(host, slug) {
    const cat = window.LR_DATA.getCategory(slug);
    const titleEl  = document.querySelector("[data-cat-title]");
    const subEl    = document.querySelector("[data-cat-sub]");
    const crumbEl  = document.querySelector("[data-cat-crumb]");
    if (titleEl) titleEl.textContent = cat ? cat.name : "المنتجات";
    if (subEl)   subEl.textContent   = cat ? cat.desc : "";
    if (crumbEl) crumbEl.textContent = cat ? cat.name : "";

    if (!cat) {
      host.innerHTML = emptyHTML("الفئة غير موجودة", "تحقق من الرابط أو عُد للصفحة الرئيسية.");
      return;
    }
    const products = window.LR_DATA.productsByCategory(slug);
    if (!products.length) {
      host.innerHTML = emptyHTML(`${cat.name} — قريباً`, "نعمل على إضافة منتجات هذا القسم. تابعنا لآخر التحديثات.");
      return;
    }
    host.innerHTML = `<div class="products-grid">${products.map((p) => cardHTML(p, { allowFeatured: false })).join("")}</div>`;
  }

  /* -- product detail page -------------------------------------- */
  function renderProductPage(host, id) {
    const p = window.LR_DATA.getProduct(id);
    if (!p) {
      host.innerHTML = `<div class="product-detail__grid"><div>${emptyHTML("المنتج غير موجود", "ربما تم حذفه أو تغيير الرابط.")}</div></div>`;
      return;
    }
    const cat = window.LR_DATA.getCategory(p.cat);

    // page meta
    document.title = `${p.name} — LOADRYX`;
    const titleEl = document.querySelector("[data-product-title]");
    const crumbEl = document.querySelector("[data-product-crumb]");
    const crumbCatEl = document.querySelector("[data-product-crumb-cat]");
    if (titleEl) titleEl.textContent = p.name;
    if (crumbEl) crumbEl.textContent = p.name;
    if (crumbCatEl) {
      crumbCatEl.textContent = cat ? cat.name : "المنتجات";
      crumbCatEl.href = `category.html?cat=${p.cat}`;
    }

    const isUltimate = p.art.kind === "ultimate";
    const artInner = isUltimate
      ? `<span class="product-art__title">${p.art.lines[0]}</span><span class="product-art__sub">${p.art.lines[1] || ""}</span>`
      : p.art.lines.map((l, i) => `<span class="product-art__${i === 0 ? "game" : "legend"}">${l}</span>`).join("");
    const badge = p.badge
      ? `<span class="badge ${p.badge.kind === "reserve" ? "badge--reserve" : "badge--featured"}">${p.badge.text}</span>`
      : "";

    const sections = (p.sections || []).map(blockHTML).join("");

    host.innerHTML = `
      <div class="product-detail__grid">
        <div class="product-detail__media">
          ${badge}
          <div class="product-art product-art--${p.art.kind}">${artInner}</div>
        </div>
        <div class="product-detail__body">
          <span class="product-detail__cat">${cat ? cat.name : ""}</span>
          <h1 class="product-detail__title">${p.name}</h1>

          <div class="product-detail__price-row">
            <div class="price product-detail__price">
              <span class="price__amount">${window.LR_DATA.formatPrice(p.price)}</span>
              <span class="price__currency"><svg class="sar-icon"><use href="#sar-symbol"/></svg></span>
            </div>
            <span style="color:var(--muted); font-size:13px;">السعر شامل ضريبة القيمة المضافة</span>
          </div>

          <p class="product-detail__intro">${p.intro || p.short || ""}</p>

          <div class="product-detail__cta">
            <div class="qty-stepper" data-qty-stepper>
              <button type="button" data-stepper-dec aria-label="ناقص">−</button>
              <input type="number" min="1" max="99" value="1" aria-label="الكمية" data-stepper-input />
              <button type="button" data-stepper-inc aria-label="زائد">+</button>
            </div>
            <button class="btn btn--primary btn--solid btn--full" type="button" data-add-to-cart="${p.id}" data-qty="1">
              ${SVG.cart}<span>أضف للسلة</span>
            </button>
            <a href="https://wa.me/966573534407?text=${encodeURIComponent("استفسار عن: " + p.name)}" target="_blank" rel="noopener" class="btn btn--whats product-detail__whats" style="height:50px;">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C7.03 3 3 7.03 3 12c0 1.58.42 3.07 1.14 4.36L3 21l4.78-1.12A8.96 8.96 0 0 0 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/></svg>
              <span>استفسار عبر واتساب</span>
            </a>
          </div>

          <div class="product-detail__trust">
            <div class="product-detail__trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 9.5 4.5-1 8-4.5 8-9.5V5l-8-3z"/><path d="M9 12l2 2 4-4"/></svg>
              <span>دفع آمن 100%</span>
            </div>
            <div class="product-detail__trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 7h13l5 5v5h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
              <span>توصيل لجميع المدن</span>
            </div>
            <div class="product-detail__trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v6h-6"/></svg>
              <span>تحديثات مستمرة</span>
            </div>
            <div class="product-detail__trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l3 2"/></svg>
              <span>تفعيل خلال ساعات</span>
            </div>
          </div>
        </div>
      </div>

      <div class="product-detail__sections">${sections}</div>
    `;

    // wire qty stepper
    const stepper = document.querySelector("[data-qty-stepper]");
    const buyBtn  = document.querySelector(`[data-add-to-cart="${p.id}"]`);
    if (stepper && buyBtn) {
      const input = stepper.querySelector("[data-stepper-input]");
      const dec   = stepper.querySelector("[data-stepper-dec]");
      const inc   = stepper.querySelector("[data-stepper-inc]");
      const sync = () => buyBtn.setAttribute("data-qty", input.value || "1");
      dec.addEventListener("click", () => { input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1); sync(); });
      inc.addEventListener("click", () => { input.value = Math.min(99, (parseInt(input.value, 10) || 1) + 1); sync(); });
      input.addEventListener("change", () => {
        let v = parseInt(input.value, 10);
        if (isNaN(v) || v < 1) v = 1;
        if (v > 99) v = 99;
        input.value = v; sync();
      });
    }
  }

  function blockHTML(block) {
    if (block.items) {
      return `<div class="product-block">
        <h3 class="product-block__heading">${block.heading}</h3>
        <ul>${block.items.map((i) => `<li>${i}</li>`).join("")}</ul>
      </div>`;
    }
    if (block.sessions) {
      return `<div class="product-block">
        <h3 class="product-block__heading">${block.heading}</h3>
        <div class="product-block__sessions">
          ${block.sessions.map((s) => `
            <div class="product-block__session">
              <h4>${s.title}</h4>
              <span class="product-block__session-duration">${s.duration}</span>
              <ul>${s.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
            </div>`).join("")}
        </div>
      </div>`;
    }
    if (block.req) {
      return `<div class="product-block">
        <h3 class="product-block__heading">${block.heading}</h3>
        <div class="product-block__req">
          <div class="product-block__req-col">
            <h5>الكمبيوتر</h5>
            <ul>${block.req.pc.map((i) => `<li>${i}</li>`).join("")}</ul>
          </div>
          <div class="product-block__req-col">
            <h5>كرت الكابتشر</h5>
            <ul>${block.req.capture.map((i) => `<li>${i}</li>`).join("")}</ul>
          </div>
        </div>
      </div>`;
    }
    if (block.note) {
      return `<div class="product-block">
        <h3 class="product-block__heading">${block.heading}</h3>
        <p class="product-block__note">${block.note}</p>
      </div>`;
    }
    return "";
  }

  /* -- cart page ------------------------------------------------ */
  function renderCartPage() {
    const host = document.querySelector("[data-cart-rows]");
    if (!host) return;
    const items = window.LR_CART.get();

    if (!items.length) {
      host.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-state__icon">${SVG.cart}</div>
        <h3 class="empty-state__title">سلتك فارغة حالياً</h3>
        <p class="empty-state__desc">تصفّح المنتجات وأضف ما يناسبك لمتابعة الطلب.</p>
        <a href="products.html" class="btn btn--primary btn--solid">تصفّح المنتجات</a>
      </div>`;
      const summary = document.querySelector("[data-cart-summary]");
      if (summary) summary.style.display = "none";
      return;
    }

    host.innerHTML = items.map((it) => {
      const p = window.LR_DATA.getProduct(it.id);
      if (!p) return "";
      const cat = window.LR_DATA.getCategory(p.cat);
      const isUltimate = p.art.kind === "ultimate";
      const artInner = isUltimate
        ? `<span class="product-art__title">${p.art.lines[0]}</span><span class="product-art__sub">${p.art.lines[1] || ""}</span>`
        : p.art.lines.map((l, i) => `<span class="product-art__${i === 0 ? "game" : "legend"}">${l}</span>`).join("");

      return `
      <div class="cart-row" data-cart-line="${p.id}">
        <div class="cart-row__art product-art product-art--${p.art.kind}">${artInner}</div>
        <div>
          <div class="cart-row__cat">${cat ? cat.name : ""}</div>
          <a class="cart-row__name" href="product.html?id=${p.id}">${p.name}</a>
        </div>
        <div class="cart-line__qty">
          <button type="button" data-qty-dec aria-label="ناقص">−</button>
          <span data-qty>${it.qty}</span>
          <button type="button" data-qty-inc aria-label="زائد">+</button>
        </div>
        <div class="cart-row__price">
          <div class="price">
            <span class="price__amount">${window.LR_DATA.formatPrice(p.price * it.qty)}</span>
            <span class="price__currency"><svg class="sar-icon"><use href="#sar-symbol"/></svg></span>
          </div>
        </div>
        <button type="button" class="cart-row__remove" data-remove aria-label="حذف">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>`;
    }).join("");

    // summary
    const subtotal = window.LR_CART.total();
    const totalEl = document.querySelector("[data-summary-total]");
    const subEl   = document.querySelector("[data-summary-subtotal]");
    if (subEl)   subEl.textContent   = window.LR_DATA.formatPrice(subtotal);
    if (totalEl) totalEl.textContent = window.LR_DATA.formatPrice(subtotal);
  }

  /* -- checkout summary ----------------------------------------- */
  function renderCheckoutSummary() {
    const host = document.querySelector("[data-checkout-lines]");
    if (!host) return;
    const items = window.LR_CART.get();
    if (!items.length) {
      host.innerHTML = `<p style="color:var(--muted);font-size:14px;">السلة فارغة. <a href="products.html" style="color:var(--blue);">تصفّح المنتجات</a></p>`;
    } else {
      host.innerHTML = items.map((it) => {
        const p = window.LR_DATA.getProduct(it.id);
        if (!p) return "";
        return `<div class="cart-summary__row">
          <span>${p.name} <span style="color:var(--muted); font-family:var(--font-display);">× ${it.qty}</span></span>
          <span class="price"><span class="price__amount" style="font-size:14px;">${window.LR_DATA.formatPrice(p.price * it.qty)}</span><span class="price__currency" style="font-size:14px;"><svg class="sar-icon"><use href="#sar-symbol"/></svg></span></span>
        </div>`;
      }).join("");
    }
    const total = window.LR_CART.total();
    document.querySelectorAll("[data-checkout-total]").forEach((el) => el.textContent = window.LR_DATA.formatPrice(total));
  }

  /* -- run on page load ----------------------------------------- */
  ready(() => waitForData(() => {
    const homeHost     = document.querySelector("[data-home-products]");
    const allHost      = document.querySelector("[data-all-products]");
    const catHost      = document.querySelector("[data-category-products]");
    const productHost  = document.querySelector("[data-product-detail]");
    const cartHost     = document.querySelector("[data-cart-rows]");
    const checkoutHost = document.querySelector("[data-checkout-lines]");

    if (homeHost)    renderHomeProducts(homeHost);
    if (allHost)     renderAllProducts(allHost);
    if (catHost) {
      const params = new URLSearchParams(location.search);
      renderCategoryPage(catHost, params.get("cat") || "ps5");
    }
    if (productHost) {
      const params = new URLSearchParams(location.search);
      renderProductPage(productHost, params.get("id") || "");
    }
    if (cartHost)     renderCartPage();
    if (checkoutHost) renderCheckoutSummary();

    // re-render on cart changes
    window.addEventListener("cart:change", () => {
      if (cartHost)     renderCartPage();
      if (checkoutHost) renderCheckoutSummary();
    });
  }));
})();
