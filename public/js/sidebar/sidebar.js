import { loadPage, getPageFromLocation, prefetchAllPageHtml, prefetchPage } from './sidebar-functions.js';
import { initAccountDropdown } from '../headers/header.js';
import { initNotificationDropdown } from '../headers/notification.js';

const initialPage = getPageFromLocation() ?? 'dashboard';
const initialTargetId = new URLSearchParams(window.location.search).get('targetId');

loadPage(initialPage, initialTargetId, { replaceHistory: true }).then(prefetchAllPageHtml);

window.addEventListener('popstate', () => {
    const page = getPageFromLocation() ?? 'dashboard';
    const targetId = new URLSearchParams(window.location.search).get('targetId');
    loadPage(page, targetId, { updateHistory: false });
});

initAccountDropdown();
initNotificationDropdown();

const options = document.querySelectorAll('.option');
options.forEach(option => {
    // Start loading the page as soon as the pointer is over it
    option.addEventListener('pointerenter', () => prefetchPage(option.dataset.page), { once: true });

    option.addEventListener('click', async event => {
        if (
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return;
        }

        event.preventDefault();

        if (option.dataset.page === getPageFromLocation() && !window.location.search) {
            return;
        }

        await loadPage(option.dataset.page);
    });
});