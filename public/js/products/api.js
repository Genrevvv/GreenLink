import { apiFetchJSON } from '../utils/api.js';

export async function fetchProducts() {
    const data = await apiFetchJSON('/products', 'GET');
    return data.products;
}

export async function updateStockStatus(productId, inStock) {
    const body = { 
        'id': productId,
        'inStock': inStock
     }

    const data = await apiFetchJSON('/products/updateStock', 'POST', body);
    console.log(data.success)
    return data.success;
}