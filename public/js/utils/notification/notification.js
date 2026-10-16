import { notificationModal } from './notification-modal.js';

const notifContainer = document.querySelector('.notif-container');

export function createNotificationElement(notificationData) {
    const notifElement = document.createElement('div');
    notifElement.classList.add('notif-element');

    notifElement.innerHTML = notificationModal(notificationData);
    notifContainer.appendChild(notifElement);

    setTimeout(() => {
        notifElement.classList.add('hide');
        notifElement.remove();
    }, 3000);
}