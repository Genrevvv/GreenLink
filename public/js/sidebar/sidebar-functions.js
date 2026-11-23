import { apiFetch } from '../utils/api.js';
import { getCurrentUser } from '../utils/user.js';
import { createFallbackSkeleton, createPageSkeleton } from './skeleton.js';

const mainContent = document.querySelector('#main-content');
const headerText = document.querySelector('#header-text');
const user = getCurrentUser();

let cleanupPage = null;
let currentLoad = 0;

// Page scripts and their init functions
const pageModules = {
    dashboard: { load: () => import('../dashboard/dashboard.js'), init: 'initDashboard' },
    products: { load: () => import('../products/products.js'), init: 'initProducts' },
    appointments: { load: () => import('../appointments/appointments.js'), init: 'initAppointments' },
    inquiries: { load: () => import('../inquiries/inquiries.js'), init: 'initInquiries' },
    profile: { load: () => import('../profiles/profile.js'), init: 'initProfile' }
};

const pageHtmlCache = new Map();
const loadedPageHtml = new Map();
const pageTitles = {
    dashboard: 'Dashboard',
    products: 'Products',
    appointments: 'Appointments',
    inquiries: 'Inquiries',
    profile: 'Account Profile'
};

function getPagePath(page) {
    return page === 'profile'
        ? '/views/pages/profile.html'
        : `/views/pages/${user.user_type}/${page}.html`;
}

function fetchPageHtml(page) {
    if (!pageHtmlCache.has(page)) {
        const request = fetch(getPagePath(page)).then(response => {
            if (!response.ok) throw new Error(`Failed to load ${page} page`);
            return response.text();
        }).then(html => {
            loadedPageHtml.set(page, html);
            return html;
        });

        request.catch(() => pageHtmlCache.delete(page));
        pageHtmlCache.set(page, request);
    }

    return pageHtmlCache.get(page);
}

export function prefetchPage(page) {
    if (!pageModules[page]) return;

    fetchPageHtml(page).catch(() => {});
    pageModules[page].load().catch(() => {});
}

export function prefetchAllPageHtml() {
    Object.keys(pageModules).forEach(page => fetchPageHtml(page).catch(() => {}));
}

function runCleanup(cleanup) {
    if (typeof cleanup === 'function') {
        cleanup();
    }
}

export function getPageFromLocation() {
    const page = window.location.pathname.replace(/^\/+|\/+$/g, '');
    return pageModules[page] ? page : null;
}

function updatePageNavigation(page) {
    document.querySelectorAll('.sidebar-options .option').forEach(option => {
        const isSelected = option.dataset.page === page;
        option.classList.toggle('selected', isSelected);

        if (isSelected) {
            option.setAttribute('aria-current', 'page');
        } else {
            option.removeAttribute('aria-current');
        }
    });

    updateHeaderText(pageTitles[page]);
}

export async function loadPage(page, targetId = null, options = {}) {
    if (!pageModules[page]) {
        throw new Error(`Unknown page: ${page}`);
    }

    const targetParam = targetId === null || targetId === undefined || targetId === ''
        ? ''
        : `?targetId=${encodeURIComponent(targetId)}`;
    const pageUrl = `/${page}${targetParam}`;

    if (options.updateHistory !== false) {
        const currentUrl = `${window.location.pathname}${window.location.search}`;

        if (options.replaceHistory || currentUrl !== pageUrl) {
            const method = options.replaceHistory ? 'replaceState' : 'pushState';
            window.history[method]({ page, targetId }, '', pageUrl);
        }
    }

    updatePageNavigation(page);

    const loadId = ++currentLoad;
    const isStale = () => loadId !== currentLoad;

    runCleanup(cleanupPage);
    cleanupPage = null;

    let skeleton = loadedPageHtml.has(page)
        ? createPageSkeleton(loadedPageHtml.get(page))
        : createFallbackSkeleton();
    mainContent.replaceChildren(skeleton);
    mainContent.scrollTop = 0;

    try {
        const pageModule = pageModules[page];
        const modulePromise = pageModule ? pageModule.load() : null;
        const html = await fetchPageHtml(page);

        if (isStale()) return;

        if (!skeleton.classList.contains('page-skeleton')) {
            const pageSkeleton = createPageSkeleton(html);
            skeleton.replaceWith(pageSkeleton);
            skeleton = pageSkeleton;
        }

        const module = await modulePromise;

        if (isStale()) return;

        const pageView = document.createElement('div');
        pageView.className = 'page-view hidden';
        pageView.innerHTML = html;
        skeleton.before(pageView);

        const cleanup = module ? await module[pageModule.init](targetId) : null;

        if (isStale()) {
            runCleanup(cleanup);
            return;
        }

        cleanupPage = cleanup;
        skeleton.remove();
        pageView.classList.remove('hidden');
    } catch (error) {
        if (isStale()) return;

        console.error(`Failed to load ${page} page:`, error);
        mainContent.innerHTML = `
            <div class="container p-2">
                Can't load content hehe :)
            </div>
        `;
        return;
    }

}

function updateHeaderText(text) {
    headerText.textContent = text;
}

export async function logout() {
    try {
        await apiFetch('/api/logout', 'POST');
        window.location.href = "/";
    } catch (error) {
        console.error("Logout failed:", error);
    }
}
