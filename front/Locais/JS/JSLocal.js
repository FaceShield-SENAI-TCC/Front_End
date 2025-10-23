
// ========================== TRADUÇÃO ==========================
let translations = {};

function t(key) {
  return translations[key] || key;
}

async function loadTranslations(lang) {
  try {
    const response = await fetch(`./translate/${lang}.json`);
    if (!response.ok) throw new Error(`File not found for: ${lang}`);
    translations = await response.json();
  } catch (error) {
    console.error("Failed to load translation file:", error);
  }
}

function updateUI() {
  document.querySelectorAll("[data-translate-key]").forEach((el) => {
    const key = el.getAttribute("data-translate-key");
    if (!key) return;
    if (el.placeholder) el.placeholder = t(key);
    else if (el.tagName === "SPAN") {
      // Para o botão de toggle view
      el.textContent = t(key);
    } else {
      // Preserva o ícone
      const icon = el.querySelector("i");
      if (icon) el.innerHTML = `${icon.outerHTML} ${t(key)}`;
      else el.textContent = t(key);
    }
  });
  document.title = t("page-title");
}

async function switchLanguage(lang) {
  localStorage.setItem("language", lang);
  await loadTranslations(lang);
  updateUI();
  renderLocations(allLocationsCache);
}
window.switchLanguage = switchLanguage;

// ========================== LÓGICA DA PÁGINA ==========================
const API = {
  get: "http://localhost:8080/locais/buscar",
  delete: "http://localhost:8080/locais/deletar",
  post: "http://localhost:8080/locais/novoLocal",
  put: "http://localhost:8080/locais/editar",
};

let allLocationsCache = [];
let isCardView = false;

function showLoading(show) {
  document.getElementById("loading-overlay").style.display = show
    ? "flex"
    : "none";
}
function showNotification(type, message) {
  /* ... (função igual à anterior) ... */
}

async function fetchLocations() {
  showLoading(true);
  try {
    const response = await fetch(API.get);
    if (!response.ok) throw new Error(t("alert-fetch-fail"));
    allLocationsCache = await response.json();
    renderLocations(allLocationsCache);
  } catch (error) {
    showNotification("error", error.message);
  } finally {
    showLoading(false);
  }
}

function renderLocations(locations) {
  const tableBody = document.getElementById("locations-table-body");
  const grid = document.getElementById("location-grid");
  const emptyState = document.getElementById("empty-state");
  tableBody.innerHTML = "";
  grid.innerHTML = "";

  document.getElementById("table-view").style.display =
    locations.length > 0 && !isCardView ? "block" : "none";
  document.getElementById("card-view").style.display =
    locations.length > 0 && isCardView ? "block" : "none";
  emptyState.style.display = locations.length === 0 ? "block" : "none";

  if (locations.length === 0) return;

  locations.forEach((loc) => {
    const caseDisplay = loc.estojo || t("table-na");
    // Tabela
    tableBody.innerHTML += `
            <tr data-location-id="${loc.id}">
                <td>${loc.id}</td>
                <td><i class="fas fa-building"></i> ${loc.nomeEspaco}</td>
                <td><i class="fas fa-archive"></i> ${loc.armario}</td>
                <td><i class="fas fa-layer-group"></i> ${loc.prateleira}</td>
                <td><i class="fas fa-box"></i> ${caseDisplay}</td>
                <td class="actions-cell">
                    <button class="action-btn edit-btn" data-id="${
                      loc.id
                    }"><i class="fas fa-edit"></i> ${t(
      "table-edit-btn"
    )}</button>
                    <button class="action-btn delete-btn" data-id="${
                      loc.id
                    }"><i class="fas fa-trash"></i> ${t(
      "table-delete-btn"
    )}</button>
                </td>
            </tr>`;
    // Cards
    grid.innerHTML += `
            <div class="location-card" data-location-id="${loc.id}">
                <div class="card-header"><h3><i class="fas fa-map-marker-alt"></i> ${t(
                  "card-header"
                )}${loc.id}</h3></div>
                <div class="card-body">
                    <div class="location-info"><span><strong>${t(
                      "card-label-space"
                    )}</strong> ${loc.nomeEspaco}</span></div>
                    <div class="location-info"><span><strong>${t(
                      "card-label-cabinet"
                    )}</strong> ${loc.armario}</span></div>
                    <div class="location-info"><span><strong>${t(
                      "card-label-shelf"
                    )}</strong> ${loc.prateleira}</span></div>
                    <div class="location-info"><span><strong>${t(
                      "card-label-case"
                    )}</strong> ${caseDisplay}</span></div>
                </div>
                <div class="card-footer">
                    <button class="action-btn edit-btn" data-id="${
                      loc.id
                    }"><i class="fas fa-edit"></i> ${t(
      "table-edit-btn"
    )}</button>
                    <button class="action-btn delete-btn" data-id="${
                      loc.id
                    }"><i class="fas fa-trash"></i> ${t(
      "table-delete-btn"
    )}</button>
                </div>
            </div>`;
  });
}

function openModal(location = null) {
  const form = document.getElementById("location-form");
  const modalTitle = document.getElementById("modal-title");
  form.reset();
  document.getElementById("location-id").value = "";

  if (location) {
    // Modo Edição
    modalTitle.textContent = t("modal-edit-title");
    document.getElementById("location-id").value = location.id;
    document.getElementById("location-space").value = location.nomeEspaco;
    document.getElementById("location-cabinet").value = location.armario;
    document.getElementById("location-shelf").value = location.prateleira;
    document.getElementById("location-case").value = location.estojo || "";
  } else {
    // Modo Adição
    modalTitle.textContent = t("modal-add-title");
  }
  document.getElementById("location-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("location-modal").style.display = "none";
}

async function handleSave(event) {
  event.preventDefault();
  const id = document.getElementById("location-id").value;
  const data = {
    nomeEspaco: document.getElementById("location-space").value,
    armario: document.getElementById("location-cabinet").value,
    prateleira: document.getElementById("location-shelf").value,
    estojo: document.getElementById("location-case").value || null,
  };

  const url = id ? `${API.put}/${id}` : API.post;
  const method = id ? "PUT" : "POST";

  showLoading(true);
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(t("alert-save-fail"));
    await fetchLocations();
    closeModal();
    showNotification(
      "success",
      id ? t("alert-update-success") : t("alert-create-success")
    );
  } catch (error) {
    showNotification("error", error.message);
  } finally {
    showLoading(false);
  }
}

async function handleDelete(id) {
  if (!confirm(t("alert-delete-confirm"))) return;
  showLoading(true);
  try {
    const response = await fetch(`${API.delete}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error(t("alert-delete-fail"));
    await fetchLocations();
    showNotification("success", t("alert-delete-success"));
  } catch (error) {
    showNotification("error", error.message);
  } finally {
    showLoading(false);
  }
}

function handleSearch() {
  const term = document.getElementById("search-input").value.toLowerCase();
  const filtered = allLocationsCache.filter((loc) =>
    Object.values(loc).some((val) => String(val).toLowerCase().includes(term))
  );
  renderLocations(filtered);
}

function toggleView() {
  isCardView = !isCardView;
  const btn = document.getElementById("view-toggle-btn");
  const span = btn.querySelector("span");
  const icon = btn.querySelector("i");

  if (isCardView) {
    span.setAttribute("data-translate-key", "view-toggle-table");
    span.textContent = t("view-toggle-table");
    icon.className = "fas fa-list";
  } else {
    span.setAttribute("data-translate-key", "view-toggle-cards");
    span.textContent = t("view-toggle-cards");
    icon.className = "fas fa-th";
  }
  renderLocations(allLocationsCache);
}

document.addEventListener("DOMContentLoaded", async () => {
  const currentLanguage = localStorage.getItem("language") || "pt";
  await loadTranslations(currentLanguage);
  updateUI();

  await fetchLocations();

  // Event Listeners
  document
    .getElementById("add-location-btn")
    .addEventListener("click", () => openModal());
  document
    .getElementById("add-first-location")
    .addEventListener("click", () => openModal());
  document
    .getElementById("location-form")
    .addEventListener("submit", handleSave);
  document.getElementById("cancel-btn").addEventListener("click", closeModal);
  document
    .querySelector(".modal .close-btn")
    .addEventListener("click", closeModal);
  document
    .getElementById("search-input")
    .addEventListener("input", handleSearch);
  document
    .getElementById("view-toggle-btn")
    .addEventListener("click", toggleView);

  const mainContent = document.querySelector(".main-content");
  mainContent.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".edit-btn");
    const deleteBtn = e.target.closest(".delete-btn");

    if (editBtn) {
      const id = editBtn.dataset.id;
      const location = allLocationsCache.find((l) => l.id == id);
      openModal(location);
    }
    if (deleteBtn) {
      handleDelete(deleteBtn.dataset.id);
    }
  });

  window.addEventListener("click", (e) => {
    if (e.target == document.getElementById("location-modal")) closeModal();
  });
});
