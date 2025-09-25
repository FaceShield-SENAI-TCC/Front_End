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

const Ferramenta_GET = "http://localhost:8080/ferramentas/buscar";
const Ferramenta_POST = "http://localhost:8080/ferramentas/novaFerramenta";
const Ferramenta_PUT = "http://localhost:8080/ferramentas/editar";
const Ferramenta_DELETE = "http://localhost:8080/ferramentas/deletar";

const locais_get = "http://localhost:8080/locais/buscar";

// Adicionar após as variáveis existentes no JS
const qrScannerModal = document.createElement('div');
qrScannerModal.innerHTML = `
<div id="qr-scanner-modal" class="modal">
  <div class="modal-content" style="max-width: 600px;">
    <div class="modal-header">
      <h2>Escanear QR Code</h2>
      <button class="close-btn close-scan-btn">&times;</button>
    </div>
    <div class="modal-body">
      <div id="scanner-container" style="text-align: center;">
        <video id="qr-video" width="100%" height="300" style="border: 2px solid var(--primary-color); border-radius: 8px;"></video>
        <div id="scan-result" style="margin: 15px 0; font-weight: bold;"></div>
        <canvas id="qr-canvas" style="display: none;"></canvas>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn" id="cancel-scan-btn">Cancelar</button>
      <button class="btn btn-primary" id="capture-btn">Capturar e Escanear</button>
    </div>
  </div>
</div>
`;

document.body.appendChild(qrScannerModal.firstElementChild);

// Variáveis do scanner
const startScanBtn = document.createElement('button');
const videoElement = document.getElementById('qr-video');
const scanResultElement = document.getElementById('scan-result');
const canvasElement = document.getElementById('qr-canvas');
const context = canvasElement.getContext('2d');
let qrStream = null;
let scanInterval = null;

// URL do seu backend Python para escanear QR Code
const QR_SCAN_API = "http://localhost:5000/read-qrcode"; // Ajuste conforme sua API

// Modificar o campo QR Code no formulário existente
const qrCodeField = document.getElementById('tool-qrcode');
if (qrCodeField) {
    const qrContainer = qrCodeField.parentElement;
    qrContainer.style.display = 'flex';
    qrContainer.style.gap = '10px';
    qrContainer.style.alignItems = 'center';
    
    qrCodeField.style.flex = '1';
    
    // Criar botão de escanear
    startScanBtn.innerHTML = '<i class="fas fa-camera"></i> Escanear';
    startScanBtn.className = 'btn';
    startScanBtn.type = 'button';
    startScanBtn.style.whiteSpace = 'nowrap';
    
    qrContainer.appendChild(startScanBtn);
}

// Função para inicializar o scanner
async function initializeQRScanner() {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Câmera não suportada neste dispositivo');
        }

        qrStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        videoElement.srcObject = qrStream;
        scanResultElement.textContent = 'Câmera ativa. Clique em "Capturar e Escanear" para ler o QR Code.';
        scanResultElement.style.color = 'var(--primary-color)';
        
    } catch (error) {
        console.error('Erro ao acessar câmera:', error);
        scanResultElement.textContent = 'Erro: ' + error.message;
        scanResultElement.style.color = 'var(--accent-color)';
    }
}

// Função para capturar imagem e enviar para o backend
async function captureAndScan() {
    try {
        showLoading(true);
        scanResultElement.textContent = 'Processando imagem...';
        
        // Configurar canvas com as dimensões do vídeo
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        
        // Desenhar o frame atual do vídeo no canvas
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        
        // Converter canvas para Blob
        canvasElement.toBlob(async (blob) => {
            try {
                // Criar FormData para enviar a imagem
                const formData = new FormData();
                formData.append('image', blob, 'qrcode.png');
                
                // Enviar para o backend Python
                const response = await fetch(QR_SCAN_API, {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error(`Erro HTTP ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.success && result.qrCode) {
                    // QR Code detectado com sucesso
                    document.getElementById('tool-qrcode').value = result.qrCode;
                    closeQRScanner();
                    showNotification('QR Code escaneado com sucesso!', true);
                } else {
                    scanResultElement.textContent = 'QR Code não detectado. Tente novamente.';
                    scanResultElement.style.color = 'var(--accent-color)';
                }
                
            } catch (error) {
                console.error('Erro ao escanear QR Code:', error);
                scanResultElement.textContent = 'Erro no escaneamento: ' + error.message;
                scanResultElement.style.color = 'var(--accent-color)';
            } finally {
                showLoading(false);
            }
        }, 'image/png');
        
    } catch (error) {
        console.error('Erro na captura:', error);
        scanResultElement.textContent = 'Erro na captura: ' + error.message;
        scanResultElement.style.color = 'var(--accent-color)';
        showLoading(false);
    }
}

// Abrir scanner
function openQRScanner() {
    document.getElementById('qr-scanner-modal').style.display = 'flex';
    scanResultElement.textContent = 'Iniciando câmera...';
    scanResultElement.style.color = 'inherit';
    initializeQRScanner();
}

// Fechar scanner
function closeQRScanner() {
    document.getElementById('qr-scanner-modal').style.display = 'none';
    
    if (qrStream) {
        qrStream.getTracks().forEach(track => track.stop());
        qrStream = null;
    }
    
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
}

// Event listeners
startScanBtn.addEventListener('click', openQRScanner);
document.getElementById('cancel-scan-btn').addEventListener('click', closeQRScanner);
document.querySelector('.close-scan-btn').addEventListener('click', closeQRScanner);
document.getElementById('capture-btn').addEventListener('click', captureAndScan);

// Fechar modal ao clicar fora
document.getElementById('qr-scanner-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeQRScanner();
    }
});

// Tecla ESC para fechar
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('qr-scanner-modal').style.display === 'flex') {
        closeQRScanner();
    }
});
let locaisCache = [];

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

// Função para carregar locais
async function loadLocais() {
  try {
    // Mostrar estado de carregamento
    toolIdLocal.innerHTML =
      '<option value="">Carregando locais... <span class="loading"></span></option>';

    const response = await fetch(locais_get);
    if (!response.ok) throw new Error("Erro ao carregar locais");

    const locais = await response.json();
    locaisCache = locais; // Armazenar em cache

    return locais;
  } catch (error) {
    console.error("Erro ao carregar locais:", error);
    toolIdLocal.innerHTML = '<option value="">Erro ao carregar locais</option>';
    showNotification("Erro ao carregar locais", false);
    return [];
  }
}

// Função para preencher o select de locais com o cache
function fillLocaisSelect() {
  toolIdLocal.innerHTML = '<option value="">Selecione um local...</option>';
  locaisCache.forEach((local) => {
    const option = document.createElement("option");
    option.value = local.id;
    // CORREÇÃO: Usar nomeEspaco em vez de nome
    option.textContent = local.nomeEspaco;
    toolIdLocal.appendChild(option);
  });
}

// Função para carregar ferramentas
async function loadFerramentas() {
  try {
    const response = await fetch(Ferramenta_GET);
    if (!response.ok) throw new Error("Erro ao carregar ferramentas");
    return await response.json();
  } catch (error) {
    console.error("Erro ao carregar ferramentas:", error);
    showNotification("Erro ao carregar ferramentas", false);
    return [];
  }
}

// Função para criar card de ferramenta (mobile)
function createToolCard(ferramenta, nomeLocal) {
  const card = document.createElement("div");
  card.className = "tool-card";

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
            <span class="detail-value">${ferramenta.nomeLocal}</span>
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
          <button class="card-action card-edit" data-id="${ferramenta.id}">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="card-action card-delete" data-id="${ferramenta.id}">
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
    const ferramentas = await loadFerramentas();
    toolsTableBody.innerHTML = "";
    toolsCards.innerHTML = "";

    if (ferramentas.length === 0) {
      toolsTableBody.innerHTML = `
            <tr>
              <td colspan="10" style="text-align: center; padding: 30px;">
                <i class="fas fa-info-circle" style="font-size: 3rem; color: #6c757d; margin-bottom: 15px;"></i>
                <p>Nenhuma ferramenta cadastrada</p>
              </td>
            </tr>
          `;

      toolsCards.innerHTML = `
            <div class="tool-card" style="text-align: center; padding: 30px;">
              <i class="fas fa-info-circle" style="font-size: 3rem; color: #6c757d; margin-bottom: 15px;"></i>
              <p>Nenhuma ferramenta cadastrada</p>
            </div>
          `;

      return;
    }

    ferramentas.forEach((ferramenta) => {
      // CORREÇÃO 1: Obter o nome do local corretamente
      const nomeLocal = ferramenta.local?.nomeEspaco || "Local não encontrado";

      // Criar linha da tabela (desktop)
      const row = document.createElement("tr");
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
            <td>${ferramenta.nomeLocal}</td> <!-- CORREÇÃO 2: Usar a variável nomeLocal -->
            <td class="action-buttons-cell">
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
      const card = createToolCard(ferramenta, nomeLocal); // CORREÇÃO 3: Passar nomeLocal para o card
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
    showNotification("Erro ao carregar ferramentas", false);
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

  // Preencher o select de locais com o cache
  fillLocaisSelect();
}

async function openEditToolModal(id) {
  try {
    showLoading(true);
    const response = await fetch(`${Ferramenta_GET}/${id}`);
    if (!response.ok) throw new Error("Erro ao carregar ferramenta");

    const ferramenta = await response.json();

    // Preencher o select de locais com o cache
    fillLocaisSelect();

    // Preencher formulário
    toolId.value = ferramenta.id;
    toolName.value = ferramenta.nome;
    toolBrand.value = ferramenta.marca;
    toolModel.value = ferramenta.modelo;
    toolQrcode.value = ferramenta.qrcode || "";
    toolEstado.value = ferramenta.estado;
    toolDisponibilidade.checked = ferramenta.disponibilidade;
    toolDescricao.value = ferramenta.descricao || "";

    // Selecionar o local correto
    toolIdLocal.value = ferramenta.id_local;

    modalTitle.textContent = "Editar Ferramenta";
    toolModal.style.display = "flex";
  } catch (error) {
    console.error("Erro ao carregar ferramenta:", error);
    showNotification("Não foi possível carregar os dados da ferramenta", false);
  } finally {
    showLoading(false);
  }
}

function closeModal() {
  toolModal.style.display = "none";
}

async function saveTool() {
  // Validar campos obrigatórios
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

  const toolData = {
    nome: toolName.value,
    marca: toolBrand.value,
    modelo: toolModel.value,
    qrcode: toolQrcode.value || null,
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

    response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toolData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
    }

    // Verificar se a resposta é JSON válido
    const contentType = response.headers.get("content-type");
    const result = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

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
    showNotification(`Erro ao salvar ferramenta: ${error.message}`, false);
  } finally {
    showLoading(false);
  }
}

// Função para excluir ferramenta
async function deleteTool(id) {
  if (confirm("Tem certeza que deseja excluir esta ferramenta?")) {
    try {
      showLoading(true);
      const response = await fetch(`${Ferramenta_DELETE}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      showNotification("Ferramenta excluída com sucesso!", true);
      await loadToolsTable();
    } catch (error) {
      console.error("Erro ao excluir ferramenta:", error);
      showNotification(
        `Não foi possível excluir a ferramenta: ${error.message}`,
        false
      );
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

// Inicializa a tabela e carrega locais quando a página carregar
document.addEventListener("DOMContentLoaded", async function () {
  showLoading(true);
  try {
    // Carregar locais primeiro
    await loadLocais();
    // Preencher o select de locais
    fillLocaisSelect();
    // Carregar ferramentas depois
    await loadToolsTable();
  } catch (error) {
    console.error("Erro na inicialização:", error);
    showNotification("Erro ao carregar dados iniciais", false);
  } finally {
    showLoading(false);
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && toolModal.style.display === "flex") {
      closeModal();
    }
  });

  // Fechar modal ao clicar fora do conteúdo
  window.addEventListener("click", (e) => {
    if (e.target === toolModal) {
      closeModal();
    }
  });
});
