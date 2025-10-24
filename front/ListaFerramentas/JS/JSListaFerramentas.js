// ========================== LÓGICA DE TRADUÇÃO ==========================
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
  document.querySelectorAll("[data-translate-key]").forEach((element) => {
    const key = element.getAttribute("data-translate-key");
    if (!key) return;

    if (element.tagName === "INPUT" && element.placeholder) {
      element.placeholder = t(key);
    } else {
      element.textContent = t(key);
    }
  });
  document.title = t("tools-list-title");
  const pageHeader = document.querySelector(".page-title");
  if (pageHeader)
    pageHeader.innerHTML = `<i class="fas fa-toolbox"></i> ${t(
      "page-header-title"
    )}`;
}

async function switchLanguage(lang) {
  localStorage.setItem("language", lang);
  await loadTranslations(lang);
  updateUI();
  await loadAllData(false); // Recarrega os dados sem mostrar o loading
}
window.switchLanguage = switchLanguage;

// ========================== LÓGICA DA PÁGINA ==========================

const API_URLS = {
  ferramentas: "http://localhost:8080/ferramentas/buscar",
  ferramentaPost: "http://localhost:8080/ferramentas/novaFerramenta",
  ferramentaPut: "http://localhost:8080/ferramentas/editar",
  ferramentaDelete: "http://localhost:8080/ferramentas/deletar",
  locais: "http://localhost:8080/locais/buscar",
};

let allToolsCache = [];
let allLocationsCache = [];

const stateTranslationKeys = {
  Novo: "tool-state-new",
  Usado: "tool-state-used",
  Desgastado: "tool-state-worn",
  Danificado: "tool-state-damaged",
};

function showLoading(show) {
  document.getElementById("loading-overlay").style.display = show
    ? "flex"
    : "none";
}

function showNotification(message, isSuccess = true) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `notification ${
    isSuccess ? "success" : "error"
  } show`;
  setTimeout(() => notification.classList.remove("show"), 3000);
}

async function fetchLocations() {
  if (allLocationsCache.length > 0) return; // Evita recarregar se já tiver em cache
  try {
    const response = await fetch(API_URLS.locais);
    if (!response.ok) throw new Error(t("alert-fetch-locations-error"));
    allLocationsCache = await response.json();
  } catch (error) {
    showNotification(error.message, false);
  }
}

async function fetchTools() {
  try {
    const response = await fetch(API_URLS.ferramentas);
    if (!response.ok) throw new Error(t("alert-fetch-all-error"));
    allToolsCache = await response.json();
  } catch (error) {
    showNotification(error.message, false);
  }
}

function renderTools(toolsToRender) {
  const tableBody = document.getElementById("tools-table-body");
  const cardsContainer = document.getElementById("tools-cards");
  tableBody.innerHTML = "";
  cardsContainer.innerHTML = "";

  if (toolsToRender.length === 0) {
    const emptyRow = `<tr><td colspan="10" class="empty-message">${t(
      "no-tools-found"
    )}</td></tr>`;
    tableBody.innerHTML = emptyRow;
    cardsContainer.innerHTML = `<div class="empty-message">${t(
      "no-tools-found"
    )}</div>`;
    return;
  }

  toolsToRender.forEach((tool) => {
    const location = allLocationsCache.find((l) => l.id === tool.id_local);
    const locationName = location
      ? location.nomeEspaco
      : t("location-not-found");
    const translatedState = t(stateTranslationKeys[tool.estado] || tool.estado);
    const availabilityClass = tool.disponibilidade
      ? "status-available"
      : "status-unavailable";
    const availabilityText = tool.disponibilidade
      ? t("tool-status-available")
      : t("tool-status-unavailable");

    // CRIA A LINHA DA TABELA (DESKTOP)
    const tableRow = document.createElement("tr");
    tableRow.setAttribute("data-tool-id", tool.id);
    tableRow.innerHTML = `
      <td>${tool.id}</td>
      <td>${tool.nome}</td>
      <td>${tool.marca}</td>
      <td>${tool.modelo}</td>
      <td>${tool.qrcode || t("table-na")}</td>
      <td>${translatedState}</td>
      <td class="${availabilityClass}">${availabilityText}</td>
      <td>${(tool.descricao || t("table-na")).substring(0, 30)}...</td>
      <td>${locationName}</td>
      <td class="action-buttons-cell">
        <button class="btn-action btn-edit" data-id="${
          tool.id
        }"><i class="fas fa-edit"></i> ${t("table-edit-btn")}</button>
        <button class="btn-action btn-delete" data-id="${
          tool.id
        }"><i class="fas fa-trash-alt"></i> ${t("table-delete-btn")}</button>
      </td>`;
    tableBody.appendChild(tableRow);

    // CRIA O CARD (MOBILE)
    const card = document.createElement("div");
    card.className = "tool-card";
    card.setAttribute("data-tool-id", tool.id);
    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${tool.nome}</div>
        <div class="card-badge">ID: ${tool.id}</div>
      </div>
      <div class="card-details">
        <div class="card-detail"><span class="detail-label">${t(
          "tool-brand"
        )}:</span><span class="detail-value">${tool.marca}</span></div>
        <div class="card-detail"><span class="detail-label">${t(
          "tool-model"
        )}:</span><span class="detail-value">${tool.modelo}</span></div>
        <div class="card-detail"><span class="detail-label">${t(
          "tool-state"
        )}:</span><span class="detail-value">${translatedState}</span></div>
        <div class="card-detail"><span class="detail-label">${t(
          "tool-available"
        )}:</span><span class="detail-value ${availabilityClass}">${availabilityText}</span></div>
        <div class="card-detail"><span class="detail-label">${t(
          "tool-location"
        )}:</span><span class="detail-value">${locationName}</span></div>
      </div>
      <div class="card-actions">
        <button class="card-action card-edit" data-id="${
          tool.id
        }"><i class="fas fa-edit"></i> ${t("table-edit-btn")}</button>
        <button class="card-action card-delete" data-id="${
          tool.id
        }"><i class="fas fa-trash-alt"></i> ${t("table-delete-btn")}</button>
      </div>`;
    cardsContainer.appendChild(card);
  });
}

function fillLocationsSelect() {
  const select = document.getElementById("tool-id_local");
  select.innerHTML = `<option value="">${t(
    "select-location-default"
  )}</option>`;
  allLocationsCache.forEach((location) => {
    select.innerHTML += `<option value="${location.id}">${location.nomeEspaco}</option>`;
  });
}

const toolModal = document.getElementById("tool-modal");

function openModal(isEdit = false, tool = null) {
  document.getElementById("tool-form").reset();
  fillLocationsSelect();

  const modalTitle = document.getElementById("modal-title");
  if (isEdit && tool) {
    modalTitle.textContent = t("modal-tool-edit-title");
    document.getElementById("tool-id").value = tool.id;
    document.getElementById("tool-name").value = tool.nome;
    document.getElementById("tool-brand").value = tool.marca;
    document.getElementById("tool-model").value = tool.modelo;
    document.getElementById("tool-qrcode").value = tool.qrcode || "";
    document.getElementById("tool-estado").value = tool.estado;
    document.getElementById("tool-disponibilidade").checked =
      tool.disponibilidade;
    document.getElementById("tool-descricao").value = tool.descricao || "";
    document.getElementById("tool-id_local").value = tool.id_local;
  } else {
    modalTitle.textContent = t("modal-tool-add-title");
    document.getElementById("tool-disponibilidade").checked = true;
  }
  toolModal.style.display = "flex";
}

function closeModal() {
  toolModal.style.display = "none";
}

async function handleSaveTool(event) {
  event.preventDefault();
  const form = document.getElementById("tool-form");
  const toolId = document.getElementById("tool-id").value;

  if (!form.checkValidity()) {
    showNotification(t("alert-fill-required"), false);
    return;
  }
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  data.disponibilidade = document.getElementById(
    "tool-disponibilidade"
  ).checked;
  data.id = toolId ? toolId : undefined;

  const isEditing = !!toolId;
  const url = isEditing
    ? `${API_URLS.ferramentaPut}/${toolId}`
    : API_URLS.ferramentaPost;
  const method = isEditing ? "PUT" : "POST";

  showLoading(true);
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    showNotification(t("alert-tool-save-success"), true);
    closeModal();
    await loadAllData(false);
  } catch (error) {
    showNotification(
      `${t("alert-tool-save-fail-error")} ${error.message}`,
      false
    );
  } finally {
    showLoading(false);
  }
}

async function handleDeleteTool(toolId) {
  if (!confirm(t("alert-tool-delete-confirm"))) return;

  showLoading(true);
  try {
    const response = await fetch(`${API_URLS.ferramentaDelete}/${toolId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(await response.text());
    showNotification(t("alert-tool-delete-success"), true);
    await loadAllData(false);
  } catch (error) {
    showNotification(`${t("alert-tool-delete-fail")} ${error.message}`, false);
  } finally {
    showLoading(false);
  }
}

function handleSearch() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();
  const filteredTools = allToolsCache.filter((tool) => {
    const location = allLocationsCache.find((l) => l.id === tool.id_local);
    const locationName = location ? location.nomeEspaco.toLowerCase() : "";
    const translatedState = t(
      stateTranslationKeys[tool.estado] || tool.estado
    ).toLowerCase();

    return (
      Object.values(tool).some((value) =>
        String(value).toLowerCase().includes(searchTerm)
      ) ||
      locationName.includes(searchTerm) ||
      translatedState.includes(searchTerm)
    );
  });
  renderTools(filteredTools);
}

async function loadAllData(showLoader = true) {
  if (showLoader) showLoading(true);
  await fetchLocations();
  await fetchTools();
  renderTools(allToolsCache);
  if (showLoader) showLoading(false);
}

document.addEventListener("DOMContentLoaded", async () => {
  const currentLanguage = localStorage.getItem("language") || "pt";
  await loadTranslations(currentLanguage);
  updateUI();

  await loadAllData();

  document
    .getElementById("add-tool-btn")
    .addEventListener("click", () => openModal(false));
  document
    .getElementById("tool-form")
    .addEventListener("submit", handleSaveTool);
  document
    .getElementById("search-input")
    .addEventListener("input", handleSearch);

  toolModal.querySelector(".close-btn").addEventListener("click", closeModal);
  document.getElementById("cancel-btn").addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target === toolModal) closeModal();
  });

  const mainContent = document.querySelector(".main-content");
  mainContent.addEventListener("click", async (e) => {
    const editButton = e.target.closest(".btn-edit, .card-edit");
    const deleteButton = e.target.closest(".btn-delete, .card-delete");

    if (editButton) {
      const toolId = editButton.dataset.id;
      const tool = allToolsCache.find((t) => t.id == toolId);
      openModal(true, tool);
    }
    if (deleteButton) {
      const toolId = deleteButton.dataset.id;
      await handleDeleteTool(toolId);
    }
  });
});