window.addEventListener("load", function () {
  var p = new URLSearchParams(location.search);
  if (p.get("id") !== "ps5-ai-ultimate") return;

  var m = document.querySelector(".product-detail__media");
  if (!m) return;

  m.style.cursor = "zoom-in";
  m.setAttribute("role", "link");
  m.setAttribute("tabindex", "0");
  m.setAttribute("aria-label", "فتح صورة المنتج بحجم كامل");

  function openImage() {
    location.href = "ps5-ai-ultimate.png";
  }

  m.addEventListener("click", openImage);
  m.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openImage();
    }
  });
});
