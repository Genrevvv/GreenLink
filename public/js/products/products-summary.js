const totalProducts = document.querySelector('#total-products');
const inStock = document.querySelector('#in-stock');
const limitedStock = document.querySelector('#limited-stock');
const totalValue = document.querySelector('#total-value');

/* TODO:
    - Make product summary update everytime there are changes on the table
*/

export function setTotalProducts(n) {
    totalProducts.innerHTML = n;
}

export function setInStock(n) {
    inStock.innerHTML = n;
}

export function setLimitedStock(n) {
    limitedStock.innerHTML = n;
}

export function setTotalValue(n) {
    totalValue.innerHTML = `₱${n}`;
}

export function getTotalProducts(productsData) {
    return productsData.length;
}

export function getInStock(productsData) {
    return productsData.filter(product => product.stock > 10).length;
}

export function getLimitedStock(productsData) {
    return productsData.filter(product => product.stock < 10 && product.stock !== 0).length;
}

export function getTotalValue(productsData) {
    return productsData.reduce((sum, product) => {
        return sum + (product.price * product.stock);
    },0);
}