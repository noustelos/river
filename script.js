const LANG_STORAGE_KEY = "vouraikos-lang";
const CONSENT_STORAGE_KEY = "vouraikos-cookie-consent";

function getSupportedLang(lang) {
  return lang === "en" ? "en" : "el";
}

function updateLocalizedLabels(lang) {
  const nextLang = getSupportedLang(lang);
  const siteHeader = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const langSwitcher = document.querySelector(".lang-switcher");
  const lightbox = document.querySelector("#gallery-lightbox");
  const lightboxClose = document.querySelector(".lightbox-close");
  const lightboxPrev = document.querySelector(".lightbox-nav-prev");
  const lightboxNext = document.querySelector(".lightbox-nav-next");
  const galleryViewAll = document.querySelector(".gallery-view-all");
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

    if (typeof temperature !== "number") {
      throw new Error("Invalid temperature payload");
    }

    temperatureEl.textContent = `${Math.round(temperature)}°C`;
  } catch (error) {
    temperatureEl.textContent = "--°C";
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
    cookieBanner.setAttribute("aria-hidden", "true");
  };

  const showCookieBanner = () => {
    if (!cookieBanner) {
      return;
    }

    cookieBanner.hidden = false;
    cookieBanner.setAttribute("aria-hidden", "false");
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
        if (window.matchMedia("(max-width: 900px)").matches) {
          closeMobileNav();
        }
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        closeMobileNav();
      }
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

      window.addEventListener("scroll", updateActiveFromViewport, { passive: true });
      window.addEventListener("resize", updateActiveFromViewport);

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

  const closeLightbox = () => {
    if (!lightbox || !lightboxImage) {
      return;
    }

    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
    lightboxImage.alt = "";
    if (lightboxStatus) {
      lightboxStatus.textContent = "";
      lightboxStatus.removeAttribute("aria-label");
    }
    currentImageIndex = -1;
    document.body.style.overflow = "";

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }

    lastFocusedElement = null;
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
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    trackEvent("gallery_open", { source, index: imageIndex + 1 });

    window.requestAnimationFrame(() => {
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

      panel.style.setProperty("--panel-image", `url('${panelImage}')`);
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
    const isIPadOS = /iPad/.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)");
    const phoneLikeViewport = window.matchMedia("(max-width: 500px), (max-height: 500px)");
    let rafId = 0;

    if (isIPadOS) {
      document.documentElement.classList.add("is-ipados");
    }

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
        const amplitude = panel.classList.contains("scroll-panel-caption") ? 160 : 220;
        const shift = Math.max(-180, Math.min(180, centerDelta * speed * amplitude));
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
});