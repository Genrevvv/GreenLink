
import { createProductCard } from './products-function-legacy.js';
import { productsData } from './data.js';
import * as prodSum from './summary.js';
import { getCurrentUser } from '../utils/user.js';
import { initProductFilters } from './filter.js';
import { renderProducts } from './table.js';
import { showAddProductForm } from './form.js';
import { toggleArchivedProducts } from './archive.js';

export function initProducts() {
    const user = getCurrentUser();

    if (user.user_type === 'admin') {
        adminProductScript();
    } else if (user.user_type === 'user') {
        userProductScript();
    }

    console.log('products.js has been imported');
}

function adminProductScript() {
    prodSum.updateProductSummary();
    initProductFilters();
    renderProducts();

    const addProductBtn = document.querySelector('#add-product');

    if (addProductBtn) {
        addProductBtn.onclick = () => {
            showAddProductForm();
        };
    }

    const viewArchivedBtn = document.querySelector('#view-archieved');

    if (viewArchivedBtn) {
        viewArchivedBtn.onclick = () => {
            toggleArchivedProducts();
        };
    }
}

function userProductScript() {
    const productCards = document.querySelector('#product-cards');

    if (!productCards) return;

    productCards.innerHTML = '';

    productsData
        .filter(product => !product.isArchived && product.inStock)
        .forEach(productData => {
            createProductCard(productData);
        });
}
