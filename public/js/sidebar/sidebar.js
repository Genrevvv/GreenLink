import { titleCase } from '../utils/string.js';
import { loadPage, selectOption, updateHeaderText } from './sidebar-functions.js';
import { initAccountDropdown } from '../headers/header.js';
import { initNotificationDropdown } from '../headers/notification.js';

loadPage('dashboard'); // load initial content
initAccountDropdown();
initNotificationDropdown();

const options = document.querySelectorAll('.option');
options.forEach(option => {
    option.addEventListener('click', async () => {
        if (option.classList.contains('selected')) {
            return;
        }

        selectOption(option, options);
        updateHeaderText(titleCase(option.dataset.page));
        await loadPage(option.dataset.page);
    });
});