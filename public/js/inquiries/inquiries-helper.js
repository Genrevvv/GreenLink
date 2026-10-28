export function getToday() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${now.getFullYear()}-${month}-${day}`;
}

export function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
}
