// Elementos DOM
const toolsTableBody = document.getElementById("tools-table-body");
const toolsCards = document.getElementById("tools-cards");
const searchInput = document.getElementById("search-input");
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
const notification = document.getElementById("notification");
const loadingOverlay = document.getElementById("loading-overlay");

// Constantes da API Java (porta 8080) - USARÃO TOKEN
const Ferramenta_GET = "http://localhost:8080/ferramentas/buscar";
const Ferramenta_POST = "http://localhost:8080/ferramentas/novaFerramenta";
const Ferramenta_PUT = "http://localhost:8080/ferramentas/editar";
const Ferramenta_DELETE = "http://localhost:8080/ferramentas/deletar";
const Ferramenta_GET_BY_QRCODE =
  "http://localhost:5000/ferramentas/buscarPorQRCode";
const locais_get = "http://localhost:8080/locais/buscar";

const QR_SCAN_API = "http://localhost:5000/read-qrcode";

// QR Scanner - Modal e elementos
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

// Variáveis do scanner
const videoElement = document.getElementById("qr-video");
const scanResultElement = document.getElementById("scan-result");
const canvasElement = document.getElementById("qr-canvas");
const context = canvasElement.getContext("2d");
let qrStream = null;
let isScanning = false;

// Cache de locais
let locaisCache = [];

// ==================== FUNÇÕES DE AUTENTICAÇÃO (ADICIONADAS) ====================

/**
 * Pega o token do localStorage e retorna o cabeçalho de Autorização.
 * Se o token não existir, lança um erro e redireciona para o login.
 * @param {boolean} includeContentType - Define se o 'Content-Type: application/json' deve ser incluído
 * @returns {HeadersInit} - Objeto de Headers pronto para o fetch
 */
function getAuthHeaders(includeContentType = false) {
  // Pega o token que foi salvo no login
  const token = localStorage.getItem("authToken");

  if (!token) {
    alert("Sessão expirada ou usuário não logado.");
    // ATENÇÃO: Ajuste a URL abaixo para a sua página de login de professor
    window.location.href = "../Login/LoginProfessor.html"; // Exemplo
    throw new Error("Token não encontrado. Redirecionando para login.");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

/**
 * Função para tratar erros de resposta da API, especialmente 401/403.
 * @param {Response} response - O objeto de resposta do fetch
 */
async function handleResponseError(response) {
  if (response.status === 401 || response.status === 403) {
    // Token inválido ou expirado
    alert("Acesso negado. Sua sessão pode ter expirado. Faça login novamente.");
    // ATENÇÃO: Ajuste a URL abaixo para a sua página de login de professor
    window.location.href = "../LoginProf/LoginProf.html"; // Exemplo
    throw new Error("Acesso não autorizado (401/403).");
  }

  const errorText = await response.text();
  throw new Error(
    `Erro na requisição: ${errorText} (Status: ${response.status})`
  );
}

// ==================== RESTANTE DO SEU CÓDIGO (MODIFICADO) ====================

// Função para mostrar notificação
function showNotification(message, isSuccess = true) {
  notification.textContent = message;
  notification.className = `notification ${isSuccess ? "success" : "error"}`;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Mostrar/ocultar overlay de carregamento
function showLoading(show) {
  loadingOverlay.style.display = show ? "flex" : "none";
}

// Modificar o campo QR Code no formulário existente para adicionar botão de escanear
function setupQRCodeField() {
  const qrCodeField = document.getElementById("tool-qrcode");
  // Verifica se o qrCodeField existe E se o botão ainda não foi criado
  if (qrCodeField && !document.getElementById("start-scan-btn")) {
    const qrContainer = qrCodeField.parentElement;

    // Criar container para o campo QR Code com botão
    const newQrContainer = document.createElement("div");
    newQrContainer.className = "form-group";

    // Substitui o input antigo pelo novo layout
    // (Presume que o input antigo está sozinho no 'form-group')
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
      // Adicionar event listener para o botão de escanear
      qrContainer
        .querySelector("#start-scan-btn")
        .addEventListener("click", openQRScanner);
    }
  }
}
// Nova função para buscar dados da ferramenta pelo QR Code (SEM AUTENTICAÇÃO)
async function fetchToolDataByQRCode(qrCode) {
  try {
    showLoading(true);

    // <-- MODIFICADO: Chamada fetch simples, sem o getAuthHeaders()
    const response = await fetch(`${Ferramenta_GET_BY_QRCODE}/${qrCode}`);

    if (response.status === 404) {
      // Ferramenta não encontrada - modo de cadastro
      showNotification(
        "Ferramenta não encontrada. Preencha os dados para cadastrar.",
        false
      );

      // Limpa formulário, mas mantém o QR Code
      toolId.value = "";
      toolName.value = "";
      toolBrand.value = "";
      toolModel.value = "";
      toolEstado.value = "";
      toolDisponibilidade.checked = true;
      toolDescricao.value = "";
      toolIdLocal.value = "";
      // O 'tool-qrcode' já está preenchido pelo scanner

      modalTitle.textContent = "Cadastrar Nova Ferramenta";
      toolName.focus();
    } else if (response.ok) {
      // Ferramenta encontrada - modo de edição
      const ferramenta = await response.json();

      toolId.value = ferramenta.id;
      toolName.value = ferramenta.nome;
      toolBrand.value = ferramenta.marca;
      toolModel.value = ferramenta.modelo;
      // document.getElementById("tool-qrcode").value = ferramenta.qrcode; // Já está preenchido
      toolEstado.value = ferramenta.estado;
      toolDisponibilidade.checked = ferramenta.disponibilidade;
      toolDescricao.value = ferramenta.descricao || "";
      toolIdLocal.value = ferramenta.id_local;

      modalTitle.textContent = "Editar Ferramenta";
      showNotification("Dados da ferramenta carregados automaticamente!", true);
    } else {
      // <-- MODIFICADO: Tratamento de erro simples, sem o handleResponseError()
      const errorText = await response.text();
      throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error("Erro ao buscar dados da ferramenta:", error);
    // Não precisa mais checar por "Token" aqui
    showNotification(
      `Erro ao carregar dados da ferramenta: ${error.message}`,
      false
    );
  } finally {
    showLoading(false);
  }
}

// Função para inicializar o scanner com escaneamento automático
async function initializeQRScanner() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Câmera não suportada neste dispositivo");
    }

    scanResultElement.textContent = "Solicitando permissão da câmera...";

    const constraints = {
      video: {
        facingMode: "environment", // Preferir câmera traseira
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    qrStream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = qrStream;

    await new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        videoElement
          .play()
          .then(resolve)
          .catch((error) => {
            console.error("Erro ao reproduzir vídeo:", error);
            resolve();
          });
      };
    });

    scanResultElement.textContent = "Câmera ativa. Procurando QR Code...";
    scanResultElement.style.color = "var(--primary-color)";

    startAutoScan(); // Inicia o escaneamento
  } catch (error) {
    console.error("Erro ao acessar câmera:", error);

    // Tenta configuração alternativa
    if (
      error.name === "OverconstrainedError" ||
      error.name === "ConstraintNotSatisfiedError"
    ) {
      try {
        scanResultElement.textContent = "Tentando configuração alternativa...";
        qrStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        videoElement.srcObject = qrStream;
        await videoElement.play();
        startAutoScan();
        return;
      } catch (fallbackError) {
        console.error("Configuração alternativa também falhou:", fallbackError);
      }
    }

    scanResultElement.textContent = "Erro: " + error.message;
    scanResultElement.style.color = "var(--accent-color)";
  }
}

// Função para escaneamento automático contínuo
// (Usa a API Python, não precisa de token)
function startAutoScan() {
  if (isScanning) return;

  isScanning = true;
  let scanAttempts = 0;

  const scanFrame = async () => {
    if (
      !isScanning ||
      !videoElement.videoWidth ||
      videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA
    ) {
      if (isScanning) {
        setTimeout(scanFrame, 500);
      }
      return;
    }

    try {
      scanAttempts++;

      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      context.drawImage(
        videoElement,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      canvasElement.toBlob(async (blob) => {
        if (!blob || !isScanning) return;

        try {
          const formData = new FormData();
          formData.append("image", blob, "qrcode.png");

          console.log(
            `🔄 Tentativa ${scanAttempts}: Enviando imagem para escaneamento (API Python)...`
          );

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

          const response = await fetch(QR_SCAN_API, {
            // API Python
            method: "POST",
            body: formData,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(
              `Erro HTTP ${response.status}: ${await response.text()}`
            );
          }

          const result = await response.json();
          console.log("📨 Resposta do backend (Python):", result);

          if (result.success && result.qrCode) {
            // QR Code detectado com sucesso
            const qrCodeValue = result.qrCode;
            document.getElementById("tool-qrcode").value = qrCodeValue;

            // AGORA, busca dados na API Java (com token)
            await fetchToolDataByQRCode(qrCodeValue);

            showNotification("QR Code escaneado com sucesso!", true);
            closeQRScanner();
          } else if (scanAttempts % 5 === 0) {
            scanResultElement.textContent =
              result.error || "Procurando QR Code...";
          }
        } catch (error) {
          console.error("❌ Erro ao escanear QR Code (API Python):", error);
          if (scanAttempts % 5 === 0) {
            if (error.name === "AbortError") {
              scanResultElement.textContent =
                "Timeout: Servidor Python não respondeu";
            } else {
              scanResultElement.textContent =
                "Erro de conexão com o servidor Python";
            }
            scanResultElement.style.color = "var(--accent-color)";
          }
        }
      }, "image/png");
    } catch (error) {
      console.error("Erro na captura:", error);
    }

    // Continuar o escaneamento
    if (isScanning) {
      setTimeout(scanFrame, 1000); // Escanear a cada 1 segundo
    }
  };

  scanFrame(); // Iniciar
}

// Abrir scanner
function openQRScanner() {
  const modal = document.getElementById("qr-scanner-modal");
  modal.style.display = "flex";
  scanResultElement.textContent = "Iniciando câmera...";
  scanResultElement.style.color = "inherit";

  // Limpa stream anterior
  if (qrStream) {
    qrStream.getTracks().forEach((track) => track.stop());
    qrStream = null;
  }
  videoElement.srcObject = null;

  initializeQRScanner();
}

// Fechar scanner
function closeQRScanner() {
  const modal = document.getElementById("qr-scanner-modal");
  modal.style.display = "none";

  isScanning = false;

  if (qrStream) {
    qrStream.getTracks().forEach((track) => track.stop());
    qrStream = null;
  }
  videoElement.srcObject = null;
}

// Função para carregar locais (MODIFICADA)
async function loadLocais() {
  try {
    toolIdLocal.innerHTML =
      '<option value="">Carregando locais... <span class="loading"></span></option>';

    // <-- MODIFICADO: Adiciona headers de autenticação
    const response = await fetch(locais_get, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    // <-- MODIFICADO: Usa handleResponseError
    if (!response.ok) await handleResponseError(response);

    const locais = await response.json();
    locaisCache = locais; // Armazenar em cache
    return locais;
  } catch (error) {
    console.error("Erro ao carregar locais:", error);
    toolIdLocal.innerHTML = '<option value="">Erro ao carregar locais</option>';
    if (!error.message.includes("Token")) {
      showNotification("Erro ao carregar locais", false);
    }
    return [];
  }
}

// Função para preencher o select de locais com o cache
function fillLocaisSelect() {
  toolIdLocal.innerHTML = '<option value="">Selecione um local...</option>';
  locaisCache.forEach((local) => {
    const option = document.createElement("option");
    option.value = local.id;
    // Ajuste aqui se o nome do local for diferente
    option.textContent = local.nomeEspaco || `Local ID ${local.id}`;
    toolIdLocal.appendChild(option);
  });
}

// Função para carregar ferramentas (MODIFICADA)
async function loadFerramentas() {
  try {
    // <-- MODIFICADO: Adiciona headers de autenticação
    const response = await fetch(Ferramenta_GET, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    // <-- MODIFICADO: Usa handleResponseError
    if (!response.ok) await handleResponseError(response);

    return await response.json();
  } catch (error) {
    console.error("Erro ao carregar ferramentas:", error);
    if (!error.message.includes("Token")) {
      showNotification("Erro ao carregar ferramentas", false);
    }
    return [];
  }
}

// Função para criar card de ferramenta (mobile)
function createToolCard(ferramenta, nomeLocal) {
  const card = document.createElement("div");
  card.className = "tool-card";

  // === BOTÕES CORRIGIDOS AQUI ===
  card.innerHTML = `
        <div class="card-header">
          <div class="card-title">${ferramenta.nome}</div>
          <div class="card-badge">ID: ${ferramenta.id}</div>
        </div>
        
        <div class="card-details">
          <div class="card-detail">
            <span class="detail-label">Marca:</span>
            <span class="detail-value">${ferramenta.marca}</span>
          </div>
          
          <div class="card-detail">
            <span class="detail-label">Modelo:</span>
            <span class="detail-value">${ferramenta.modelo}</span>
          </div>
          
          <div class="card-detail">
            <span class="detail-label">QR Code:</span>
            <span class="detail-value">${ferramenta.qrcode || "N/A"}</span>
          </div>
          
          <div class="card-detail">
            <span class="detail-label">Estado:</span>
            <span class="detail-value">${ferramenta.estado}</span>
          </div>
          
          <div class="card-detail">
            <span class="detail-label">Disponível:</span>
            <span class="detail-value ${
              ferramenta.disponibilidade
                ? "status-available"
                : "status-unavailable"
            }">
              ${ferramenta.disponibilidade ? "Sim" : "Não"}
            </span>
          </div>
          
          <div class="card-detail">
            <span class="detail-label">Local:</span>
            <span class="detail-value">${nomeLocal}</span>
          </div>
          
          <div class="card-detail" style="grid-column: span 2;">
            <span class="detail-label">Descrição:</span>
            <span class="detail-value">
              ${
                ferramenta.descricao
                  ? ferramenta.descricao.substring(0, 50) +
                    (ferramenta.descricao.length > 50 ? "..." : "")
                  : "N/A"
              }
            </span>
          </div>
        </div>
        
        <div class="card-actions">
          <button class="btn-action btn-edit" data-id="${ferramenta.id}">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn-action btn-delete" data-id="${ferramenta.id}">
            <i class="fas fa-trash-alt"></i> Excluir
          </button>
        </div>
      `;

  return card;
}

// Função para carregar ferramentas na tabela e cards
async function loadToolsTable() {
  showLoading(true);

  try {
    const ferramentas = await loadFerramentas(); // Já usa token
    toolsTableBody.innerHTML = "";
    toolsCards.innerHTML = "";

    if (ferramentas.length === 0) {
      const emptyHtml = `
            <td colspan="10" style="text-align: center; padding: 30px;">
              <i class="fas fa-info-circle" style="font-size: 3rem; color: #6c757d; margin-bottom: 15px;"></i>
              <p>Nenhuma ferramenta cadastrada</p>
            </td>
          `;
      toolsTableBody.innerHTML = `<tr>${emptyHtml}</tr>`;

      toolsCards.innerHTML = `
            <div class="tool-card" style="text-align: center; padding: 30px;">
              ${emptyHtml.replace(/<td[^>]*>|<\/td>/g, "")} 
            </div>
          `;
      return;
    }

    ferramentas.forEach((ferramenta) => {
      // Obter o nome do local corretamente
      // 'ferramenta.nomeLocal' parece já vir do backend, se não, use o cache
      const nomeLocal =
        ferramenta.nomeLocal ||
        locaisCache.find((l) => l.id == ferramenta.id_local)?.nomeEspaco ||
        "N/A";

      // Criar linha da tabela (desktop)
      const row = document.createElement("tr");

      // === BOTÕES CORRIGIDOS AQUI (action-buttons-cell -> actions) ===
      row.innerHTML = `
            <td>${ferramenta.id}</td>
            <td>${ferramenta.nome}</td>
            <td>${ferramenta.marca}</td>
            <td>${ferramenta.modelo}</td>
            <td>${ferramenta.qrcode || "N/A"}</td>
            <td>${ferramenta.estado}</td>
            <td class="${
              ferramenta.disponibilidade
                ? "status-available"
                : "status-unavailable"
            }">
              ${ferramenta.disponibilidade ? "Sim" : "Não"}
            </td>
            <td>${
              ferramenta.descricao
                ? ferramenta.descricao.substring(0, 20) +
                  (ferramenta.descricao.length > 20 ? "..." : "")
                : "N/A"
            }</td>
            <td>${nomeLocal}</td> 
            <td class="actions">
              <button class="btn-action btn-edit" data-id="${ferramenta.id}">
                <i class="fas fa-edit"></i> Editar
              </button>
              <button class="btn-action btn-delete" data-id="${ferramenta.id}">
                <i class="fas fa-trash-alt"></i> Excluir
              </button>
            </td>
          `;
      toolsTableBody.appendChild(row);

      // Criar card (mobile)
      const card = createToolCard(ferramenta, nomeLocal);
      toolsCards.appendChild(card);
    });

    // Adicionar event listeners para os botões (tabela)
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

    // Adicionar event listeners para os botões (cards)
    document.querySelectorAll(".card-edit").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        openEditToolModal(id);
      });
    });

    document.querySelectorAll(".card-delete").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        deleteTool(id);
      });
    });
  } catch (error) {
    console.error("Erro ao carregar ferramentas:", error);
    // showNotification("Erro ao carregar ferramentas", false); // Já tratado em loadFerramentas
  } finally {
    showLoading(false);
  }
}

// Função de pesquisa
function searchTools() {
  const searchTerm = searchInput.value.toLowerCase();

  // Filtrar tabela
  const rows = toolsTableBody.querySelectorAll("tr");
  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });

  // Filtrar cards
  const cards = toolsCards.querySelectorAll(".tool-card");
  cards.forEach((card) => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

// Funções do modal
async function openAddToolModal() {
  toolForm.reset();
  toolId.value = "";
  toolDisponibilidade.checked = true;
  modalTitle.textContent = "Adicionar Nova Ferramenta";
  toolModal.style.display = "flex";

  setupQRCodeField();
  fillLocaisSelect(); // Preencher o select com o cache
}

// (MODIFICADA)
async function openEditToolModal(id) {
  try {
    showLoading(true);
    // <-- MODIFICADO: Adiciona headers de autenticação
    const response = await fetch(`${Ferramenta_GET}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    // <-- MODIFICADO: Usa handleResponseError
    if (!response.ok) await handleResponseError(response);

    const ferramenta = await response.json();

    setupQRCodeField();
    fillLocaisSelect(); // Preencher o select com o cache

    // Preencher formulário
    toolId.value = ferramenta.id;
    toolName.value = ferramenta.nome;
    toolBrand.value = ferramenta.marca;
    toolModel.value = ferramenta.modelo;
    // Precisamos garantir que o input correto do qrcode seja pego
    document.getElementById("tool-qrcode").value = ferramenta.qrcode || "";
    toolEstado.value = ferramenta.estado;
    toolDisponibilidade.checked = ferramenta.disponibilidade;
    toolDescricao.value = ferramenta.descricao || "";
    toolIdLocal.value = ferramenta.id_local;

    modalTitle.textContent = "Editar Ferramenta";
    toolModal.style.display = "flex";
  } catch (error) {
    console.error("Erro ao carregar ferramenta:", error);
    if (!error.message.includes("Token")) {
      showNotification(
        "Não foi possível carregar os dados da ferramenta",
        false
      );
    }
  } finally {
    showLoading(false);
  }
}

function closeModal() {
  toolModal.style.display = "none";
}

// (MODIFICADA)
async function saveTool() {
  // Validar campos OBRIGATÓRIOS
  if (
    !toolName.value ||
    !toolBrand.value ||
    !toolModel.value ||
    !toolEstado.value ||
    !toolIdLocal.value
  ) {
    showNotification("Preencha todos os campos obrigatórios!", false);
    return;
  }

  // Garantir que o QR Code seja pego do campo correto
  const qrcodeValue = document.getElementById("tool-qrcode").value;

  const toolData = {
    nome: toolName.value,
    marca: toolBrand.value,
    modelo: toolModel.value,
    qrcode: qrcodeValue,
    estado: toolEstado.value,
    disponibilidade: toolDisponibilidade.checked,
    descricao: toolDescricao.value || null,
    id_local: toolIdLocal.value,
  };

  try {
    showLoading(true);
    let response;
    const method = toolId.value ? "PUT" : "POST";
    const url = toolId.value
      ? `${Ferramenta_PUT}/${toolId.value}`
      : Ferramenta_POST;

    // <-- MODIFICADO: Adiciona headers de autenticação (com Content-Type)
    response = await fetch(url, {
      method: method,
      headers: getAuthHeaders(true), // true para 'application/json'
      body: JSON.stringify(toolData),
    });

    // <-- MODIFICADO: Usa handleResponseError
    if (!response.ok) await handleResponseError(response);

    showNotification(
      toolId.value
        ? "Ferramenta atualizada com sucesso!"
        : "Ferramenta cadastrada com sucesso!",
      true
    );
    await loadToolsTable();
    closeModal();
  } catch (error) {
    console.error("Erro ao salvar ferramenta:", error);
    if (!error.message.includes("Token")) {
      showNotification(`Erro ao salvar ferramenta: ${error.message}`, false);
    }
  } finally {
    showLoading(false);
  }
}

// Função para excluir ferramenta (MODIFICADA)
async function deleteTool(id) {
  if (confirm("Tem certeza que deseja excluir esta ferramenta?")) {
    try {
      showLoading(true);
      // <-- MODIFICADO: Adiciona headers de autenticação
      const response = await fetch(`${Ferramenta_DELETE}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      // <-- MODIFICADO: Usa handleResponseError
      if (!response.ok) await handleResponseError(response);

      showNotification("Ferramenta excluída com sucesso!", true);
      await loadToolsTable();
    } catch (error) {
      console.error("Erro ao excluir ferramenta:", error);
      if (!error.message.includes("Token")) {
        showNotification(
          `Não foi possível excluir a ferramenta: ${error.message}`,
          false
        );
      }
    } finally {
      showLoading(false);
    }
  }
}

// Event Listeners
addToolBtn.addEventListener("click", openAddToolModal);
saveBtn.addEventListener("click", saveTool);
cancelBtn.addEventListener("click", closeModal);
closeBtn.addEventListener("click", closeModal);
searchInput.addEventListener("input", searchTools);

// Fechar modal ao clicar fora do conteúdo
window.addEventListener("click", (e) => {
  if (e.target === toolModal) {
    closeModal();
  }
});

// === BLOCO DO DOMCONTENTLOADED ATUALIZADO ===
document.addEventListener("DOMContentLoaded", async function () {
  // === LÓGICA DO DARK MODE ADICIONADA AQUI ===
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const body = document.body;

  if (themeToggleBtn) {
    const icon = themeToggleBtn.querySelector("i");

    // Função para aplicar o tema (claro ou escuro)
    function aplicarTema(tema) {
      if (tema === "dark") {
        body.classList.add("dark-mode");
        if (icon) {
          icon.classList.remove("fa-moon");
          icon.classList.add("fa-sun");
        }
      } else {
        body.classList.remove("dark-mode");
        if (icon) {
          icon.classList.remove("fa-sun");
          icon.classList.add("fa-moon");
        }
      }
    }

    // Verificar se já existe um tema salvo no localStorage
    const temaSalvo = localStorage.getItem("theme");

    if (temaSalvo) {
      aplicarTema(temaSalvo);
    } else {
      // Opcional: Checar preferência do sistema
      const prefereEscuro =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefereEscuro) {
        aplicarTema("dark");
      } else {
        aplicarTema("light");
      }
    }

    // Adicionar o evento de clique ao botão
    themeToggleBtn.addEventListener("click", () => {
      // Verifica se o body JÁ TEM a classe dark-mode
      if (body.classList.contains("dark-mode")) {
        // Se sim, troca para light
        aplicarTema("light");
        localStorage.setItem("theme", "light"); // Salva a escolha
      } else {
        // Se não, troca para dark
        aplicarTema("dark");
        localStorage.setItem("theme", "dark"); // Salva a escolha
      }
    });
  }
  // === FIM DA LÓGICA DO DARK MODE ===

  // --- O RESTO DO SEU CÓDIGO ORIGINAL CONTINUA ABAIXO ---
  showLoading(true);
  try {
    setupQRCodeField(); // Configura o botão de scan no formulário

    // As funções abaixo já estão modificadas para usar o token
    await loadLocais();
    fillLocaisSelect(); // Preenche o select agora que o cache está pronto
    await loadToolsTable();
  } catch (error) {
    console.error("Erro na inicialização:", error);
    if (!error.message.includes("Token")) {
      showNotification("Erro ao carregar dados iniciais", false);
    }
  } finally {
    showLoading(false);
  }
});
