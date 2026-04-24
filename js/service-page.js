function initServicePageFaqSingleOpen() {
    const faqItems = document.querySelectorAll(".service-page-faq .faq-item");
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

function initServicePageReveal() {
    const revealItems = document.querySelectorAll(`
    .service-page-hero-card,
    .service-page-sidebar-card,
    .service-overview-block,
    .service-overview-card,
    .service-factor-card,
    .service-checklist-panel,
    .service-step-card,
    .service-visual-card,
    .faq-item,
    .cta-strip
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

function initServicePageHoverDepth() {
    const cards = document.querySelectorAll(`
    .service-page-hero-card,
    .service-overview-card,
    .service-factor-card,
    .service-step-card
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

function initServiceContactLinks() {
    const serviceName = document.body.dataset.serviceName?.trim();
    if (!serviceName) return;

    const encodedService = encodeURIComponent(serviceName);
    const links = document.querySelectorAll("[data-service-contact-link]");

    if (!links.length) return;

    links.forEach((link) => {
        const baseHref = link.getAttribute("href") || "contact.html";
        const cleanHref = baseHref.split("?")[0];
        link.setAttribute("href", `${cleanHref}?service=${encodedService}`);
    });
}

function initServiceSidebarActiveLinks() {
    const currentPage = window.location.pathname.split("/").pop();
    const links = document.querySelectorAll(".service-page-sidebar-links a");

    if (!links.length || !currentPage) return;

    links.forEach((link) => {
        const href = link.getAttribute("href");
        if (href === currentPage) {
            link.classList.add("is-active");
        } else {
            link.classList.remove("is-active");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initServicePageReveal();
    initServicePageHoverDepth();
    initServiceContactLinks();
    initServiceSidebarActiveLinks();
});
