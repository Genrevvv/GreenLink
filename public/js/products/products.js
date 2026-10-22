import { createProductCard, getStatus, showAddProductForm } from './products-function.js';
import { addProduct } from './products-function.js';
import { productsData } from './products-data.js';
import * as prodSum from './products-summary.js';
import { getCurrentUser } from '../utils/user.js';

export function initProducts() {
    const user = getCurrentUser();

    if (user.user_type === 'admin') {
        adminProductScript()
    }
    else if (user.user_type === 'user') {
        userProductScript();
    }

    console.log('products.js has been imported');    
}

function adminProductScript() {
    // Setup product summary
    prodSum.updateProductSummary();

    // Load products (pseudo loader for front end testing, temporary)
    for (let productData of productsData) {
        const { status, statusClass } = getStatus(productData.stock);
        productData = { ...productData, status, statusClass };
        addProduct(productData);
    }

    // Add a product
    const addProductBtn = document.querySelector('#add-product');
    addProductBtn.onclick = () => {
        showAddProductForm();
    }
}

function userProductScript() {
    // Load product cards (currently only for front end testing)
    for (const productData of productsData) {
        createProductCard(productData);
    }
}
