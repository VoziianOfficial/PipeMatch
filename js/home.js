function initReviewsSlider() {
    const sliderElement = document.querySelector(".reviews-slider");
    if (!sliderElement || typeof Swiper === "undefined") return;

    const paginationElement = sliderElement.querySelector(".swiper-pagination");

    new Swiper(sliderElement, {
        slidesPerView: 1,
        spaceBetween: 18,
        speed: 900,
        loop: true,
        grabCursor: true,
        centeredSlides: false,
        watchSlidesProgress: true,
        autoplay: {
            delay: 4200,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        pagination: {
            el: paginationElement,
            clickable: true
        },
        breakpoints: {
            640: {
                slidesPerView: 1.15,
                spaceBetween: 18
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            1200: {
                slidesPerView: 3,
                spaceBetween: 24
            }
        }
    });
}

function initFaqSingleOpen() {
    const faqItems = [...document.querySelectorAll(".faq-item")];
    if (!faqItems.length) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bodyByItem = new Map();

    faqItems.forEach((item) => {
        const body = item.querySelector("p");
        if (!body) return;

        bodyByItem.set(item, body);
        body.style.overflow = "hidden";
        body.style.height = item.open ? "auto" : "0px";
        body.style.opacity = item.open ? "1" : "0";
    });

    if (prefersReducedMotion) {
        faqItems.forEach((item) => {
            const summary = item.querySelector("summary");
            if (!summary || !bodyByItem.has(item)) return;

            summary.addEventListener("click", (event) => {
                event.preventDefault();

                if (item.open) {
                    item.open = false;
                    bodyByItem.get(item).style.opacity = "0";
                    bodyByItem.get(item).style.height = "0px";
                    return;
                }

                faqItems.forEach((otherItem) => {
                    if (otherItem === item || !bodyByItem.has(otherItem)) return;
                    otherItem.open = false;
                    bodyByItem.get(otherItem).style.opacity = "0";
                    bodyByItem.get(otherItem).style.height = "0px";
                });

                item.open = true;
                bodyByItem.get(item).style.height = "auto";
                bodyByItem.get(item).style.opacity = "1";
            });
        });

        return;
    }

    const animateClose = (item) => {
        const body = bodyByItem.get(item);
        if (!body || !item.open || item.dataset.faqAnimating === "true") return;

        item.dataset.faqAnimating = "true";
        const startHeight = body.scrollHeight;
        body.style.height = `${startHeight}px`;
        body.style.opacity = "1";

        requestAnimationFrame(() => {
            body.style.height = "0px";
            body.style.opacity = "0";
        });

        const onCloseEnd = (event) => {
            if (event.propertyName !== "height") return;
            body.removeEventListener("transitionend", onCloseEnd);
            item.open = false;
            item.dataset.faqAnimating = "false";
        };

        body.addEventListener("transitionend", onCloseEnd);
    };

    const animateOpen = (item) => {
        const body = bodyByItem.get(item);
        if (!body || item.open || item.dataset.faqAnimating === "true") return;

        item.dataset.faqAnimating = "true";
        item.open = true;
        body.style.height = "0px";
        body.style.opacity = "0";

        requestAnimationFrame(() => {
            const targetHeight = body.scrollHeight;
            body.style.height = `${targetHeight}px`;
            body.style.opacity = "1";
        });

        const onOpenEnd = (event) => {
            if (event.propertyName !== "height") return;
            body.removeEventListener("transitionend", onOpenEnd);
            body.style.height = "auto";
            item.dataset.faqAnimating = "false";
        };

        body.addEventListener("transitionend", onOpenEnd);
    };

    faqItems.forEach((item) => {
        const summary = item.querySelector("summary");
        if (!summary || !bodyByItem.has(item)) return;

        summary.addEventListener("click", (event) => {
            event.preventDefault();

            if (item.dataset.faqAnimating === "true") return;

            if (item.open) {
                animateClose(item);
                return;
            }

            faqItems.forEach((otherItem) => {
                if (otherItem !== item) {
                    animateClose(otherItem);
                }
            });

            animateOpen(item);
        });
    });
}

function initServiceSearch() {
    const searchInput = document.querySelector(".rail-search input");
    const railLinks = document.querySelectorAll(".rail-links a");

    if (!searchInput || !railLinks.length) return;

    searchInput.addEventListener("input", (event) => {
        const query = event.target.value.trim().toLowerCase();

        railLinks.forEach((link) => {
            const text = link.textContent.trim().toLowerCase();
            const isMatch = text.includes(query);
            link.style.display = isMatch ? "flex" : "none";
        });
    });
}

function initCoverageMap() {
    const mapEl = document.querySelector("#coverageMap");
    if (!mapEl) return;

    const L = window.L;
    if (!L || typeof L.map !== "function") return;

    const center = [33.4484, -112.0740];

    const map = L.map(mapEl, {
        center,
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: true,
        tap: true
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);
    

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    requestAnimationFrame(() => map.invalidateSize());

    const marker = L.marker(center, {
        keyboard: false
    }).addTo(map);

    marker.bindPopup("<strong>Phoenix, AZ</strong><br/>Example service-area view");

    L.circle(center, {
        radius: 24000,
        color: "#b28a4f",
        weight: 2,
        opacity: 0.95,
        fillColor: "#d7bb89",
        fillOpacity: 0.16
    }).addTo(map);
}

function initRevealAnimations() {
    const revealItems = document.querySelectorAll(`
        .hero-copy,
        .hero-form-card,
        .service-rail-card,
        .service-card,
        .step-card,
        .split-feature-copy,
        .visual-card,
        .review-card,
        .coverage-card,
        .faq-item,
        .cta-strip
    `);

    if (!revealItems.length || !("IntersectionObserver" in window)) return;

    revealItems.forEach((item, index) => {
        item.style.opacity = "0";
        item.style.transform = "translateY(42px)";
        item.style.transition = `
            opacity 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) ${index * 0.03}s,
            transform 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) ${index * 0.03}s
        `;
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

    revealItems.forEach((item) => observer.observe(item));
}

function initHeroParallax() {
    const hero = document.querySelector(".home-hero");
    const bg = document.querySelector(".home-hero-bg");
    const orbOne = document.querySelector(".home-hero-orb");
    const orbTwo = document.querySelector(".home-hero-orb--two");
    const formCard = document.querySelector(".hero-form-card");

    if (!hero || window.innerWidth < 992) return;

    hero.addEventListener("mousemove", (event) => {
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        const moveX = (x - 0.5) * 18;
        const moveY = (y - 0.5) * 14;

        if (bg) {
            bg.style.transform = `scale(1.08) translate(${moveX * -0.35}px, ${moveY * -0.35}px)`;
        }

        if (orbOne) {
            orbOne.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }

        if (orbTwo) {
            orbTwo.style.transform = `translate(${moveX * -0.75}px, ${moveY * -0.75}px)`;
        }

        if (formCard) {
            formCard.style.transform = `perspective(1200px) rotateX(${(y - 0.5) * -4}deg) rotateY(${(x - 0.5) * 4}deg) translateY(-4px)`;
        }
    });

    hero.addEventListener("mouseleave", () => {
        if (bg) bg.style.transform = "";
        if (orbOne) orbOne.style.transform = "";
        if (orbTwo) orbTwo.style.transform = "";
        if (formCard) formCard.style.transform = "";
    });
}

function initCardDepth() {
    const cards = document.querySelectorAll(`
        .service-card,
        .step-card,
        .review-card
    `);

    if (!cards.length) return;

    cards.forEach((card) => {
        card.addEventListener("mousemove", (event) => {
            if (window.innerWidth < 992) return;

            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const rotateY = ((x / rect.width) - 0.5) * 7;
            const rotateX = ((y / rect.height) - 0.5) * -7;

            card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });
}

function initHeadingMotion() {
    const heroTitle = document.querySelector(".hero-copy h1");
    const heroText = document.querySelector(".hero-text");
    const heroBadges = document.querySelectorAll(".hero-badges span");
    const heroButtons = document.querySelectorAll(".hero-actions .btn");
    const heroDisclaimer = document.querySelector(".hero-disclaimer-note");

    if (!heroTitle) return;

    const animatedItems = [
        heroTitle,
        heroText,
        ...heroBadges,
        ...heroButtons,
        heroDisclaimer
    ].filter(Boolean);

    animatedItems.forEach((item, index) => {
        item.style.opacity = "0";
        item.style.transform = "translateY(26px)";
        item.style.transition = `
            opacity 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) ${0.08 + index * 0.08}s,
            transform 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) ${0.08 + index * 0.08}s
        `;
    });

    requestAnimationFrame(() => {
        animatedItems.forEach((item) => {
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initReviewsSlider();
    initServiceSearch();
    initCoverageMap();
    initRevealAnimations();
    initHeroParallax();
    initCardDepth();
    initHeadingMotion();
});
