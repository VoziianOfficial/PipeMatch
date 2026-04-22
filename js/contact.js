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

document.addEventListener("DOMContentLoaded", () => {
    initContactFaqSingleOpen();
    initContactReveal();
    initContactHoverDepth();
    initServicePrefillFromQuery();
});