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

export async function loadPage(page) {
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

        const cleanup = module ? await module[pageModule.init]() : null;

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
        window.location.href = "/";
    } catch (error) {
        console.error("Logout failed:", error);
    }
}
