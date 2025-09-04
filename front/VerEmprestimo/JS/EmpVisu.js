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

// URLs da API
const EMPRESTIMOS_API = "http://localhost:8080/emprestimos/buscar";
const FINALIZAR_EMPRESTIMO_API = "http://localhost:8080/emprestimos/finalizar";

// Variáveis globais
let currentPage = 1;
const itemsPerPage = 10;
let allLoans = [];
let filteredLoans = [];

// Função para formatar data no formato ISO (YYYY-MM-DDTHH:mm:ss) para o fuso de Brasília
function formatToISOLocal(date) {
    if (!date) return null;
    const pad = (n) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// Função para exibir mensagem de feedback
function showFeedback(message, type = "error") {
    feedbackMessage.textContent = message;
    feedbackMessage.className = `feedback-message feedback-${type}`;
    feedbackMessage.style.display = "block";
    if (type === "success") {
        setTimeout(() => {
            feedbackMessage.style.display = "none";
        }, 3000);
    }
}

// Função para carregar empréstimos
async function loadLoans() {
    try {
        showFeedback("Carregando empréstimos...", "success");
        loansTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px;"><div style="display: inline-block; margin-right: 10px;" class="loading"></div>Carregando empréstimos...</td></tr>`;
        const response = await fetch(EMPRESTIMOS_API);
        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }
        const data = await response.json();
        allLoans = data;
        filteredLoans = [...allLoans];
        renderTable();
        setupPagination();
        feedbackMessage.style.display = "none";
    } catch (error) {
        console.error("Erro ao carregar empréstimos:", error);
        loansTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px; color: #c62828;">Erro ao carregar empréstimos. Verifique se o servidor está rodando.</td></tr>`;
        showFeedback("Erro ao carregar empréstimos. Verifique se o servidor está rodando.");
    }
}

// Função para finalizar empréstimo
async function finalizarEmprestimo(loanId) {
    try {
        showFeedback("Registrando devolução...", "success");
        const now = new Date();
        const dataDevolucao = formatToISOLocal(now);
        const emprestimo = allLoans.find(loan => loan.id == loanId);
        const params = new URLSearchParams();
        params.append('dataDevolucao', dataDevolucao);
        if (emprestimo && emprestimo.observacoes) {
            params.append('observacoes', emprestimo.observacoes);
        }
        const response = await fetch(`${FINALIZAR_EMPRESTIMO_API}/${loanId}?${params}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Erro HTTP ${response.status}`);
        }
        showFeedback("Devolução registrada com sucesso!", "success");
        loadLoans();
    } catch (error) {
        console.error("Erro ao registrar devolução:", error);
        showFeedback(`Erro ao registrar devolução: ${error.message}`);
    }
}

// Função para renderizar a tabela
function renderTable() {
    loansTableBody.innerHTML = "";
    if (filteredLoans.length === 0) {
        loansTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px;">Nenhum empréstimo encontrado</td></tr>`;
        return;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredLoans.length);
    const currentLoans = filteredLoans.slice(startIndex, endIndex);
    currentLoans.forEach((loan) => {
        const row = document.createElement("tr");
        const status = calculateLoanStatus(loan);
        // Com a nova lógica, 'isReturned' será sempre falso, pois a função não retorna mais "Devolvido".
        // Isso é parte do problema que explico no alerta.
        const isReturned = status === "Devolvido";
        row.innerHTML = `
            <td>${loan.id}</td>
            <td>${loan.nomeUsuario || "N/A"}</td>
            <td>${loan.nomeFerramenta || "N/A"}</td>
            <td>${formatDate(loan.data_retirada)}</td>
            <td>${loan.data_devolucao ? formatDate(loan.data_devolucao) : "Pendente"}</td>
            <td><span class="status-badge ${getStatusClass(status)}">${status}</span></td>
            <td>${loan.observacoes || "Nenhuma"}</td>
            <td>
                ${!isReturned ?
                    `<button class="return-btn" data-id="${loan.id}"><i class="fas fa-check-circle"></i> Devolver</button>` :
                    `<button class="return-btn btn-finalizado" disabled><i class="fas fa-check-square"></i> Finalizado</button>`
                }
            </td>
        `;
        loansTableBody.appendChild(row);
    });
    document.querySelectorAll('.return-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const btn = e.target.closest('.return-btn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Devolvendo...';
            const loanId = btn.getAttribute('data-id');
            finalizarEmprestimo(loanId);
        });
    });
}

// ===================================================================
// AQUI ESTÁ A FUNÇÃO CORRIGIDA CONFORME SUA SOLICITAÇÃO
// ===================================================================
// ...existing code...
function calculateLoanStatus(loan) {
    const now = new Date();

    // Se já foi devolvido (data_devolucao existe e é menor ou igual a agora)
    if (loan.data_devolucao) {
        const dataDevolucao = new Date(loan.data_devolucao);
        if (dataDevolucao <= now) {
            return "Devolvido";
        }
    }

    // Data prevista de devolução (use o campo do backend se existir)
    let expectedReturnDate;
    if (loan.data_devolucao_prevista) {
        expectedReturnDate = new Date(loan.data_devolucao_prevista);
    } else {
        const withdrawalDate = new Date(loan.data_retirada);
        expectedReturnDate = new Date(withdrawalDate);
        expectedReturnDate.setDate(expectedReturnDate.getDate() + 7);
    }

    // EM ATRASO: passou da data prevista e não foi devolvido
    if (now > expectedReturnDate) {
        return "Em atraso";
    }

    // PENDENTE: ainda não chegou a data prevista e não foi devolvido
    return "Em andamento";
}

function getStatusClass(status) {
    switch (status) {
        case "Pendente": return "status-pending";
        case "Em andamento": return "status-active";
        case "Devolvido": return "status-returned";
        case "Em atraso": return "status-delayed";
        default: return "";
    }
}
// ...existing code...
// Função para formatar data para exibição
function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// Função para configurar paginação
function setupPagination() {
    const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
    pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    prevPageBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
            setupPagination();
        }
    };
    nextPageBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
            setupPagination();
        }
    };
}

// Função para aplicar filtros
function applyFilters() {
    const userText = filterUser.value.toLowerCase();
    const toolText = filterTool.value.toLowerCase();
    const status = filterStatus.value;
    filteredLoans = allLoans.filter((loan) => {
        if (userText && !(loan.nomeUsuario || "").toLowerCase().includes(userText)) return false;
        if (toolText && !(loan.nomeFerramenta || "").toLowerCase().includes(toolText)) return false;
        if (status) {
            const loanStatus = calculateLoanStatus(loan);
            const statusMap = {
                active: "Em andamento",
                returned: "Devolvido",
                delayed: "Em atraso"
            };
            if (loanStatus !== statusMap[status]) return false;
        }
        return true;
    });
    currentPage = 1;
    renderTable();
    setupPagination();
}

// Adicionar event listeners
filterUser.addEventListener("input", applyFilters);
filterTool.addEventListener("input", applyFilters);
filterStatus.addEventListener("change", applyFilters);
novoEmprestimoBtn.addEventListener("click", () => {
    window.location.href = "../PostEmp/PostEmp.html";
});
document.addEventListener("DOMContentLoaded", loadLoans);