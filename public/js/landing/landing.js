const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links a");

// Section Visibility Observer for Fade-up Animations
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
        }
    });
}, { threshold: 0.25 });

sections.forEach((section) => {
    sectionObserver.observe(section);
});

// Navbar Active Link Highlighting on Scroll
const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            navLinks.forEach((link) => link.classList.remove("active"));
            const activeLink = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
            if (activeLink) activeLink.classList.add("active");
        }
    });
}, { threshold: 0.55 });

sections.forEach((section) => {
    navObserver.observe(section);
});

// Smooth Scroll Navigation Handler
navLinks.forEach((link) => {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});

// 1. Independent Left Image Box Slideshow 
const slides = document.querySelectorAll(".about-slide");
let currentSlideIndex = 0;

setInterval(() => {
    slides[currentSlideIndex].classList.remove("active");
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    slides[currentSlideIndex].classList.add("active");
}, 3000);

// 2. Independent Right Card Text Tabs
const tabButtons = document.querySelectorAll(".about-tab-btn");
const tabPanels = document.querySelectorAll(".about-panel");

tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        tabButtons.forEach(btn => btn.classList.remove("active"));
        tabPanels.forEach(panel => panel.classList.remove("active"));

        button.classList.add("active");
        const targetPanel = document.getElementById(button.getAttribute("data-tab"));
        if (targetPanel) {
            targetPanel.classList.add("active");
        }
    });
});