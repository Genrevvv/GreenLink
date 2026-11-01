const totalProducts = document.querySelector('#total-products');
const inStock = document.querySelector('#in-stock');
const outOfStock = document.querySelector('#out-of-stock');

// REFRESH SUMMARY
export function updateProductSummary(products) {
    setTotalProducts(getTotalProducts(products));
    setInStock(getInStock(products));
    setOutofStock(getOutofStock(products));
}

// UPDATE SUMMARY CARDS
export function setTotalProducts(n) {
    if (totalProducts) totalProducts.textContent = n;
}

export function setInStock(n) {
    if (inStock) inStock.textContent = n;
}

export function setOutofStock(n) {
    if (outOfStock) outOfStock.textContent = n;
}

// GET PRODUCT COUNTS
export function getTotalProducts(products) {
    return products.filter(product => !product.isArchived).length;
}

export function getInStock(products) {
    return products.filter(product => !product.isArchived && product.inStock).length;
}

export function getOutofStock(products) {
    return products.filter(product => !product.isArchived && !product.inStock).length;
}