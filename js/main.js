const API_URL = "https://gabistam.github.io/Demo_API/data/projects.json";

const appState = {
  projects: [],
  activeFilter: "all",
  lastFocused: null,
};

const refs = {
  filterRoot: null,
  projectGrid: null,
  countBadge: null,
  loader: null,
  errorBox: null,
  modalRoot: null,
  modalOverlay: null,
  modalClose: null,
  modalImage: null,
  modalTitle: null,
  modalClient: null,
  modalDescription: null,
  modalCategory: null,
  modalYear: null,
  modalDuration: null,
  modalTechnologies: null,
  modalFeatures: null,
  modalLink: null,
};

let isModalListenerBound = false;

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initDynamicYear();

  const page = document.body.dataset.page;

  if (page === "home") {
    initPortfolio();
  }

  if (page === "contact") {
    initContactForm();
  }
});

const initDynamicYear = () => {
  const year = new Date().getFullYear();
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = year;
  });
};

const initNavigation = () => {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-primary-nav]");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
};

const initPortfolio = () => {
  refs.filterRoot = document.querySelector("[data-filter-root]");
  refs.projectGrid = document.querySelector("[data-project-grid]");
  refs.countBadge = document.querySelector("[data-project-count]");
  refs.loader = document.querySelector("[data-loader]");
  refs.errorBox = document.querySelector("[data-error]");
  refs.modalRoot = document.querySelector("[data-modal-root]");
  refs.modalOverlay = document.querySelector("[data-modal-overlay]");
  refs.modalClose = document.querySelector("[data-modal-close]");
  refs.modalImage = document.querySelector("[data-modal-image]");
  refs.modalTitle = document.querySelector("[data-modal-title]");
  refs.modalClient = document.querySelector("[data-modal-client]");
  refs.modalDescription = document.querySelector("[data-modal-description]");
  refs.modalCategory = document.querySelector("[data-modal-category]");
  refs.modalYear = document.querySelector("[data-modal-year]");
  refs.modalDuration = document.querySelector("[data-modal-duration]");
  refs.modalTechnologies = document.querySelector("[data-modal-technologies]");
  refs.modalFeatures = document.querySelector("[data-modal-features]");
  refs.modalLink = document.querySelector("[data-modal-link]");

  bindModalEvents();
  fetchProjects();
};

const bindModalEvents = () => {
  if (!refs.modalRoot) return;

  refs.modalClose?.addEventListener("click", closeModal);

  refs.modalOverlay?.addEventListener("click", (event) => {
    if (event.target === refs.modalOverlay) {
      closeModal();
    }
  });

  if (!isModalListenerBound) {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    });
    isModalListenerBound = true;
  }
};

const fetchProjects = async () => {
  if (!refs.projectGrid) return;

  toggleLoader(true);
  showError("");

  try {
    const response = await fetch(API_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const projects = Array.isArray(payload.projects) ? payload.projects : [];
    const technologies = Array.isArray(payload.technologies) ? payload.technologies : [];
    const collected = projects.flatMap((project) =>
      Array.isArray(project.technologies) ? project.technologies : []
    );

    const uniqueTechnologies = [...new Set([...technologies, ...collected])]
      .filter(Boolean)
      .map((tech) => String(tech).trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));

    appState.projects = projects;
    appState.activeFilter = "all";

    renderFilters(uniqueTechnologies);
    updateProjectList();
  } catch (error) {
    console.error("Failed to fetch projects", error);
    showError("Impossible de charger les projets. Verifiez votre connexion et reessayez.");
  } finally {
    toggleLoader(false);
  }
};

const renderFilters = (technologies = []) => {
  if (!refs.filterRoot) return;

  refs.filterRoot.innerHTML = "";

  const filters = ["all", ...technologies];

  filters.forEach((tech) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.dataset.filter = tech;
    button.textContent = tech === "all" ? "Tous" : tech;

    const isActive = tech === appState.activeFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));

    button.addEventListener("click", () => handleFilterChange(tech));
    refs.filterRoot.appendChild(button);
  });
};

const handleFilterChange = (nextFilter) => {
  if (appState.activeFilter === nextFilter) return;

  appState.activeFilter = nextFilter;

  refs.filterRoot?.querySelectorAll(".filter-button").forEach((button) => {
    const isActive = button.dataset.filter === nextFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  updateProjectList();
};

const updateProjectList = () => {
  if (!refs.projectGrid) return;

  const projects = getFilteredProjects();
  renderProjects(projects);
  updateCount(projects.length);
};

const getFilteredProjects = () => {
  if (appState.activeFilter === "all") {
    return [...appState.projects];
  }

  return appState.projects.filter((project) =>
    Array.isArray(project.technologies) && project.technologies.includes(appState.activeFilter)
  );
};

const renderProjects = (projects) => {
  if (!refs.projectGrid) return;

  refs.projectGrid.innerHTML = "";

  if (!projects.length) {
    const message = document.createElement("p");
    message.className = "empty-state";
    message.textContent = "Aucun projet ne correspond a ce filtre.";
    refs.projectGrid.appendChild(message);
    return;
  }

  const fragment = document.createDocumentFragment();

  projects.forEach((project) => {
    const projectTitle = project.title || "Projet WebCraft";
    const card = document.createElement("article");
    card.className = "project-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");

    const picture = document.createElement("figure");
    picture.className = "project-media";

    if (project.image) {
      const image = document.createElement("img");
      image.src = project.image;
      image.alt = `Visuel du projet ${projectTitle}`;
      image.loading = "lazy";
      picture.appendChild(image);
    } else {
      picture.classList.add("is-placeholder");
      const placeholder = document.createElement("span");
      placeholder.textContent = "Visuel a venir";
      picture.appendChild(placeholder);
    }

    card.appendChild(picture);

    const content = document.createElement("div");
    content.className = "project-content";

    const client = document.createElement("p");
    client.className = "project-client";
    client.textContent = project.client || "Client WebCraft";
    content.appendChild(client);

    const title = document.createElement("h3");
    title.className = "project-title";
    title.textContent = projectTitle;
    content.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "project-meta";

    if (project.category) {
      const category = document.createElement("span");
      category.textContent = project.category;
      meta.appendChild(category);
    }

    if (project.year) {
      const year = document.createElement("span");
      year.textContent = String(project.year);
      meta.appendChild(year);
    }

    if (project.duration) {
      const duration = document.createElement("span");
      duration.textContent = project.duration;
      meta.appendChild(duration);
    }

    if (meta.childElementCount > 0) {
      content.appendChild(meta);
    }

    const techContainer = document.createElement("div");
    techContainer.className = "project-technologies";

    const techList = Array.isArray(project.technologies) ? project.technologies : [];
    techList.forEach((tech) => {
      const badge = document.createElement("span");
      badge.textContent = tech;
      techContainer.appendChild(badge);
    });

    if (techContainer.childElementCount > 0) {
      content.appendChild(techContainer);
    }

    card.appendChild(content);

    const actions = document.createElement("div");
    actions.className = "project-actions";

    const cta = document.createElement("span");
    cta.className = "project-button";
    cta.textContent = "Voir details";
    cta.setAttribute("aria-hidden", "true");
    actions.appendChild(cta);

    card.appendChild(actions);

    const openFromCard = () => openModal(project, card);

    card.addEventListener("click", () => {
      openFromCard();
    });

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar" && event.key !== "Space") {
        return;
      }
      event.preventDefault();
      openFromCard();
    });

    fragment.appendChild(card);
  });

  refs.projectGrid.appendChild(fragment);
};


const openModal = (project, trigger) => {
  if (!refs.modalRoot) return;

  appState.lastFocused = trigger instanceof HTMLElement ? trigger : document.activeElement;

  populateModal(project);
  refs.modalRoot.removeAttribute("hidden");
  document.body.classList.add("modal-open");

  requestAnimationFrame(() => {
    refs.modalClose?.focus();
  });
};

const populateModal = (project) => {
  if (!refs.modalRoot) return;

  if (refs.modalTitle) {
    refs.modalTitle.textContent = project.title || "Projet WebCraft";
  }

  if (refs.modalClient) {
    refs.modalClient.textContent = project.client || "Client WebCraft";
  }

  if (refs.modalDescription) {
    refs.modalDescription.textContent = project.description || "Description non renseignee.";
  }

  if (refs.modalCategory) {
    refs.modalCategory.textContent = project.category || "Non renseigne";
  }

  if (refs.modalYear) {
    refs.modalYear.textContent = project.year ? String(project.year) : "-";
  }

  if (refs.modalDuration) {
    refs.modalDuration.textContent = project.duration || "-";
  }

  if (refs.modalImage) {
    if (project.image) {
      refs.modalImage.src = project.image;
      refs.modalImage.alt = project.title ? `Visuel du projet ${project.title}` : "Visuel du projet";
      refs.modalImage.removeAttribute("hidden");
    } else {
      refs.modalImage.src = "";
      refs.modalImage.alt = "";
      refs.modalImage.setAttribute("hidden", "");
    }
  }

  if (refs.modalTechnologies) {
    refs.modalTechnologies.innerHTML = "";
    const techList = Array.isArray(project.technologies) ? project.technologies : [];

    if (techList.length === 0) {
      const badge = document.createElement("span");
      badge.textContent = "Technologie non renseignee";
      refs.modalTechnologies.appendChild(badge);
    } else {
      techList.forEach((tech) => {
        const badge = document.createElement("span");
        badge.textContent = tech;
        refs.modalTechnologies.appendChild(badge);
      });
    }
  }

  if (refs.modalFeatures) {
    refs.modalFeatures.innerHTML = "";
    const features = Array.isArray(project.features) ? project.features : [];

    if (features.length === 0) {
      const item = document.createElement("li");
      item.textContent = "Pas de fonctionnalite detaillee.";
      refs.modalFeatures.appendChild(item);
    } else {
      features.forEach((feature) => {
        const item = document.createElement("li");
        item.textContent = feature;
        refs.modalFeatures.appendChild(item);
      });
    }
  }

  if (refs.modalLink) {
    if (project.url) {
      refs.modalLink.href = project.url;
      refs.modalLink.removeAttribute("hidden");
    } else {
      refs.modalLink.href = "#";
      refs.modalLink.setAttribute("hidden", "");
    }
  }
};

const closeModal = () => {
  if (!refs.modalRoot || refs.modalRoot.hasAttribute("hidden")) return;

  refs.modalRoot.setAttribute("hidden", "");
  document.body.classList.remove("modal-open");

  const target = appState.lastFocused;
  if (target && typeof target.focus === "function") {
    target.focus();
  }

  appState.lastFocused = null;
};

const toggleLoader = (isVisible) => {
  if (!refs.loader) return;

  if (isVisible) {
    refs.loader.removeAttribute("hidden");
  } else {
    refs.loader.setAttribute("hidden", "");
  }
};

const showError = (message) => {
  if (!refs.errorBox) return;

  if (!message) {
    refs.errorBox.textContent = "";
    refs.errorBox.setAttribute("hidden", "");
    return;
  }

  refs.errorBox.textContent = message;
  refs.errorBox.removeAttribute("hidden");
};

const updateCount = (count = 0) => {
  if (refs.countBadge) {
    refs.countBadge.textContent = String(count);
  }
};

const initContactForm = () => {
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-form-status]");

  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    const result = validateContactForm(payload);
    applyFieldFeedback(form, result.errors);

    if (!result.isValid) {
      showFormStatus(status, "Merci de corriger les erreurs indiquees.", "error");
      return;
    }

    showFormStatus(status, "Merci, votre message a bien ete transmis.", "success");
    form.reset();
  });

  form.addEventListener("input", (event) => {
    if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
      return;
    }

    const { name, value } = event.target;
    const errorMessage = validateSingleField(name, value);
    applySingleFieldFeedback(form, name, errorMessage);

    if (status.textContent) {
      showFormStatus(status, "", "clear");
    }
  });
};

const validateContactForm = ({ name, email, message }) => {
  const errors = {
    name: validateSingleField("name", name),
    email: validateSingleField("email", email),
    message: validateSingleField("message", message),
  };

  const isValid = Object.values(errors).every((value) => !value);

  return { isValid, errors };
};

const validateSingleField = (fieldName, value) => {
  const trimmed = typeof value === "string" ? value.trim() : "";

  switch (fieldName) {
    case "name":
      if (!trimmed) return "Le champ nom est obligatoire.";
      if (trimmed.length < 2) return "Le nom doit contenir au moins 2 caracteres.";
      return "";
    case "email":
      if (!trimmed) return "Le champ email est obligatoire.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Format email invalide.";
      return "";
    case "message":
      if (!trimmed) return "Le message est obligatoire.";
      if (trimmed.length < 10) return "Le message doit contenir au moins 10 caracteres.";
      return "";
    default:
      return "";
  }
};

const applyFieldFeedback = (form, errors) => {
  Object.entries(errors).forEach(([fieldName, message]) => {
    applySingleFieldFeedback(form, fieldName, message);
  });
};

const applySingleFieldFeedback = (form, fieldName, message) => {
  const field = form.elements.namedItem(fieldName);
  const errorElement = form.querySelector(`[data-error-for="${fieldName}"]`);

  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) || !errorElement) {
    return;
  }

  if (message) {
    field.setAttribute("aria-invalid", "true");
    errorElement.textContent = message;
  } else {
    field.removeAttribute("aria-invalid");
    errorElement.textContent = "";
  }
};

const showFormStatus = (element, message, variant) => {
  if (!element) return;

  element.classList.remove("is-error", "is-success");

  if (!message) {
    element.textContent = "";
    element.setAttribute("hidden", "");
    return;
  }

  element.textContent = message;
  element.removeAttribute("hidden");

  if (variant === "error") {
    element.classList.add("is-error");
  } else if (variant === "success") {
    element.classList.add("is-success");
  }
};
