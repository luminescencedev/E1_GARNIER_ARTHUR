const API_URL = "https://gabistam.github.io/Demo_API/data/projects.json";

const state = {
  projects: [],
  filter: "all",
  lastFocus: null,
};

document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  fillCurrentYear();

  const page = document.body.dataset.page;

  if (page === "home") {
    initPortfolio();
  }

  if (page === "contact") {
    initContactForm();
  }
});

function setupNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const list = document.querySelector("[data-nav-list]");

  if (!toggle || !list) return;

  toggle.addEventListener("click", () => {
    const isOpen = list.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  list.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      list.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function fillCurrentYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = year;
  });
}

function initPortfolio() {
  const filterBox = document.querySelector("[data-filter-root]");
  const grid = document.querySelector("[data-project-grid]");
  const loader = document.querySelector("[data-loader]");
  const errorBox = document.querySelector("[data-error]");
  const countBadge = document.querySelector("[data-project-count]");

  if (!filterBox || !grid || !loader || !errorBox || !countBadge) return;

  state.filterBox = filterBox;
  state.grid = grid;
  state.loader = loader;
  state.errorBox = errorBox;
  state.countBadge = countBadge;

  state.modal = document.querySelector("[data-modal]");
  state.modalImage = document.querySelector("[data-modal-image]");
  state.modalClient = document.querySelector("[data-modal-client]");
  state.modalTitle = document.querySelector("[data-modal-title]");
  state.modalDescription = document.querySelector("[data-modal-description]");
  state.modalCategory = document.querySelector("[data-modal-category]");
  state.modalYear = document.querySelector("[data-modal-year]");
  state.modalDuration = document.querySelector("[data-modal-duration]");
  state.modalTags = document.querySelector("[data-modal-technologies]");
  state.modalFeatures = document.querySelector("[data-modal-features]");
  state.modalLink = document.querySelector("[data-modal-link]");
  state.modalClose = document.querySelector("[data-modal-close]");
  state.modalPlaceholder = state.modalImage
    ? state.modalImage.dataset.placeholder || ""
    : "";

  bindModal();
  loadProjects();
}

async function loadProjects() {
  showLoader(true);
  showError("");

  try {
    const response = await fetch(API_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }

    const data = await response.json();
    const projects = Array.isArray(data.projects) ? data.projects : [];
    const techsFromApi = Array.isArray(data.technologies)
      ? data.technologies
      : [];

    state.projects = projects;

    const allTechs = new Set([
      "all",
      ...techsFromApi,
      ...projects.flatMap((project) => project.technologies || []),
    ]);

    renderFilters(Array.from(allTechs).filter(Boolean));
    renderProjects();
  } catch (error) {
    console.error("fetch error", error);
    showError("Impossible de charger les projets pour le moment.");
  } finally {
    showLoader(false);
  }
}

function renderFilters(list) {
  if (!state.filterBox) return;

  state.filterBox.innerHTML = "";

  list.sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));

  list.forEach((tech) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = tech === "all" ? "Tous" : tech;
    button.dataset.filter = tech;
    button.classList.toggle("active", state.filter === tech);
    button.addEventListener("click", () => {
      state.filter = tech;
      updateFilterButtons();
      renderProjects();
    });
    state.filterBox.appendChild(button);
  });
}

function updateFilterButtons() {
  state.filterBox?.querySelectorAll("button").forEach((button) => {
    const isActive = button.dataset.filter === state.filter;
    button.classList.toggle("active", isActive);
  });
}

function getVisibleProjects() {
  if (state.filter === "all") {
    return state.projects;
  }

  return state.projects.filter(
    (project) =>
      Array.isArray(project.technologies) &&
      project.technologies.includes(state.filter)
  );
}

function renderProjects() {
  if (!state.grid || !state.countBadge) return;

  showLoader(false);

  const projects = getVisibleProjects();
  state.countBadge.textContent = projects.length;
  state.grid.innerHTML = "";

  if (!projects.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Aucun projet trouve pour ce filtre.";
    state.grid.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();

  projects.forEach((project) => {
    const title = project.title || "Projet WebCraft";

    const card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");

    const figure = document.createElement("figure");

    if (project.image) {
      const img = document.createElement("img");
      img.src = project.image;
      img.alt = `Illustration du projet ${title}`;
      img.loading = "lazy";
      figure.appendChild(img);
    } else {
      figure.textContent = "Visuel a venir";
    }

    card.appendChild(figure);

    const client = document.createElement("span");
    client.className = "client";
    client.textContent = project.client || "Client WebCraft";
    card.appendChild(client);

    const heading = document.createElement("h3");
    heading.textContent = title;
    card.appendChild(heading);

    const meta = document.createElement("div");
    meta.className = "meta";

    if (project.category) {
      meta.appendChild(buildMetaItem(project.category));
    }

    if (project.year) {
      meta.appendChild(buildMetaItem(project.year));
    }

    if (project.duration) {
      meta.appendChild(buildMetaItem(project.duration));
    }

    if (meta.children.length) {
      card.appendChild(meta);
    }

    const tags = document.createElement("div");
    tags.className = "tags";

    (project.technologies || []).forEach((tech) => {
      const badge = document.createElement("span");
      badge.textContent = tech;
      tags.appendChild(badge);
    });

    if (tags.children.length) {
      card.appendChild(tags);
    }

    const more = document.createElement("span");
    more.className = "more";
    more.textContent = "Voir details";
    card.appendChild(more);

    const open = () => openModal(project, card);

    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (
        event.key !== "Enter" &&
        event.key !== " " &&
        event.key !== "Spacebar" &&
        event.key !== "Space"
      ) {
        return;
      }
      event.preventDefault();
      open();
    });

    fragment.appendChild(card);
  });

  state.grid.appendChild(fragment);
}

function buildMetaItem(value) {
  const span = document.createElement("span");
  span.textContent = value;
  return span;
}

function bindModal() {
  if (!state.modal) return;

  state.modalClose?.addEventListener("click", closeModal);

  state.modal.addEventListener("click", (event) => {
    if (event.target === state.modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });
}

function openModal(project, trigger) {
  if (!state.modal) return;

  state.lastFocus = trigger instanceof HTMLElement ? trigger : null;

  fillModal(project);
  state.modal.hidden = false;
  document.body.style.overflow = "hidden";
  state.modalClose?.focus();
}

function fillModal(project) {
  const title = project.title || "Projet WebCraft";

  if (state.modalImage) {
    if (project.image) {
      state.modalImage.src = project.image;
      state.modalImage.alt = `Visuel du projet ${title}`;
      state.modalImage.removeAttribute("hidden");
    } else {
      state.modalImage.src = state.modalPlaceholder;
      state.modalImage.alt = "";
      state.modalImage.setAttribute("hidden", "true");
    }
  }

  if (state.modalClient) {
    state.modalClient.textContent = project.client || "Client WebCraft";
  }

  if (state.modalTitle) {
    state.modalTitle.textContent = title;
  }

  if (state.modalDescription) {
    state.modalDescription.textContent =
      project.description || "Description a completer.";
  }

  if (state.modalCategory) {
    state.modalCategory.textContent = project.category || "Non precise";
  }

  if (state.modalYear) {
    state.modalYear.textContent = project.year ? String(project.year) : "-";
  }

  if (state.modalDuration) {
    state.modalDuration.textContent = project.duration || "-";
  }

  if (state.modalTags) {
    state.modalTags.innerHTML = "";
    const list = project.technologies || [];

    if (!list.length) {
      const badge = document.createElement("span");
      badge.textContent = "Tech a confirmer";
      state.modalTags.appendChild(badge);
    } else {
      list.forEach((tech) => {
        const badge = document.createElement("span");
        badge.textContent = tech;
        state.modalTags.appendChild(badge);
      });
    }
  }

  if (state.modalFeatures) {
    state.modalFeatures.innerHTML = "";
    const features = project.features || [];

    if (!features.length) {
      const item = document.createElement("li");
      item.textContent = "Fonctionnalites a detailler.";
      state.modalFeatures.appendChild(item);
    } else {
      features.forEach((feature) => {
        const item = document.createElement("li");
        item.textContent = feature;
        state.modalFeatures.appendChild(item);
      });
    }
  }

  if (state.modalLink) {
    if (project.url) {
      state.modalLink.href = project.url;
      state.modalLink.removeAttribute("hidden");
    } else {
      state.modalLink.href = "#";
      state.modalLink.setAttribute("hidden", "true");
    }
  }
}

function closeModal() {
  if (!state.modal || state.modal.hidden) return;

  state.modal.hidden = true;
  document.body.style.overflow = "";

  if (state.lastFocus && typeof state.lastFocus.focus === "function") {
    state.lastFocus.focus();
  }

  state.lastFocus = null;
}

function showLoader(show) {
  if (!state.loader) return;

  state.loader.hidden = !show;
  state.loader.style.display = show ? "flex" : "none";
}

function showError(message) {
  if (!state.errorBox) return;

  if (!message) {
    state.errorBox.hidden = true;
    state.errorBox.textContent = "";
    return;
  }

  state.errorBox.hidden = false;
  state.errorBox.textContent = message;
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-form-status]");

  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const values = {
      name: formData.get("name") || "",
      email: formData.get("email") || "",
      message: formData.get("message") || "",
    };

    const errors = validateContact(values);
    applyFieldErrors(form, errors);

    if (Object.values(errors).some(Boolean)) {
      status.hidden = false;
      status.textContent = "Merci de corriger les erreurs.";
      status.className = "status-msg error";
      return;
    }

    status.hidden = false;
    status.textContent = "Message envoye. Nous revenons vers vous rapidement.";
    status.className = "status-msg success";
    form.reset();
  });

  form.addEventListener("input", (event) => {
    if (
      !(
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
    ) {
      return;
    }

    const { name, value } = event.target;
    const error = validateField(name, value);
    setFieldError(form, name, error);

    const status = document.querySelector("[data-form-status]");
    if (status) {
      status.hidden = true;
      status.textContent = "";
      status.className = "status-msg";
    }
  });
}

function validateContact(values) {
  return {
    name: validateField("name", values.name),
    email: validateField("email", values.email),
    message: validateField("message", values.message),
  };
}

function validateField(field, value) {
  const text = typeof value === "string" ? value.trim() : "";

  if (field === "name") {
    if (!text) return "Le nom est requis.";
    if (text.length < 2) return "Entrez au moins deux caracteres.";
  }

  if (field === "email") {
    if (!text) return "L'email est requis.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text))
      return "Format email invalide.";
  }

  if (field === "message") {
    if (!text) return "Le message est requis.";
    if (text.length < 10) return "Developpez un peu plus votre demande.";
  }

  return "";
}

function applyFieldErrors(form, errors) {
  Object.entries(errors).forEach(([field, message]) => {
    setFieldError(form, field, message);
  });
}

function setFieldError(form, field, message) {
  const input = form.elements.namedItem(field);
  const feedback = form.querySelector(`[data-error-for="${field}"]`);

  if (
    !(
      input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement
    ) ||
    !feedback
  ) {
    return;
  }

  if (message) {
    input.setAttribute("aria-invalid", "true");
    feedback.textContent = message;
  } else {
    input.removeAttribute("aria-invalid");
    feedback.textContent = "";
  }
}
