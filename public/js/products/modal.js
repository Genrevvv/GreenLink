import { titleCase } from '../utils/string.js';

export function addEditProductModal(productData = null) {
    const isEdit = productData !== null;
    const buttonId = isEdit ? 'update-product-btn' : 'add-product-btn';
    const buttonText = isEdit ? 'Update Product' : 'Add Product';

    const name = productData?.name ?? '';
    const category = (productData?.category ?? '').toLowerCase();

    return `
        <div class="add-edit-product-form flex-column gap-1">
            <i id="close-add-product" class="fa-solid fa-x close-overlay"></i>
            <h4>${isEdit ? 'Edit Product' : 'Add New Product'}</h4>

            <div>
                <span>Product Name</span>
                <input
                    id="product-name"
                    type="text"
                    class="focus-input"
                    value="${name}"
                >
            </div>

            <div>
                <span>Category</span>
                <select class="product-filter" id="product-category">
                    <option value="vegetables" ${category === 'vegetables' ? 'selected' : ''}>Vegetables</option>
                    <option value="fruits" ${category === 'fruits' ? 'selected' : ''}>Fruits</option>
                    <option value="poultry" ${category === 'poultry' ? 'selected' : ''}>Poultry</option>
                </select>
            </div>

            <div id="${buttonId}" class="add-edit-btn">${buttonText}</div>
        </div>
    `;
}

export function productRowModal(productData) {
    const actionButtons = productData.isArchived
        ? `
            <i
                class="fa-solid fa-pen-to-square edit-product"
                title="Edit Product"
                role="button"
                aria-label="Edit Product"
                tabindex="0"
            ></i>

            <i
                class="fa-solid fa-rotate-left restore-product"
                title="Restore Product"
                role="button"
                aria-label="Restore Product"
                tabindex="0"
            ></i>
        `
        : `
            <i
                class="fa-solid fa-pen-to-square edit-product"
                title="Edit Product"
                role="button"
                aria-label="Edit Product"
                tabindex="0"
            ></i>

            <i
                class="fa-solid fa-box-archive archive-product"
                title="Archive Product"
                role="button"
                aria-label="Archive Product"
                tabindex="0"
            ></i>
        `;

    return `
        <td>${productData.name}</td>
        <td>${titleCase(productData.category)}</td>
        <td>${productData.status}</td>
        <td class="${productData.isArchived ? 'archived-actions' : 'product-actions'}">
            ${actionButtons}
        </td>
    `;
}

export function productCardModal(productData) {
    return `
        <div class="container flex-center product-image">
            <i class="fa-solid fa-leaf"></i>
        </div>
        <div class="container mt-3 product-content">
            <h4 class="text-sm">${productData.name}</h4>
            <span class="text-xs">currently no description data</span>
            <div class="container flex gap-1 px-0 mt-1">
                <h3 class="text-base">₱${productData.price}</h3>
                <span class="text-sm px-1 mt-1">${productData.unit}</span>
            </div>
            <div class="container mt-1 product-option">
                <div>
                    <button class="rounded-sm qty-btn qty-sub">-</button>
                    <input class="text-xs qty-count" type="number" min="1" max="999" value="1">
                    <button class="rounded-sm qty-btn qty-add">+</button>
                </div>
                <div class="order-btn">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <span class="text-xs">Order Now</span>
                </div>
            </div>
        </div>
    `;
}