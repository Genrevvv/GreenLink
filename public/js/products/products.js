
import { createProductCard } from './card.js';
import { productsData } from './data.js';
import * as prodSum from './summary.js';
import { getCurrentUser } from '../utils/user.js';
import { initProductCardFilters, initProductFilters } from './filter.js';
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
    initProductCardFilters();

    const productCards = document.querySelector('#product-cards');
    productCards.innerHTML = '';

    productsData
        .filter(product => !product.isArchived)
        .forEach(productData => {
            createProductCard(productData);
        });
}
