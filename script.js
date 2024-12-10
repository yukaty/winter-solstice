document.addEventListener("DOMContentLoaded", () => {
  // Poem generation
  fetchAndDisplayPoem();

  // Navigation and scroll handling
  initializeNavigation();
});

async function fetchAndDisplayPoem() {
  const poemContainer = document.createElement("div");
  poemContainer.id = "poem-container";
  poemContainer.textContent = "Loading poem...";
  document.querySelector("#main-header").appendChild(poemContainer);

  try {
    const response = await fetch(
      // Hugging Face API
      "https://api-inference.huggingface.co/models/google/gemma-2-2b-it",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: "Write a poem about the winter solstice. Limit the poem to 20 words or fewer.",
          parameters: {
            return_full_text: false,
            temperature: 0.8,
            top_p: 0.9,
            seed: Math.floor(Math.random() * 10000),
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    const generatedText = result[0]?.generated_text || "Poem could not be loaded.";
    poemContainer.textContent = generatedText;

  } catch (error) {
    console.error("Error fetching poem:", error);
    poemContainer.textContent = "Failed to load the poem. Please try again later.";
  }
}

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
