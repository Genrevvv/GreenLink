import { hideOverlay, showOverlay } from '../utils/overlay.js';

export function showAddProductForm() {
    showOverlay(`
        <div class="add-product-form flex-column gap-1">
            <i id="close-add-product" class="fa-solid fa-x close-overlay"></i>
            <h4>Add New Product</h4>
            <div>
                <span>Product Name</span>
                <input id="product-name" type="text" class="focus-input">
            </div>
            <div>
                <span>Price (₱)</span>
                <input id="product-price" type="number">
            </div>
            <div>
                <span>Unit</span>
                <input id="product-unit" type="text" placeholder="e.g. per kg, per dozen">
            </div>
            <div>
                <span>Stock Quantity</span>
                <input id="product-stock" type="number">
            </div>
            <div id="add-product-btn" type="submit">Add Product</div>
        </div>
    `);

    document.querySelector('.focus-input').focus();

    const addProductBtn = document.querySelector('#add-product-btn');
    addProductBtn.onclick = addProduct;
}

export function addProduct() {
    /* TODO: 
        - Input validation
        - Implement backend
    */
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

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${name}</td>
        <td>₱${price}</td>
        <td>${unit}</td>
        <td>${stock}</td>
        <td>
            <span class="${statusClass}">${status}</span>
        </td>
        <td>
            <i class="fa-solid fa-trash-can"></i>
            <i class="fa-solid fa-pen-to-square"></i>
        </td>
    `;

    document.querySelector('.products-table').appendChild(row);
    hideOverlay();
}