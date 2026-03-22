function setLang(lang) {
  document.documentElement.lang = lang;

  document.querySelectorAll(".lang-switcher button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const siteHeader = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");

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
});