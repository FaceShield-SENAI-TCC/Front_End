// ========================== LÓGICA DE TRADUÇÃO ==========================
let translations = {};

function t(key, replacements = {}) {
  let text = translations[key] || key;
  for (const placeholder in replacements) {
    text = text.replace(`{${placeholder}}`, replacements[placeholder]);
  }
  return text;
}

async function loadTranslations(lang) {
  try {
    const response = await fetch(`./translate/${lang}.json`);
    if (!response.ok)
      throw new Error(`Translation file not found for: ${lang}`);
    translations = await response.json();
  } catch (error) {
    console.error("Failed to load translation file:", error);
  }
}

function updateUI() {
  document.querySelectorAll("[data-translate-key]").forEach((element) => {
    const key = element.getAttribute("data-translate-key");
    if (key) {
      if (element.tagName === "INPUT" && element.placeholder) {
        element.placeholder = t(key);
      } else {
        element.textContent = t(key);
      }
    }
  });
  document.title = t("list-title");
}

async function switchLanguage(lang) {
  localStorage.setItem("language", lang);
  await loadTranslations(lang);
  updateUI();
  // Recarrega os dados da tabela para aplicar traduções dinâmicas (ex: tipo de usuário)
  loadUsersTable();
}

window.switchLanguage = switchLanguage;

// ========================== LÓGICA DA PÁGINA ==========================

// URLs da API
const API_BASE = "http://localhost:8080/usuarios";

// Service para comunicação com a API
const userService = {
  getAll: async () => {
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error(t("alert-fetch-all-error"));
      return await response.json();
    } catch (error) {
      showNotification("error", error.message);
      return [];
    }
  },
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) throw new Error(t("alert-fetch-id-error"));
      return await response.json();
    } catch (error) {
      showNotification("error", error.message);
      return null;
    }
  },
  save: async (user) => {
    try {
      const url = user.id
        ? `${API_BASE}/editar/${user.id}`
        : `${API_BASE}/novoUsuario`;
      const method = user.id ? "PUT" : "POST";
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      return await response.json();
    } catch (error) {
      showNotification(
        "error",
        `${t("alert-save-fail-error")} ${error.message}`
      );
      return null;
    }
  },
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/deletar/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      return true;
    } catch (error) {
      showNotification("error", `${t("alert-delete-fail")} ${error.message}`);
      return false;
    }
  },
};

// Variável global para cache dos usuários
let allUsers = [];

// Função para exibir notificações
function showNotification(type, message) {
  const notificationElement = document.getElementById("notification");
  if (!notificationElement) return;
  notificationElement.textContent = message;
  notificationElement.className = `notification ${type} show`;
  setTimeout(() => {
    notificationElement.classList.remove("show");
  }, 5000);
}

// Converte o tipo de usuário da API para o texto traduzido
function getTranslatedUserType(type) {
  if (type === "ALUNO") return t("user-type-student");
  if (type === "PROFESSOR") return t("user-type-teacher");
  return type;
}

// Popula a tabela com os dados dos usuários
function renderUsersTable(users) {
  const tableBody = document.getElementById("users-table-body");
  tableBody.innerHTML = "";
  users.forEach((user) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.nome}</td>
      <td>${user.sobrenome}</td>
      <td>${user.turma}</td>
      <td>${getTranslatedUserType(user.tipoUsuario)}</td>
      <td class="actions">
        <button class="btn-icon" onclick="openEditModal(${
          user.id
        })"><i class="fas fa-edit"></i></button>
        <button class="btn-icon btn-danger" onclick="deleteUser(${
          user.id
        })"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Carrega os usuários da API e renderiza a tabela
async function loadUsersTable() {
  allUsers = await userService.getAll();
  renderUsersTable(allUsers);
}

// Funções do Modal
function openModal() {
  document.getElementById("user-form").reset();
  document.getElementById("user-id").value = "";
  document.getElementById("modal-title").textContent = t("modal-add-title");
  document.getElementById("user-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("user-modal").style.display = "none";
}

async function openEditModal(id) {
  const user = await userService.getById(id);
  if (user) {
    document.getElementById("user-id").value = user.id;
    document.getElementById("first-name").value = user.nome;
    document.getElementById("last-name").value = user.sobrenome;
    document.getElementById("class-select").value = user.turma; // Corrigido para o ID do select
    document.getElementById("user-type-select").value =
      user.tipoUsuario === "ALUNO" ? "Aluno" : "Professor"; // Corrigido para o ID do select
    document.getElementById("modal-title").textContent = t("modal-edit-title");
    document.getElementById("user-modal").style.display = "flex";
  }
}

// Ações (salvar, deletar, pesquisar)
async function saveUser() {
  const userId = document.getElementById("user-id").value;
  const firstName = document.getElementById("first-name").value;
  const lastName = document.getElementById("last-name").value;
  const userClass = document.getElementById("class-select").value;
  const userType = document.getElementById("user-type-select").value;

  if (!firstName || !lastName || !userClass || !userType) {
    showNotification("error", t("alert-fill-required"));
    return;
  }

  const user = {
    id: userId ? parseInt(userId) : null,
    nome: firstName,
    sobrenome: lastName,
    turma: userClass,
    tipoUsuario: userType.toUpperCase(),
  };

  const result = await userService.save(user);
  if (result) {
    loadUsersTable();
    closeModal();
    showNotification("success", t("alert-save-success"));
  }
}

async function deleteUser(id) {
  if (confirm(t("alert-delete-confirm"))) {
    const success = await userService.delete(id);
    if (success) {
      loadUsersTable();
      showNotification("success", t("user-deleted-success"));
    }
  }
}

function searchUsers() {
  const searchTerm = document
    .getElementById("search-input")
    .value.trim()
    .toLowerCase();
  if (searchTerm === "") {
    renderUsersTable(allUsers);
    return;
  }
  const filteredUsers = allUsers.filter(
    (user) =>
      (user.nome && user.nome.toLowerCase().includes(searchTerm)) ||
      (user.sobrenome && user.sobrenome.toLowerCase().includes(searchTerm)) ||
      (user.turma && user.turma.toLowerCase().includes(searchTerm))
  );
  renderUsersTable(filteredUsers);
}

// Expõe funções para o escopo global para serem chamadas pelo HTML (onclick)
window.openEditModal = openEditModal;
window.deleteUser = deleteUser;

// ========================== INICIALIZAÇÃO ==========================
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Carrega as traduções primeiro
  const currentLanguage = localStorage.getItem("language") || "pt";
  await loadTranslations(currentLanguage);
  updateUI();

  // 2. Seleciona os elementos do DOM
  const addUserBtn = document.getElementById("add-user-btn");
  const modal = document.getElementById("user-modal");
  const closeBtn = modal.querySelector(".close-btn");
  const cancelBtn = modal.querySelector(
    '[data-translate-key="modal-btn-cancel"]'
  );
  const userForm = document.getElementById("user-form");
  const searchInput = document.getElementById("search-input");

  // 3. Adiciona os event listeners
  addUserBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  userForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveUser();
  });
  searchInput.addEventListener("input", searchUsers);

  // 4. Carrega os dados iniciais
  loadUsersTable();
});
