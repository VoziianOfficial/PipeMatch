function initReviewsSlider() {
    const sliderElement = document.querySelector(".reviews-slider");

    if (!sliderElement || typeof Swiper === "undefined") return;

    new Swiper(".reviews-slider", {
        slidesPerView: 1,
        spaceBetween: 18,
        speed: 700,
        loop: true,
        grabCursor: true,
        pagination: {
            el: ".swiper-pagination",
            clickable: true
        },
        breakpoints: {
            640: {
                slidesPerView: 1.2
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            1200: {
                slidesPerView: 3,
                spaceBetween: 22
            }
        }
    });
}

function initRailChips() {
    const chips = document.querySelectorAll(".rail-filter-group .chip");
    if (!chips.length) return;

    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            chips.forEach((item) => item.classList.remove("is-active"));
            chip.classList.add("is-active");
        });
    });
}

function initFaqSingleOpen() {
    const faqItems = document.querySelectorAll(".faq-item");
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

function initServiceSearch() {
    const searchInput = document.querySelector('.rail-search input');
    const railLinks = document.querySelectorAll('.rail-links a');

    if (!searchInput || !railLinks.length) return;

    searchInput.addEventListener('input', (event) => {
        const query = event.target.value.trim().toLowerCase();

        railLinks.forEach((link) => {
            const text = link.textContent.trim().toLowerCase();
            const isMatch = text.includes(query);
            link.style.display = isMatch ? "flex" : "none";
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initReviewsSlider();
    initRailChips();
    initFaqSingleOpen();
    initServiceSearch();
});