import { notificationModal } from './notification-modal.js';

export function createNotificationElement(notificationData) {
    const notifContainer = document.querySelector('.notif-container');

    if (!notifContainer) return;

    const notifElement = document.createElement('div');
    notifElement.classList.add('notif-element');
    notifElement.setAttribute('role', notificationData.status === 'failed' ? 'alert' : 'status');

    notifElement.innerHTML = notificationModal(notificationData);
    notifContainer.appendChild(notifElement);

    // Fade out, then remove once the transition has finished.
    setTimeout(() => {
        notifElement.classList.add('hide');
        setTimeout(() => notifElement.remove(), 300);
    }, 3000);
}
