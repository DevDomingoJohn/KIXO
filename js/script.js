document.addEventListener("DOMContentLoaded", function () {
    /* ---- 1. Auto-close the mobile Offcanvas menu after a link is tapped ---- */
    var offcanvasEl = document.getElementById("mobileNav");
    if (offcanvasEl) {
        var bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
        offcanvasEl.querySelectorAll("a.nav-link").forEach(function (link) {
            link.addEventListener("click", function () { bsOffcanvas.hide(); });
        });
    }


    /* ---- 3. Cart page — live quantity math + remove rows ---- */
  var cartTable = document.getElementById("cartTable");
  if (cartTable) {
    function formatPeso(n) {
      return "\u20B1" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    function recalcCart() {
      var grandTotal = 0;
      cartTable.querySelectorAll("tbody tr").forEach(function (row) {
        var price = parseFloat(row.dataset.price);
        var qtyInput = row.querySelector(".cart-qty");
        var qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
        qtyInput.value = qty;
        var subtotal = price * qty;
        row.querySelector(".cart-subtotal").textContent = formatPeso(subtotal);
        grandTotal += subtotal;
      });
      var totalEl = document.getElementById("cartGrandTotal");
      if (totalEl) totalEl.textContent = formatPeso(grandTotal);
      var countEl = document.getElementById("cartItemCount");
      if (countEl) countEl.textContent = cartTable.querySelectorAll("tbody tr").length;
    }
    cartTable.addEventListener("change", function (e) {
      if (e.target.classList.contains("cart-qty")) recalcCart();
    });
    cartTable.addEventListener("click", function (e) {
      var btn = e.target.closest(".cart-remove");
      if (btn) {
        btn.closest("tr").remove();
        recalcCart();
      }
    });
    recalcCart();

    var updateBtn = document.getElementById("updateCartBtn");
    var cartToastEl = document.getElementById("cartToast");
    if (updateBtn && cartToastEl) {
      var cartToast = new bootstrap.Toast(cartToastEl);
      updateBtn.addEventListener("click", function () {
        recalcCart();
        cartToast.show();
      });
    }
  }
});