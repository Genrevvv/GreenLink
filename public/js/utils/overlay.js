const overlay = document.querySelector('#overlay');

export function showOverlay(content) {
    overlay.innerHTML = content;
    overlay.classList.remove('hidden');

    overlay.onclick = (e) => {
        if (e.target === overlay) {
            hideOverlay();
        }
    };

    overlay.querySelector('.close-overlay').onclick = hideOverlay;
}

export function hideOverlay() {
    overlay.innerHTML = '';
    overlay.classList.add('hidden');
}