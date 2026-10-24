import { hideOverlay, showOverlay } from '../utils/overlay.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import { productsData } from './data.js';
import { addEditProductModal } from './modal.js';
import { renderProducts } from './table.js';
import { showingArchivedProducts, toggleArchivedProducts } from './archive.js';

export function showAddProductForm() {
    showOverlay(addEditProductModal());

    document.querySelector('.focus-input')?.focus();

    const addProductBtn = document.querySelector('#add-product-btn');

    if (addProductBtn) {
        addProductBtn.onclick = addProduct;
    }
}

export function getProductData() {
    return {
        name: document.querySelector('#product-name')?.value.trim() ?? '',
        category: document.querySelector('#product-category')?.value ?? 'vegetables'
    };
}

export function addProduct() {
    const productData = getProductData();

    if (!productData.name) {
        alert('Please enter a product name.');
        return;
    }

    const newId = Math.max(
        0,
        ...productsData.map(product => Number(product.id) || 0)
    ) + 1;

    productsData.push({
        id: newId,
        name: productData.name,
        category: productData.category,
        description: '',
        inStock: true,
        isArchived: false
    });

    // Switch back to active products if currently viewing archived products.
    if (showingArchivedProducts) {
        toggleArchivedProducts();
    } else {
        renderProducts();
    }

    hideOverlay();

    createNotificationElement({
        status: 'success',
        message: 'Product Added Successfully'
    });
}