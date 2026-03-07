document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("mainPanel");

  // Εμφάνιση (Slow Fade In)
  setTimeout(() => {
    panel.classList.add("active");
  }, 500);

  // Εξαφάνιση (Fade Out)
  setTimeout(() => {
    panel.classList.add("exit");
  }, 6000); // Αύξησα λίγο τον χρόνο για να προλάβει ο χρήστης να απολαύσει το αργό εφέ

  const secondPanel = document.getElementById("secondPanel");

  // Εμφάνιση (Slow Fade In)
  setTimeout(() => {
    secondPanel.classList.add("active");
  }, 500);

  // Εξαφάνιση (Fade Out)
  setTimeout(() => {
    secondPanel.classList.add("exit");
  }, 6000);
});
