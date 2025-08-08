// URLs da API
const API_TOOLS_GET_URL = "http://localhost:8080/ferramentas/buscar";
const API_TOOLS_POST_URL = "http://localhost:8080/ferramentas/novaFerramenta";
const API_TOOLS_PUT_URL = "http://localhost:8080/ferramentas/editar";
const API_TOOLS_DELETE_URL = "http://localhost:8080/ferramentas/deletar";
const API_LOCATIONS_URL = "http://localhost:8080/locais/buscar";

// Elementos DOM
const toolsTableBody = document.getElementById("tools-table-body");
const searchInput = document.getElementById("search-input");
const toolModal = document.getElementById("tool-modal");
const modalTitle = document.getElementById("modal-title");
const toolForm = document.getElementById("tool-form");
const toolId = document.getElementById("tool-id");
const toolName = document.getElementById("tool-name");
const toolBrand = document.getElementById("tool-brand");
const toolModel = document.getElementById("tool-model");
const toolStock = document.getElementById("tool-stock");
const toolLocation = document.getElementById("tool-location");
const locationDetails = document.getElementById("location-details");
const locationSpaceDetail = document.getElementById("location-space-detail");
const locationCabinetDetail = document.getElementById(
  "location-cabinet-detail"
);
const locationShelfDetail = document.getElementById("location-shelf-detail");
const locationCaseDetail = document.getElementById("location-case-detail");
const addToolBtn = document.getElementById("add-tool-btn");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");
const closeBtn = document.querySelector(".close-btn");
const notification = document.getElementById("notification");
const loadingOverlay = document.getElementById("loading-overlay");

// Variáveis para armazenar dados
let tools = [];
let locations = [];

// Função para mostrar notificação
function showNotification(type, message) {
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// Função para mostrar/ocultar loading
function showLoading(show) {
  loadingOverlay.style.display = show ? "flex" : "none";
}

// Função para buscar ferramentas da API
async function fetchTools() {
  showLoading(true);
  try {
    const response = await fetch(API_TOOLS_GET_URL);

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar ferramentas:", error);
    showNotification("error", "Falha ao carregar ferramentas do servidor");
    return [];
  } finally {
    showLoading(false);
  }
}

// Função para buscar locais da API
async function fetchLocations() {
  try {
    const response = await fetch(API_LOCATIONS_URL);

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar locais:", error);
    showNotification("error", "Falha ao carregar locais do servidor");
    return [];
  }
}

// Função para carregar locais no dropdown
function loadLocationsDropdown() {
  toolLocation.innerHTML = '<option value="">Selecione um local</option>';

  locations.forEach((location) => {
    const option = document.createElement("option");
    option.value = location.id;
    option.textContent = `${location.nome_espaco} (Armário: ${location.armario}, Prateleira: ${location.prateleira})`;
    toolLocation.appendChild(option);
  });
}

// Função para mostrar detalhes do local selecionado
function showLocationDetails(locationId) {
  const location = locations.find((l) => l.id == locationId);

  if (location) {
    locationSpaceDetail.textContent = location.nome_espaco;
    locationCabinetDetail.textContent = location.armario;
    locationShelfDetail.textContent = location.prateleira;
    locationCaseDetail.textContent = location.estojo || "N/A";
    locationDetails.style.display = "block";
  } else {
    locationDetails.style.display = "none";
  }
}

// Função para carregar ferramentas na tabela
function loadToolsTable(toolsArray = tools) {
  toolsTableBody.innerHTML = "";

  if (toolsArray.length === 0) {
    // Mostrar estado vazio se necessário
    return;
  }

  toolsArray.forEach((tool) => {
    const row = document.createElement("tr");

    // Encontrar o local correspondente
    const location = locations.find((l) => l.id == tool.localId);

    const estojoDisplay = tool.estojo
      ? `<span class="location-badge"><i class="fas fa-box"></i> ${tool.estojo}</span>`
      : '<span class="location-badge"><i class="fas fa-box"></i> N/A</span>';

    row.innerHTML = `
                    <td>${tool.id}</td>
                    <td>${tool.name}</td>
                    <td>${tool.brand}</td>
                    <td>${tool.model}</td>
                    <td class="${tool.stock < 5 ? "quantity-low" : ""}">${
      tool.stock
    }</td>
                    <td><span class="location-badge"><i class="fas fa-building"></i> ${
                      location ? location.nome_espaco : "N/A"
                    }</span></td>
                    <td><span class="location-badge"><i class="fas fa-archive"></i> ${
                      location ? location.armario : "N/A"
                    }</span></td>
                    <td><span class="location-badge"><i class="fas fa-layer-group"></i> ${
                      location ? location.prateleira : "N/A"
                    }</span></td>
                    <td>${estojoDisplay}</td>
                    <td class="action-buttons-cell">
                        <button class="btn-action btn-edit" data-id="${
                          tool.id
                        }">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-action btn-delete" data-id="${
                          tool.id
                        }">
                            <i class="fas fa-trash-alt"></i> Excluir
                        </button>
                    </td>
                `;
    toolsTableBody.appendChild(row);
  });

  // Adicionar event listeners para os novos botões
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      openEditToolModal(id);
    });
  });

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      deleteTool(id);
    });
  });
}

// Função de pesquisa
function searchTools() {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchTerm) ||
      tool.brand.toLowerCase().includes(searchTerm) ||
      tool.model.toLowerCase().includes(searchTerm) ||
      (tool.localId &&
        locations.some(
          (l) =>
            l.id == tool.localId &&
            l.nome_espaco.toLowerCase().includes(searchTerm)
        ))
  );
  loadToolsTable(filteredTools);
}

// Funções do modal
function openAddToolModal() {
  toolForm.reset();
  toolId.value = "";
  modalTitle.textContent = "Adicionar Nova Ferramenta";
  toolLocation.value = "";
  locationDetails.style.display = "none";
  toolModal.style.display = "flex";
}

function openEditToolModal(id) {
  const tool = tools.find((t) => t.id == id);
  if (tool) {
    toolId.value = tool.id;
    toolName.value = tool.name;
    toolBrand.value = tool.brand;
    toolModel.value = tool.model;
    toolStock.value = tool.stock;

    // Selecionar o local correspondente
    if (tool.localId) {
      toolLocation.value = tool.localId;
      showLocationDetails(tool.localId);
    } else {
      toolLocation.value = "";
      locationDetails.style.display = "none";
    }

    modalTitle.textContent = "Editar Ferramenta";
    toolModal.style.display = "flex";
  }
}

function closeModal() {
  toolModal.style.display = "none";
}

async function saveTool() {
  const id = toolId.value;
  const name = toolName.value;
  const brand = toolBrand.value;
  const model = toolModel.value;
  const stock = parseInt(toolStock.value);
  const localId = toolLocation.value;

  // Validar campos obrigatórios
  if (!name || !brand || !model || isNaN(stock) || !localId) {
    showNotification("error", "Preencha todos os campos obrigatórios");
    return;
  }

  // Construir objeto no formato esperado pelo servidor (CORREÇÃO)
  const toolData = {
    nome_espaco: name, // Campo alterado para 'nome'
    marca: brand, // Campo alterado para 'marca'
    modelo: model, // Campo alterado para 'modelo'
    estoque: stock, // Campo alterado para 'estoque'
    local: {
      // Estrutura aninhada
      id: parseInt(localId),
    },
  };

  showLoading(true);
  try {
    let response;
    let url;

    if (id) {
      // Atualização (PUT)
      url = API_TOOLS_PUT_URL;
      response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toolData),
      });
    } else {
      // Criação (POST)
      url = API_TOOLS_POST_URL;
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toolData),
      });
    }

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    // Recarregar ferramentas
    tools = await fetchTools();
    loadToolsTable(tools);
    closeModal();
    showNotification(
      "success",
      id
        ? "Ferramenta atualizada com sucesso!"
        : "Ferramenta criada com sucesso!"
    );
  } catch (error) {
    console.error("Erro completo ao salvar ferramenta:", error);
    showNotification("error", error.message || "Erro ao salvar ferramenta");

    // Log detalhado para diagnóstico
    console.error("Detalhes do erro:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  } finally {
    showLoading(false);
  }
}

// Função para excluir ferramenta
async function deleteTool(id) {
  if (!confirm("Tem certeza que deseja excluir esta ferramenta?")) return;

  showLoading(true);
  try {
    const response = await fetch(`${API_TOOLS_DELETE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Erro ${response.status}: ${errorText || response.statusText}`
      );
    }

    // Recarregar ferramentas
    tools = await fetchTools();
    loadToolsTable(tools);
    showNotification("success", "Ferramenta excluída com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir ferramenta:", error);
    showNotification("error", error.message || "Erro ao excluir ferramenta");
  } finally {
    showLoading(false);
  }
}

// Inicializar aplicação
async function init() {
  try {
    // Carregar locais primeiro
    locations = await fetchLocations();
    loadLocationsDropdown();

    // Carregar ferramentas
    tools = await fetchTools();
    loadToolsTable(tools);
  } catch (error) {
    console.error("Erro na inicialização:", error);
    showNotification("error", "Falha ao iniciar a aplicação");
  }
}

// Event Listeners
addToolBtn.addEventListener("click", openAddToolModal);
saveBtn.addEventListener("click", saveTool);
cancelBtn.addEventListener("click", closeModal);
closeBtn.addEventListener("click", closeModal);
searchInput.addEventListener("input", searchTools);

// Mostrar detalhes do local quando selecionado
toolLocation.addEventListener("change", function () {
  if (this.value) {
    showLocationDetails(this.value);
  } else {
    locationDetails.style.display = "none";
  }
});

// Fechar modal ao clicar fora do conteúdo
window.addEventListener("click", (e) => {
  if (e.target === toolModal) {
    closeModal();
  }
});

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", init);
