import { createNotificationElement } from '../utils/notification/notification.js';
import { hideOverlay, showOverlay } from '../utils/overlay.js';
import { addEditProductModal, productCardModal, productRowModal } from './products-modal.js';

export function showAddProductForm() {
    showOverlay(addEditProductModal());
    document.querySelector('.focus-input').focus();

    const addProductBtn = document.querySelector('#add-product-btn');
    addProductBtn.onclick = () => { addProduct() };
}

// PRODUCT MANAGEMENT: Product Row
export function addProduct(productDataInput = null) {
    /* TODO: 
        - Implement backend
    */
    const productData = productDataInput !== null ? productDataInput : getProductData();

    const row = document.createElement('tr');
    row.innerHTML = productRowModal(productData);

    document.querySelector('.products-table').appendChild(row);
    hideOverlay();

    setupProductRowActions(row, productData);
}

function setupProductRowActions(productRow, productData) {
    const deleteProductAct = productRow.querySelector('.delete-product');
    deleteProductAct.onclick = () => { deleteProduct(productRow) };

    const editProductAct = productRow.querySelector('.edit-product');
    editProductAct.onclick = () => { editProduct(productRow, productData) };
}

function deleteProduct(productRow) {
    /* TODO:
        - Add action notification (pag di tinamad)
        - suggestion: small lower right notification pop up 
          that have a stack animation, so action notif can stack
    */
    const confirmed = confirm("Are you sure you want to delete this item?");
    if (!confirmed) {
        return
    }

    productRow.remove();

    // Testing message only
    createNotificationElement({
        status: 'success', 
        message: `Product Deleted Successfully`
    });
}

function editProduct(productRow, productData) {
    showOverlay(addEditProductModal(productData));
    document.querySelector('.focus-input').focus();

    const updateProductBtn = document.querySelector('#update-product-btn');
    updateProductBtn.onclick = () => { updateProduct(productRow) };
}

function updateProduct(productRow) {
    /* TODO: 
        - Implement backend
    */
    const productData = getProductData();
    productRow.innerHTML = productRowModal(productData);
    hideOverlay();

    setupProductRowActions(productRow, productData);

    // Testing message only
    createNotificationElement({
        status: 'success', 
        message: `Product Updated Successfully`
    });
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

// PRODUCTS DISPLAY: Product Card
export function createProductCard(productData) {
    const productCards = document.querySelector('#product-cards');
    const productCard = document.createElement('div');
    
    // <div class="container container-xs px-0 product-card">...</div>
    productCard.classList.add('container', 'container-xs', 'px-0', 'product-card');
    productCard.innerHTML = productCardModal(productData);

    productCards.appendChild(productCard);
    setupProductCardActions(productCard, productData);
}

function setupProductCardActions(productCard, productData) {
    // Quantity functions
    const qtyAdd = productCard.querySelector('.qty-add');
    const qtySub = productCard.querySelector('.qty-sub');
    const qtyCount = productCard.querySelector('.qty-count');

    qtyAdd.onclick = () => { qtyCount.value = Math.min(999, Number(qtyCount.value) + 1) };
    qtySub.onclick = () => { qtyCount.value = Math.max(1, Number(qtyCount.value) - 1) };

    // Order Functions
    const orderBtn = productCard.querySelector('.order-btn');
    orderBtn.onclick = () => { 
        // Testing message only
        createNotificationElement({
            status: 'success', 
            message: `Added ${qtyCount.value} ${productData.name} to cart`
        });
    }
}