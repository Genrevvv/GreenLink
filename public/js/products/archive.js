
import { createNotificationElement } from '../utils/notification/notification.js';
import { updateArchiveStatus } from './api.js';
import { updateProductSummary } from './summary.js';
import { renderProducts } from './table.js';

export let showingArchivedProducts = false;

// ARCHIVE PRODUCT
export async function archiveProduct(id, products) {
    const product = products.find(product => product.id === id);

    if (!product) return;
    if (!confirm(`Archive ${product.name}?`)) return;

    const success = await updateArchiveStatus(id, true);
    if (!success) return;

    product.isArchived = true;

    renderProducts();
    updateProductSummary(products);

    createNotificationElement({
        status: 'success',
        message: 'Product Archived Successfully'
    });
}

// RESTORE PRODUCT
export async function restoreProduct(id, products) {
    const product = products.find(product => product.id === id);

    if (!product) return;
    if (!confirm(`Restore ${product.name} to active products?`)) return;

    const success = await updateArchiveStatus(id, false);
    if (!success) return;

    product.isArchived = false;

    renderProducts();
    updateProductSummary(products);

    createNotificationElement({
        status: 'success',
        message: 'Product Restored Successfully'
    });
}

// TOGGLE ARCHIVED PRODUCTS
export function toggleArchivedProducts() {
    showingArchivedProducts = !showingArchivedProducts;

    const button = document.querySelector('#view-archieved');

    if (button) {
        button.textContent = showingArchivedProducts
            ? 'View Active Products'
            : 'View Archived';
    }

    // RESET FILTERS
    const searchInput = document.querySelector('#product-search');
    const categoryFilter = document.querySelector('#filter-product-category');
    const statusFilter = document.querySelector('#filter-product-status');

    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = 'all';
    if (statusFilter) statusFilter.value = 'all';
}
