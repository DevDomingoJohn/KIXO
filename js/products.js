document.addEventListener("DOMContentLoaded", function () {
  const categoryButtons = document.querySelectorAll('[data-filter-category]');
  const brandButtons    = document.querySelectorAll('[data-filter-brand]');
  const products        = document.querySelectorAll('.product-item');

  let activeCategory = 'all';
  let activeBrand    = 'all';

  function applyFilters() {
    products.forEach(item => {
      const itemCategory = item.getAttribute('data-category');
      const itemBrand    = item.getAttribute('data-brand');

      const categoryMatch = (activeCategory === 'all' || itemCategory === activeCategory);
      const brandMatch    = (activeBrand === 'all' || itemBrand === activeBrand);

      // Show only if BOTH match
      if (categoryMatch && brandMatch) {
        item.classList.remove('d-none');
      } else {
        item.classList.add('d-none');
      }
    });
  }

  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      activeCategory = btn.getAttribute('data-filter-category');
      applyFilters();
    });
  });

  brandButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      brandButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      activeBrand = btn.getAttribute('data-filter-brand');
      applyFilters();
    });
  });
});