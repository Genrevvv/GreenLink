import { hideOverlay, showOverlay } from '../utils/overlay.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import { addEditProductModal } from './modal.js';
import { products, renderProducts } from './table.js';
import { showingArchivedProducts, toggleArchivedProducts } from './archive.js';
import * as api from './api.js';

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
        category: document.querySelector('#product-category')?.value ?? 'vegetables',
        description: document.querySelector('#product-description')?.value.trim() ?? ''
    };
}

export async function addProduct() {
    let productData = getProductData();

    if (!productData.name) {
        alert('Please enter a product name.');
        return;
    }

    if (!productData.description) {
        alert('Please enter a product description.');
        return;
    }

    productData = {
        name: productData.name,
        category: productData.category,
        description: productData.description,
        inStock: true,
        isArchived: false
    };

    const data = await api.addProduct(productData);

    if (!data.success) return;

    products.push({
        id: data.id,
        ...productData
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