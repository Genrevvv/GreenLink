import { hideOverlay, showOverlay } from '../utils/overlay.js';
import {
    archiveProduct,
    restoreProduct,
    showingArchivedProducts
} from './archive.js';
import { productsData } from './data.js';
import { filterProducts } from './filter.js';
import { getProductData } from './form.js';
import { addEditProductModal, productRowModal } from './modal.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import { updateProductSummary } from './summary.js';

export function renderProducts() {
    const productTable = document.querySelector('.products-table');

    if (!productTable) return;

    productTable.innerHTML = `
        <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th>Availability</th>
            <th>Actions</th>
        </tr>
    `;

    const visibleProducts = productsData.filter(product =>
        Boolean(product.isArchived) === showingArchivedProducts
    );

    visibleProducts.forEach(productData => {
        const row = document.createElement('tr');
        const status = productData.inStock ? 'In Stock' : 'Out of Stock';

        row.innerHTML = productRowModal({
            ...productData,
            status
        });

        row.dataset.category = String(productData.category ?? '').toLowerCase();
        row.dataset.status = status.toLowerCase();

        productTable.appendChild(row);
        setupProductRowActions(row, productData);
    });

    filterProducts();
}

export function setupProductRowActions(productRow, productData) {
    const editProductAct = productRow.querySelector('.edit-product');
    const archiveProductAct = productRow.querySelector('.archive-product');
    const restoreProductAct = productRow.querySelector('.restore-product');
    const stockStatusBtn = productRow.querySelector('.stock-status');

    if (editProductAct) {
        editProductAct.onclick = () => {
            editProduct(productData);
        };
    }

    if (archiveProductAct) {
        archiveProductAct.onclick = () => {
            archiveProduct(productData.id);
        };
    }

    if (restoreProductAct) {
        restoreProductAct.onclick = () => {
            restoreProduct(productData.id);
        };
    }

    if (stockStatusBtn) {
        stockStatusBtn.onclick = () => {
            toggleProductAvailability(productData.id);
        };
    }
}

export function toggleProductAvailability(id) {
    const product = productsData.find(
        product => product.id === id
    );

    if (!product) return;

    product.inStock = !product.inStock;

    renderProducts();
    updateProductSummary();

    createNotificationElement({
        status: 'success',
        message: `${product.name} marked as ${product.inStock ? 'In Stock' : 'Out of Stock'}`
    });
}

export function editProduct(productData) {
    showOverlay(addEditProductModal(productData));

    document.querySelector('.focus-input')?.focus();

    const updateProductBtn = document.querySelector('#update-product-btn');

    if (updateProductBtn) {
        updateProductBtn.onclick = () => {
            updateProduct(productData.id);
        };
    }
}

export function updateProduct(id) {
    const product = productsData.find(
        product => product.id === id
    );

    if (!product) return;

    const updatedData = getProductData();

    if (!updatedData.name) {
        alert('Please enter a product name.');
        return;
    }

    product.name = updatedData.name;
    product.category = updatedData.category;

    hideOverlay();
    renderProducts();
    updateProductSummary();

    createNotificationElement({
        status: 'success',
        message: 'Product Updated Successfully'
    });
}