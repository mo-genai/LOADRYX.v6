window.addEventListener("load", function () {
  var params = new URLSearchParams(location.search);
  if (params.get("id") !== "ps5-ai-ultimate") return;

  var media = document.querySelector(".product-detail__media");
  if (!media) return;

  media.style.cursor = "zoom-in";

  media.onclick = function () {
    var box = document.createElement("div");
    box.className = "lr-lightbox";

    var img = document.createElement("img");
    img.src = "ps5-ai-ultimate.png";
    img.alt = "PS5 AI AIM Package";

    var close = document.createElement("button");
    close.type = "button";
    close.className = "lr-lightbox-x";
    close.textContent = "×";

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
