import { siteConfig } from "./config.js";

const select = (selector, scope = document) => scope.querySelector(selector);
const selectAll = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const setTextForElements = (selector, value) => {
    const elements = selectAll(selector);
    elements.forEach((element) => {
        element.textContent = value;
    });
};

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

function setCurrentYear() {
    const yearElement = select("#year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

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

function initPageLoadFadeIn() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const main = select("main");
    if (!main) return;

    // Fade in on initial load/reload without transform to avoid clashing with other animations.
    main.style.opacity = "0";
    main.style.transition = "opacity 0.75s ease";
    main.style.willChange = "opacity";

    requestAnimationFrame(() => {
        main.style.opacity = "1";
    });
}

function initMobileMenu() {
    const menu = select("#mobileMenu");
    const openButton = select(".mobile-menu-toggle");
    const closeButton = select(".mobile-menu-close");

    if (!menu || !openButton || !closeButton) return;

    const menuLinks = selectAll(".mobile-nav a, .mobile-legal-links a", menu);
    const servicesSelect = select("#mobileServicesSelect", menu);
    const body = document.body;

    const openMenu = () => {
        menu.classList.add("is-open");
        menu.setAttribute("aria-hidden", "false");
        openButton.setAttribute("aria-expanded", "true");
        body.classList.add("no-scroll");
        menu.scrollTop = 0;
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

    if (servicesSelect) {
        servicesSelect.addEventListener("change", () => {
            if (!menu.classList.contains("is-open")) return;
            closeMenu();
        });
    }
}

function initMobileServicesSelect() {
    const selectElement = select("#mobileServicesSelect");
    if (!selectElement) return;
    const dropdownWrap = selectElement.closest(".mobile-services-dropdown");

    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const matchingOption = [...selectElement.options].find((option) => {
        const value = (option.value || "").trim();
        if (!value) return false;
        return value === currentPage;
    });

    if (matchingOption) {
        selectElement.value = matchingOption.value;
    }

    if (dropdownWrap && !select(".mobile-services-hint", dropdownWrap)) {
        const hint = document.createElement("p");
        hint.className = "mobile-services-hint";
        hint.textContent = "Quick jump between service pages";
        dropdownWrap.append(hint);
    }

    selectElement.addEventListener("change", (event) => {
        const targetUrl = event.target.value?.trim();

        if (!targetUrl) return;
        if (targetUrl === currentPage) return;

        // Let native select close first to avoid flicker on iOS/Android before navigation.
        window.requestAnimationFrame(() => {
            window.location.href = targetUrl;
        });
    });
}

function initComparisonGridSlider() {
    const grids = selectAll(".comparison-grid");
    if (!grids.length) return;

    const sliderMediaQuery = window.matchMedia("(max-width: 1024px)");

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    grids.forEach((grid, gridIndex) => {
        const cards = selectAll(".comparison-card", grid);
        if (cards.length < 2) return;

        const sliderId = `comparison-slider-${gridIndex + 1}`;
        grid.dataset.sliderId = sliderId;

        let currentIndex = 0;
        let isTicking = false;

        const controls = document.createElement("div");
        controls.className = "comparison-slider-controls";
        controls.setAttribute("data-comparison-slider", sliderId);

        const nav = document.createElement("div");
        nav.className = "comparison-slider-nav";

        const prevButton = document.createElement("button");
        prevButton.type = "button";
        prevButton.className = "comparison-slider-btn";
        prevButton.setAttribute("aria-label", "Previous comparison card");
        prevButton.textContent = "Prev";

        const nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.className = "comparison-slider-btn";
        nextButton.setAttribute("aria-label", "Next comparison card");
        nextButton.textContent = "Next";

        nav.append(prevButton, nextButton);

        const dots = document.createElement("div");
        dots.className = "comparison-slider-dots";
        dots.setAttribute("role", "tablist");

        const dotButtons = cards.map((_, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "comparison-slider-dot";
            dot.setAttribute("role", "tab");
            dot.setAttribute("aria-label", `Open card ${index + 1}`);
            dot.setAttribute("aria-selected", index === 0 ? "true" : "false");
            dots.append(dot);
            return dot;
        });

        controls.append(nav, dots);
        grid.insertAdjacentElement("afterend", controls);

        const updateActiveState = (index) => {
            currentIndex = clamp(index, 0, cards.length - 1);
            dotButtons.forEach((dot, dotIndex) => {
                const isActive = dotIndex === currentIndex;
                dot.classList.toggle("is-active", isActive);
                dot.setAttribute("aria-selected", isActive ? "true" : "false");
            });

            prevButton.disabled = currentIndex === 0;
            nextButton.disabled = currentIndex === cards.length - 1;
        };

        const scrollToCard = (index, behavior = "smooth") => {
            const safeIndex = clamp(index, 0, cards.length - 1);
            cards[safeIndex].scrollIntoView({
                behavior,
                inline: "start",
                block: "nearest"
            });
            updateActiveState(safeIndex);
        };

        const detectIndexFromScroll = () => {
            const gridLeft = grid.getBoundingClientRect().left;
            let closestIndex = 0;
            let closestDistance = Number.POSITIVE_INFINITY;

            cards.forEach((card, index) => {
                const distance = Math.abs(card.getBoundingClientRect().left - gridLeft);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });

            updateActiveState(closestIndex);
        };

        grid.addEventListener("scroll", () => {
            if (!sliderMediaQuery.matches) return;
            if (isTicking) return;
            isTicking = true;
            requestAnimationFrame(() => {
                detectIndexFromScroll();
                isTicking = false;
            });
        }, { passive: true });

        prevButton.addEventListener("click", () => {
            scrollToCard(currentIndex - 1);
        });

        nextButton.addEventListener("click", () => {
            scrollToCard(currentIndex + 1);
        });

        dotButtons.forEach((dot, dotIndex) => {
            dot.addEventListener("click", () => {
                scrollToCard(dotIndex);
            });
        });

        const applySliderMode = () => {
            const isSlider = sliderMediaQuery.matches;
            grid.classList.toggle("is-comparison-slider", isSlider);
            controls.hidden = !isSlider;

            if (!isSlider) {
                updateActiveState(0);
                return;
            }

            requestAnimationFrame(() => {
                detectIndexFromScroll();
            });
        };

        applySliderMode();
        sliderMediaQuery.addEventListener("change", applySliderMode);
    });
}

function initAboutProcessSlider() {
    const grids = selectAll(".about-process-grid");
    if (!grids.length) return;

    const sliderMediaQuery = window.matchMedia("(max-width: 1024px)");
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    grids.forEach((grid, gridIndex) => {
        const cards = selectAll(".process-card", grid);
        if (cards.length < 2) return;

        const sliderId = `about-process-slider-${gridIndex + 1}`;
        let currentIndex = 0;
        let isTicking = false;

        const controls = document.createElement("div");
        controls.className = "about-process-slider-controls";
        controls.setAttribute("data-about-process-slider", sliderId);

        const nav = document.createElement("div");
        nav.className = "about-process-slider-nav";

        const prevButton = document.createElement("button");
        prevButton.type = "button";
        prevButton.className = "about-process-slider-btn";
        prevButton.setAttribute("aria-label", "Previous process step");
        prevButton.textContent = "Prev";

        const nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.className = "about-process-slider-btn";
        nextButton.setAttribute("aria-label", "Next process step");
        nextButton.textContent = "Next";

        nav.append(prevButton, nextButton);

        const dots = document.createElement("div");
        dots.className = "about-process-slider-dots";
        dots.setAttribute("role", "tablist");

        const dotButtons = cards.map((_, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "about-process-slider-dot";
            dot.setAttribute("role", "tab");
            dot.setAttribute("aria-label", `Open step ${index + 1}`);
            dot.setAttribute("aria-selected", index === 0 ? "true" : "false");
            dots.append(dot);
            return dot;
        });

        controls.append(nav, dots);
        grid.insertAdjacentElement("afterend", controls);

        const updateActiveState = (index) => {
            currentIndex = clamp(index, 0, cards.length - 1);
            dotButtons.forEach((dot, dotIndex) => {
                const isActive = dotIndex === currentIndex;
                dot.classList.toggle("is-active", isActive);
                dot.setAttribute("aria-selected", isActive ? "true" : "false");
            });

            prevButton.disabled = currentIndex === 0;
            nextButton.disabled = currentIndex === cards.length - 1;
        };

        const scrollToCard = (index, behavior = "smooth") => {
            const safeIndex = clamp(index, 0, cards.length - 1);
            cards[safeIndex].scrollIntoView({
                behavior,
                inline: "start",
                block: "nearest"
            });
            updateActiveState(safeIndex);
        };

        const detectIndexFromScroll = () => {
            const gridLeft = grid.getBoundingClientRect().left;
            let closestIndex = 0;
            let closestDistance = Number.POSITIVE_INFINITY;

            cards.forEach((card, index) => {
                const distance = Math.abs(card.getBoundingClientRect().left - gridLeft);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });

            updateActiveState(closestIndex);
        };

        grid.addEventListener(
            "scroll",
            () => {
                if (!sliderMediaQuery.matches) return;
                if (isTicking) return;
                isTicking = true;
                requestAnimationFrame(() => {
                    detectIndexFromScroll();
                    isTicking = false;
                });
            },
            { passive: true }
        );

        prevButton.addEventListener("click", () => {
            scrollToCard(currentIndex - 1);
        });

        nextButton.addEventListener("click", () => {
            scrollToCard(currentIndex + 1);
        });

        dotButtons.forEach((dot, dotIndex) => {
            dot.addEventListener("click", () => {
                scrollToCard(dotIndex);
            });
        });

        const applySliderMode = () => {
            const isSlider = sliderMediaQuery.matches;
            grid.classList.toggle("is-about-process-slider", isSlider);
            controls.hidden = !isSlider;

            if (!isSlider) {
                updateActiveState(0);
                return;
            }

            requestAnimationFrame(() => {
                detectIndexFromScroll();
            });
        };

        applySliderMode();
        sliderMediaQuery.addEventListener("change", applySliderMode);
    });
}

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

function initFormEnhancements() {
    const forms = selectAll("form.compact-form, form.contact-page-form");
    if (!forms.length) return;

    forms.forEach((form) => {
        const submitButton = form.querySelector('button[type="submit"]');
        if (!submitButton) return;
        const phoneInput = form.querySelector('input[type="tel"][name="phone"]');
        const emailInput = form.querySelector('input[type="email"][name="email"]');
        const statusMessage = form.querySelector(".form-status-message");

        const updateFormStatus = (text = "", type = "success") => {
            if (!statusMessage) return;
            statusMessage.textContent = text;
            statusMessage.classList.remove("is-success", "is-error", "is-visible");
            if (!text) return;
            statusMessage.classList.add("is-visible");
            statusMessage.classList.add(type === "error" ? "is-error" : "is-success");
        };

        const validatePhone = () => {
            if (!phoneInput) return;
            const value = phoneInput.value.trim();
            const isValid = /^\+?[0-9()\-\s]{7,20}$/.test(value);
            phoneInput.setCustomValidity(value && !isValid ? "Please enter a valid phone number." : "");
        };

        const validateEmail = () => {
            if (!emailInput) return;
            const value = emailInput.value.trim();
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
            emailInput.setCustomValidity(value && !isValid ? "Please enter a valid email address." : "");
        };

        if (phoneInput) {
            phoneInput.addEventListener("input", validatePhone);
            phoneInput.addEventListener("blur", validatePhone);
        }

        if (emailInput) {
            emailInput.addEventListener("input", validateEmail);
            emailInput.addEventListener("blur", validateEmail);
        }

        form.addEventListener("submit", (event) => {
            event.preventDefault();

            validatePhone();
            validateEmail();

            if (!form.checkValidity()) {
                form.reportValidity();
                updateFormStatus("Please check required fields and try again.", "error");
                return;
            }

            updateFormStatus("");
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = "Request Sent";

            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                form.reset();
                updateFormStatus("Thank you. Your request was sent successfully.");
            }, 1800);
        });
    });
}

function initGlobalRevealAnimations() {
    if (!("IntersectionObserver" in window)) return;

    const revealTargets = selectAll(`
        .section-intro,
        .service-card,
        .directory-card,
        .comparison-card,
        .service-step-card,
        .service-factor-card,
        .service-overview-card,
        .service-visual-card,
        .review-card,
        .legal-section,
        .legal-intro-card,
        .contact-info-card,
        .contact-sidebar-panel,
        .contact-map-wrap,
        .cta-strip
    `);

    if (!revealTargets.length) return;

    revealTargets.forEach((item, index) => {
        item.style.opacity = "0";
        item.style.transform = "translateY(24px)";
        item.style.transition = `opacity 0.65s ease ${Math.min(index * 0.025, 0.22)}s, transform 0.65s ease ${Math.min(index * 0.025, 0.22)}s`;
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

    revealTargets.forEach((item) => observer.observe(item));
}

function initCardLinkFallbacks() {
    const setups = [
        { cardSelector: ".service-card", linkSelector: "a.service-card-link[href]" },
        { cardSelector: ".directory-card", linkSelector: "a.directory-card-link[href]" },
        { cardSelector: "[data-card-href]", linkSelector: "a[href]" }
    ];

    setups.forEach(({ cardSelector, linkSelector }) => {
        const cards = selectAll(cardSelector);
        if (!cards.length) return;

        cards.forEach((card) => {
            const explicitHref = card.getAttribute("data-card-href");
            const link = card.querySelector(linkSelector);

            if (explicitHref && !link && !card.hasAttribute("tabindex")) {
                card.setAttribute("tabindex", "0");
                card.setAttribute("role", "link");
            }

            card.addEventListener("click", (event) => {
                if (event.defaultPrevented) return;
                if (event.target.closest("a")) return;
                if (event.target.closest("button, input, select, textarea, label")) return;

                if (link) {
                    link.click();
                    return;
                }

                if (explicitHref) {
                    window.location.href = explicitHref;
                }
            });

            card.addEventListener("keydown", (event) => {
                if (!explicitHref || link) return;
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                window.location.href = explicitHref;
            });
        });
    });
}

function initHeadingRevealAnimation() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const headings = selectAll(`
        .hero-copy h1,
        .services-hero-copy h1,
        .service-page-hero-copy h1,
        .about-hero-copy h1,
        .contact-hero-copy h1,
        .legal-hero-copy h1,
        .section-intro h2,
        .cta-strip h2
    `);

    if (!headings.length) return;

    headings.forEach((heading, index) => {
        heading.classList.add("title-reveal");
        const delay = Math.min(index * 60, 280);

        window.setTimeout(() => {
            heading.classList.add("is-visible");
        }, delay);
    });
}

function initSmoothFaqAccordions() {
    const items = document.querySelectorAll(".faq-item");

    items.forEach((item) => {
        const btn = item.querySelector(".faq-question");
        const content = item.querySelector(".faq-answer");

        btn.addEventListener("click", () => {
            const isOpen = item.classList.contains("is-open");

            // закрываем все
            items.forEach((i) => {
                if (i === item) return;

                const c = i.querySelector(".faq-answer");
                i.classList.remove("is-open");
                c.style.height = "0px";
            });

            if (isOpen) {
                content.style.height = content.scrollHeight + "px";

                requestAnimationFrame(() => {
                    content.style.height = "0px";
                });

                item.classList.remove("is-open");
                return;
            }

            item.classList.add("is-open");

            content.style.height = "0px";

            requestAnimationFrame(() => {
                content.style.height = content.scrollHeight + "px";
            });
        });

        content.addEventListener("transitionend", () => {
            if (item.classList.contains("is-open")) {
                content.style.height = "auto";
            }
        });
    });
}



document.addEventListener("DOMContentLoaded", () => {
    applySiteConfig();
    setCurrentYear();
    initHeaderScrollState();
    initPageLoadFadeIn();
    initMobileMenu();
    initMobileServicesSelect();
    initCookieBanner();
    setActiveNavLink();
    initFormEnhancements();
    initCardLinkFallbacks();
    initGlobalRevealAnimations();
    initHeadingRevealAnimation();
    initSmoothFaqAccordions();
    initComparisonGridSlider();
    initAboutProcessSlider();
});
