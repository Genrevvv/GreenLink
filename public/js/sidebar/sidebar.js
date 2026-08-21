import { titleCase } from '../utils/string.js';
import { loadPage, selectOption,  logout, updateHeaderText } from './sidebar-functions.js';

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

const logoutBtn = document.querySelector('#logout');
logoutBtn.onclick = logout;