function initServicesFiltering() {
    const searchInput = document.querySelector("#servicesSearchInput");
    const filterButtons = document.querySelectorAll(
        ".services-filter-buttons .chip, .services-chip-group .chip"
    );
    const cards = document.querySelectorAll("#servicesGrid .directory-card");

    if (!cards.length) return;

    let activeFilter = "all";
    let searchQuery = "";

    const updateCards = () => {
        cards.forEach((card) => {
            const category = card.dataset.category || "";
            const title = card.querySelector("h3")?.textContent.toLowerCase() || "";
            const text = card.querySelector("p")?.textContent.toLowerCase() || "";

            const matchesFilter = activeFilter === "all" || category === activeFilter;
            const matchesSearch =
                !searchQuery ||
                title.includes(searchQuery) ||
                text.includes(searchQuery);

            card.classList.toggle("is-hidden", !matchesFilter || !matchesSearch);
        });
    };

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            filterButtons.forEach((item) => item.classList.remove("is-active"));
            button.classList.add("is-active");

            activeFilter = button.dataset.filter || "all";
            updateCards();
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", (event) => {
            searchQuery = event.target.value.toLowerCase().trim();
            updateCards();
        });
    }

    updateCards();
}

function initServicesFaqSingleOpen() {
    const faqItems = document.querySelectorAll(".services-faq-block .faq-item");
    if (!faqItems.length) return;

    faqItems.forEach((item) => {
        item.addEventListener("toggle", () => {
            if (!item.open) return;

            faqItems.forEach((otherItem) => {
                if (otherItem !== item) {
                    otherItem.open = false;
                }
            });
        });
    });
}

function initServicesReveal() {
    const cards = document.querySelectorAll(
        ".directory-card, .comparison-card, .editorial-panel-card"
    );

    if (!cards.length || !("IntersectionObserver" in window)) return;

    cards.forEach((card, index) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(24px)";
        card.style.transition = `opacity 0.6s ease ${index * 0.04}s, transform 0.6s ease ${index * 0.04}s`;
    });

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                obs.unobserve(entry.target);
            });
        },
        { threshold: 0.12 }
    );

    cards.forEach((card) => observer.observe(card));
}

function initServicesClientCounter() {
    const counter = document.querySelector("[data-counter-target]");
    if (!counter) return;

    const rawTarget = Number.parseInt(counter.getAttribute("data-counter-target") || "0", 10);
    if (!Number.isFinite(rawTarget) || rawTarget <= 0) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
        counter.textContent = rawTarget.toLocaleString("en-US");
        return;
    }

    const duration = 1300;
    const startTime = performance.now();

    const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(rawTarget * eased);
        counter.textContent = value.toLocaleString("en-US");

        if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
}

document.addEventListener("DOMContentLoaded", () => {
    initServicesFiltering();
    initServicesFaqSingleOpen();
    initServicesReveal();
    initServicesClientCounter();
});