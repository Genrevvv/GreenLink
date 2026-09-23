export function addEditProductModal(productData = null) {
    const isEdit = productData !== null;
    const buttonId = isEdit ? 'update-product-btn' : 'add-product-btn';
    const buttonText = isEdit ? 'Update Product' : 'Add Product';

    const name = productData?.name ?? '';
    const price = productData?.price ?? '';
    const unit = productData?.unit ?? '';
    const stock = productData?.stock ?? '';

    return `
        <div class="add-edit-product-form flex-column gap-1">
            <i id="close-add-product" class="fa-solid fa-x close-overlay"></i>
            <h4>${isEdit ? 'Edit Product' : 'Add New Product'}</h4>
            <div>
                <span>Product Name</span>
                <input id="product-name" type="text" class="focus-input" value="${name}">
            </div>
            <div>
                <span>Price (₱)</span>
                <input id="product-price" type="number" value="${price}">
            </div>
            <div>
                <span>Unit</span>
                <input id="product-unit" type="text" placeholder="e.g. per kg, per dozen" value="${unit}">
            </div>
            <div>
                <span>Stock Quantity</span>
                <input id="product-stock" type="number" value="${stock}">
            </div>
            <div id="${buttonId}" class="add-edit-btn">${buttonText}</div>
        </div>
    `;
}

export function productRowModal(productData) {
    return `
        <td>${productData.name}</td>
        <td>₱${productData.price}</td>
        <td>${productData.unit}</td>
        <td>${productData.stock}</td>
        <td>
            <span class="${productData.statusClass}">${productData.status}</span>
        </td>
        <td>
            <i class="fa-solid fa-pen-to-square edit-product"></i>
            <i class="fa-solid fa-trash-can delete-product"></i>
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
                    <button>-</button>
                    <input type="number" value="1">
                    <button>+</button>
                </div>
                <div class="order-btn">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <span class="text-xs">Order Now</span>
                </div>                    
            </div>
    `;
}