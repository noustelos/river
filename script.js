const LANG_STORAGE_KEY = "vouraikos-lang";
const CONSENT_STORAGE_KEY = "vouraikos-cookie-consent";
const MOBILE_BREAKPOINT = 900;
const PARALLAX_AMPLITUDE_DEFAULT = 220;
const PARALLAX_AMPLITUDE_CAPTION = 160;
const PARALLAX_SHIFT_LIMIT = 180;

function getSupportedLang(lang) {
  return lang === "en" ? "en" : "el";
}

const _labelEls = {};

function _getLabelEl(key, selector) {
  if (!(key in _labelEls)) {
    _labelEls[key] = document.querySelector(selector);
  }
  return _labelEls[key];
}

function updateLocalizedLabels(lang) {
  const nextLang = getSupportedLang(lang);
  const siteHeader = _getLabelEl("siteHeader", ".site-header");
  const navToggle = _getLabelEl("navToggle", ".nav-toggle");
  const langSwitcher = _getLabelEl("langSwitcher", ".lang-switcher");
  const lightbox = _getLabelEl("lightbox", "#gallery-lightbox");
  const lightboxClose = _getLabelEl("lightboxClose", ".lightbox-close");
  const lightboxPrev = _getLabelEl("lightboxPrev", ".lightbox-nav-prev");
  const lightboxNext = _getLabelEl("lightboxNext", ".lightbox-nav-next");
  const galleryViewAll = _getLabelEl("galleryViewAll", ".gallery-view-all");
  const navIsOpen = siteHeader?.classList.contains("is-nav-open");

  if (langSwitcher) {
    langSwitcher.setAttribute("aria-label", nextLang === "el" ? "Επιλογή γλώσσας" : "Language switcher");
  }

  const siteNav = document.querySelector("#site-nav");

  if (siteNav) {
    siteNav.setAttribute("aria-label", nextLang === "el" ? "Κύρια πλοήγηση" : "Main navigation");
  }

  if (navToggle) {
    navToggle.setAttribute(
      "aria-label",
      nextLang === "el"
        ? (navIsOpen ? "Κλείσιμο πλοήγησης" : "Άνοιγμα πλοήγησης")
        : (navIsOpen ? "Close navigation" : "Open navigation")
    );
  }

  if (lightbox) {
    lightbox.setAttribute("aria-label", nextLang === "el" ? "Προβολή φωτογραφιών" : "Photo viewer");
  }

  if (lightboxClose) {
    lightboxClose.setAttribute("aria-label", nextLang === "el" ? "Κλείσιμο προβολής" : "Close viewer");
  }

  if (lightboxPrev) {
    lightboxPrev.setAttribute("aria-label", nextLang === "el" ? "Προηγούμενη φωτογραφία" : "Previous photo");
  }

  if (lightboxNext) {
    lightboxNext.setAttribute("aria-label", nextLang === "el" ? "Επόμενη φωτογραφία" : "Next photo");
  }

  if (galleryViewAll) {
    galleryViewAll.setAttribute("aria-label", nextLang === "el" ? "Δείτε όλες τις φωτογραφίες" : "View all photos");
  }
}

function setLang(lang, options = {}) {
  const nextLang = getSupportedLang(lang);
  document.documentElement.lang = nextLang;

  document.querySelectorAll(".lang-switcher button").forEach((button) => {
    const isActive = button.dataset.lang === nextLang;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (options.persist !== false) {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, nextLang);
    } catch (error) {
      // Ignore storage failures and keep the selected language only in-memory.
    }
  }

  if (options.syncUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", nextLang);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  updateLocalizedLabels(nextLang);
}

function trackEvent(eventName, detail = {}) {
  const payload = {
    event: eventName,
    lang: getSupportedLang(document.documentElement.lang),
    ...detail
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  document.dispatchEvent(new CustomEvent("site:analytics", { detail: payload }));
}

async function updateGorgeTemperature() {
  const temperatureEl = document.querySelector("#hero-weather-temp");

  if (!temperatureEl) {
    return;
  }

  const endpoint = "https://api.open-meteo.com/v1/forecast?latitude=38.2039&longitude=22.1891&current=temperature_2m&timezone=auto";

  try {
    const response = await fetch(endpoint, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Weather request failed");
    }

    const data = await response.json();
    const temperature = data?.current?.temperature_2m;

    if (!Number.isFinite(temperature)) {
      throw new Error("Invalid temperature payload");
    }

    temperatureEl.textContent = `${Math.round(temperature)}°C`;
    temperatureEl.classList.remove("is-loading");
  } catch (error) {
    temperatureEl.textContent = "--°C";
    temperatureEl.classList.remove("is-loading");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const siteHeader = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const gallery = document.querySelector(".gallery");
  const galleryOpenTriggers = Array.from(document.querySelectorAll("[data-lightbox-open]"));
  const gallerySourceNodes = Array.from(document.querySelectorAll(".gallery-lightbox-sources [data-lightbox-src]"));
  const trackedElements = Array.from(document.querySelectorAll("[data-track]"));
  const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const lightbox = document.querySelector("#gallery-lightbox");
  const lightboxImage = document.querySelector(".lightbox-image");
  const lightboxStatus = document.querySelector(".lightbox-status");
  const lightboxClose = document.querySelector(".lightbox-close");
  const lightboxPrev = document.querySelector(".lightbox-nav-prev");
  const lightboxNext = document.querySelector(".lightbox-nav-next");
  const drawerLinks = Array.from(document.querySelectorAll(".route-more[data-drawer-target]"));
  const cookieBanner = document.getElementById("cookie-consent");
  const cookieAcceptButton = document.getElementById("cookie-accept");
  const cookieRejectButton = document.getElementById("cookie-reject");
  const openCookieSettingsButton = document.getElementById("open-cookie-settings");
  const obfuscatedEmailLink = document.getElementById("contact-email-link");
  const contactForm = document.getElementById("contact-form");
  const contactFormStatus = document.getElementById("contact-form-status");
  const copyrightYear = document.getElementById("copyright-year");
  const copyrightYearEn = document.getElementById("copyright-year-en");
  let galleryImages = [];
  let currentImageIndex = -1;
  let lastFocusedElement = null;

  const setCookieConsent = (value) => {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
    } catch (error) {
      // Ignore storage failures for privacy-state persistence.
    }
  };

  const getCookieConsent = () => {
    try {
      return window.localStorage.getItem(CONSENT_STORAGE_KEY);
    } catch (error) {
      return null;
    }
  };

  const hideCookieBanner = () => {
    if (!cookieBanner) {
      return;
    }

    cookieBanner.hidden = true;
  };

  const showCookieBanner = () => {
    if (!cookieBanner) {
      return;
    }

    cookieBanner.hidden = false;
  };

  const closeMobileNav = () => {
    if (!siteHeader || !navToggle) {
      return;
    }

    siteHeader.classList.remove("is-nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    updateLocalizedLabels(document.documentElement.lang);
  };

  if (siteHeader && navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteHeader.classList.toggle("is-nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      updateLocalizedLabels(document.documentElement.lang);
    });

    document.querySelectorAll(".site-header nav a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches) {
          closeMobileNav();
        }
      });
    });

    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > MOBILE_BREAKPOINT) {
          closeMobileNav();
        }
      }, 200);
    });
  }

  const navSectionLinks = Array.from(document.querySelectorAll(".site-header nav a[href^='#']"));

  if (navSectionLinks.length) {
    const sectionToLink = new Map();

    navSectionLinks.forEach((link) => {
      const targetId = link.getAttribute("href")?.slice(1);

      if (!targetId) {
        return;
      }

      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        sectionToLink.set(targetSection.id, link);
      }
    });

    let activeSectionId = "";

    const setActiveNavLink = (sectionId) => {
      if (!sectionId || sectionId === activeSectionId) {
        return;
      }

      activeSectionId = sectionId;
      navSectionLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${sectionId}`;
        link.classList.toggle("is-current", isCurrent);

        if (isCurrent) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const sectionIds = Array.from(sectionToLink.keys());

    if (sectionIds.length) {
      const getBestVisibleSection = () => {
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const headerOffset = siteHeader?.offsetHeight || 0;
        const focusLine = Math.min(viewportHeight * 0.42, headerOffset + viewportHeight * 0.2);
        let bestId = "";
        let bestDistance = Number.POSITIVE_INFINITY;

        sectionIds.forEach((sectionId) => {
          const section = document.getElementById(sectionId);

          if (!section) {
            return;
          }

          const rect = section.getBoundingClientRect();

          if (rect.bottom <= headerOffset || rect.top >= viewportHeight) {
            return;
          }

          const distance = Math.abs(rect.top - focusLine);

          if (distance < bestDistance) {
            bestDistance = distance;
            bestId = sectionId;
          }
        });

        return bestId;
      };

      const updateActiveFromViewport = () => {
        const visibleSectionId = getBestVisibleSection();

        if (visibleSectionId) {
          setActiveNavLink(visibleSectionId);
        }
      };

      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          () => {
            updateActiveFromViewport();
          },
          {
            threshold: [0.1, 0.25, 0.5, 0.75],
            rootMargin: "-20% 0px -55% 0px"
          }
        );

        sectionIds.forEach((sectionId) => {
          const section = document.getElementById(sectionId);

          if (section) {
            observer.observe(section);
          }
        });
      }

      let navRafId = 0;
      const requestNavUpdate = () => {
        if (!navRafId) {
          navRafId = requestAnimationFrame(() => {
            navRafId = 0;
            updateActiveFromViewport();
          });
        }
      };
      window.addEventListener("scroll", requestNavUpdate, { passive: true });
      window.addEventListener("resize", requestNavUpdate);

      navSectionLinks.forEach((link) => {
        link.addEventListener("click", () => {
          const sectionId = link.getAttribute("href")?.slice(1);

          if (sectionId) {
            setActiveNavLink(sectionId);
          }
        });
      });

      updateActiveFromViewport();
    }
  }

  document.querySelectorAll(".lang-switcher button").forEach((button) => {
    button.addEventListener("click", () => {
      trackEvent("language_change", { target: button.dataset.lang || "el" });
      setLang(button.dataset.lang, { syncUrl: true });
    });
  });

  trackedElements.forEach((element) => {
    element.addEventListener("click", () => {
      trackEvent("ui_click", {
        target: element.dataset.track || "unknown",
        href: element.getAttribute("href") || "",
        component: element.className || element.tagName.toLowerCase()
      });
    });
  });

  const updateLightboxStatus = () => {
    if (!lightboxStatus || currentImageIndex === -1 || !galleryImages.length) {
      return;
    }

    const lang = getSupportedLang(document.documentElement.lang);
    const currentLabel = currentImageIndex + 1;
    const totalLabel = galleryImages.length;

    lightboxStatus.textContent = `${currentLabel} / ${totalLabel}`;
    lightboxStatus.setAttribute(
      "aria-label",
      lang === "el"
        ? `Φωτογραφία ${currentLabel} από ${totalLabel}`
        : `Photo ${currentLabel} of ${totalLabel}`
    );
  };

  const getLightboxFocusableElements = () => {
    if (!lightbox) {
      return [];
    }

    return Array.from(
      lightbox.querySelectorAll("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])")
    ).filter((element) => !element.hasAttribute("hidden"));
  };

  let savedScrollY = 0;

  const closeLightbox = () => {
    if (!lightbox) {
      return;
    }

    lightbox.classList.remove("is-active");

    const finishClose = () => {
      lightbox.hidden = true;
      lightboxImage.src = "";
      lightboxImage.alt = "";
      if (lightboxStatus) {
        lightboxStatus.textContent = "";
        lightboxStatus.removeAttribute("aria-label");
      }
      currentImageIndex = -1;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, savedScrollY);

      if (lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus();
      }

      lastFocusedElement = null;
    };

    if (reducedMotionPreference.matches) {
      finishClose();
    } else {
      var closeTimer = setTimeout(finishClose, 400);
      lightbox.addEventListener("transitionend", function () {
        clearTimeout(closeTimer);
        finishClose();
      }, { once: true });
    }
  };

  const showLightboxImage = (nextIndex) => {
    if (!galleryImages.length || !lightboxImage) {
      return;
    }

    const total = galleryImages.length;
    currentImageIndex = (nextIndex + total) % total;
    const selectedImage = galleryImages[currentImageIndex];

    lightboxImage.src = selectedImage.src;
    lightboxImage.alt = selectedImage.alt;
    updateLightboxStatus();
  };

  const openLightboxAt = (imageIndex, source = "gallery") => {
    if (!lightbox || !galleryImages.length) {
      return;
    }

    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    showLightboxImage(imageIndex);
    lightbox.hidden = false;
    savedScrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    trackEvent("gallery_open", { source, index: imageIndex + 1 });

    window.requestAnimationFrame(() => {
      lightbox.classList.add("is-active");
      lightboxClose?.focus();
    });
  };

  if (lightbox && lightboxImage && lightboxClose && lightboxPrev && lightboxNext) {
    galleryImages = gallerySourceNodes.map((node) => ({
      src: node.dataset.lightboxSrc,
      alt: node.dataset.lightboxAlt || ""
    })).filter((image) => image.src);

    if (gallery) {
      gallery.addEventListener("click", (event) => {
        const trigger = event.target.closest("[data-lightbox-index]");

        if (!trigger) {
          return;
        }

        const imageIndex = Number.parseInt(trigger.dataset.lightboxIndex || "0", 10);

        if (Number.isNaN(imageIndex)) {
          return;
        }

        openLightboxAt(imageIndex, "gallery_card");
      });
    }

    galleryOpenTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const imageIndex = Number.parseInt(trigger.dataset.lightboxOpen || "0", 10);

        if (Number.isNaN(imageIndex)) {
          return;
        }

        openLightboxAt(imageIndex, trigger.dataset.track || "gallery_trigger");
      });
    });

    lightboxClose.addEventListener("click", closeLightbox);

    lightboxPrev.addEventListener("click", () => {
      if (currentImageIndex !== -1) {
        showLightboxImage(currentImageIndex - 1);
      }
    });

    lightboxNext.addEventListener("click", () => {
      if (currentImageIndex !== -1) {
        showLightboxImage(currentImageIndex + 1);
      }
    });

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (lightbox.hidden) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (event.key === "Tab") {
        const focusableElements = getLightboxFocusableElements();

        if (!focusableElements.length) {
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;

        if (event.shiftKey && (activeElement === firstElement || !lightbox.contains(activeElement))) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }

        return;
      }

      if (event.key === "ArrowLeft" && currentImageIndex !== -1) {
        showLightboxImage(currentImageIndex - 1);
      }

      if (event.key === "ArrowRight" && currentImageIndex !== -1) {
        showLightboxImage(currentImageIndex + 1);
      }
    });
  }

  if (drawerLinks.length) {
    drawerLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.dataset.drawerTarget;

        if (!targetId) {
          return;
        }

        const targetDrawer = document.getElementById(targetId);

        if (!targetDrawer) {
          return;
        }

        event.preventDefault();
        targetDrawer.open = true;
        trackEvent("drawer_open", { target: targetId });
        targetDrawer.scrollIntoView({
          behavior: reducedMotionPreference.matches ? "auto" : "smooth",
          block: "start"
        });
      });
    });
  }

  if (cookieAcceptButton) {
    cookieAcceptButton.addEventListener("click", () => {
      setCookieConsent("accepted");
      hideCookieBanner();
    });
  }

  if (cookieRejectButton) {
    cookieRejectButton.addEventListener("click", () => {
      setCookieConsent("essential");
      hideCookieBanner();
    });
  }

  if (openCookieSettingsButton) {
    openCookieSettingsButton.addEventListener("click", () => {
      showCookieBanner();
    });
  }

  if (!getCookieConsent()) {
    showCookieBanner();
  }

  if (obfuscatedEmailLink) {
    const user = obfuscatedEmailLink.dataset.user || "";
    const domainName = obfuscatedEmailLink.dataset.domainName || "";
    const domainTld = obfuscatedEmailLink.dataset.domainTld || "";
    const email = `${user}@${domainName}.${domainTld}`;

    if (user && domainName && domainTld) {
      obfuscatedEmailLink.href = `mailto:${email}`;
      obfuscatedEmailLink.textContent = email;
      obfuscatedEmailLink.setAttribute("aria-label", email);
    }
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const honeypot = String(formData.get("company") || "").trim();

      // If the hidden field is filled, silently stop to reduce bot spam.
      if (honeypot) {
        return;
      }

      const name = String(formData.get("name") || "").trim();
      const message = String(formData.get("message") || "").trim();
      const emailTarget = obfuscatedEmailLink?.getAttribute("href") || "mailto:info@noustelos.gr";

      if (!name || !message) {
        return;
      }

      const subject = encodeURIComponent(`Website contact from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\n\nMessage:\n${message}`);
      window.location.href = `${emailTarget}?subject=${subject}&body=${body}`;

      if (contactFormStatus) {
        const lang = getSupportedLang(document.documentElement.lang);
        contactFormStatus.textContent = lang === "el"
          ? "Ευχαριστούμε! Το mail client άνοιξε με το μήνυμά σας."
          : "Thank you! Your email client has opened with your message.";
        contactFormStatus.hidden = false;
        contactForm.reset();
      }
    });
  }

  const currentYear = new Date().getFullYear();
  if (copyrightYear) {
    copyrightYear.textContent = String(currentYear);
  }
  if (copyrightYearEn) {
    copyrightYearEn.textContent = String(currentYear);
  }

  const lazyScrollPanels = Array.from(document.querySelectorAll(".scroll-panel[data-panel-image]"));

  if (lazyScrollPanels.length) {
    const applyPanelImage = (panel) => {
      const panelImage = panel.dataset.panelImage;

      if (!panelImage || panel.dataset.panelLoaded === "true") {
        return;
      }

      const sanitizedUrl = panelImage.replace(/['")]/g, "");
      panel.style.setProperty("--panel-image", `url('${sanitizedUrl}')`);
      panel.dataset.panelLoaded = "true";
    };

    if ("IntersectionObserver" in window) {
      const panelObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            applyPanelImage(entry.target);
            observer.unobserve(entry.target);
          });
        },
        {
          rootMargin: "300px 0px"
        }
      );

      lazyScrollPanels.forEach((panel) => {
        panelObserver.observe(panel);
      });
    } else {
      lazyScrollPanels.forEach(applyPanelImage);
    }
  }

  const parallaxPanels = Array.from(document.querySelectorAll(".scroll-panel-gorge-parallax")).map((panel) => {
    const media = panel.querySelector(".scroll-panel-media");
    const speed = Number(panel.dataset.parallaxSpeed || "0");

    if (!media || Number.isNaN(speed)) {
      return null;
    }

    return { panel, media, speed };
  }).filter(Boolean);

  if (parallaxPanels.length) {
    const userAgent = navigator.userAgent || "";
    const isIPadOS = document.documentElement.classList.contains("is-ipados");
    const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)");
    const phoneLikeViewport = window.matchMedia("(max-width: 500px), (max-height: 500px)");
    let rafId = 0;

    const bindMediaChange = (query, handler) => {
      query.addEventListener("change", handler);
    };

    const resetParallax = () => {
      parallaxPanels.forEach(({ panel, media }) => {
        const stage = media.closest(".scroll-panel-stage");
        media.style.setProperty("--parallax-shift", "0px");

        if (isIPadOS || panel.classList.contains("scroll-panel-vertical-reveal")) {
          media.style.setProperty("--parallax-position-y", "50%");

          if (stage) {
            stage.style.setProperty("--parallax-position-y", "50%");
          }
        }
      });
    };

    const shouldRunParallax = () => {
      const isIPhoneLike = /iPhone|iPod/.test(userAgent)
        || (coarsePointer.matches && phoneLikeViewport.matches && !isIPadOS);

      // Keep parallax enabled only on desktop-class devices.
      return !isIPhoneLike && !isIPadOS && !reducedMotionPreference.matches;
    };

    const updateParallax = () => {
      rafId = 0;

      if (!shouldRunParallax()) {
        resetParallax();
        return;
      }

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      parallaxPanels.forEach(({ panel, media, speed }) => {
        const stage = media.closest(".scroll-panel-stage");

        if (!stage) {
          return;
        }

        const rect = stage.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewportHeight) {
          return;
        }

        if (panel.classList.contains("scroll-panel-vertical-reveal")) {
          const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
          const positionY = 8 + progress * 84;
          media.style.setProperty("--parallax-position-y", `${positionY.toFixed(2)}%`);
          return;
        }

        if (isIPadOS) {
          const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
          const positionY = 25 + progress * 50;
          const y = `${positionY.toFixed(2)}%`;
          media.style.setProperty("--parallax-position-y", y);
          stage.style.setProperty("--parallax-position-y", y);
          return;
        }

        const centerDelta = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
        const amplitude = panel.classList.contains("scroll-panel-caption") ? PARALLAX_AMPLITUDE_CAPTION : PARALLAX_AMPLITUDE_DEFAULT;
        const shift = Math.max(-PARALLAX_SHIFT_LIMIT, Math.min(PARALLAX_SHIFT_LIMIT, centerDelta * speed * amplitude));
        media.style.setProperty("--parallax-shift", `${shift.toFixed(1)}px`);
      });
    };

    const requestParallaxUpdate = () => {
      if (rafId) {
        return;
      }

      rafId = window.requestAnimationFrame(updateParallax);
    };

    window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
    window.addEventListener("resize", requestParallaxUpdate);
    bindMediaChange(coarsePointer, requestParallaxUpdate);
    bindMediaChange(phoneLikeViewport, requestParallaxUpdate);
    bindMediaChange(reducedMotionPreference, requestParallaxUpdate);
    requestParallaxUpdate();
  }

  setLang(document.documentElement.lang || "el", { syncUrl: false });
  updateGorgeTemperature();

  /* ── Planner progressive disclosure ── */
  const plannerToggle = document.getElementById("planner-toggle");
  const plannerDetails = document.getElementById("planner-details");
  if (plannerToggle && plannerDetails) {
    plannerToggle.addEventListener("click", function () {
      const open = plannerDetails.classList.toggle("is-open");
      plannerDetails.hidden = !open;
      plannerToggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* ── Back-to-top button ── */
  const backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    const heroSection = document.querySelector(".hero");
    if (heroSection) {
      const heroObs = new IntersectionObserver(function (entries) {
        backToTop.hidden = false;
        backToTop.classList.toggle("is-visible", !entries[0].isIntersecting);
      }, { threshold: 0 });
      heroObs.observe(heroSection);
    }
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ── B: Scroll progress bar ── */
  const scrollProgressBar = document.getElementById("scroll-progress");
  if (scrollProgressBar) {
    let progressTicking = false;
    window.addEventListener("scroll", function () {
      if (!progressTicking) {
        window.requestAnimationFrame(function () {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
          scrollProgressBar.style.width = pct + "%";
          progressTicking = false;
        });
        progressTicking = true;
      }
    }, { passive: true });
  }

  /* ── A + G: Scroll-reveal with stagger ── */
  if (!reducedMotionPreference.matches) {
    const srSelectors = [
      ".section-heading",
      ".planner-card",
      ".route-card",
      ".planner-signal-bar",
      ".planner-actions",
      ".info-drawer",
      ".gallery-actions",
      ".map-heading",
      ".credits-section"
    ];
    const srElements = document.querySelectorAll(srSelectors.join(","));
    srElements.forEach(function (el) { el.classList.add("sr"); });

    /* G: Gallery cards with stagger delay */
    const galleryCards = document.querySelectorAll(".gallery-card");
    galleryCards.forEach(function (card, i) {
      card.classList.add("sr");
      card.style.setProperty("--sr-d", (i * 80) + "ms");
    });

    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(".sr").forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ── D: Image blur-up loading ── */
  const lazyImages = document.querySelectorAll(".gallery-card img[loading='lazy']");
  lazyImages.forEach(function (img) {
    const parent = img.closest(".gallery-card picture") || img.closest(".gallery-card");
    if (parent) {
      parent.classList.add("lazy-panel");
    }
    if (img.complete && img.naturalWidth > 0) {
      if (parent) { parent.classList.add("is-loaded"); }
    } else {
      img.addEventListener("load", function () {
        if (parent) { parent.classList.add("is-loaded"); }
      }, { once: true });
    }
  });

  /* ── F: Animated stat counters ── */
  const countUp = function (el, target, suffix, duration) {
    const startTime = performance.now();
    const update = function (now) {
      const progress = Math.min((now - startTime) / duration, 1);
      /* Ease-out cubic */
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(update);
      } else {
        el.classList.add("is-counted");
      }
    };
    window.requestAnimationFrame(update);
  };

  const statEls = document.querySelectorAll(".meta-item strong:not(#hero-weather-temp)");
  if (statEls.length && !reducedMotionPreference.matches) {
    const statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        const el = entry.target;
        const raw = el.textContent.trim();
        /* Match patterns like "20 km", "750m - 1200m" */
        const match = raw.match(/^(\d+)\s*(km|m)/);
        if (match) {
          const target = parseInt(match[1], 10);
          const suffix = " " + match[2];
          /* Preserve the rest of the text (e.g. " - 1200m") */
          const remaining = raw.slice(match[0].length);
          countUp(el, target, suffix + remaining, 1200);
        }
        statObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    statEls.forEach(function (el) { statObserver.observe(el); });
  }

  /* ── C: Drawer smooth open/close ── */
  document.querySelectorAll(".info-drawer").forEach(function (drawer) {
    drawer.addEventListener("click", function (e) {
      if (!e.target.closest("summary")) { return; }
      if (!drawer.open) {
        /* Opening — let browser handle, CSS grid transition handles animation */
        return;
      }
      /* Closing — animate first, then close */
      e.preventDefault();
      const content = drawer.querySelector(".drawer-content, .pausanias-drawer-content, .traveller-drawer");
      if (!content) { drawer.open = false; return; }
      content.style.gridTemplateRows = "0fr";
      content.style.opacity = "0";
      content.addEventListener("transitionend", function handler() {
        content.removeEventListener("transitionend", handler);
        drawer.open = false;
        content.style.gridTemplateRows = "";
        content.style.opacity = "";
      }, { once: true });
      /* Fallback */
      setTimeout(function () { if (drawer.open) { drawer.open = false; content.style.gridTemplateRows = ""; content.style.opacity = ""; } }, 400);
    });
  });

  /* ── Hero scroll parallax ── */
  if (!reducedMotionPreference.matches) {
    const heroEl = document.querySelector(".hero");
    const heroBackdropImg = document.querySelector(".hero-backdrop img");
    if (heroEl && heroBackdropImg) {
      let heroTicking = false;
      const updateHeroParallax = function () {
        const scrollY = window.scrollY;
        const heroH = heroEl.offsetHeight;
        /* Toggle parallax class so Ken Burns plays when at top */
        if (scrollY > 5) {
          heroEl.classList.add("has-parallax");
        } else if (scrollY < 1) {
          heroEl.classList.remove("has-parallax");
        }
        if (scrollY > heroH * 1.2) { heroTicking = false; return; }
        /* Translate image down as user scrolls, creating depth */
        const shift = scrollY * 0.35;
        /* Subtle zoom increase as scrolling past */
        const scale = 1 + scrollY * 0.00012;
        heroBackdropImg.style.setProperty("--hero-parallax-y", shift.toFixed(1) + "px");
        heroBackdropImg.style.setProperty("--hero-scale", scale.toFixed(4));
        heroTicking = false;
      };
      window.addEventListener("scroll", function () {
        if (!heroTicking) {
          window.requestAnimationFrame(updateHeroParallax);
          heroTicking = true;
        }
      }, { passive: true });
    }
  }

  /* ── Content image reveal on scroll ── */
  if (!reducedMotionPreference.matches) {
    const contentImages = document.querySelectorAll(".story-media img, .time-card img, .supporting-visual img");
    contentImages.forEach(function (img) {
      img.classList.add("img-reveal");
    });
    const imgRevealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          imgRevealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -30px 0px" });
    contentImages.forEach(function (img) { imgRevealObs.observe(img); });
  }

  /* ── Mobile-fold: collapsible sections on mobile ── */
  const isMobileView = window.matchMedia("(max-width: " + MOBILE_BREAKPOINT + "px)");

  function initMobileFolds() {
    /* Always-visible folds work at any viewport */
    document.querySelectorAll("[data-fold-always]").forEach(function (foldContent) {
      if (foldContent.dataset.foldInit) { return; }
      foldContent.dataset.foldInit = "true";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mobile-fold-toggle always-fold-btn";
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = "<span lang=\"el\">" + (foldContent.dataset.foldLabelEl || "Περισσότερα") + "</span><span lang=\"en\">" + (foldContent.dataset.foldLabelEn || "More") + "</span>";
      foldContent.parentNode.insertBefore(btn, foldContent);
      btn.addEventListener("click", function () {
        var expanded = foldContent.classList.toggle("is-expanded");
        btn.classList.toggle("is-expanded", expanded);
        btn.setAttribute("aria-expanded", String(expanded));
        btn.innerHTML = expanded
          ? "<span lang=\"el\">" + (foldContent.dataset.foldCloseEl || "Λιγότερα") + "</span><span lang=\"en\">" + (foldContent.dataset.foldCloseEn || "Less") + "</span>"
          : "<span lang=\"el\">" + (foldContent.dataset.foldLabelEl || "Περισσότερα") + "</span><span lang=\"en\">" + (foldContent.dataset.foldLabelEn || "More") + "</span>";
        if (!expanded) {
          var rect = (btn.closest(".planner-compare") || btn.parentNode);
          if (rect) { rect.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
        }
      });
    });

    if (!isMobileView.matches) { return; }

    /* Mobile-only fold sections */
    document.querySelectorAll("[data-mobile-fold]:not([data-fold-always])").forEach(function (foldContent) {
      if (foldContent.dataset.foldInit) { return; }
      foldContent.dataset.foldInit = "true";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mobile-fold-toggle";
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = "<span lang=\"el\">" + (foldContent.dataset.foldLabelEl || "Περισσότερα") + "</span><span lang=\"en\">" + (foldContent.dataset.foldLabelEn || "More") + "</span>";
      foldContent.parentNode.insertBefore(btn, foldContent);
      btn.addEventListener("click", function () {
        var expanded = foldContent.classList.toggle("is-expanded");
        btn.classList.toggle("is-expanded", expanded);
        btn.setAttribute("aria-expanded", String(expanded));
        btn.innerHTML = expanded
          ? "<span lang=\"el\">" + (foldContent.dataset.foldCloseEl || "Λιγότερα") + "</span><span lang=\"en\">" + (foldContent.dataset.foldCloseEn || "Less") + "</span>"
          : "<span lang=\"el\">" + (foldContent.dataset.foldLabelEl || "Περισσότερα") + "</span><span lang=\"en\">" + (foldContent.dataset.foldLabelEn || "More") + "</span>";
        if (!expanded) {
          var rect = (btn.closest(".planner-compare") || btn.closest(".experiences-guide") || btn.parentNode);
          if (rect) { rect.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
        }
      });
    });

    /* Route grid: show 2, fold rest */
    document.querySelectorAll("[data-mobile-fold-grid]").forEach(function (grid) {
      if (grid.dataset.foldInit) { return; }
      grid.dataset.foldInit = "true";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "route-grid-toggle";
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = "<span lang=\"el\">" + (grid.dataset.foldLabelEl || "Περισσότερα") + "</span><span lang=\"en\">" + (grid.dataset.foldLabelEn || "More") + "</span>";
      grid.parentNode.insertBefore(btn, grid.nextSibling);
      btn.addEventListener("click", function () {
        var expanded = grid.classList.toggle("is-expanded");
        btn.classList.toggle("is-expanded", expanded);
        btn.setAttribute("aria-expanded", String(expanded));
        btn.innerHTML = expanded
          ? "<span lang=\"el\">" + (grid.dataset.foldCloseEl || "Λιγότερα") + "</span><span lang=\"en\">" + (grid.dataset.foldCloseEn || "Less") + "</span>"
          : "<span lang=\"el\">" + (grid.dataset.foldLabelEl || "Περισσότερα") + "</span><span lang=\"en\">" + (grid.dataset.foldLabelEn || "More") + "</span>";
        if (!expanded) {
          grid.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    });
  }

  initMobileFolds();
});