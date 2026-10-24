// GET STOCK STATUS 
// Di na need kasi ala na stock, keep muna if ever need ibalik ung stock count
// export function getStatus(stock) {
//     let status;
//     let statusClass;

//     if (stock === 0) {
//         status = 'Out of Stock';
//         statusClass = 'out-of-stock';
//     } else if (stock < 10) {
//         status = 'Limited Stock';
//         statusClass = 'limited-stock';
//     } else {
//         status = 'In Stock';
//         statusClass = 'in-stock';
//     }

//     return { status, statusClass };
// }

// USER PRODUCT CARDS
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

    productCard.innerHTML = productCardModal(productData);
    productCards.appendChild(productCard);

    setupProductCardActions(productCard, productData);
}

function setupProductCardActions(productCard, productData) {
    const qtyAdd = productCard.querySelector('.qty-add');
    const qtySub = productCard.querySelector('.qty-sub');
    const qtyCount = productCard.querySelector('.qty-count');

    if (qtyAdd && qtyCount) {
        qtyAdd.onclick = () => {
            qtyCount.value = Math.min(999, Number(qtyCount.value) + 1);
        };
    }

    if (qtySub && qtyCount) {
        qtySub.onclick = () => {
            qtyCount.value = Math.max(1, Number(qtyCount.value) - 1);
        };
    }

    const orderBtn = productCard.querySelector('.order-btn');

    if (orderBtn && qtyCount) {
        orderBtn.onclick = () => {
            createNotificationElement({
                status: 'success',
                message: `Added ${qtyCount.value} ${productData.name} to cart`
            });
        };
    }
}

