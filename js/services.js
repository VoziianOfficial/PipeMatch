function initServicesFiltering() {
    const searchInput = document.querySelector("#servicesSearchInput");
    const filterButtons = document.querySelectorAll(".services-chip-group .chip");
    const cards = document.querySelectorAll(".directory-card");

    if (!cards.length) return;

    let activeFilter = "all";
    let searchQuery = "";

    const matchesFilter = (card, filter) => {
        if (filter === "all") return true;
        return card.dataset.category === filter;
    };

    const matchesSearch = (card, query) => {
        if (!query) return true;

        const text = card.textContent.toLowerCase().trim();
        return text.includes(query);
    };

    const updateCards = () => {
        cards.forEach((card) => {
            const visibleByFilter = matchesFilter(card, activeFilter);
            const visibleBySearch = matchesSearch(card, searchQuery);
            const shouldShow = visibleByFilter && visibleBySearch;

            card.classList.toggle("is-hidden", !shouldShow);
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
        {
            threshold: 0.12
        }
    );

    cards.forEach((card) => observer.observe(card));
}

document.addEventListener("DOMContentLoaded", () => {
    initServicesFiltering();
    initServicesFaqSingleOpen();
    initServicesReveal();
});