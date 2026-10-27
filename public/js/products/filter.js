export function initProductFilters() {
    document.querySelector('#product-search')?.addEventListener('input', filterProducts);

    document.querySelector('#filter-product-category')?.addEventListener('change', filterProducts);

    document.querySelector('#filter-product-status')?.addEventListener('change', filterProducts);
}

export function filterProducts() {
    const searchInput = document.querySelector('#product-search');
    const categoryFilter = document.querySelector('#filter-product-category');
    const statusFilter = document.querySelector('#filter-product-status');
    const productTable = document.querySelector('.products-table');

    if (!productTable) return;

    const searchValue = searchInput?.value.trim().toLowerCase() || '';
    const selectedCategory = categoryFilter?.value || 'all';
    const selectedStatus = statusFilter?.value || 'all';

    productTable.querySelectorAll('tr').forEach(row => {
        if (row.querySelector('th')) return;

        const name = row.cells[0]?.textContent.trim().toLowerCase() || '';
        const category = row.dataset.category || '';
        const status = row.dataset.status || '';

        const matchesSearch = name.includes(searchValue);
        const matchesCategory =
            selectedCategory === 'all' || category === selectedCategory;
        const matchesStatus =
            selectedStatus === 'all' ||
            status === selectedStatus.replace('-', ' ');

        row.style.display =
            matchesSearch && matchesCategory && matchesStatus ? '' : 'none';
    });
}

export function initProductCardFilters() {
    const searchInput = document.querySelector('#card-product-search');
    const categoryFilter = document.querySelector('#card-category-filter');
    const availabilityFilter = document.querySelector('#card-availability-filter');

    if (!searchInput || !categoryFilter || !availabilityFilter) return;

    // POPULATE CATEGORY OPTIONS
    const categories = [...new Set(
        [...document.querySelectorAll('#product-cards .product-card')]
            .map(card => card.dataset.category)
            .filter(Boolean)
    )].sort();

    categories.forEach(category => {
        if ([...categoryFilter.options].some(option => option.value === category)) {
            return;
        }

        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });

    searchInput.addEventListener('input', filterProductCards);
    categoryFilter.addEventListener('change', filterProductCards);
    availabilityFilter.addEventListener('change', filterProductCards);

    // filterProductCards();
}

export function filterProductCards() {
    const searchInput = document.querySelector('#card-product-search');
    const categoryFilter = document.querySelector('#card-category-filter');
    const availabilityFilter = document.querySelector('#card-availability-filter');
    const productCards = document.querySelector('#product-cards');
    const emptyMessage = document.querySelector('#no-products-found');

    if (!productCards) return;

    const searchValue = searchInput?.value.trim().toLowerCase() || '';
    const selectedCategory = categoryFilter?.value || 'all';
    const selectedAvailability = availabilityFilter?.value || 'all';

    let visibleCount = 0;

    productCards.querySelectorAll('.product-card').forEach(card => {
        const matchesSearch =
            (card.dataset.name || '').includes(searchValue) ||
            (card.dataset.description || '').includes(searchValue);

        const matchesCategory =
            selectedCategory === 'all' ||
            card.dataset.category === selectedCategory;

        const matchesAvailability =
            selectedAvailability === 'all' ||
            card.dataset.availability === selectedAvailability;

        const isVisible =
            matchesSearch && matchesCategory && matchesAvailability;

        card.hidden = !isVisible;

        if (isVisible) visibleCount++;
    });

    if (emptyMessage) {
        emptyMessage.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}