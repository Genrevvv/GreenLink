import { createProductCard } from './card.js';
import { fetchProducts } from './api.js';
import * as prodSum from './summary.js';
import { getCurrentUser } from '../utils/user.js';
import { initProductCardFilters, initProductFilters } from './filter.js';
import { loadProducts, renderProducts } from './table.js';
import { showAddProductForm } from './form.js';
import { toggleArchivedProducts } from './archive.js';

export async function initProducts() {
    const user = getCurrentUser();

    try {
        const products = await fetchProducts();
        console.log(products);
        
        if (user.user_type === 'admin') {
            adminProductScript(products);
        } else if (user.user_type === 'user') {
            userProductScript(products);
        }

    } catch (error) {
        console.error('Failed to initialize products:', error);
    }

    console.log('products.js has been imported');
}

function adminProductScript(products) {
    prodSum.updateProductSummary(products);
    initProductFilters();
    loadProducts(products);

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
            renderProducts(products);
        };
    }
}

function userProductScript(products) {
    initProductCardFilters();

    const productCards = document.querySelector('#product-cards');

    if (!productCards) return;

    productCards.innerHTML = '';

    products
        .filter(product => !product.isArchived)
        .forEach(productData => {
            createProductCard(productData);
        });
}