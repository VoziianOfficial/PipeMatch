function initServicesFiltering() {
    const searchInput = document.querySelector("#servicesSearchInput");
    const filterButtons = document.querySelectorAll(
        ".services-filter-buttons .chip, .services-chip-group .chip"
    );
    const cards = document.querySelectorAll(
        "#servicesGrid .directory-card:not([data-swiper-clone])"
    );

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
        ".directory-card:not([data-swiper-clone]), .comparison-card, .editorial-panel-card"
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

function initServicesDirectorySwiper() {
    const gridSection = document.querySelector("#servicesGrid[data-services-swiper]");
    if (!gridSection) return;

    const enableMq = window.matchMedia("(max-width: 1100px)");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let wrapper = null;
    let track = null;
    let prevButton = null;
    let nextButton = null;
    let observer = null;
    let rebuildRaf = 0;
    let isBuilding = false;

    let originalCards = [];
    let cleanup = null;
    let lastSlidesPerView = null;

    const getSlidesPerView = () => (window.matchMedia("(max-width: 767px)").matches ? 1 : 2);

    const ensureWrapper = () => {
        wrapper = gridSection.querySelector(".services-directory-swiper");
        track = gridSection.querySelector("[data-swiper-track]");
        prevButton = gridSection.querySelector("[data-swiper-prev]");
        nextButton = gridSection.querySelector("[data-swiper-next]");

        if (wrapper && track) return;

        wrapper = document.createElement("div");
        wrapper.className = "services-directory-swiper";
        wrapper.setAttribute("aria-label", "Service categories carousel");

        prevButton = document.createElement("button");
        prevButton.className = "services-directory-nav services-directory-nav--prev";
        prevButton.type = "button";
        prevButton.setAttribute("aria-label", "Previous categories");
        prevButton.dataset.swiperPrev = "";
        prevButton.innerHTML = '<i class="fa-solid fa-arrow-left" aria-hidden="true"></i>';

        nextButton = document.createElement("button");
        nextButton.className = "services-directory-nav services-directory-nav--next";
        nextButton.type = "button";
        nextButton.setAttribute("aria-label", "Next categories");
        nextButton.dataset.swiperNext = "";
        nextButton.innerHTML = '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';

        track = document.createElement("div");
        track.className = "services-directory-track";
        track.dataset.swiperTrack = "";

        originalCards = Array.from(gridSection.querySelectorAll(":scope > .directory-card")).filter(
            (card) => card.dataset.swiperClone !== "true"
        );
        originalCards.forEach((card) => track.appendChild(card));

        wrapper.appendChild(prevButton);
        wrapper.appendChild(track);
        wrapper.appendChild(nextButton);
        gridSection.appendChild(wrapper);
    };

    const unwrap = () => {
        if (!wrapper || !track) return;

        track
            .querySelectorAll('.directory-card[data-swiper-clone="true"]')
            .forEach((node) => node.remove());

        Array.from(track.querySelectorAll(".directory-card")).forEach((card) => gridSection.appendChild(card));
        wrapper.remove();

        wrapper = null;
        track = null;
        prevButton = null;
        nextButton = null;
    };

    const getScrollableCards = () =>
        Array.from(track.querySelectorAll(".directory-card")).filter(
            (card) => card.dataset.swiperClone !== "true" && !card.classList.contains("is-hidden")
        );

    const destroy = () => {
        if (cleanup) cleanup();
        cleanup = null;

        if (!track) return;

        track
            .querySelectorAll('.directory-card[data-swiper-clone="true"]')
            .forEach((node) => node.remove());

        if (originalCards.length) {
            originalCards.forEach((card) => track.appendChild(card));
        }
    };

    const build = () => {
        if (!enableMq.matches) return;
        if (isBuilding) return;

        isBuilding = true;
        try {
            ensureWrapper();

            destroy();

        const slidesPerView = getSlidesPerView();
        lastSlidesPerView = slidesPerView;

        originalCards = Array.from(track.children).filter(
            (node) => node.classList && node.classList.contains("directory-card")
        );

            const visibleCards = getScrollableCards();
            if (visibleCards.length <= slidesPerView) return;

        const head = visibleCards.slice(0, slidesPerView);
        const tail = visibleCards.slice(-slidesPerView);

        const makeClone = (node) => {
            const clone = node.cloneNode(true);
            clone.dataset.swiperClone = "true";
            clone.classList.add("is-swiper-clone");
            return clone;
        };

        tail.map(makeClone).forEach((clone) => track.insertBefore(clone, track.firstChild));
        head.map(makeClone).forEach((clone) => track.appendChild(clone));

        requestAnimationFrame(() => {
            const firstReal = visibleCards[0];
            if (!firstReal) return;
            track.scrollLeft = firstReal.offsetLeft;
        });

        const getStep = () => {
            const firstVisible = getScrollableCards()[0];
            if (!firstVisible) return 0;
            const computed = window.getComputedStyle(track);
            const gap = Number.parseFloat(computed.columnGap || computed.gap || "0") || 0;
            return firstVisible.getBoundingClientRect().width + gap;
        };

        const scrollBySlides = (dir) => {
            const step = getStep();
            if (!step) return;
            track.scrollBy({
                left: dir * step,
                behavior: prefersReducedMotion ? "auto" : "smooth",
            });
        };

        const onPrev = () => scrollBySlides(-1);
        const onNext = () => scrollBySlides(1);

        const maybeWrap = () => {
            const clones = Array.from(track.querySelectorAll('.directory-card[data-swiper-clone="true"]'));
            const reals = getScrollableCards();
            if (!clones.length || reals.length <= slidesPerView) return;

            const firstReal = reals[0];
            const lastReal = reals[reals.length - 1];
            if (!firstReal || !lastReal) return;

            const step = getStep();
            if (!step) return;

            if (track.scrollLeft <= firstReal.offsetLeft - step * 0.5) {
                track.scrollLeft = lastReal.offsetLeft;
                return;
            }

            if (track.scrollLeft >= lastReal.offsetLeft + step * 0.5) {
                track.scrollLeft = firstReal.offsetLeft;
            }
        };

        let raf = 0;
        const onScroll = () => {
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(maybeWrap);
        };

        const onResize = () => {
            if (!enableMq.matches) {
                teardown();
                return;
            }

            const nextSlidesPerView = getSlidesPerView();
            if (nextSlidesPerView !== lastSlidesPerView) {
                build();
                return;
            }

            const reals = getScrollableCards();
            if (!reals.length) return;
            track.scrollLeft = reals[0].offsetLeft;
        };

        let isPointerDown = false;
        let startX = 0;
        let startScrollLeft = 0;
        let pointerId = null;

        const onPointerDown = (event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            isPointerDown = true;
            pointerId = event.pointerId;
            startX = event.clientX;
            startScrollLeft = track.scrollLeft;
            track.setPointerCapture(pointerId);
        };

        const onPointerMove = (event) => {
            if (!isPointerDown) return;
            const delta = event.clientX - startX;
            track.scrollLeft = startScrollLeft - delta;
        };

        const onPointerUp = () => {
            isPointerDown = false;
            pointerId = null;
        };

        prevButton?.addEventListener("click", onPrev);
        nextButton?.addEventListener("click", onNext);
        track.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize, { passive: true });

        track.addEventListener("pointerdown", onPointerDown);
        track.addEventListener("pointermove", onPointerMove);
        track.addEventListener("pointerup", onPointerUp);
        track.addEventListener("pointercancel", onPointerUp);

            cleanup = () => {
            prevButton?.removeEventListener("click", onPrev);
            nextButton?.removeEventListener("click", onNext);
            track.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            track.removeEventListener("pointerdown", onPointerDown);
            track.removeEventListener("pointermove", onPointerMove);
            track.removeEventListener("pointerup", onPointerUp);
            track.removeEventListener("pointercancel", onPointerUp);
            if (raf) cancelAnimationFrame(raf);
            };
        } finally {
            isBuilding = false;
        }
    };

    const teardown = () => {
        if (observer) observer.disconnect();
        observer = null;
        if (rebuildRaf) cancelAnimationFrame(rebuildRaf);
        rebuildRaf = 0;

        destroy();
        unwrap();
    };

    const setMode = () => {
        if (!enableMq.matches) {
            teardown();
            return;
        }

        build();

        if (observer) observer.disconnect();
        observer = new MutationObserver(() => {
            if (rebuildRaf) cancelAnimationFrame(rebuildRaf);
            rebuildRaf = requestAnimationFrame(() => build());
        });

        const realCards = Array.from(gridSection.querySelectorAll(".directory-card")).filter(
            (card) => card.dataset.swiperClone !== "true"
        );
        realCards.forEach((card) => {
            observer.observe(card, { attributes: true, attributeFilter: ["class"] });
        });
    };

    setMode();
    if (enableMq.addEventListener) enableMq.addEventListener("change", setMode);
    else enableMq.addListener(setMode);
}

document.addEventListener("DOMContentLoaded", () => {
    initServicesFiltering();
    initServicesFaqSingleOpen();
    initServicesReveal();
    initServicesClientCounter();
    initServicesDirectorySwiper();
});
