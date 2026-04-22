import { siteConfig } from "./config.js";

/* =========================
   HELPERS
========================= */
const select = (selector, scope = document) => scope.querySelector(selector);
const selectAll = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const setTextForElements = (selector, value) => {
    const elements = selectAll(selector);
    elements.forEach((element) => {
        element.textContent = value;
    });
};

/* =========================
   CONFIG INJECTION
========================= */
function applySiteConfig() {
    setTextForElements("[data-company-name]", siteConfig.companyName);
    setTextForElements("[data-company-id]", siteConfig.companyId);
    setTextForElements("[data-phone-display]", siteConfig.phoneDisplay);
    setTextForElements("[data-address]", siteConfig.address);
    setTextForElements("[data-service-area]", siteConfig.serviceAreaText);
    setTextForElements("[data-footer-text]", siteConfig.footerText);
    setTextForElements("[data-disclaimer]", siteConfig.disclaimer);
    setTextForElements("[data-cookie-text]", siteConfig.cookieNoticeText);
    setTextForElements(
        "[data-legal-last-updated-label]",
        `Last updated: ${siteConfig.legalLastUpdated}`
    );

    const phoneLinks = selectAll("[data-phone-link]");
    phoneLinks.forEach((link) => {
        link.setAttribute("href", siteConfig.phoneHref);

        const icon = link.querySelector("i");
        if (!icon) {
            link.textContent = siteConfig.phoneDisplay;
        }
    });

    const emailLinks = selectAll("[data-email]");
    emailLinks.forEach((link) => {
        link.setAttribute("href", siteConfig.emailHref);

        const span = link.querySelector("span");
        if (span) {
            span.textContent = siteConfig.email;
        } else {
            link.textContent = siteConfig.email;
        }
    });
}

/* =========================
   CURRENT YEAR
========================= */
function setCurrentYear() {
    const yearElement = select("#year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

/* =========================
   STICKY HEADER SCROLL STATE
========================= */
function initHeaderScrollState() {
    const header = select("#siteHeader");
    if (!header) return;

    const toggleScrolledState = () => {
        if (window.scrollY > 14) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    };

    toggleScrolledState();
    window.addEventListener("scroll", toggleScrolledState, { passive: true });
}

/* =========================
   MOBILE MENU
========================= */
function initMobileMenu() {
    const menu = select("#mobileMenu");
    const openButton = select(".mobile-menu-toggle");
    const closeButton = select(".mobile-menu-close");

    if (!menu || !openButton || !closeButton) return;

    const menuLinks = selectAll(".mobile-nav a, .mobile-legal-links a", menu);
    const body = document.body;

    const openMenu = () => {
        menu.classList.add("is-open");
        menu.setAttribute("aria-hidden", "false");
        openButton.setAttribute("aria-expanded", "true");
        body.classList.add("no-scroll");
    };

    const closeMenu = () => {
        menu.classList.remove("is-open");
        menu.setAttribute("aria-hidden", "true");
        openButton.setAttribute("aria-expanded", "false");
        body.classList.remove("no-scroll");
    };

    openButton.addEventListener("click", openMenu);
    closeButton.addEventListener("click", closeMenu);

    menu.addEventListener("click", (event) => {
        if (event.target === menu) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menu.classList.contains("is-open")) {
            closeMenu();
        }
    });

    menuLinks.forEach((link) => {
        link.addEventListener("click", closeMenu);
    });
}

/* =========================
   MOBILE SERVICES SELECT
========================= */
function initMobileServicesSelect() {
    const selectElement = select("#mobileServicesSelect");
    if (!selectElement) return;

    selectElement.addEventListener("change", (event) => {
        const targetUrl = event.target.value?.trim();

        if (!targetUrl) return;
        window.location.href = targetUrl;
    });
}

/* =========================
   COOKIE BANNER
========================= */
function initCookieBanner() {
    const cookieBanner = select("#cookieBanner");
    const acceptButton = select("#acceptCookies");
    const declineButton = select("#declineCookies");

    if (!cookieBanner || !acceptButton || !declineButton) return;

    const storageKey = "pipematch_cookie_choice";
    const existingChoice = localStorage.getItem(storageKey);

    if (!existingChoice) {
        cookieBanner.classList.add("is-visible");
    }

    const saveChoice = (value) => {
        localStorage.setItem(storageKey, value);
        cookieBanner.classList.remove("is-visible");
    };

    acceptButton.addEventListener("click", () => {
        saveChoice("accepted");
    });

    declineButton.addEventListener("click", () => {
        saveChoice("declined");
    });
}

/* =========================
   ACTIVE NAV LINK
========================= */
function setActiveNavLink() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    const desktopLinks = selectAll(".desktop-nav-list a");
    const mobileLinks = selectAll(".mobile-nav-list a");

    [...desktopLinks, ...mobileLinks].forEach((link) => {
        const href = link.getAttribute("href");
        if (href === currentPage) {
            link.classList.add("is-active");
        } else {
            link.classList.remove("is-active");
        }
    });
}

/* =========================
   GENERIC FORM UX
========================= */
function initFormEnhancements() {
    const forms = selectAll("form");
    if (!forms.length) return;

    forms.forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const submitButton = form.querySelector('button[type="submit"]');
            if (!submitButton) return;

            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = "Request Sent";

            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                form.reset();
            }, 1800);
        });
    });
}

/* =========================
   CARD LINK FALLBACKS
========================= */
function initCardLinkFallbacks() {
    const setups = [
        { cardSelector: ".service-card", linkSelector: "a.service-card-link[href]" },
        { cardSelector: ".directory-card", linkSelector: "a.directory-card-link[href]" }
    ];

    setups.forEach(({ cardSelector, linkSelector }) => {
        const cards = selectAll(cardSelector);
        if (!cards.length) return;

        cards.forEach((card) => {
            const link = card.querySelector(linkSelector);
            if (!link) return;

            card.addEventListener("click", (event) => {
                if (event.defaultPrevented) return;
                if (event.target.closest("a")) return;
                if (event.target.closest("button, input, select, textarea, label")) return;
                link.click();
            });
        });
    });
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
    applySiteConfig();
    setCurrentYear();
    initHeaderScrollState();
    initMobileMenu();
    initMobileServicesSelect();
    initCookieBanner();
    setActiveNavLink();
    initFormEnhancements();
    initCardLinkFallbacks();
});
