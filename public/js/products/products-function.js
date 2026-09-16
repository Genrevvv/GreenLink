import { hideOverlay, showOverlay } from '../utils/overlay.js';
import { addEditProductModal, setProductrow } from './products-modal.js';

export function showAddProductForm() {
    showOverlay(addEditProductModal());

    document.querySelector('.focus-input').focus();

    const addProductBtn = document.querySelector('#add-product-btn');
    addProductBtn.onclick = addProduct;
}

function addProduct() {
    /* TODO: 
        - Input validation
        - Implement backend
    */
    const productData = getProductData();

    const row = document.createElement('tr');
    row.innerHTML = setProductrow(productData);

    document.querySelector('.products-table').appendChild(row);
    hideOverlay();

    const editProductAct = row.querySelector('.edit-product');
    editProductAct.onclick = () => { editProduct(row, productData) };
}

function editProduct(productRow, productData) {
    showOverlay(addEditProductModal(productData));
    
    const updateProductBtn = document.querySelector('#update-product-btn');
    updateProductBtn.onclick = () => { updateProduct(productRow) };
}

function updateProduct(productRow) {
    const productData = getProductData();
    productRow.innerHTML = setProductrow(productData);

    hideOverlay();
}

function getProductData() {
    const name = document.querySelector('#product-name').value;
    const price = document.querySelector('#product-price').value;
    const unit = document.querySelector('#product-unit').value;
    const stock = Number(document.querySelector('#product-stock').value);

    let status, statusClass;
    if (stock === 0) {
        status = 'Out of Stock';
        statusClass = 'out-of-stock';
    } else if (stock < 10) {
        status = 'Limited Stock';
        statusClass = 'limited-stock';
    } else {
        status = 'In Stock';
        statusClass = 'in-stock';
    }

    return { name, price, unit, stock, status, statusClass };
}