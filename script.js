function setLang(lang) {
  document.documentElement.lang = lang;

  document.querySelectorAll(".lang-switcher button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".lang-switcher button").forEach((button) => {
    button.addEventListener("click", () => {
      setLang(button.dataset.lang);
    });
  });

  setLang("el");
});