const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links a");

// Reveal sections as they enter the viewport.
if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.25 });

    sections.forEach((section) => sectionObserver.observe(section));

    // Highlight the navigation link for the visible section.
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            navLinks.forEach((link) => link.classList.remove("active"));

            const activeLink = document.querySelector(
                `.nav-links a[href="#${entry.target.id}"]`
            );

            if (activeLink) {
                activeLink.classList.add("active");
            }
        });
    }, { threshold: 0.55 });

    sections.forEach((section) => navObserver.observe(section));
} else {
    sections.forEach((section) => section.classList.add("visible"));
}

// Smooth scrolling for in-page navigation.
navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
        const href = this.getAttribute("href");

        if (!href || !href.startsWith("#")) return;

        const target = document.querySelector(href);

        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});

// Automatic slideshow for the About section.
const slides = document.querySelectorAll(".about-slide");
let currentSlideIndex = 0;

if (slides.length > 1) {
    window.setInterval(() => {
        slides[currentSlideIndex].classList.remove("active");

        currentSlideIndex =
            (currentSlideIndex + 1) % slides.length;

        slides[currentSlideIndex].classList.add("active");
    }, 3000);
}

// About section tabs.
const tabButtons = document.querySelectorAll(".about-tab-btn");
const tabPanels = document.querySelectorAll(".about-panel");

function activateAboutTab(button) {
    const targetId = button.dataset.tab;
    const targetPanel = document.getElementById(targetId);

    if (!targetPanel) return;

    tabButtons.forEach((tabButton) => {
        const isActive = tabButton === button;

        tabButton.classList.toggle("active", isActive);
        tabButton.setAttribute("aria-selected", String(isActive));
        tabButton.tabIndex = isActive ? 0 : -1;
    });

    tabPanels.forEach((panel) => {
        const isActive = panel === targetPanel;

        panel.classList.toggle("active", isActive);
        panel.hidden = !isActive;
    });
}

tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
        activateAboutTab(button);
    });

    // Keyboard support for switching between tabs.
    button.addEventListener("keydown", (event) => {
        let nextIndex = index;

        if (event.key === "ArrowRight") {
            nextIndex = (index + 1) % tabButtons.length;
        } else if (event.key === "ArrowLeft") {
            nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
        } else {
            return;
        }

        event.preventDefault();

        tabButtons[nextIndex].focus();
        activateAboutTab(tabButtons[nextIndex]);
    });
});

// Set the initial tab state.
if (tabButtons.length) {
    tabButtons.forEach((button, index) => {
        button.tabIndex = index === 0 ? 0 : -1;
    });
}