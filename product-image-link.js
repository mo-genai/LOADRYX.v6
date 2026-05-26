window.addEventListener("load", function () {
  var params = new URLSearchParams(location.search);
  if (params.get("id") !== "ps5-ai-ultimate") return;

  var media = document.querySelector(".product-detail__media");
  if (!media) return;

  media.style.cursor = "zoom-in";
  media.onclick = function () {
    window.open("ps5-ai-ultimate.png", "_blank");
  };
});
