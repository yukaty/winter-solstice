document.addEventListener("DOMContentLoaded", () => {
  // Poem generation
  initializePoemDisplay();
  // Navigation and scroll handling
  initializeNavigation();
  // Back to top button
  initializeBackToTop();
  // Scroll Animation
  initializeScrollAnimations();
});

async function initializePoemDisplay() {
  let poemContainer = document.getElementById("poem-container");

  if (!poemContainer) {
    poemContainer = createPoemContainer();
    const contentWrapper = createContentWrapper();

    poemContainer.appendChild(contentWrapper);
    document.querySelector("#main-header").appendChild(poemContainer);
  }

  const poemText = poemContainer.querySelector("p");
  poemText.textContent = "Loading poem...";

  try {
    const generatedText = await fetchPoem();
    poemText.textContent = generatedText;

    const speakerButton = poemContainer.querySelector(".speaker-control");
    setupSpeakerButton(speakerButton, generatedText);
  } catch (error) {
    console.error("Error fetching poem:", error);
    poemText.textContent = error.message;
    poemText.setAttribute("aria-live", "assertive");
  }
}

function initializeNavigation() {
  const nav = document.getElementById("main-nav");
  const navLinks = nav.querySelectorAll("a");
  const sections = document.querySelectorAll("section");

  // Add Hamburger Menu for Mobile
  const menuToggle = document.createElement("button");
  menuToggle.className = "menu-toggle";
  menuToggle.innerHTML = "☰";
  nav.prepend(menuToggle);

  menuToggle.addEventListener("click", () => {
    const navList = document.querySelector("#main-nav ul");
    const isOpen = navList.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", isOpen);
  });

  // Smooth scroll to sections
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth" });
        updateURL(targetId);

        // Close menu on mobile after clicking a link
        const navList = document.querySelector("#main-nav ul");
        if (navList.classList.contains("open")) {
          navList.classList.remove("open");
        }
      }
    });
  });

  // Update active section while scrolling
  window.addEventListener(
    "scroll",
    () => {
      // Control scroll event firing frequency
      if (!window.requestAnimationFrame) {
        updateActiveSection(sections, navLinks);
        return;
      }

      // Execute in sync with animation frame
      requestAnimationFrame(() => {
        updateActiveSection(sections, navLinks);
      });
    },
    { passive: true }
  );

  // Initial check for active section
  updateActiveSection(sections, navLinks);
}

function initializeBackToTop() {
  // Create button element
  const backToTop = document.createElement("button");
  backToTop.id = "back-to-top";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 15l-6-6-6 6"/>
    </svg>
  `;

  // Add to document
  document.body.appendChild(backToTop);

  // Handle scroll visibility
  let scrollTimeout;
  window.addEventListener(
    "scroll",
    () => {
      if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
      }

      scrollTimeout = window.requestAnimationFrame(() => {
        if (window.scrollY > 100) {
          backToTop.classList.add("visible");
        } else {
          backToTop.classList.remove("visible");
        }
      });
    },
    { passive: true }
  );

  // Handle click
  backToTop.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

function initializeScrollAnimations() {
  const animatedElements = [
    ...document.querySelectorAll(
      ".hemisphere, .celebration, #traditions li, section"
    ),
  ];

  // Create Intersection Observer instance
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 } // Trigger when 20% of element is visible
  );

  const setInitialState = (element, index) => {
    element.style.opacity = "0";

    if (element.matches("section")) {
      element.style.transform = "scale(0.95)";
    } else if (element.classList.contains("hemisphere")) {
      // Alternate direction for hemispheres
      element.style.transform = `translateX(${index % 2 ? "30px" : "-30px"})`;
    } else {
      element.style.transform = "translateX(25px)";
    }

    observer.observe(element);
  };

  const resetState = (element) => {
    element.style.opacity = "1";
    element.style.transform = "none";
    observer.unobserve(element);
  };

  // Initialize animations
  animatedElements.forEach(setInitialState);

  // Handle reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  if (prefersReducedMotion.matches) {
    animatedElements.forEach(resetState);
  }

  prefersReducedMotion.addEventListener("change", ({ matches }) => {
    if (matches) {
      animatedElements.forEach(resetState);
    }
  });
}

// =========================================
// Poem Feature
// =========================================
async function fetchPoem() {
  try {
    const response = await fetch("/api/fetch-poem", { method: "GET" });

    if (!response.ok) {
      // HTTP error
      throw new Error("Failed to fetch poem");
    }

    const result = await response.json();
    return result[0]?.generated_text || "Failed to generate poem.";
  } catch (error) {
    // Network error
    const errorMessage = navigator.onLine
      ? "Failed to generate poem. Please try again later."
      : "Please check your internet connection.";
    throw new Error(errorMessage);
  }
}

function createPoemContainer() {
  const container = document.createElement("div");
  container.id = "poem-container";
  container.setAttribute("role", "article");
  container.setAttribute("aria-label", "Winter Solstice Poem");

  return container;
}

function createContentWrapper() {
  const wrapper = document.createElement("div");
  wrapper.className = "poem-content-wrapper";

  const aiIcon = createAIIcon();

  const poemText = document.createElement("p");
  poemText.setAttribute("aria-live", "polite");

  const speakerButton = createSpeakerButton();

  wrapper.appendChild(aiIcon);
  wrapper.appendChild(poemText);
  wrapper.appendChild(speakerButton);

  return wrapper;
}

function createAIIcon() {
  const icon = document.createElement("span");
  icon.className = "ai-icon";
  icon.setAttribute("role", "img");
  icon.setAttribute("aria-label", "AI Generated Content");
  icon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor">
      <path d="M234.7 42.7L197 56.8c-3 1.1-5 4-5 7.2s2 6.1 5 7.2l37.7 14.1L248.8 123c1.1 3 4 5 7.2 5s6.1-2 7.2-5l14.1-37.7L315 71.2c3-1.1 5-4 5-7.2s-2-6.1-5-7.2L277.3 42.7 263.2 5c-1.1-3-4-5-7.2-5s-6.1 2-7.2 5L234.7 42.7zM46.1 395.4c-18.7 18.7-18.7 49.1 0 67.9l34.6 34.6c18.7 18.7 49.1 18.7 67.9 0L529.9 116.5c18.7-18.7 18.7-49.1 0-67.9L495.3 14.1c-18.7-18.7-49.1-18.7-67.9 0L46.1 395.4zM484.6 82.6l-105 105-23.3-23.3 105-105 23.3 23.3zM7.5 117.2C3 118.9 0 123.2 0 128s3 9.1 7.5 10.8L64 160l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L128 160l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L128 96 106.8 39.5C105.1 35 100.8 32 96 32s-9.1 3-10.8 7.5L64 96 7.5 117.2zm352 256c-4.5 1.7-7.5 6-7.5 10.8s3 9.1 7.5 10.8L416 416l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L480 416l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L480 352l-21.2-56.5c-1.7-4.5-6-7.5-10.8-7.5s-9.1 3-10.8 7.5L416 352l-56.5 21.2z"/>
    </svg>
  `;
  return icon;
}

function createSpeakerButton() {
  const button = document.createElement("button");
  button.className = "speaker-control";
  button.setAttribute("aria-label", "Read poem aloud");
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="speaker-icon">
      <path d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
    </svg>
  `;
  return button;
}

function setupSpeakerButton(button, text) {
  button.onclick = () => {
    if (!speechSynthesis) {
      button.disabled = true;
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };
}

// =========================================
// Navitation Feature
// =========================================
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
