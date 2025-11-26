// ==================== ELEMENTOS DOM ====================
const toolsTableBody = document.getElementById("tools-table-body");
const toolsCards = document.getElementById("tools-cards");
const searchInput = document.getElementById("search-input");

// Elementos Modal Ferramenta
const toolModal = document.getElementById("tool-modal");
const modalTitle = document.getElementById("modal-title");
const toolForm = document.getElementById("tool-form");
const toolId = document.getElementById("tool-id");
const toolName = document.getElementById("tool-name");
const toolBrand = document.getElementById("tool-brand");
const toolModel = document.getElementById("tool-model");
const toolQrcode = document.getElementById("tool-qrcode");
const toolEstado = document.getElementById("tool-estado");
const toolDisponibilidade = document.getElementById("tool-disponibilidade");
const toolDescricao = document.getElementById("tool-descricao");
const toolIdLocal = document.getElementById("tool-id_local");
const addToolBtn = document.getElementById("add-tool-btn");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");
const closeBtn = document.querySelector(".close-btn");

// Elementos Modal Detalhes Local
const locationModal = document.getElementById("location-modal");
const locationDetailsBody = document.getElementById("location-details-body");
const closeLocationBtn = document.querySelector(".close-location-btn");
const closeLocationBtnFooter = document.getElementById("close-location-btn");

const notification = document.getElementById("notification");
const loadingOverlay = document.getElementById("loading-overlay");

// ==================== CONSTANTES DA API ====================
// Porta 8080 (Java/Spring)
const Ferramenta_GET = "http://localhost:8080/ferramentas/buscar";
const Ferramenta_POST = "http://localhost:8080/ferramentas/novaFerramenta";
const Ferramenta_PUT = "http://localhost:8080/ferramentas/editar";
const Ferramenta_DELETE = "http://localhost:8080/ferramentas/deletar";
const Locais_GET = "http://localhost:8080/locais/buscar";
const Location_Details_GET = "http://localhost:8080/detalhes/ferramentas/local";

// Porta 5000 (Python/Flask)
const Ferramenta_GET_BY_QRCODE =
  "http://localhost:5000/ferramentas/buscarPorQRCode";
const QR_SCAN_API = "http://localhost:5000/read-qrcode";

// Cache de locais (fundamental para resolver o problema do ID)
let locaisCache = [];

// ==================== CONFIGURAÇÃO DO SCANNER QR CODE ====================
const qrScannerModal = document.createElement("div");
qrScannerModal.innerHTML = `
<div id="qr-scanner-modal" class="modal">
  <div class="modal-content" style="max-width: 600px;">
    <div class="modal-header">
      <h2>Escanear QR Code</h2>
      <button class="close-btn close-scan-btn">&times;</button>
    </div>
    <div class="modal-body">
      <div id="scanner-container" style="text-align: center;">
        <video id="qr-video" width="100%" height="300" style="border: 2px solid var(--primary-color); border-radius: 8px; background: #000;"></video>
        <div id="scan-result" style="margin: 15px 0; font-weight: bold; min-height: 24px;">Aguardando inicialização da câmera...</div>
        <canvas id="qr-canvas" style="display: none;"></canvas>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn" id="cancel-scan-btn">Cancelar</button>
    </div>
  </div>
</div>
`;
document.body.appendChild(qrScannerModal.firstElementChild);

const videoElement = document.getElementById("qr-video");
const scanResultElement = document.getElementById("scan-result");
const canvasElement = document.getElementById("qr-canvas");
const context = canvasElement.getContext("2d");
let qrStream = null;
let isScanning = false;

// ==================== FUNÇÕES DE AUTENTICAÇÃO ====================

function getAuthHeaders(includeContentType = false) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    alert("Sessão expirada ou usuário não logado.");
    window.location.href = "../Login/LoginProfessor.html";
    throw new Error("Token não encontrado.");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function handleResponseError(response) {
  if (response.status === 401 || response.status === 403) {
    alert("Acesso negado. Faça login novamente.");
    window.location.href = "../LoginProf/LoginProf.html";
    throw new Error("Acesso não autorizado.");
  }
  const errorText = await response.text();
  throw new Error(`Erro: ${errorText} (Status: ${response.status})`);
}

// ==================== UTILITÁRIOS ====================

function showNotification(message, isSuccess = true) {
  notification.textContent = message;
  notification.className = `notification ${isSuccess ? "success" : "error"}`;
  notification.classList.add("show");
  setTimeout(() => notification.classList.remove("show"), 3000);
}

function showLoading(show) {
  loadingOverlay.style.display = show ? "flex" : "none";
}

function setupQRCodeField() {
  const qrCodeField = document.getElementById("tool-qrcode");
  if (qrCodeField && !document.getElementById("start-scan-btn")) {
    const qrContainer = qrCodeField.parentElement;
    if (qrContainer && qrContainer.className.includes("form-group")) {
      qrContainer.innerHTML = `
            <label for="tool-qrcode">QR Code</label>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="text" id="tool-qrcode" class="form-control" style="flex: 1;" />
                <button type="button" id="start-scan-btn" class="btn" style="white-space: nowrap;">
                    <i class="fas fa-camera"></i> Escanear
                </button>
            </div>
        `;
      qrContainer
        .querySelector("#start-scan-btn")
        .addEventListener("click", openQRScanner);
    }
  }
}

// ==================== DETALHES DO LOCAL ====================

async function openLocationDetails(localId) {
  if (!localId || localId === "undefined" || localId === "null") {
    showNotification(
      "Erro: Não foi possível identificar o ID do local.",
      false
    );
    return;
  }

  locationModal.style.display = "flex";
  locationDetailsBody.innerHTML = `
    <div style="text-align: center; padding: 20px;">
        <div class="loading"></div>
        <p>Buscando detalhes do local...</p>
    </div>`;

  try {
    const response = await fetch(`${Location_Details_GET}/${localId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) await handleResponseError(response);

    const data = await response.json();
    const detalhes = Array.isArray(data) ? data[0] : data;

    if (!detalhes) {
      locationDetailsBody.innerHTML = `<div style="padding: 20px; text-align: center;">Nenhum detalhe encontrado.</div>`;
      return;
    }

    locationDetailsBody.innerHTML = `
      <div class="detail-group">
        <h3><i class="fas fa-map-marker-alt"></i> ${
          detalhes.nomeLocal || detalhes.nomeEspaco || "Local"
        }</h3>
        
        <div class="info-row">
            <strong><i class="fas fa-cube"></i> Armário:</strong> 
            <span>${detalhes.armario || "N/A"}</span>
        </div>
        
        <div class="info-row">
            <strong><i class="fas fa-layer-group"></i> Prateleira:</strong> 
            <span>${detalhes.prateleira || "N/A"}</span>
        </div>

        <div class="info-row">
            <strong><i class="fas fa-box-open"></i> Estojo/Caixa:</strong> 
            <span>${detalhes.estojo || "N/A"}</span>
        </div>
        
        <div class="info-row" style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #eee;">
             <small style="color: #666;">ID do Local: ${
               detalhes.id || localId
             }</small>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Erro detalhes:", error);
    locationDetailsBody.innerHTML = `<p style="color:red; text-align:center;">Erro ao carregar detalhes: ${error.message}</p>`;
  }
}

function closeLocationModal() {
  locationModal.style.display = "none";
}

// ==================== SCANNER QR CODE ====================

async function fetchToolDataByQRCode(qrCode) {
  try {
    showLoading(true);
    const response = await fetch(`${Ferramenta_GET_BY_QRCODE}/${qrCode}`);

    if (response.status === 404) {
      showNotification("Ferramenta não encontrada.", false);
      toolForm.reset();
      toolDisponibilidade.checked = true;
      modalTitle.textContent = "Cadastrar Nova Ferramenta";
    } else if (response.ok) {
      const ferramenta = await response.json();
      toolId.value = ferramenta.id;
      toolName.value = ferramenta.nome;
      toolBrand.value = ferramenta.marca;
      toolModel.value = ferramenta.modelo;
      toolEstado.value = ferramenta.estado;
      toolDisponibilidade.checked = ferramenta.disponibilidade;
      toolDescricao.value = ferramenta.descricao || "";

      // Tenta preencher o select do local
      const idLocal =
        ferramenta.id_local || (ferramenta.local ? ferramenta.local.id : "");
      toolIdLocal.value = idLocal;

      modalTitle.textContent = "Editar Ferramenta";
      showNotification("Dados carregados via QR Code!", true);
    }
  } catch (error) {
    console.error(error);
    showNotification("Erro ao processar QR Code.", false);
  } finally {
    showLoading(false);
  }
}

async function initializeQRScanner() {
  try {
    if (!navigator.mediaDevices?.getUserMedia)
      throw new Error("Sem acesso à câmera.");

    scanResultElement.textContent = "Solicitando câmera...";
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    qrStream = stream;
    videoElement.srcObject = stream;

    await videoElement.play();
    scanResultElement.textContent = "Procurando QR Code...";
    startAutoScan();
  } catch (error) {
    scanResultElement.textContent = "Erro: " + error.message;
  }
}

function startAutoScan() {
  if (isScanning) return;
  isScanning = true;

  const scan = async () => {
    if (!isScanning || !videoElement.videoWidth) {
      if (isScanning) requestAnimationFrame(scan);
      return;
    }

    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0);

    canvasElement.toBlob(async (blob) => {
      if (!blob) return;
      try {
        const fd = new FormData();
        fd.append("image", blob);

        const res = await fetch(QR_SCAN_API, { method: "POST", body: fd });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.qrCode) {
            document.getElementById("tool-qrcode").value = json.qrCode;
            await fetchToolDataByQRCode(json.qrCode);
            closeQRScanner();
          }
        }
      } catch (e) {}
    });

    if (isScanning) setTimeout(scan, 800);
  };
  scan();
}

function openQRScanner() {
  document.getElementById("qr-scanner-modal").style.display = "flex";
  initializeQRScanner();
}

function closeQRScanner() {
  document.getElementById("qr-scanner-modal").style.display = "none";
  isScanning = false;
  if (qrStream) qrStream.getTracks().forEach((t) => t.stop());
}

// === ESTA É A FUNÇÃO QUE ESTAVA FALTANDO ===
function setupScannerEventListeners() {
  const closeScanBtn = document.querySelector(".close-scan-btn");
  if (closeScanBtn) {
    closeScanBtn.addEventListener("click", closeQRScanner);
  }

  const cancelScanBtn = document.getElementById("cancel-scan-btn");
  if (cancelScanBtn) {
    cancelScanBtn.addEventListener("click", closeQRScanner);
  }

  const scannerModal = document.getElementById("qr-scanner-modal");
  if (scannerModal) {
    scannerModal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeQRScanner();
      }
    });
  }
}

// ==================== CRUD E LÓGICA PRINCIPAL ====================

async function loadLocais() {
  try {
    toolIdLocal.innerHTML = '<option value="">Carregando...</option>';
    const response = await fetch(Locais_GET, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Falha ao carregar locais");

    locaisCache = await response.json();
    return locaisCache;
  } catch (error) {
    console.error(error);
    toolIdLocal.innerHTML = '<option value="">Erro ao carregar</option>';
    return [];
  }
}

function fillLocaisSelect() {
  toolIdLocal.innerHTML = '<option value="">Selecione um local...</option>';
  locaisCache.forEach((local) => {
    const opt = document.createElement("option");
    opt.value = local.id;
    opt.textContent = local.nomeEspaco || local.nome || `Local ID ${local.id}`;
    toolIdLocal.appendChild(opt);
  });
}

async function loadFerramentas() {
  const response = await fetch(Ferramenta_GET, { headers: getAuthHeaders() });
  return await response.json();
}

// Função auxiliar para encontrar ID do local pelo nome
function encontrarIdLocalPorNome(nomeLocal) {
  if (!nomeLocal) return null;
  if (locaisCache.length === 0) return null;

  // Procura no cache de locais um que tenha o mesmo nome
  const localEncontrado = locaisCache.find(
    (l) =>
      (l.nomeEspaco &&
        l.nomeEspaco.trim().toLowerCase() === nomeLocal.trim().toLowerCase()) ||
      (l.nome && l.nome.trim().toLowerCase() === nomeLocal.trim().toLowerCase())
  );

  return localEncontrado ? localEncontrado.id : null;
}

function createToolCard(ferramenta, nomeLocal, idLocalReal) {
  const card = document.createElement("div");
  card.className = "tool-card";
  card.innerHTML = `
        <div class="card-header">
          <div class="card-title">${ferramenta.nome}</div>
          <div class="card-badge">ID: ${ferramenta.id}</div>
        </div>
        <div class="card-details">
          <div class="card-detail"><span class="detail-label">Marca:</span><span class="detail-value">${
            ferramenta.marca
          }</span></div>
          <div class="card-detail"><span class="detail-label">Modelo:</span><span class="detail-value">${
            ferramenta.modelo
          }</span></div>
          <div class="card-detail"><span class="detail-label">Local:</span><span class="detail-value">${nomeLocal}</span></div>
          <div class="card-detail"><span class="detail-label">Disp:</span><span class="detail-value ${
            ferramenta.disponibilidade
              ? "status-available"
              : "status-unavailable"
          }">${ferramenta.disponibilidade ? "Sim" : "Não"}</span></div>
        </div>
        <div class="card-actions">
           <button class="btn-action btn-details" data-local-id="${idLocalReal}"><i class="fas fa-info-circle"></i> Detalhes</button>
           <button class="btn-action btn-edit" data-id="${
             ferramenta.id
           }"><i class="fas fa-edit"></i> Editar</button>
           <button class="btn-action btn-delete" data-id="${
             ferramenta.id
           }"><i class="fas fa-trash-alt"></i> Excluir</button>
        </div>
    `;
  return card;
}

async function loadToolsTable() {
  showLoading(true);
  try {
    // 1. Carrega Ferramentas
    const ferramentas = await loadFerramentas();

    // 2. Garante que locais estão carregados para fazer a busca
    if (locaisCache.length === 0) {
      await loadLocais();
    }

    toolsTableBody.innerHTML = "";
    toolsCards.innerHTML = "";

    if (ferramentas.length === 0) {
      toolsTableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;">Nenhuma ferramenta.</td></tr>`;
      return;
    }

    ferramentas.forEach((ferramenta) => {
      // Tenta pegar o ID direto. Se não tiver, busca na lista de locais pelo NOME
      let idLocalReal = ferramenta.id_local || ferramenta.localId;

      if (!idLocalReal && ferramenta.nomeLocal) {
        idLocalReal = encontrarIdLocalPorNome(ferramenta.nomeLocal);
      }

      // Nome para exibição
      const nomeLocal = ferramenta.nomeLocal || "N/A";

      const row = document.createElement("tr");
      row.innerHTML = `
            <td>${ferramenta.id}</td>
            <td>${ferramenta.nome}</td>
            <td>${ferramenta.marca}</td>
            <td>${ferramenta.modelo}</td>
            <td>${ferramenta.qrcode || "-"}</td>
            <td>${ferramenta.estado}</td>
            <td class="${
              ferramenta.disponibilidade
                ? "status-available"
                : "status-unavailable"
            }">${ferramenta.disponibilidade ? "Sim" : "Não"}</td>
            <td>${
              ferramenta.descricao
                ? ferramenta.descricao.substring(0, 15) + "..."
                : "-"
            }</td>
            <td>${nomeLocal}</td> 
            <td class="actions">
               <button class="btn-action btn-details" data-local-id="${idLocalReal}"><i class="fas fa-info-circle"></i></button>
               <button class="btn-action btn-edit" data-id="${
                 ferramenta.id
               }"><i class="fas fa-edit"></i></button>
               <button class="btn-action btn-delete" data-id="${
                 ferramenta.id
               }"><i class="fas fa-trash-alt"></i></button>
            </td>
          `;
      toolsTableBody.appendChild(row);
      toolsCards.appendChild(
        createToolCard(ferramenta, nomeLocal, idLocalReal)
      );
    });

    // Event Listeners
    document.querySelectorAll(".btn-details").forEach((btn) =>
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-local-id");
        if (id && id !== "null" && id !== "undefined") {
          openLocationDetails(id);
        } else {
          showNotification("Local não encontrado no sistema.", false);
        }
      })
    );

    document.querySelectorAll(".btn-edit").forEach((btn) =>
      btn.addEventListener("click", function () {
        openEditToolModal(this.getAttribute("data-id"));
      })
    );
    document.querySelectorAll(".btn-delete").forEach((btn) =>
      btn.addEventListener("click", function () {
        deleteTool(this.getAttribute("data-id"));
      })
    );
  } catch (error) {
    console.error(error);
  } finally {
    showLoading(false);
  }
}

function searchTools() {
  const term = searchInput.value.toLowerCase();
  toolsTableBody
    .querySelectorAll("tr")
    .forEach(
      (r) =>
        (r.style.display = r.textContent.toLowerCase().includes(term)
          ? ""
          : "none")
    );
}

async function openAddToolModal() {
  toolForm.reset();
  toolId.value = "";
  modalTitle.textContent = "Adicionar Ferramenta";
  toolModal.style.display = "flex";
  setupQRCodeField();
  if (locaisCache.length === 0) await loadLocais();
  fillLocaisSelect();
}

async function openEditToolModal(id) {
  try {
    showLoading(true);
    const res = await fetch(`${Ferramenta_GET}/${id}`, {
      headers: getAuthHeaders(),
    });
    const ferramenta = await res.json();

    setupQRCodeField();
    if (locaisCache.length === 0) await loadLocais();
    fillLocaisSelect();

    toolId.value = ferramenta.id;
    toolName.value = ferramenta.nome;
    toolBrand.value = ferramenta.marca;
    toolModel.value = ferramenta.modelo;
    document.getElementById("tool-qrcode").value = ferramenta.qrcode || "";
    toolEstado.value = ferramenta.estado;
    toolDisponibilidade.checked = ferramenta.disponibilidade;
    toolDescricao.value = ferramenta.descricao || "";

    // Tenta setar o select do local
    let idLocal = ferramenta.id_local || ferramenta.localId;
    if (!idLocal && ferramenta.nomeLocal) {
      idLocal = encontrarIdLocalPorNome(ferramenta.nomeLocal);
    }
    toolIdLocal.value = idLocal || "";

    modalTitle.textContent = "Editar Ferramenta";
    toolModal.style.display = "flex";
  } catch (e) {
    console.error(e);
  } finally {
    showLoading(false);
  }
}

function closeModal() {
  toolModal.style.display = "none";
}

async function saveTool() {
  if (
    !toolName.value ||
    !toolBrand.value ||
    !toolModel.value ||
    !toolIdLocal.value
  ) {
    showNotification("Preencha os campos obrigatórios.", false);
    return;
  }

  const data = {
    nome: toolName.value,
    marca: toolBrand.value,
    modelo: toolModel.value,
    qrcode: document.getElementById("tool-qrcode").value,
    estado: toolEstado.value,
    disponibilidade: toolDisponibilidade.checked,
    descricao: toolDescricao.value,
    id_local: toolIdLocal.value,
  };

  try {
    showLoading(true);
    const method = toolId.value ? "PUT" : "POST";
    const url = toolId.value
      ? `${Ferramenta_PUT}/${toolId.value}`
      : Ferramenta_POST;

    const res = await fetch(url, {
      method: method,
      headers: getAuthHeaders(true),
      body: JSON.stringify(data),
    });

    if (!res.ok) await handleResponseError(res);

    showNotification("Salvo com sucesso!", true);
    closeModal();
    loadToolsTable();
  } catch (e) {
    showNotification("Erro ao salvar: " + e.message, false);
  } finally {
    showLoading(false);
  }
}

async function deleteTool(id) {
  if (!confirm("Excluir esta ferramenta?")) return;
  try {
    showLoading(true);
    const res = await fetch(`${Ferramenta_DELETE}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) await handleResponseError(res);
    showNotification("Excluído com sucesso!", true);
    loadToolsTable();
  } catch (e) {
    console.error(e);
  } finally {
    showLoading(false);
  }
}

// ==================== INICIALIZAÇÃO ====================

addToolBtn.addEventListener("click", openAddToolModal);
saveBtn.addEventListener("click", saveTool);
cancelBtn.addEventListener("click", closeModal);
closeBtn.addEventListener("click", closeModal);
searchInput.addEventListener("input", searchTools);

if (closeLocationBtn)
  closeLocationBtn.addEventListener("click", closeLocationModal);
if (closeLocationBtnFooter)
  closeLocationBtnFooter.addEventListener("click", closeLocationModal);

window.addEventListener("click", (e) => {
  if (e.target === toolModal) closeModal();
  if (e.target === locationModal) closeLocationModal();
});

document.addEventListener("DOMContentLoaded", async () => {
  // Dark Mode
  const toggle = document.getElementById("theme-toggle-btn");
  if (toggle) {
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      const i = toggle.querySelector("i");
      if (i) i.className = isDark ? "fas fa-sun" : "fas fa-moon";
    });
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark-mode");
      toggle.querySelector("i").className = "fas fa-sun";
    }
  }

  setupScannerEventListeners();

  // Carregamento Inicial
  try {
    await loadLocais(); // Carrega locais PRIMEIRO para ter o cache
    fillLocaisSelect();
    await loadToolsTable(); // Depois carrega ferramentas e faz o match
  } catch (e) {
    console.error("Erro inicialização:", e);
  }
});
