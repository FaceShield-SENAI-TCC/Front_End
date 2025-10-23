
// ========================== TRADUÇÃO ==========================
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
        if (!response.ok) throw new Error(`File not found for: ${lang}`);
        translations = await response.json();
    } catch (error) { console.error("Failed to load translation file:", error); }
}

function updateUI() {
    document.querySelectorAll("[data-translate-key]").forEach(el => {
        const key = el.getAttribute("data-translate-key");
        if (!key) return;

        // Específico para o span de paginação
        if (key === 'pagination-page-info') {
             el.textContent = t(key, { currentPage: el.dataset.page, totalPages: el.dataset.total });
             return;
        }

        // Preserva ícones e atualiza texto
        const icon = el.querySelector('i');
        const textNode = icon ? icon.nextSibling : (el.firstChild && el.firstChild.nodeType === Node.TEXT_NODE ? el.firstChild : null);

        if (el.placeholder) {
            el.placeholder = t(key);
        } else if (textNode) { // Atualiza o nó de texto após o ícone ou o primeiro nó de texto
            textNode.textContent = ` ${t(key)}`;
        } else if (!icon) { // Se não tem ícone nem texto (ex: options do select), define o texto
            el.textContent = t(key);
        }
    });
    document.title = t("page-title");
}

async function switchLanguage(lang) {
    localStorage.setItem("language", lang);
    await loadTranslations(lang);
    updateUI();
    // Re-renderiza a tabela para aplicar traduções dinâmicas (status, botões)
    renderTable(); 
    setupPagination(); // Atualiza texto da paginação
}
window.switchLanguage = switchLanguage;

// ========================== LÓGICA DA PÁGINA ==========================

// Elementos DOM
const loansTableBody = document.getElementById("loans-table-body");
const filterUser = document.getElementById("filter-user");
const filterTool = document.getElementById("filter-tool");
const filterStatus = document.getElementById("filter-status");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");
const feedbackMessage = document.getElementById("feedback-message");
const novoEmprestimoBtn = document.getElementById("novo-emprestimo-btn");
const modal = document.getElementById("loan-details-modal");
// ... (outros elementos do modal) ...

// URLs da API
const API = {
    emprestimos: "http://localhost:8080/emprestimos/buscar",
    finalizar: "http://localhost:8080/emprestimos/finalizar",
    ferramentas: "http://localhost:8080/ferramentas/buscar",
    locais: "http://localhost:8080/locais/buscar", // Adicionado para buscar locais
};

// Variáveis globais
let currentPage = 1;
const itemsPerPage = 10;
let allLoans = [];
let allTools = [];
let allLocations = []; // Adicionado para cache de locais
let filteredLoans = [];
let currentLoanId = null;

// Funções de data (não mudam)
function formatToISOLocal(date) { /* ... */ }

// Função para exibir feedback (usa chaves de tradução)
function showFeedback(messageKey, type = "error", replacements = {}) {
    feedbackMessage.textContent = t(messageKey, replacements);
    feedbackMessage.className = `feedback-message feedback-${type}`;
    feedbackMessage.style.display = "block";
    if (type === "success") {
        setTimeout(() => { feedbackMessage.style.display = "none"; }, 3000);
    }
}

// Carregar todos os dados (Empréstimos, Ferramentas e Locais)
async function loadAllData() {
    showFeedback("alert-loading-data", "success");
    loansTableBody.innerHTML = `<tr><td colspan="8" class="loading-cell"><div class="loading"></div> ${t("loading-loans")}</td></tr>`;
    try {
        const [loansRes, toolsRes, locationsRes] = await Promise.all([
            fetch(API.emprestimos),
            fetch(API.ferramentas),
            fetch(API.locais)
        ]);

        if (!loansRes.ok || !toolsRes.ok || !locationsRes.ok) throw new Error(); // Erro genérico para o catch tratar

        allLoans = await loansRes.json();
        allTools = await toolsRes.json();
        allLocations = await locationsRes.json(); // Armazena locais no cache

        applyFilters(); // Aplica filtros iniciais (ou nenhum filtro) e renderiza
        feedbackMessage.style.display = "none";
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        loansTableBody.innerHTML = `<tr><td colspan="8" class="error-cell">${t("alert-loading-error")}</td></tr>`;
        showFeedback("alert-loading-error");
    }
}

// Obtém informações de localização combinadas
function getToolLocationInfo(toolId) {
    const tool = allTools.find(t => t.id == toolId);
    if (!tool || !tool.id_local) return null;
    const location = allLocations.find(l => l.id == tool.id_local);
    return location || null; // Retorna o objeto de localização encontrado
}


// Função para finalizar empréstimo (com tradução)
async function finalizarEmprestimo(loanId) {
    showFeedback("alert-return-registering", "success");
    const now = new Date();
    const dataDevolucao = formatToISOLocal(now);
    const emprestimo = allLoans.find((loan) => loan.id == loanId);
    const params = new URLSearchParams();
    params.append("dataDevolucao", dataDevolucao);
    if (emprestimo && emprestimo.observacoes) {
        params.append("observacoes", emprestimo.observacoes);
    }

    try {
        const response = await fetch(`${API.finalizar}/${loanId}?${params}`, { method: "PUT" });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Erro HTTP ${response.status}`);
        }
        showFeedback("alert-return-success", "success");
        await loadAllData(); // Recarrega tudo
        closeModal();
    } catch (error) {
        console.error("Erro ao registrar devolução:", error);
        showFeedback("alert-return-fail", "error", { message: error.message });
        // Reabilita o botão em caso de erro
        const button = document.querySelector(`.return-btn[data-id="${loanId}"], #modal-return-btn`);
        if(button) {
             button.disabled = false;
             button.innerHTML = `<i class="fas fa-check-circle"></i> ${t("action-return")}`;
        }
    }
}

// Traduz o status retornado pela calculateLoanStatus
function translateStatus(status) {
    const statusMap = {
        "Pendente": "status-pending",
        "Em andamento": "status-active",
        "Devolvido": "status-returned",
        "Em atraso": "status-delayed",
    };
    return t(statusMap[status] || status); // Retorna a tradução ou o status original
}

// Renderiza a tabela (com tradução)
function renderTable() {
    loansTableBody.innerHTML = "";
    if (filteredLoans.length === 0) {
        loansTableBody.innerHTML = `<tr><td colspan="8" class="empty-cell">${t("no-loans-found")}</td></tr>`;
        return;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredLoans.length);
    const currentLoans = filteredLoans.slice(startIndex, endIndex);

    currentLoans.forEach((loan) => {
        const row = document.createElement("tr");
        const statusText = calculateLoanStatus(loan); // Status original em PT
        const translatedStatus = translateStatus(statusText); // Status traduzido
        const isReturned = statusText === "Devolvido";
        
        row.innerHTML = `
            <td>${loan.id}</td>
            <td>${loan.nomeUsuario || t('table-na')}</td>
            <td>${loan.nomeFerramenta || t('table-na')}</td>
            <td>${formatDate(loan.data_retirada)}</td>
            <td>${loan.data_devolucao ? formatDate(loan.data_devolucao) : t('status-pending')}</td>
            <td><span class="status-badge ${getStatusClass(statusText)}">${translatedStatus}</span></td>
            <td>${loan.observacoes || t('no-notes')}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" data-id="${loan.id}"><i class="fas fa-eye"></i> ${t('action-details')}</button>
                    ${!isReturned
                        ? `<button class="return-btn" data-id="${loan.id}"><i class="fas fa-check-circle"></i> ${t('action-return')}</button>`
                        : `<button class="return-btn btn-finalizado" disabled><i class="fas fa-check-square"></i> ${t('action-finished')}</button>`
                    }
                </div>
            </td>
        `;
        loansTableBody.appendChild(row);
    });
}


// Abrir modal (com tradução)
function openModal(loanId) {
    const loan = allLoans.find((item) => item.id == loanId);
    if (!loan) return;

    currentLoanId = loanId;
    const statusText = calculateLoanStatus(loan);
    const translatedStatus = translateStatus(statusText);
    const isReturned = statusText === "Devolvido";

    // Preencher modal
    document.getElementById("modal-id").textContent = loan.id;
    document.getElementById("modal-user").textContent = loan.nomeUsuario || t('table-na');
    document.getElementById("modal-tool").textContent = loan.nomeFerramenta || t('table-na');
    document.getElementById("modal-withdrawal").textContent = formatDate(loan.data_retirada);
    
    // Calcular data prevista (igual ao seu código original)
    const withdrawalDate = new Date(loan.data_retirada);
    const expectedReturnDate = new Date(withdrawalDate);
    expectedReturnDate.setDate(expectedReturnDate.getDate() + 7);
    document.getElementById("modal-expected-return").textContent = formatDate(expectedReturnDate);

    document.getElementById("modal-actual-return").textContent = loan.data_devolucao ? formatDate(loan.data_devolucao) : t('status-pending');
    
    const modalStatusEl = document.getElementById("modal-status");
    modalStatusEl.textContent = translatedStatus;
    modalStatusEl.className = `status-badge ${getStatusClass(statusText)}`; // Usa a classe CSS correta
    
    document.getElementById("modal-notes").textContent = loan.observacoes || t('no-notes');

    // Localização
    const locationInfo = getToolLocationInfo(loan.idFerramenta);
    document.getElementById("modal-location-space").textContent = locationInfo?.nomeEspaco || t('modal-location-not-found');
    document.getElementById("modal-location-cabinet").textContent = locationInfo?.armario || t('table-na');
    document.getElementById("modal-location-shelf").textContent = locationInfo?.prateleira || t('table-na');
    document.getElementById("modal-location-case").textContent = locationInfo?.estojo || t('table-na');


    // Botão de devolução do modal
    const modalReturnBtn = document.getElementById("modal-return-btn");
    modalReturnBtn.disabled = isReturned;
    modalReturnBtn.innerHTML = isReturned
        ? `<i class="fas fa-check-square"></i> ${t('modal-return-finished-btn')}`
        : `<i class="fas fa-check-circle"></i> ${t('modal-return-btn')}`;
    modalReturnBtn.className = isReturned ? "return-btn btn-finalizado" : "return-btn";

    modal.style.display = "block";
}

function closeModal() { /* ... (código original) ... */ }

// Calcular status (não muda)
function calculateLoanStatus(loan) { /* ... (código original) ... */ }
function getStatusClass(status) { /* ... (código original) ... */ }

// Formatar data (não muda)
function formatDate(dateString) { /* ... (código original) ... */ }

// Configurar paginação (com tradução)
function setupPagination() {
    const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
    pageInfo.textContent = t('pagination-page-info', { currentPage: currentPage, totalPages: totalPages || 1 });
    // Guarda os valores nos atributos para a função updateUI conseguir re-traduzir
    pageInfo.dataset.page = currentPage; 
    pageInfo.dataset.total = totalPages || 1; 

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Aplicar filtros (com tradução)
function applyFilters() {
    const userText = filterUser.value.toLowerCase();
    const toolText = filterTool.value.toLowerCase();
    const statusValue = filterStatus.value; // Valor do select (ex: 'active', 'returned')

    filteredLoans = allLoans.filter((loan) => {
        if (userText && !(loan.nomeUsuario || "").toLowerCase().includes(userText)) return false;
        if (toolText && !(loan.nomeFerramenta || "").toLowerCase().includes(toolText)) return false;
        
        if (statusValue) {
            const loanStatusText = calculateLoanStatus(loan); // Status em PT (ex: 'Em andamento')
            // Mapeia o valor do select para o status em PT
            const statusMap = {
                active: "Em andamento",
                returned: "Devolvido",
                delayed: "Em atraso",
            };
            if (loanStatusText !== statusMap[statusValue]) return false;
        }
        return true;
    });
    currentPage = 1;
    renderTable();
    setupPagination();
}

// Inicialização e Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
    // Carrega traduções PRIMEIRO
    const currentLanguage = localStorage.getItem("language") || "pt";
    await loadTranslations(currentLanguage);
    updateUI(); // Traduz HTML estático

    await loadAllData(); // Carrega dados da API

    // Adiciona Listeners
    filterUser.addEventListener("input", applyFilters);
    filterTool.addEventListener("input", applyFilters);
    filterStatus.addEventListener("change", applyFilters);
    novoEmprestimoBtn.addEventListener("click", () => { window.location.href = "../PostEmp/PostEmp.html"; });

    // Listeners do Modal
    document.querySelector("#loan-details-modal .close").addEventListener("click", closeModal);
    document.getElementById("modal-return-btn").addEventListener("click", () => {
        if (currentLoanId && !document.getElementById("modal-return-btn").disabled) {
            document.getElementById("modal-return-btn").disabled = true;
            document.getElementById("modal-return-btn").innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('action-returning')}`;
            finalizarEmprestimo(currentLoanId);
        }
    });
    window.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });

    // Listeners da Tabela (Delegação de Eventos)
    loansTableBody.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.view-btn');
        const returnBtn = e.target.closest('.return-btn:not([disabled])'); // Só pega se não estiver desabilitado

        if (viewBtn) {
            openModal(viewBtn.dataset.id);
        } else if (returnBtn) {
            returnBtn.disabled = true;
            returnBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('action-returning')}`;
            finalizarEmprestimo(returnBtn.dataset.id);
        }
    });

    // Listeners da Paginação
    prevPageBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
            setupPagination();
        }
    };
    nextPageBtn.onclick = () => {
        const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
            setupPagination();
        }
    };
});