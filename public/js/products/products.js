import { showAddProductForm } from './products-function.js';

const addProduct = document.querySelector('#add-product');
addProduct.onclick = () => {
    showAddProductForm();
}