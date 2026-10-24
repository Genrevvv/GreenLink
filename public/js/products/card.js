import { productCardModal } from "./modal.js";

export function createProductCard(productData) {
    const productCards = document.querySelector('#product-cards');

    if (!productCards) return;

    const productCard = document.createElement('div');

    productCard.classList.add(
        'container',
        'container-xs',
        'px-0',
        'product-card'
    );
    productCard.dataset.name = productData.name.toLowerCase();
    productCard.dataset.description = (productData.description || '').toLowerCase();
    productCard.dataset.category = (productData.category || '').toLowerCase();
    productCard.dataset.availability = productData.inStock
    
    ? 'available'
    : 'unavailable';
    productCard.innerHTML = productCardModal(productData);
    productCards.appendChild(productCard);
}

