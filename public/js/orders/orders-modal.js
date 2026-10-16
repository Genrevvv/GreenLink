export function orderRowModal(orderData) {
    let actions = '';

    if (orderData.status === 'pending') {
        actions = `
            <i class="fa-solid fa-square-check text-xl action-approve"
               title="Approve Order"></i>
            <i class="fa-solid fa-square-xmark text-xl action-reject"
               title="Reject Order"></i>
        `;
    }
    else if (orderData.status === 'approved') {
        actions = `
            <span class="action-complete">
                <i class="fa-regular fa-circle-check"></i>
                <span>Complete</span>
            </span>
        `;
    }

    return `
        <td>${orderData.id}</td>
        <td>${orderData.customer}</td>
        <td>${orderData.product}</td>
        <td>${orderData.quantity}</td>
        <td>${orderData.date}</td>
        <td>₱${Number(orderData.total).toLocaleString('en-PH')}</td>
        <td>
            <span class="status status-${orderData.status}">
                ${orderData.status}
            </span>
        </td>
        <td>${actions}</td>
    `;
}