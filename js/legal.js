function initLegalReveal() {
    const revealItems = document.querySelectorAll(`
    .legal-hero-card,
    .legal-sidebar-card,
    .legal-intro-card,
    .legal-section,
    .legal-bottom-note
  `);

    if (!revealItems.length || !("IntersectionObserver" in window)) return;

    revealItems.forEach((item, index) => {
        item.style.opacity = "0";
        item.style.transform = "translateY(24px)";
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
            threshold: 0.12
        }
    );

    revealItems.forEach((item) => observer.observe(item));
}

function initLegalSmoothAnchors() {
    const tocLinks = document.querySelectorAll(".legal-toc a[href^='#']");
    if (!tocLinks.length) return;

    tocLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");
            if (!targetId || targetId === "#") return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            event.preventDefault();

            targetElement.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            history.replaceState(null, "", targetId);
        });
    });
}

function initLegalActiveToc() {
    const sections = document.querySelectorAll(".legal-section[id]");
    const tocLinks = document.querySelectorAll(".legal-toc a[href^='#']");

    if (!sections.length || !tocLinks.length || !("IntersectionObserver" in window)) return;

    const linkMap = new Map();

    tocLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href) {
            linkMap.set(href.replace("#", ""), link);
        }
    });

    const observer = new IntersectionObserver(
        (entries) => {
            let visibleSection = null;

            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    visibleSection = entry.target.id;
                }
            });

            if (!visibleSection) return;

            tocLinks.forEach((link) => link.classList.remove("is-active"));

            const activeLink = linkMap.get(visibleSection);
            if (activeLink) {
                activeLink.classList.add("is-active");
            }
        },
        {
            rootMargin: "-20% 0px -60% 0px",
            threshold: 0.1
        }
    );

    sections.forEach((section) => observer.observe(section));
}

document.addEventListener("DOMContentLoaded", () => {
    initLegalReveal();
    initLegalSmoothAnchors();
    initLegalActiveToc();
});