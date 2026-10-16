export function notificationModal(notificationData) {
    const icons = {
        success: '<i class="fa-solid fa-circle-check notif-success"></i>',
        failed: '<i class="fa-solid fa-circle-xmark notif-failed"></i>'
    };

    return `
        ${icons[notificationData.status] ?? ''}
        <span class="notif-message">${notificationData.message}</span>
    `;
}