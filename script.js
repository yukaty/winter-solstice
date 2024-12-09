document.addEventListener("DOMContentLoaded", () => {
  // Navigation and scroll handling
  initializeNavigation();
});

function initializeNavigation() {
  const nav = document.getElementById("main-nav");
  const navLinks = nav.querySelectorAll("a");
  const sections = document.querySelectorAll("section");

  // Smooth scroll to sections
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth" });
        updateURL(targetId);
      }
    });
  });

  // Update active section while scrolling
  window.addEventListener("scroll", () => {
    updateActiveSection(sections, navLinks);
  });

  // Initial check for active section
  updateActiveSection(sections, navLinks);
}

function updateActiveSection(sections, navLinks) {
  const scrollPosition = window.scrollY + window.innerHeight / 3;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      navLinks.forEach((link) => link.classList.remove("active"));

      const correspondingLink = document.querySelector(
        `#main-nav a[href="#${section.id}"]`
      );
      if (correspondingLink) {
        correspondingLink.classList.add("active");
      }
    }
  });
}

function updateURL(id) {
  history.pushState(null, "", `#${id}`);
}
