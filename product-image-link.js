window.addEventListener("load", function () {
  var p = new URLSearchParams(location.search);
  if (p.get("id") !== "ps5-ai-ultimate") return;

  var m = document.querySelector(".product-detail__media");
  if (!m) return;

  m.style.cursor = "zoom-in";
  m.setAttribute("role", "button");
  m.setAttribute("tabindex", "0");
  m.setAttribute("aria-label", "عرض صورة المنتج");

  function openImage() {
    var overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "9999";
    overlay.style.background = "rgba(0, 4, 10, .94)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "28px";
    overlay.style.cursor = "zoom-out";

    var img = document.createElement("img");
    img.src = "ps5-ai-ultimate.png";
    img.alt = "PS5 AI AIM Package — Ultimate Edition";
    img.style.maxWidth = "96vw";
    img.style.maxHeight = "92vh";
    img.style.objectFit = "contain";
    img.style.border = "1px solid rgba(3,131,244,.35)";
    img.style.cursor = "default";

    var close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    close.setAttribute("aria-label", "إغلاق الصورة");
    close.style.position = "fixed";
    close.style.top = "22px";
    close.style.left = "28px";
    close.style.fontSize = "42px";
    close.style.color = "#fff";
    close.style.zIndex = "10000";
    close.style.cursor = "pointer";

    function closeImage() {
      overlay.remove();
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    }

    function onEsc(e) {
      if (e.key === "Escape") closeImage();
    }

    overlay.addEventListener("click", closeImage);
    img.addEventListener("click", function (e) {
      e.stopPropagation();
    });
    close.addEventListener("click", closeImage);
    document.addEventListener("keydown", onEsc);

    overlay.appendChild(img);
    overlay.appendChild(close);
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
  }

  m.addEventListener("click", openImage);
  m.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openImage();
    }
  });
});
