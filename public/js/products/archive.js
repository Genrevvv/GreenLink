import { createNotificationElement } from '../utils/notification/notification.js';
import { productsData } from './data.js';
import { renderProducts } from './table.js';

export let showingArchivedProducts = false;

export function archiveProduct(id) {
    const product = productsData.find(
        product => product.id === id
    );

    if (!product) return;

    if (!confirm(`Archive ${product.name}?`)) return;

    product.isArchived = true;

    renderProducts();

    createNotificationElement({
        status: 'success',
        message: 'Product Archived Successfully'
    });
}

export function restoreProduct(id) {
    const product = productsData.find(
        product => product.id === id
    );

    if (!product) return;

    if (!confirm(`Restore ${product.name} to active products?`)) return;

    product.isArchived = false;

    renderProducts();

    createNotificationElement({
        status: 'success',
        message: 'Product Restored Successfully'
    });
}

export function toggleArchivedProducts() {
    showingArchivedProducts = !showingArchivedProducts;

    const button = document.querySelector('#view-archieved');

    if (button) {
        button.textContent = showingArchivedProducts
            ? 'View Active Products'
            : 'View Archived';
    }

    // Reset filters when switching between active and archived products.
    const searchInput = document.querySelector('#product-search');
    const categoryFilter = document.querySelector('#filter-product-category');
    const statusFilter = document.querySelector('#filter-product-status');

    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = 'all';
    if (statusFilter) statusFilter.value = 'all';

    renderProducts();
}