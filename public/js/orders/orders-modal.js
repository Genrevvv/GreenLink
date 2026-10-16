
export function orderRowModal(orderData, showActions = true) {
    let actions = '';

    if (showActions) {
        if (orderData.status === 'pending') {
            actions = `
                <td>
                    <i class="fa-solid fa-square-check text-xl action-approve"
                       title="Approve Order"></i>
                    <i class="fa-solid fa-square-xmark text-xl action-reject"
                       title="Reject Order"></i>
                </td>
            `;
        } else if (orderData.status === 'approved') {
            actions = `
                <td>
                    <span class="action-complete">Complete</span>
                </td>
            `;
        } else {
            actions = '<td></td>';
        }
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
        ${actions}
    `;
}
