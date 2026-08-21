import { logout } from './sidebar-functions.js';

const options = document.querySelectorAll('.option');
const mainContent = document.querySelector('#main-content');

options.forEach(option => {
    option.addEventListener('click', async () => {
        options.forEach(option => {
            option.classList.remove('selected');
        });

        option.classList.add('selected');
        const page = option.dataset.page;
        const response = await fetch(`/pages/${page}.html`);

        if (!response.ok) {
            throw new Error(`Failed to load ${page}`);
        }

        mainContent.innerHTML = await response.text();
    });
});

const logoutBtn = document.querySelector('#logout');
logoutBtn.onclick = logout;