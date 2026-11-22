import { titleCase } from '../utils/string.js';
import { loadPage, prefetchAllPageHtml, prefetchPage, selectOption, updateHeaderText } from './sidebar-functions.js';
import { initAccountDropdown } from '../headers/header.js';

loadPage('dashboard').then(prefetchAllPageHtml); // load initial content, then warm up the other pages
initAccountDropdown();

const options = document.querySelectorAll('.option');
options.forEach(option => {
    // Start loading the page as soon as the pointer is over it
    option.addEventListener('pointerenter', () => prefetchPage(option.dataset.page), { once: true });

    option.addEventListener('click', async () => {
        if (option.classList.contains('selected')) {
            return;
        }

        selectOption(option, options);
        updateHeaderText(titleCase(option.dataset.page));
        await loadPage(option.dataset.page);
    });
});