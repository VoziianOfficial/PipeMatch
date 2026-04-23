function initContactFaqSingleOpen() {
    const faqItems = document.querySelectorAll(".contact-faq-section .faq-item");
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

function initContactReveal() {
    const revealItems = document.querySelectorAll(`
    .contact-hero-card,
    .contact-form-wrap,
    .contact-info-card,
    .contact-sidebar-panel,
    .contact-map-wrap,
    .faq-item
  `);

    if (!revealItems.length || !("IntersectionObserver" in window)) return;

    revealItems.forEach((item, index) => {
        item.style.opacity = "0";
        item.style.transform = "translateY(28px)";
        item.style.transition = `opacity 0.7s ease ${index * 0.04}s, transform 0.7s ease ${index * 0.04}s`;
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
            threshold: 0.14
        }
    );

    revealItems.forEach((item) => observer.observe(item));
}

function initContactHoverDepth() {
    const cards = document.querySelectorAll(`
    .contact-info-card,
    .contact-hero-card,
    .contact-sidebar-panel
  `);

    if (!cards.length) return;

    cards.forEach((card) => {
        card.addEventListener("mousemove", (event) => {
            if (window.innerWidth < 992) return;

            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const rotateY = ((x / rect.width) - 0.5) * 4;
            const rotateX = ((y / rect.height) - 0.5) * -4;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });
}

function initServicePrefillFromQuery() {
    const serviceSelect = document.querySelector("#contactServiceType");
    if (!serviceSelect) return;

    const params = new URLSearchParams(window.location.search);
    const service = params.get("service");

    if (!service) return;

    const normalized = service.trim().toLowerCase();

    [...serviceSelect.options].forEach((option) => {
        if (option.textContent.trim().toLowerCase() === normalized) {
            serviceSelect.value = option.value || option.textContent;
        }
    });
}

function initContactMap() {
    const mapEl = document.querySelector("#contactMap");
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

    L.control
        .zoom({
            position: "bottomright"
        })
        .addTo(map);
    // Attribution + scale controls are intentionally omitted for a cleaner UI.

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

    const buttons = [...document.querySelectorAll(".contact-map-style-btn[data-map-style]")];

    const getStoredStyle = () => {
        try {
            return localStorage.getItem("pipematch:contactMapStyle");
        } catch {
            return null;
        }
    };

    const setStoredStyle = (style) => {
        try {
            localStorage.setItem("pipematch:contactMapStyle", style);
        } catch {
        }
    };

    const updateButtons = (style) => {
        buttons.forEach((btn) => {
            const isActive = btn.dataset.mapStyle === style;
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
            setStyle(btn.dataset.mapStyle);
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
    initContactFaqSingleOpen();
    initContactReveal();
    initContactHoverDepth();
    initServicePrefillFromQuery();
    initContactMap();
});
