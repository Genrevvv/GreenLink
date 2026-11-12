import { loadPage, logout, updateHeaderText } from '../sidebar/sidebar-functions.js';

export function initAccountDropdown() {
    const menu = document.querySelector('#account-menu');
    const toggle = document.querySelector('#account-menu-toggle');
    const dropdown = document.querySelector('#account-menu-dropdown');

    if (!menu || !toggle || !dropdown) {
        return () => {};
    }

    const closeDropdown = () => {
        dropdown.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
    };

    const handleToggle = () => {
        const isOpen = !dropdown.classList.contains('hidden');
        dropdown.classList.toggle('hidden', isOpen);
        toggle.setAttribute('aria-expanded', String(!isOpen));
    };

    const handleMenuClick = async (event) => {
        const action = event.target.closest('[data-account-action]')?.dataset.accountAction;
        if (!action) return;

        closeDropdown();

        if (action === 'profile') {
            document.querySelectorAll('.sidebar-options .option').forEach(option => {
                option.classList.remove('selected');
            });
            updateHeaderText('Account Profile');
            await loadPage('profile');
        } else if (action === 'logout') {
            await logout();
        }
    };

    const handleDocumentClick = (event) => {
        if (!menu.contains(event.target)) {
            closeDropdown();
        }
    };

    const handleKeydown = (event) => {
        if (event.key === 'Escape') {
            closeDropdown();
        }
    };

    toggle.addEventListener('click', handleToggle);
    dropdown.addEventListener('click', handleMenuClick);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeydown);

    return () => {
        toggle.removeEventListener('click', handleToggle);
        dropdown.removeEventListener('click', handleMenuClick);
        document.removeEventListener('click', handleDocumentClick);
        document.removeEventListener('keydown', handleKeydown);
    };
}
