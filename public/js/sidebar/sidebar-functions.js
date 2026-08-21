import { apiFetch } from '../api/api.js';
import { getCurrentUser } from '../state/user.js';

const mainContent = document.querySelector('#main-content');
const headerText = document.querySelector('#header-text');
const user = getCurrentUser();

export async function loadPage(page) {
    // js for testing, remove the products page specific constraint later
    const pagePath = page === 'products' ? `/views/pages/${user.user_type}/${page}.html` : '/views/dummy.html';

    const response = await fetch(pagePath);

    if (!response.ok) {
        mainContent.innerHTML = `
            <div class="container p-2">
                Can't load content hehe :)
            </div>
        `;
        return;
    }

    mainContent.innerHTML = await response.text();
}

export function selectOption(selectedOption, options) {
    options.forEach(option => {
        option.classList.remove('selected');
    });

    selectedOption.classList.add('selected');
}

export function updateHeaderText(text) {
    headerText.innerHTML = text;
}

export async function logout() {
    try {
        await apiFetch('/logout', 'POST');
        window.location.href = "/login";
    } catch (error) {
        console.error("Logout failed:", error);
    }
}