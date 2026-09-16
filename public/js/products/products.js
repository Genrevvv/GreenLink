import { getStatus, showAddProductForm } from './products-function.js';
import { addProduct } from './products-function.js';

// Load products (pseudo loader for front end testing, temporary)
const productsData = [
    {
        name: 'lettuce',
        price: 45,
        unit: 'per kg',
        stock: 120
    },
    {
        name: 'kangkong',
        price: 35,
        unit: 'per bundle',
        stock: 7
    },
    {
        name: 'organic eggs',
        price: 120,
        unit: 'per dozen',
        stock: 0
    }
]; // Dummy data for loader testing

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