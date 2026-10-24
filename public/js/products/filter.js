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
            selectedCategory === 'all' ||
            category === selectedCategory;

        const matchesStatus =
            selectedStatus === 'all' ||
            status === selectedStatus.replace('-', ' ');

        row.style.display = matchesSearch && matchesCategory && matchesStatus ? '' : 'none';
    });
}
