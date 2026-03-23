function setLang(lang) {
  document.documentElement.lang = lang;

  document.querySelectorAll(".lang-switcher button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const siteHeader = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const galleryTrack = document.querySelector(".gallery-track");

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

  document.querySelectorAll(".lang-switcher button").forEach((button) => {
    button.addEventListener("click", () => {
      setLang(button.dataset.lang);
    });
  });

  setLang("el");

  if (galleryTrack) {
    const slides = Array.from(galleryTrack.querySelectorAll("img"));
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (slides.length > 0) {
      let currentIndex = 0;
      const displayMs = 5600;
      const fadeMs = prefersReducedMotion ? 200 : 1800;

      slides.forEach((slide, index) => {
        slide.classList.remove("is-visible", "is-zooming");
        slide.style.zIndex = String(index === 0 ? 2 : 1);
      });

      slides[0].classList.add("is-visible", "is-zooming");

      if (prefersReducedMotion) {
        slides[0].classList.remove("is-zooming");
      }

      if (slides.length > 1) {
        window.setInterval(() => {
          const nextIndex = (currentIndex + 1) % slides.length;
          const currentSlide = slides[currentIndex];
          const nextSlide = slides[nextIndex];

          currentSlide.style.zIndex = "1";
          nextSlide.style.zIndex = "2";
          nextSlide.classList.add("is-visible");

          window.requestAnimationFrame(() => {
            if (!prefersReducedMotion) {
              nextSlide.classList.add("is-zooming");
            }
            currentSlide.classList.remove("is-visible");
          });

          window.setTimeout(() => {
            currentSlide.classList.remove("is-zooming");
          }, fadeMs);

          currentIndex = nextIndex;
        }, displayMs);
      }
    }
  }
});