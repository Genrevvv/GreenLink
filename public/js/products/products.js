import { createProductCard, getStatus, showAddProductForm } from './products-function.js';
import { addProduct } from './products-function.js';
import { productsData } from './products-data.js';
import * as prodSum from './products-summary.js';
import { getCurrentUser } from '../utils/user.js';

const user = getCurrentUser();

if (user.user_type === 'admin') {
    adminProductScript()
}
else if (user.user_type === 'user') {
    userProductScript();
}

function adminProductScript() {
    // Setup product summary
    prodSum.setTotalProducts(prodSum.getTotalProducts(productsData));
    prodSum.setInStock(prodSum.getInStock(productsData));
    prodSum.setLimitedStock(prodSum.getLimitedStock(productsData));
    prodSum.setTotalValue(prodSum.getTotalValue(productsData));

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
    for (const productData of productsData) {
        createProductCard(productData);
    }
}
