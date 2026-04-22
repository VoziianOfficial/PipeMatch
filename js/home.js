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
        scrollWheelZoom: false,
        dragging: true,
        tap: true
    });

    L.control
        .zoom({
            position: "bottomright"
        })
        .addTo(map);

    L.control
        .scale({
            position: "bottomleft",
            imperial: true,
            metric: false
        })
        .addTo(map);

    if (map.attributionControl) {
        map.attributionControl.setPrefix(false);
    }

    const layers = {
        standard: L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }),
        light: L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
            subdomains: "abcd",
            maxZoom: 20,
            attribution: "&copy; OpenStreetMap contributors &copy; CARTO"
        }),
        dark: L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            subdomains: "abcd",
            maxZoom: 20,
            attribution: "&copy; OpenStreetMap contributors &copy; CARTO"
        })
    };

    let activeLayer = null;

    const buttons = [...document.querySelectorAll(".coverage-map-style-btn[data-coverage-map-style]")];

    const getStoredStyle = () => {
        try {
            return localStorage.getItem("pipematch:homeMapStyle");
        } catch {
            return null;
        }
    };

    const setStoredStyle = (style) => {
        try {
            localStorage.setItem("pipematch:homeMapStyle", style);
        } catch {
        }
    };

    const updateButtons = (style) => {
        buttons.forEach((btn) => {
            const isActive = btn.dataset.coverageMapStyle === style;
            btn.classList.toggle("is-active", isActive);
            btn.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
    };

    const setStyle = (style) => {
        const normalized = layers[style] ? style : "standard";

        if (activeLayer) {
            map.removeLayer(activeLayer);
        }

        activeLayer = layers[normalized];
        activeLayer.addTo(map);

        updateButtons(normalized);
        setStoredStyle(normalized);

        requestAnimationFrame(() => map.invalidateSize());
    };

    setStyle(getStoredStyle() || "standard");

    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            setStyle(btn.dataset.coverageMapStyle);
        });
    });

    const marker = L.marker(center, {
        keyboard: false
    }).addTo(map);

    marker.bindPopup("<strong>Phoenix, AZ</strong><br/>Example service-area view");

    L.circle(center, {
        radius: 24000,
        color: "#176BFF",
        weight: 2,
        opacity: 0.9,
        fillColor: "#7EC3FF",
        fillOpacity: 0.12
    }).addTo(map);
}

document.addEventListener("DOMContentLoaded", () => {
    initReviewsSlider();
    initRailChips();
    initFaqSingleOpen();
    initServiceSearch();
    initCoverageMap();
});
