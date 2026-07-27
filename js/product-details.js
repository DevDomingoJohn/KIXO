document.addEventListener("DOMContentLoaded", function () {
  if (!document.getElementById("productDetailRoot")) return;

  var params = new URLSearchParams(window.location.search);
  var productId = params.get("id");
  var product =
    window.KIXO_PRODUCTS && productId ? window.KIXO_PRODUCTS[productId] : null;

  if (!product) {
    showProductNotFound(productId);
    return;
  }

  renderProduct(product);
  initSizePicker(product);
  bindProductInteractions(product);
  renderRelatedProducts(product);
});

var SIZE_ROWS = [
  { us: "6", uk: "5", eu: "39" },
  { us: "7", uk: "6", eu: "40" },
  { us: "8", uk: "7", eu: "41" },
  { us: "9", uk: "8", eu: "42" },
  { us: "10", uk: "9", eu: "43" },
  { us: "11", uk: "10", eu: "44" },
  { us: "12", uk: "11", eu: "45" },
  { us: "13", uk: "12", eu: "48" },
];

var sizePickerState = {
  region: "us",
  us: null,
};

function initSizePicker(product) {
  var container = document.getElementById("sizeOptions");
  var hint = document.getElementById("sizeSelectionHint");
  var regionButtons = document.querySelectorAll("[data-size-region]");
  if (!container) return;

  sizePickerState.region = "us";
  sizePickerState.us = null;

  var rows =
    product.category === "basketball"
      ? SIZE_ROWS
      : SIZE_ROWS.filter(function (row) {
          return row.us !== "13";
        });

  function updateHint() {
    if (!hint) return;
    hint.classList.remove("is-warning");
    if (!sizePickerState.us) {
      hint.textContent =
        "Choose US, UK, or EU, then pick your size.";
      return;
    }
    var row = rows.find(function (r) {
      return r.us === sizePickerState.us;
    });
    if (!row) return;
    hint.textContent =
      "Selected: US " +
      row.us +
      " / UK " +
      row.uk +
      " / EU " +
      row.eu;
  }

  function renderSizeOptions() {
    container.innerHTML = "";
    rows.forEach(function (row) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "size-option-btn";
      btn.setAttribute("role", "option");
      btn.dataset.us = row.us;
      btn.textContent = row[sizePickerState.region];
      if (sizePickerState.us === row.us) {
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
      } else {
        btn.setAttribute("aria-selected", "false");
      }
      btn.addEventListener("click", function () {
        sizePickerState.us = row.us;
        renderSizeOptions();
        updateHint();
      });
      container.appendChild(btn);
    });
  }

  regionButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var region = btn.getAttribute("data-size-region");
      if (!region || region === sizePickerState.region) return;
      sizePickerState.region = region;
      regionButtons.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
      renderSizeOptions();
      updateHint();
    });
  });

  renderSizeOptions();
  updateHint();
}

function getSelectedSizeLabel() {
  if (!sizePickerState.us) return null;
  var row = SIZE_ROWS.find(function (r) {
    return r.us === sizePickerState.us;
  });
  if (!row) return null;
  var region = sizePickerState.region.toUpperCase();
  return region + " " + row[sizePickerState.region];
}

function showProductNotFound(id) {
  document.title = "Product Not Found | KIXO";
  var root = document.getElementById("productDetailRoot");
  if (!root) return;
  root.innerHTML =
    '<div class="container py-5 text-center">' +
    "<h1 class=\"mb-3\">Product not found</h1>" +
    '<p class="text-secondary mb-4">' +
    (id
      ? 'We could not find a product for id <span class="mono">' +
        escapeHtml(id) +
        "</span>."
      : "Choose a shoe from the shop and open View Details.") +
    "</p>" +
    '<a href="products.html" class="btn btn-primary">Back to Shop</a>' +
    "</div>";
}

function renderProduct(product) {
  document.title = product.name + " | KIXO";

  setText("productBreadcrumb", product.name);
  setText("productCategory", product.categoryLabel);
  setText("productName", product.name);
  setText("productPrice", product.priceDisplay);
  setText("productSummary", product.summary);
  setText("productDescription", product.description);
  setText("productShipping", product.shipping);

  var img = document.getElementById("productImage");
  if (img) {
    img.src = product.image;
    img.alt = product.name + " product photo";
  }

  var specsList = document.getElementById("productSpecsList");
  if (specsList && product.specs) {
    specsList.innerHTML = product.specs
      .map(function (row, index) {
        var border =
          index < product.specs.length - 1 ? " border-bottom" : "";
        return (
          '<li class="d-flex justify-content-between py-2' +
          border +
          '">' +
          "<span>" +
          escapeHtml(row.label) +
          "</span><span>" +
          escapeHtml(row.value) +
          "</span></li>"
        );
      })
      .join("");
  }
}

function bindProductInteractions(product) {
  var qtyInput = document.getElementById("qtyInput");
  var minusBtn = document.querySelector(".qty-minus");
  var plusBtn = document.querySelector(".qty-plus");
  var addBtn = document.getElementById("addToCartBtn");
  var toastEl = document.getElementById("addToCartToast");
  var toastBody = document.getElementById("addToCartToastBody");

  function readQty() {
    var qty = parseInt(qtyInput.value, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    qtyInput.value = qty;
    return qty;
  }

  if (minusBtn && qtyInput) {
    minusBtn.addEventListener("click", function () {
      qtyInput.value = Math.max(1, readQty() - 1);
    });
  }
  if (plusBtn && qtyInput) {
    plusBtn.addEventListener("click", function () {
      qtyInput.value = readQty() + 1;
    });
  }
  if (qtyInput) {
    qtyInput.addEventListener("change", readQty);
  }

  var sizeHint = document.getElementById("sizeSelectionHint");

  if (addBtn && toastEl && toastBody) {
    var toast = bootstrap.Toast.getOrCreateInstance(toastEl);
    addBtn.addEventListener("click", function () {
      var sizeLabel = getSelectedSizeLabel();
      if (!sizeLabel) {
        if (sizeHint) {
          sizeHint.textContent = "Please select a size before adding to cart.";
          sizeHint.classList.add("is-warning");
        }
        toastEl.classList.remove("text-bg-dark");
        toastEl.classList.add("text-bg-danger");
        toastBody.innerHTML =
          '<i class="bi bi-exclamation-triangle me-2"></i>Please select a size before adding to cart.';
        toast.show();
        return;
      }
      var qty = readQty();
      if (window.KIXO_CART) {
        window.KIXO_CART.add({
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          size: sizeLabel,
          qty: qty
        });
      }
      toastEl.classList.remove("text-bg-danger");
      toastEl.classList.add("text-bg-dark");
      toastBody.innerHTML =
        '<i class="bi bi-check-circle me-2"></i>' +
        escapeHtml(product.name) +
        " (" +
        escapeHtml(sizeLabel) +
        ") &times; " +
        qty +
        " added to your cart.";
      toast.show();
    });
  }
}

function setText(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}

function renderRelatedProducts(product) {
  var container = document.getElementById("relatedProducts");
  if (!container || !window.KIXO_PRODUCTS) return;

  var candidateIds = Object.keys(window.KIXO_PRODUCTS).filter(function (id) {
    return id !== product.id;
  });

  // Fisher-Yates shuffle, then take the first 3 — a fresh random pick on every visit/reload.
  for (var i = candidateIds.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = candidateIds[i];
    candidateIds[i] = candidateIds[j];
    candidateIds[j] = tmp;
  }

  var picks = candidateIds.slice(0, 3).map(function (id) {
    return window.KIXO_PRODUCTS[id];
  });

  container.innerHTML = picks
    .map(function (p) {
      return (
        '<div class="col-sm-6 col-lg-4 product-item">' +
        '<div class="card h-100">' +
        '<div class="position-relative">' +
        '<img src="' +
        p.image +
        '" class="card-img-top" alt="' +
        escapeHtml(p.name) +
        '">' +
        "</div>" +
        '<div class="card-body d-flex flex-column">' +
        '<p class="eyebrow mb-1">' +
        escapeHtml(p.categoryLabel) +
        " \u00b7 " +
        escapeHtml(p.brandLabel) +
        "</p>" +
        '<h3 class="h5 mb-1">' +
        escapeHtml(p.name) +
        "</h3>" +
        '<p class="text-secondary small mb-3">' +
        escapeHtml(p.summary) +
        "</p>" +
        '<div class="mt-auto d-flex justify-content-between align-items-center">' +
        '<span class="price fw-semibold">' +
        escapeHtml(p.priceDisplay) +
        "</span>" +
        '<a href="product-details.html?id=' +
        encodeURIComponent(p.id) +
        '" class="btn btn-dark btn-sm">View Details</a>' +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>"
      );
    })
    .join("");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
