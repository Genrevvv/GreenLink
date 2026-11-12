import {
    renderDeleteAccountSection,
    renderEmailForm,
    renderPasswordForm,
    renderProfileSection,
    renderUsernameForm
} from './modal.js';

export function initProfileNavigation(navigation, content, profile, initializeForms) {
    const buttons = navigation.querySelectorAll('[data-section]');

    const showSection = (section) => {
        const renderers = {
            profile: () => renderProfileSection(profile),
            username: () => renderUsernameForm(profile),
            email: () => renderEmailForm(profile),
            password: renderPasswordForm,
            delete: renderDeleteAccountSection
        };
        const render = renderers[section] ?? renderers.profile;

        buttons.forEach(button => {
            const selected = button.dataset.section === section;
            button.classList.toggle('selected', selected);
            if (selected) {
                button.setAttribute('aria-current', 'page');
            } else {
                button.removeAttribute('aria-current');
            }
        });

        content.innerHTML = render();
        initializeForms(() => showSection('profile'));
    };

    const handleClick = (event) => {
        const button = event.target.closest('[data-section]');
        if (button && navigation.contains(button)) {
            showSection(button.dataset.section);
        }
    };

    navigation.addEventListener('click', handleClick);
    showSection('profile');

    return {
        showSection,
        cleanup: () => navigation.removeEventListener('click', handleClick)
    };
}
