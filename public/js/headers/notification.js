import { apiFetchJSON } from '../utils/api.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import { titleCase } from '../utils/string.js';
import { loadPage, updateHeaderText } from '../sidebar/sidebar-functions.js';

export function initNotificationDropdown() {
    const menu = document.querySelector('#notification-menu');
    const toggle = document.querySelector('#notification-toggle');
    const dropdown = document.querySelector('#notification-dropdown');
    const list = document.querySelector('#notification-list');
    const count = document.querySelector('#notification-count');

    if (!menu || !toggle || !dropdown || !list || !count) {
        return () => {};
    }

    let notifications = [];
    let unreadCount = 0;
    let reconnectTimer = null;
    let socket = null;

    const setUnreadCount = value => {
        unreadCount = Math.max(0, value);
        count.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
        count.classList.toggle('hidden', unreadCount === 0);
        toggle.setAttribute(
            'aria-label',
            unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
        );
    };

    const renderNotifications = () => {
        list.replaceChildren();

        if (notifications.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'notification-empty';
            empty.textContent = 'No notifications yet.';
            list.appendChild(empty);
            return;
        }

        for (const notification of notifications) {
            const item = document.createElement('li');
            const button = document.createElement('button');
            const message = document.createElement('span');
            const time = document.createElement('time');

            button.type = 'button';
            button.className = `notification-entry${notification.is_read ? '' : ' is-unread'}`;
            button.dataset.notificationId = String(notification.id);
            message.className = 'notification-entry-message';
            message.textContent = notification.message;
            time.className = 'notification-entry-time';
            time.dateTime = notification.created_at;

            const createdAt = new Date(notification.created_at);
            time.textContent = Number.isNaN(createdAt.getTime())
                ? notification.created_at
                : createdAt.toLocaleString();

            button.append(message, time);
            item.appendChild(button);
            list.appendChild(item);
        }
    };

    const addNotification = notification => {
        if (
            !notification ||
            !Number.isInteger(Number(notification.id)) ||
            !['appointment', 'inquiry'].includes(notification.target_type) ||
            !Number.isInteger(Number(notification.target_id)) ||
            Number(notification.target_id) <= 0
        ) {
            console.error('Received an invalid notification update.');
            return;
        }

        const existing = notifications.find(item => item.id === Number(notification.id));
        if (existing) {
            const wasUnread = !existing.is_read;
            Object.assign(existing, notification, { id: Number(notification.id) });
            const isUnread = !existing.is_read;

            if (wasUnread !== isUnread) {
                setUnreadCount(unreadCount + (isUnread ? 1 : -1));
            }
        } else {
            const normalized = {
                ...notification,
                id: Number(notification.id),
                target_id: Number(notification.target_id),
                is_read: Boolean(notification.is_read)
            };
            notifications.unshift(normalized);

            if (!normalized.is_read) {
                setUnreadCount(unreadCount + 1);
            }
        }

        notifications.sort((a, b) => b.id - a.id);
        notifications = notifications.slice(0, 50);
        renderNotifications();
    };

    const refreshNotifications = async () => {
        try {
            const data = await apiFetchJSON('/notifications', 'GET');
            if (!data.success) {
                throw new Error(data.message ?? 'Failed to retrieve notifications.');
            }
            if (!Array.isArray(data.notifications) || !Number.isInteger(data.unread_count)) {
                throw new Error('The notification response is invalid.');
            }

            const fetchedNotifications = data.notifications.map(notification => ({
                ...notification,
                id: Number(notification.id),
                target_id: Number(notification.target_id),
                is_read: Boolean(notification.is_read)
            }));

            const fetchedIds = new Set(fetchedNotifications.map(notification => notification.id));
            const liveOnly = notifications.filter(notification => !fetchedIds.has(notification.id));
            notifications = [...liveOnly, ...fetchedNotifications]
                .sort((a, b) => b.id - a.id)
                .slice(0, 50);
            setUnreadCount(
                data.unread_count
                + liveOnly.filter(notification => !notification.is_read).length
            );
            renderNotifications();
            return true;
        } catch (error) {
            console.error('Failed to load notifications:', error);
            createNotificationElement({
                status: 'failed',
                message: 'Failed to load notifications'
            });
            return false;
        }
    };

    const closeDropdown = () => {
        dropdown.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
    };

    const openSocket = () => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const connection = new WebSocket(`${protocol}//${window.location.hostname}:8080`);
        socket = connection;

        connection.addEventListener('open', async () => {
            if (await refreshNotifications() && connection.readyState === WebSocket.OPEN) {
                connection.send(JSON.stringify({
                    type: 'subscribe',
                    after_id: notifications[0]?.id ?? 0
                }));
            }
        });
        connection.addEventListener('message', event => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'notification') {
                    addNotification(data.notification);
                }
            } catch (error) {
                console.error('Failed to process a notification update:', error);
            }
        });
        connection.addEventListener('close', () => {
            if (!reconnectTimer) {
                reconnectTimer = window.setTimeout(() => {
                    reconnectTimer = null;
                    openSocket();
                }, 3000);
            }
        });
        connection.addEventListener('error', () => {
            connection.close();
        });
    };

    toggle.addEventListener('click', () => {
        const isOpen = !dropdown.classList.contains('hidden');
        dropdown.classList.toggle('hidden', isOpen);
        toggle.setAttribute('aria-expanded', String(!isOpen));
    });

    list.addEventListener('click', async event => {
        const button = event.target.closest('[data-notification-id]');
        if (!button) return;

        const notification = notifications.find(
            item => item.id === Number(button.dataset.notificationId)
        );
        if (!notification) return;

        if (!notification.is_read) {
            notification.is_read = true;
            setUnreadCount(unreadCount - 1);
            renderNotifications();

            try {
                const data = await apiFetchJSON('/notifications/read', 'POST', {
                    id: notification.id
                });
                if (!data.success) {
                    throw new Error(data.message ?? 'Failed to mark notification as read.');
                }
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
                createNotificationElement({
                    status: 'failed',
                    message: 'Could not update notification status'
                });
            }
        }

        closeDropdown();

        const page = notification.target_type === 'appointment' ? 'appointments' : 'inquiries';
        document.querySelectorAll('.sidebar-options .option').forEach(option => {
            option.classList.toggle('selected', option.dataset.page === page);
        });
        updateHeaderText(titleCase(page));
        await loadPage(page, notification.target_id);
    });

    document.addEventListener('click', event => {
        if (!menu.contains(event.target)) {
            closeDropdown();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeDropdown();
        }
    });

    renderNotifications();
    refreshNotifications();
    openSocket();

    return () => {
        if (reconnectTimer) {
            window.clearTimeout(reconnectTimer);
        }
        if (socket) {
            socket.close();
        }
    };
}
