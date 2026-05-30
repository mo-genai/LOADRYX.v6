window.addEventListener("load", function () {
  var params = new URLSearchParams(location.search);
  var product = window.LR_DATA && window.LR_DATA.getProduct(params.get("id"));
  var images = product && Array.isArray(product.images) && product.images.length
    ? product.images
    : product && product.image
      ? [product.image]
      : [];
  if (!product || !images.length) return;

  var media = document.querySelector(".product-detail__media");
  if (!media) return;

  media.style.cursor = "zoom-in";

  media.onclick = function () {
    var box = document.createElement("div");
    box.className = "lr-lightbox";

    var img = document.createElement("img");
    var current = media.querySelector(".product-art__image");
    img.src = current ? current.getAttribute("src") : images[0];
    img.alt = product.name;

    var close = document.createElement("button");
    close.type = "button";
    close.className = "lr-lightbox-x";
    close.innerHTML = "&times;";

    box.onclick = function () {
      box.remove();
      document.body.style.overflow = "";
    };

    img.onclick = function (e) {
      e.stopPropagation();
      img.classList.toggle("is-zoomed");
    };

    close.onclick = function (e) {
      e.stopPropagation();
      box.remove();
      document.body.style.overflow = "";
    };

    box.appendChild(img);
    box.appendChild(close);
    document.body.appendChild(box);
    document.body.style.overflow = "hidden";
  };
});
