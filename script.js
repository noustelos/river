document.addEventListener("DOMContentLoaded", () => {
  function animatePanel(panel) {
    panel.classList.remove("active", "exit");
    // Εμφάνιση (Slow Fade In)
    setTimeout(() => panel.classList.add("active"), 500);
    // Εξαφάνιση (Fade Out)
    setTimeout(() => panel.classList.add("exit"), 12000);
  }

  // Πρώτο panel — εκκίνηση άμεσα
  animatePanel(document.getElementById("mainPanel"));

  // Δεύτερο panel — εκκίνηση μόνο όταν φανεί στην οθόνη
  const secondPanel = document.getElementById("secondPanel");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animatePanel(secondPanel);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(secondPanel);
});
