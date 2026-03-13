document.addEventListener("DOMContentLoaded", () => {
  function animatePanel(panel) {
    panel.classList.remove("active", "exit");
    setTimeout(() => panel.classList.add("active"), 500);
    setTimeout(() => panel.classList.add("exit"), 12000);
  }

  // Πρώτο panel — εκκίνηση άμεσα
  animatePanel(document.getElementById("mainPanel"));

  // Το δεύτερο panel να είναι πάντα ορατό
  const secondPanel = document.getElementById("secondPanel");
  secondPanel.classList.add("active");
});
