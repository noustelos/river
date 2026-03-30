function setLang(lang) {
  document.documentElement.lang = lang;

  document.querySelectorAll(".lang-switcher button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });
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
  const lightbox = document.querySelector("#gallery-lightbox");
  const lightboxImage = document.querySelector(".lightbox-image");
  const lightboxClose = document.querySelector(".lightbox-close");
  const lightboxPrev = document.querySelector(".lightbox-nav-prev");
  const lightboxNext = document.querySelector(".lightbox-nav-next");
  const drawerLinks = Array.from(document.querySelectorAll(".route-more[data-drawer-target]"));
  let galleryImages = [];
  let currentImageIndex = -1;

  const closeMobileNav = () => {
    if (!siteHeader || !navToggle) {
      return;
    }

    siteHeader.classList.remove("is-nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  if (siteHeader && navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteHeader.classList.toggle("is-nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
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
      setLang(button.dataset.lang);
    });
  });

  const closeLightbox = () => {
    if (!lightbox || !lightboxImage) {
      return;
    }

    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
    lightboxImage.alt = "";
    currentImageIndex = -1;
    document.body.style.overflow = "";
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
  };

  if (gallery && lightbox && lightboxImage && lightboxClose && lightboxPrev && lightboxNext) {
    galleryImages = Array.from(gallery.querySelectorAll("img"));

    gallery.addEventListener("click", (event) => {
      const image = event.target.closest("img");

      if (!image) {
        return;
      }

      const imageIndex = galleryImages.indexOf(image);
      showLightboxImage(imageIndex);
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
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
        closeLightbox();
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
        targetDrawer.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
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
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let rafId = 0;

    if (isIPadOS) {
      document.documentElement.classList.add("is-ipados");
    }

    const bindMediaChange = (query, handler) => {
      if (typeof query.addEventListener === "function") {
        query.addEventListener("change", handler);
      } else if (typeof query.addListener === "function") {
        query.addListener(handler);
      }
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
      return !isIPhoneLike && !isIPadOS;
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
    bindMediaChange(reducedMotion, requestParallaxUpdate);
    requestParallaxUpdate();
  }

  setLang("el");
  updateGorgeTemperature();
});