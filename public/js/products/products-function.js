import { hideOverlay, showOverlay } from '../utils/overlay.js';
import { addEditProductModal, setProductrow } from './products-modal.js';

export function showAddProductForm() {
    showOverlay(addEditProductModal());

    document.querySelector('.focus-input').focus();

    const addProductBtn = document.querySelector('#add-product-btn');
    addProductBtn.onclick = addProduct;
}

export function addProduct(productDataInput = null) {
    /* TODO: 
        - Implement backend
    */
    const productData = productDataInput !== null ? productDataInput : getProductData();

    const row = document.createElement('tr');
    row.innerHTML = setProductrow(productData);

    document.querySelector('.products-table').appendChild(row);
    hideOverlay();

    // Product row actions
    const deleteProductAct = row.querySelector('.delete-product');
    deleteProductAct.onclick = () => { deleteProduct(row) };

    const editProductAct = row.querySelector('.edit-product');
    editProductAct.onclick = () => { editProduct(row, productData) };
}

function deleteProduct(productRow) {
    /* TODO:
        - Add action notification (pag di tinamad)
        - suggestion: small lower right notification pop up 
          that have a stack animation, so action notif can stack
    */
    productRow.remove();
}

function editProduct(productRow, productData) {
    showOverlay(addEditProductModal(productData));
    
    const updateProductBtn = document.querySelector('#update-product-btn');
    updateProductBtn.onclick = () => { updateProduct(productRow) };
}

function updateProduct(productRow) {
    /* TODO: 
        - Implement backend
    */
    const productData = getProductData();
    productRow.innerHTML = setProductrow(productData);

    hideOverlay();
}

function getProductData() {
    /* TODO: 
        - Implement backend
    */
    const name = document.querySelector('#product-name').value;
    const price = document.querySelector('#product-price').value;
    const unit = document.querySelector('#product-unit').value;
    const stock = Number(document.querySelector('#product-stock').value);

    const { status, statusClass } = getStatus(stock);

    return { name, price, unit, stock, status, statusClass };
}

export function getStatus(stock) {
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

    return { status, statusClass };
}