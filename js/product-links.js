/**
 * Adds ?id= links on product cards from the image filename (e.g. nike1.png → nike1).
 * Special case: Adizero Dropset Pro → adidas-dropset.
 */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".product-item").forEach(function (item) {
    var img = item.querySelector(".card-img-top");
    var link = item.querySelector('a[href*="product-details"]');
    if (!img || !link) return;

    var match = img.getAttribute("src").match(/\/([^/]+)\.(png|jpe?g|webp)$/i);
    if (!match) return;

    var id = match[1];
    var titleEl = item.querySelector(".card-body h3");
    var title = titleEl ? titleEl.textContent : "";
    if (id === "adidas6" && /Dropset/i.test(title)) id = "adidas-dropset";

    link.setAttribute("href", "product-details.html?id=" + encodeURIComponent(id));
  });
});
