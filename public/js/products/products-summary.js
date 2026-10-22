import { productsData } from './products-data.js';

const totalProducts = document.querySelector('#total-products');
const inStock = document.querySelector('#in-stock');
const outOfStock = document.querySelector('#out-of-stock');

// Refresh all summary cards
export function updateProductSummary() {
    setTotalProducts(getTotalProducts());
    setInStock(getInStock());
    setOutofStock(getOutofStock());
}

// Update product summary cards
export function setTotalProducts(n) {
    if (totalProducts) totalProducts.textContent = n;
}

export function setInStock(n) {
    if (inStock) inStock.textContent = n;
}

export function setOutofStock(n) {
    if (outOfStock) outOfStock.textContent = n;
}

// Get product counts (exclude archived products)
export function getTotalProducts() {
    return productsData.filter(product => !product.isArchived).length;
}

export function getInStock() {
    return productsData.filter(product => !product.isArchived && product.inStock).length;
}

export function getOutofStock() {
    return productsData.filter(product => !product.isArchived && !product.inStock).length;
}

