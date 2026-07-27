/**
 * KIXO cart — shared client-side cart, stored in localStorage.
 * No backend/database: this is a simple demo cart that persists
 * only in the current browser.
 *
 * Cart is an array of rows: { id, name, image, price, size, qty }
 */
(function () {
  var CART_KEY = "kixo_cart";

  // Three real products from the catalog (js/products-data.js), preloaded
  // so the cart isn't empty on first visit. Only the id/size/qty are fixed
  // here — name, image, and price are always pulled live from
  // window.KIXO_PRODUCTS, so the demo cart can never drift out of sync
  // with what's actually shown on the Shop page.
  var DEFAULT_CART_SPEC = [
    { id: "nike1", size: "US 9", qty: 1 },
    { id: "adidas3", size: "US 10", qty: 2 },
    { id: "puma5", size: "US 8", qty: 1 }
  ];

  function buildDefaultCart() {
    var products = window.KIXO_PRODUCTS || {};
    var rows = [];
    DEFAULT_CART_SPEC.forEach(function (spec) {
      var p = products[spec.id];
      if (!p) return; // catalog not loaded on this page — skip rather than guess
      rows.push({
        id: p.id,
        name: p.name,
        image: p.image,
        price: p.price,
        size: spec.size,
        qty: spec.qty
      });
    });
    return rows;
  }

  function loadCart() {
    var raw;
    try {
      raw = localStorage.getItem(CART_KEY);
    } catch (e) {
      raw = null;
    }

    // First-ever visit on this browser (or products catalog not ready yet):
    // seed the demo cart from the real product catalog.
    if (raw === null) {
      var seeded = buildDefaultCart();
      saveCart(seeded);
      return seeded;
    }

    try {
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      /* storage unavailable — fail silently, cart just won't persist */
    }
  }

  // Adds a product to the cart. Same product id + size stacks the quantity.
  function addToCart(item) {
    var cart = loadCart();
    var existing = cart.find(function (row) {
      return row.id === item.id && row.size === item.size;
    });
    if (existing) {
      existing.qty += item.qty;
    } else {
      cart.push(item);
    }
    saveCart(cart);
    updateNavBadge();
    return cart;
  }

  function removeFromCart(index) {
    var cart = loadCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateNavBadge();
    return cart;
  }

  function updateQty(index, qty) {
    var cart = loadCart();
    if (cart[index]) {
      cart[index].qty = Math.max(1, qty);
      saveCart(cart);
    }
    updateNavBadge();
    return cart;
  }

  function getCartCount() {
    return loadCart().reduce(function (sum, row) {
      return sum + row.qty;
    }, 0);
  }

  function formatPeso(n) {
    return (
      "\u20B1" +
      n.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    );
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function updateNavBadge() {
    var badge = document.getElementById("navCartCount");
    if (!badge) return;
    var count = getCartCount();
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  /* ---- Cart page rendering (only runs if #cartTable exists) ---- */

  function renderCartTable() {
    var tbody = document.querySelector("#cartTable tbody");
    if (!tbody) return;

    var tableWrap = document.getElementById("cartTableWrap");
    var emptyState = document.getElementById("cartEmptyState");
    var cart = loadCart();

    if (cart.length === 0) {
      if (tableWrap) tableWrap.classList.add("d-none");
      if (emptyState) emptyState.classList.remove("d-none");
      updateSummary([]);
      return;
    }

    if (tableWrap) tableWrap.classList.remove("d-none");
    if (emptyState) emptyState.classList.add("d-none");

    tbody.innerHTML = cart
      .map(function (row, index) {
        var subtotal = row.price * row.qty;
        return (
          '<tr data-index="' +
          index +
          '">' +
          "<td>" +
          '<div class="d-flex align-items-center gap-3">' +
          '<img src="' +
          row.image +
          '" class="cart-thumb" alt="' +
          escapeHtml(row.name) +
          '">' +
          "<div>" +
          '<p class="mb-0 fw-semibold">' +
          escapeHtml(row.name) +
          "</p>" +
          '<p class="mb-0 small text-secondary mono">Size ' +
          escapeHtml(row.size) +
          "</p>" +
          "</div>" +
          "</div>" +
          "</td>" +
          '<td class="price">' +
          formatPeso(row.price) +
          "</td>" +
          '<td style="max-width:110px;">' +
          '<input type="number" class="form-control form-control-sm cart-qty" value="' +
          row.qty +
          '" min="1" aria-label="Quantity for ' +
          escapeHtml(row.name) +
          '">' +
          "</td>" +
          '<td class="price cart-subtotal">' +
          formatPeso(subtotal) +
          "</td>" +
          "<td>" +
          '<button class="btn btn-sm btn-outline-dark cart-remove" type="button" aria-label="Remove ' +
          escapeHtml(row.name) +
          ' from cart">' +
          '<i class="bi bi-trash"></i>' +
          "</button>" +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    updateSummary(cart);
  }

  function updateSummary(cart) {
    var grandTotal = 0;
    var count = 0;
    cart.forEach(function (row) {
      grandTotal += row.price * row.qty;
      count += row.qty;
    });
    var totalEl = document.getElementById("cartGrandTotal");
    if (totalEl) totalEl.textContent = formatPeso(grandTotal);
    var countEl = document.getElementById("cartItemCount");
    if (countEl) countEl.textContent = count;
  }

  function initCartPage() {
    var cartTable = document.getElementById("cartTable");
    if (!cartTable) return;

    renderCartTable();

    cartTable.addEventListener("change", function (e) {
      if (!e.target.classList.contains("cart-qty")) return;
      var row = e.target.closest("tr");
      var index = parseInt(row.getAttribute("data-index"), 10);
      var qty = parseInt(e.target.value, 10);
      if (isNaN(qty) || qty < 1) qty = 1;
      updateQty(index, qty);
      renderCartTable();
    });

    cartTable.addEventListener("click", function (e) {
      var btn = e.target.closest(".cart-remove");
      if (!btn) return;
      var row = btn.closest("tr");
      var index = parseInt(row.getAttribute("data-index"), 10);
      removeFromCart(index);
      renderCartTable();
    });

    var updateBtn = document.getElementById("updateCartBtn");
    var cartToastEl = document.getElementById("cartToast");
    if (updateBtn && cartToastEl && window.bootstrap) {
      var cartToast = bootstrap.Toast.getOrCreateInstance(cartToastEl);
      updateBtn.addEventListener("click", function () {
        renderCartTable();
        cartToast.show();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateNavBadge();
    initCartPage();
  });

  // Keep the badge/table in sync if the cart changes in another tab of the
  // SAME origin (e.g. two tabs both open on http://localhost/...).
  window.addEventListener("storage", function (e) {
    if (e.key !== CART_KEY) return;
    updateNavBadge();
    renderCartTable();
  });

  window.KIXO_CART = {
    load: loadCart,
    save: saveCart,
    add: addToCart,
    remove: removeFromCart,
    updateQty: updateQty,
    count: getCartCount,
    formatPeso: formatPeso,
    updateNavBadge: updateNavBadge,
    renderCartTable: renderCartTable
  };
})();
