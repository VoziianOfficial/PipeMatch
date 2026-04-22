function initAboutReveal() {
    const revealItems = document.querySelectorAll(`
    .about-hero-note,
    .about-story-copy,
    .about-story-card,
    .model-point,
    .about-benefits-panel-card,
    .process-card,
    .about-note-box
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

function initAboutHoverDepth() {
    const cards = document.querySelectorAll(`
    .about-story-card,
    .model-point,
    .process-card,
    .about-benefits-panel-card
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

document.addEventListener("DOMContentLoaded", () => {
    initAboutReveal();
    initAboutHoverDepth();
});