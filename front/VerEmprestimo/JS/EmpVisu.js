// EmpVisu.js
document.addEventListener("DOMContentLoaded", function () {
  // Elementos DOM
  const loansTableBody = document.getElementById("loans-table-body");
  const filterUser = document.getElementById("filter-user");
  const filterTool = document.getElementById("filter-tool");
  const filterStatus = document.getElementById("filter-status");
  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const pageInfo = document.getElementById("page-info");

  // URLs da API
  const EMPRESTIMOS_API = "http://localhost:8080/emprestimos/buscar";
  const USUARIOS_API = "http://localhost:8080/usuarios/buscar";
  const FERRAMENTAS_API = "http://localhost:8080/ferramentas/buscar";

  // Variáveis globais
  let currentPage = 1;
  const itemsPerPage = 10;
  let allLoans = [];
  let filteredLoans = [];

  // Função para carregar empréstimos
  async function loadLoans() {
    try {
      const response = await fetch(EMPRESTIMOS_API);
      if (!response.ok) throw new Error("Erro ao carregar empréstimos");

      const data = await response.json();
      allLoans = data;
      filteredLoans = [...allLoans];

      renderTable();
      setupPagination();
    } catch (error) {
      console.error("Erro ao carregar empréstimos:", error);
      alert("Erro ao carregar dados. Tente novamente mais tarde.");
    }
  }

  // Função para carregar usuários (para filtro)
  async function loadUsers() {
    try {
      const response = await fetch(USUARIOS_API);
      if (!response.ok) throw new Error("Erro ao carregar usuários");

      const users = await response.json();

      // Limpar e preencher o select
      filterUser.innerHTML = '<option value="">Todos os usuários</option>';
      users.forEach((user) => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = `${user.nome} ${user.sobrenome}`;
        filterUser.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  }

  // Função para carregar ferramentas (para filtro)
  async function loadTools() {
    try {
      const response = await fetch(FERRAMENTAS_API);
      if (!response.ok) throw new Error("Erro ao carregar ferramentas");

      const tools = await response.json();

      // Limpar e preencher o select
      filterTool.innerHTML = '<option value="">Todas as ferramentas</option>';
      tools.forEach((tool) => {
        const option = document.createElement("option");
        option.value = tool.id;
        option.textContent = tool.nome;
        filterTool.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao carregar ferramentas:", error);
    }
  }

  // Função para renderizar a tabela
  function renderTable() {
    loansTableBody.innerHTML = "";

    if (filteredLoans.length === 0) {
      loansTableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 20px;">
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
        <td>${loan.usuario.nome} ${loan.usuario.sobrenome}</td>
        <td>${loan.usuario.turma || "N/A"}</td>
        <td>${loan.ferramenta.nome}</td>
        <td>${loan.ferramenta.nomeLocal || "N/A"}</td>
        <td>${formatDate(loan.data_retirada)}</td>
        <td>${
          loan.data_devolucao ? formatDate(loan.data_devolucao) : "Pendente"
        }</td>
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
    const devolutionDate = new Date(loan.data_devolucao);
    const withdrawalDate = new Date(loan.data_retirada);

    if (!loan.data_devolucao) {
      // Se ainda não foi devolvido
      if (devolutionDate < now) return "Em atraso";
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
      minute: "2-digit",
    });
  }

  // Função para configurar paginação
  function setupPagination() {
    const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);

    // Atualizar informações da página
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;

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
    const userId = filterUser.value;
    const toolId = filterTool.value;
    const status = filterStatus.value;

    filteredLoans = allLoans.filter((loan) => {
      // Filtro por usuário
      if (userId && loan.usuario.id != userId) return false;

      // Filtro por ferramenta
      if (toolId && loan.ferramenta.id != toolId) return false;

      // Filtro por status
      if (status) {
        const loanStatus = calculateLoanStatus(loan).toLowerCase();
        const statusMap = {
          active: "em andamento",
          returned: "devolvido",
          delayed: "em atraso",
        };

        if (loanStatus !== statusMap[status]) return false;
      }

      return true;
    });

    currentPage = 1;
    renderTable();
    setupPagination();
  }

  // Função para navegação (novo empréstimo)
  function navigate(page) {
    // Implemente a navegação para a página de novo empréstimo
    console.log("Navegar para:", page);
    // Exemplo: window.location.href = `novo-emprestimo.html`;
  }

  // Adicionar event listeners para filtros
  filterUser.addEventListener("change", applyFilters);
  filterTool.addEventListener("change", applyFilters);
  filterStatus.addEventListener("change", applyFilters);

  // Inicializar
  loadUsers();
  loadTools();
  loadLoans();
});
