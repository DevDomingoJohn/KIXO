document.addEventListener("DOMContentLoaded", function () {
    /* ---- 1. Auto-close the mobile Offcanvas menu after a link is tapped ---- */
    var offcanvasEl = document.getElementById("mobileNav");
    if (offcanvasEl) {
        var bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
        offcanvasEl.querySelectorAll("a.nav-link").forEach(function (link) {
            link.addEventListener("click", function () { bsOffcanvas.hide(); });
        });
    }
});