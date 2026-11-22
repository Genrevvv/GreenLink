const PLACEHOLDER_TEXT = ['Loading content', 'Loading', 'Loading details here', 'Loading info'];
const FILLABLE_TAGS = new Set(['TBODY', 'UL', 'OL', 'DIV', 'SECTION']);
const LIST_ID_PATTERN = /(list|cards|grid|items)$/i;
const SKIPPED_TEXT_PARENTS = new Set(['OPTION', 'SELECT', 'TEXTAREA', 'SCRIPT', 'STYLE']);

function placeholderText(index) {
    return PLACEHOLDER_TEXT[index % PLACEHOLDER_TEXT.length];
}

function createBusyWrapper() {
    const skeleton = document.createElement('div');
    skeleton.setAttribute('aria-busy', 'true');
    skeleton.setAttribute('aria-label', 'Loading page');
    skeleton.inert = true;

    return skeleton;
}

function fillDynamicAreas(skeleton) {

    skeleton.querySelectorAll('table').forEach(table => {
        const headerRow = table.querySelector('tr');
        const columns = headerRow?.querySelectorAll('th').length || 4;
        const cells = Array.from({ length: columns }, (_, i) => `<td>${placeholderText(i)}</td>`).join('');
        const rows = `<tr>${cells}</tr>`.repeat(5);

        const filledBody = table.querySelector('tbody[id]');
        if (filledBody) {
            filledBody.innerHTML = rows;
        } else if (!table.querySelector('td')) {
            table.insertAdjacentHTML('beforeend', `<tbody>${rows}</tbody>`);
        }
    });

    skeleton.querySelectorAll('[id]').forEach(element => {
        if (!FILLABLE_TAGS.has(element.tagName) || element.tagName === 'TBODY') return;

        const isEmpty = element.children.length === 0 && element.textContent.trim() === '';
        if (!isEmpty) return;

        // A plain empty box (e.g. the inventory donut) shimmers as a whole
        const isListLike = element.tagName === 'UL' || element.tagName === 'OL' || LIST_ID_PATTERN.test(element.id);
        if (!isListLike) {
            element.classList.add('skeleton');
            return;
        }

        const itemTag = element.tagName === 'UL' || element.tagName === 'OL' ? 'li' : 'div';
        element.innerHTML = Array.from({ length: 3 }, () =>
            `<${itemTag} class="skeleton skeleton-placeholder"></${itemTag}>`
        ).join('');
    });
}

function maskText(skeleton) {
    const walker = document.createTreeWalker(skeleton, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
            if (SKIPPED_TEXT_PARENTS.has(node.parentElement?.tagName)) return NodeFilter.FILTER_REJECT;

            return NodeFilter.FILTER_ACCEPT;
        }
    });

    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach(node => {
        const bar = document.createElement('span');
        bar.className = 'skeleton skeleton-text';
        bar.textContent = node.textContent.trim();
        node.replaceWith(bar);
    });
}

export function createPageSkeleton(html) {
    const skeleton = createBusyWrapper();
    skeleton.className = 'page-skeleton';
    skeleton.innerHTML = html;

    skeleton.querySelectorAll('script, template').forEach(element => element.remove());
    fillDynamicAreas(skeleton);


    skeleton.querySelectorAll('[id], [name], [for]').forEach(element => {
        element.removeAttribute('id');
        element.removeAttribute('name');
        element.removeAttribute('for');
    });

    maskText(skeleton);

    skeleton.querySelectorAll('i[class*="fa-"], img, svg').forEach(element => {
        element.classList.add('skeleton', 'skeleton-icon');
    });

    skeleton.querySelectorAll('input, select, textarea, button').forEach(element => {
        element.classList.add('skeleton', 'skeleton-field');
        element.tabIndex = -1;
        if ('placeholder' in element) element.placeholder = '';
    });

    return skeleton;
}

export function createFallbackSkeleton() {
    const row = `
        <div class="flex align-center gap-4 py-2">
            <div class="skeleton skeleton-bar skeleton-w-20"></div>
            <div class="skeleton skeleton-bar flex-1"></div>
            <div class="skeleton skeleton-bar skeleton-w-15"></div>
        </div>
    `;

    const skeleton = createBusyWrapper();
    skeleton.className = 'container p-4 page-skeleton-fallback';
    skeleton.innerHTML = `
        <div class="flex-column gap-2 mt-4 p-4 rounded-sm bd-lg">
            <div class="skeleton skeleton-bar skeleton-lg skeleton-w-20 mb-2"></div>
            ${row.repeat(6)}
        </div>
    `;

    return skeleton;
}
