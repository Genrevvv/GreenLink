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
    const isArchived = Boolean(productData.isArchived);
    const isInStock = Boolean(productData.inStock);

    const availabilityBadge = `
        <button
            type="button"
            class="stock-status ${isInStock ? 'status-in-stock' : 'status-out-of-stock'}"
            title="Click to change availability"
            aria-label="Change availability from ${isInStock ? 'In Stock' : 'Out of Stock'}"
        >
            ${isInStock ? 'In Stock' : 'Out of Stock'}
        </button>
    `;

    const actionButtons = isArchived
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
        <td>${availabilityBadge}</td>
        <td class="${isArchived ? 'archived-actions' : 'product-actions'}">
            ${actionButtons}
        </td>
    `;
}

export function productCardModal(productData) {
    const isInStock = productData.inStock;

    return `
        <div class="container flex-center product-image">
            <i class="fa-solid fa-leaf"></i>
        </div>

        <div class="container mt-3 product-content">
            <h4 class="text-sm">${productData.name}</h4>

            <p class="text-xs product-description">
                ${productData.description || 'No description available.'}
            </p>

            <div class="product-availability ${isInStock ? 'available' : 'unavailable'}">
                <i class="fa-solid ${isInStock ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>

                <div>
                    <span class="availability-label">Availability</span>
                    <strong>${isInStock ? 'Available' : 'Unavailable'}</strong>
                </div>
            </div>
        </div>
    `;
}