// public/js/404.js
const themeBtn = document.getElementById("themeToggle");

function updateUI(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const icon = themeBtn.querySelector("i");
  icon.className = theme === "light" ? "fas fa-moon" : "fas fa-sun";
}

// 1. Manual Toggle
themeBtn.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";

  // Save preference so auto-switcher knows the user made a choice
  localStorage.setItem("theme", next);
  updateUI(next);
});

// 2. System Theme Listener (Matches your React logic)
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
mediaQuery.addEventListener("change", (e) => {
  // Only auto-switch if no manual preference is saved
  if (!localStorage.getItem("theme")) {
    const newTheme = e.matches ? "dark" : "light";
    updateUI(newTheme);
  }
});
