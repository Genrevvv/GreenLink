// Look elements up on each call: this module can load before the page HTML exists
// (prefetch on hover), and the page is re-rendered on every visit.
function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
}

// REFRESH SUMMARY
export function updateProductSummary(products) {
    setTotalProducts(getTotalProducts(products));
    setInStock(getInStock(products));
    setOutofStock(getOutofStock(products));
}

// UPDATE SUMMARY CARDS
export function setTotalProducts(n) {
    setText('#total-products', n);
}

export function setInStock(n) {
    setText('#in-stock', n);
}

export function setOutofStock(n) {
    setText('#out-of-stock', n);
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