import { apiFetchJSON } from '../utils/api.js';

export async function fetchProducts() {
    const data = await apiFetchJSON('/products', 'GET');
    return data.products;
}

export async function addProduct(productData) {
    const data = await apiFetchJSON('/products/addProduct', 'POST', productData);
    return data
}

export async function updateProduct(updatedData) {
    const data = await apiFetchJSON('/products/updateProduct', 'POST', updatedData);
    return data
}

export async function updateStockStatus(id, inStock) {
    const body = { 
        'id': id, inStock,
        'inStock': inStock
     }

    const data = await apiFetchJSON('/products/updateStockStatus', 'POST', body);
    console.log('stock status updated: ' + data.success)
    return data.success;
}

export async function updateArchiveStatus(id, isArchived) {
    const body = { 
        'id': id,
        'isArchived': isArchived
     }

    const data = await apiFetchJSON('/products/updateArchiveStatus', 'POST', body);
    console.log('archive status updated: ' + data.success);
    return data.success;
}