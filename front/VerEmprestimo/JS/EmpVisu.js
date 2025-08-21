
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

// Variáveis globais
let currentPage = 1;
const itemsPerPage = 10;
let allLoans = [];
let filteredLoans = [];

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

    // Adicionar indicador de carregamento
    loansTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 20px;">
                            <div style="display: inline-block; margin-right: 10px;" class="loading"></div>
                            Carregando empréstimos...
                        </td>
                    </tr>
                `;

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
    loansTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 20px; color: #c62828;">
                            Erro ao carregar empréstimos. Verifique se o servidor está rodando.
                        </td>
                    </tr>
                `;
    showFeedback("Erro ao carregar empréstimos. Verifique se o servidor está rodando.");
  }
}

// Função para renderizar a tabela
function renderTable() {
  loansTableBody.innerHTML = "";

  if (filteredLoans.length === 0) {
    loansTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 20px;">
                            Nenhum empréstimo encontrado
                        </td>
                    </tr>
                `;
    return;
  }

  // Calcular itens para a página atual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredLoans.length);
  const currentLoans = filteredLoans.slice(startIndex, endIndex);

  currentLoans.forEach((loan) => {
    const row = document.createElement("tr");

    // Calcular status
    const status = calculateLoanStatus(loan);

    row.innerHTML = `
                    <td>${loan.id}</td>
                    <td>${loan.nomeUsuario || "N/A"}</td>
                    <td>${loan.nomeFerramenta || "N/A"}</td>
                    <td>${formatDate(loan.data_retirada)}</td>
                    <td>${loan.data_devolucao ? formatDate(loan.data_devolucao) : "Pendente"}</td>
                    <td>
                        <span class="status-badge ${getStatusClass(status)}">
                            ${status}
                        </span>
                    </td>
                    <td>${loan.observacoes || "Nenhuma"}</td>
                `;

    loansTableBody.appendChild(row);
  });
}

// Função para calcular o status do empréstimo
function calculateLoanStatus(loan) {
  const now = new Date();
  const devolutionDate = loan.data_devolucao ? new Date(loan.data_devolucao) : null;
  const withdrawalDate = new Date(loan.data_retirada);

  if (!loan.data_devolucao) {
    // Verificar se está em atraso (considerando 7 dias como prazo)
    const expectedReturnDate = new Date(withdrawalDate);
    expectedReturnDate.setDate(expectedReturnDate.getDate() + 7);

    if (now > expectedReturnDate) {
      return "Em atraso";
    }
    return "Em andamento";
  }

  return "Devolvido";
}

// Função para obter classe CSS do status
function getStatusClass(status) {
  switch (status) {
    case "Em andamento":
      return "status-active";
    case "Devolvido":
      return "status-returned";
    case "Em atraso":
      return "status-delayed";
    default:
      return "";
  }
}

// Função para formatar data
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

  // Atualizar informações da página
  pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;

  // Habilitar/desabilitar botões
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

  // Adicionar event listeners
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
    // Filtro por usuário (texto)
    if (userText && !(loan.nomeUsuario || "").toLowerCase().includes(userText)) return false;

    // Filtro por ferramenta (texto)
    if (toolText && !(loan.nomeFerramenta || "").toLowerCase().includes(toolText)) return false;

    // Filtro por status
    if (status) {
      const loanStatus = calculateLoanStatus(loan).toLowerCase();
      const statusMap = {
        active: "em andamento",
        returned: "devolvido",
        delayed: "em atraso"
      };

      if (loanStatus !== statusMap[status]) return false;
    }

    return true;
  });

  currentPage = 1;
  renderTable();
  setupPagination();
}

// Adicionar event listeners para filtros
filterUser.addEventListener("input", applyFilters);
filterTool.addEventListener("input", applyFilters);
filterStatus.addEventListener("change", applyFilters);

// Navegação para novo empréstimo
novoEmprestimoBtn.addEventListener("click", () => {
  window.location.href = "novo-emprestimo.html";
});

// Inicializar
document.addEventListener("DOMContentLoaded", function () {
  loadLoans();
});
// Redirecionamento para Novo Empréstimo
document.getElementById('novo-emprestimo-btn').addEventListener('click', function() {
    window.location.href = '../PostEmp/PostEmp.html';
});