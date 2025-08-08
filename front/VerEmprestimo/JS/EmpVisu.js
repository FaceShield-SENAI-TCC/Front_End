// Dados simulados com estrutura consistente
const usuarios = [
  {
    id: 1,
    nome: "Carlos",
    sobrenome: "Silva",
    turma: "3º INFO A",
    tipo_usuario: "Aluno",
    matricula: "20230001", // Alunos têm matrícula
  },
  {
    id: 2,
    nome: "Ana",
    sobrenome: "Souza",
    turma: "2º ELET B",
    tipo_usuario: "Aluno",
    matricula: "20230002", // Alunos têm matrícula
  },
  {
    id: 3,
    nome: "Roberto",
    sobrenome: "Alves",
    turma: "Professores",
    tipo_usuario: "Professor",
    username: "ralves", // Professores têm username
  },
  {
    id: 4,
    nome: "Mariana",
    sobrenome: "Costa",
    turma: "1º INFO A",
    tipo_usuario: "Aluno",
    matricula: "20230003",
  },
  {
    id: 5,
    nome: "Pedro",
    sobrenome: "Santos",
    turma: "Professores",
    tipo_usuario: "Professor",
    username: "psantos",
  },
];

const ferramentas = [
  {
    id: 1,
    nome: "Multímetro Digital",
    marca: "Fluke",
    modelo: "117",
    local: { nome_espaco: "Laboratório 1", armario: "A1", prateleira: "P3" },
  },
  {
    id: 2,
    nome: "Osciloscópio",
    marca: "Tektronix",
    modelo: "TBS1202B",
    local: { nome_espaco: "Laboratório 2", armario: "B2", prateleira: "P1" },
  },
  {
    id: 3,
    nome: "Furadeira de Bancada",
    marca: "Bosch",
    modelo: "PBD 40",
    local: { nome_espaco: "Oficina Mecânica", armario: "C3", prateleira: "P2" },
  },
  {
    id: 4,
    nome: "Alicate de Corte",
    marca: "Tramontina",
    modelo: "Professional",
    local: { nome_espaco: "Oficina Elétrica", armario: "D4", prateleira: "P1" },
  },
  {
    id: 5,
    nome: "Solda Estação",
    marca: "Weller",
    modelo: "WSD81",
    local: { nome_espaco: "Laboratório 3", armario: "E2", prateleira: "P2" },
  },
];

const emprestimos = [
  {
    id: 101,
    id_usuario: 1,
    id_ferramenta: 1,
    data_retirada: "2025-06-05T10:00:00",
    data_devolucao: "2025-06-12T09:30:00",
    observacoes: "Empréstimo para aula prática",
  },
  {
    id: 102,
    id_usuario: 2,
    id_ferramenta: 2,
    data_retirada: "2025-06-06T14:20:00",
    data_devolucao: null,
    data_prevista: "2025-06-13T14:20:00",
    observacoes: "Empréstimo para projeto",
  },
  {
    id: 103,
    id_usuario: 3,
    id_ferramenta: 3,
    data_retirada: "2025-06-07T08:45:00",
    data_devolucao: null,
    data_prevista: "2025-06-10T08:45:00",
    observacoes: "Uso em laboratório",
  },
  {
    id: 104,
    id_usuario: 4,
    id_ferramenta: 4,
    data_retirada: "2025-06-01T09:15:00",
    data_devolucao: null,
    data_prevista: "2025-06-08T09:15:00",
    observacoes: "Empréstimo para trabalho",
  },
  {
    id: 105,
    id_usuario: 5,
    id_ferramenta: 5,
    data_retirada: "2025-06-08T11:30:00",
    data_devolucao: "2025-06-09T16:45:00",
    observacoes: "Demonstração em sala",
  },
  {
    id: 106,
    id_usuario: 1,
    id_ferramenta: 3,
    data_retirada: "2025-06-10T13:20:00",
    data_devolucao: null,
    data_prevista: "2025-06-17T13:20:00",
    observacoes: "Reparo de equipamento",
  },
  {
    id: 107,
    id_usuario: 2,
    id_ferramenta: 1,
    data_retirada: "2025-06-03T15:40:00",
    data_devolucao: "2025-06-10T10:15:00",
    observacoes: "Aula de eletrônica",
  },
];

// Configuração de paginação
const itemsPerPage = 5;
let currentPage = 1;

// Carregar empréstimos na tabela com paginação
function loadLoans() {
  const tableBody = document.getElementById("loans-table-body");
  tableBody.innerHTML = "";

  // Preencher filtros
  populateFilter("filter-user", usuarios, "nome", "sobrenome");
  populateFilter("filter-tool", ferramentas, "nome");

  // Filtrar empréstimos
  let filteredLoans = filterLoans();

  // Paginação
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLoans = filteredLoans.slice(startIndex, endIndex);

  // Atualizar informações de paginação
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  document.getElementById(
    "page-info"
  ).textContent = `Página ${currentPage} de ${totalPages}`;
  document.getElementById("prev-page").disabled = currentPage === 1;
  document.getElementById("next-page").disabled =
    currentPage === totalPages || totalPages === 0;

  if (paginatedLoans.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px;">Nenhum empréstimo encontrado</td></tr>`;
    return;
  }

  paginatedLoans.forEach((emp) => {
    const usuario = usuarios.find((u) => u.id === emp.id_usuario);
    const ferramenta = ferramentas.find((f) => f.id === emp.id_ferramenta);

    // Determinar status com base na data
    let status = "active";
    let statusText = "Em Andamento";
    if (emp.data_devolucao) {
      status = "returned";
      statusText = "Devolvido";
    } else if (emp.data_prevista && new Date() > new Date(emp.data_prevista)) {
      status = "delayed";
      statusText = "Em Atraso";
    }

    const row = document.createElement("tr");

    // Formatar identificador do usuário (matrícula para alunos, username para professores)
    let userIdentifier = "";
    if (usuario.tipo_usuario === "Aluno") {
      userIdentifier = `<div class="user-badge badge-student">Matrícula: ${usuario.matricula}</div>`;
    } else if (usuario.tipo_usuario === "Professor") {
      userIdentifier = `<div class="user-badge badge-professor">Username: ${usuario.username}</div>`;
    }

    row.innerHTML = `
                    <td>${emp.id}</td>
                    <td>
                        ${usuario.nome} ${usuario.sobrenome} 
                        <div><small>${usuario.tipo_usuario}</small></div>
                        ${userIdentifier}
                    </td>
                    <td>${usuario.turma}</td>
                    <td>${ferramenta.nome} <br><small>${ferramenta.marca} ${
      ferramenta.modelo
    }</small></td>
                    <td>${formatLocation(ferramenta.local)}</td>
                    <td>${formatDateTime(emp.data_retirada)}</td>
                    <td>${
                      emp.data_devolucao
                        ? formatDateTime(emp.data_devolucao)
                        : "-"
                    }</td>
                    <td>
                        <span class="status-badge status-${status}">
                            ${statusText}
                        </span>
                    </td>
                    <td>${emp.observacoes}</td>
                `;

    tableBody.appendChild(row);
  });
}

// Formatar localização
function formatLocation(local) {
  return `
                ${local.nome_espaco}<br>
                <small>Armário: ${local.armario}</small><br>
                <small>Prateleira: ${local.prateleira}</small>
            `;
}

// Formatar data e hora
function formatDateTime(dateTimeString) {
  if (!dateTimeString) return "-";
  const date = new Date(dateTimeString);
  return date.toLocaleString("pt-BR");
}

// Preencher filtros
function populateFilter(filterId, items, ...fields) {
  const filter = document.getElementById(filterId);
  // Limpar opções existentes (exceto a primeira)
  while (filter.options.length > 1) {
    filter.remove(1);
  }

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;

    // Construir texto concatenando campos solicitados
    const textParts = [];
    fields.forEach((field) => {
      if (item[field]) {
        textParts.push(item[field]);
      }
    });

    option.textContent = textParts.join(" ");
    filter.appendChild(option);
  });
}

// Filtrar empréstimos
function filterLoans() {
  const userId = document.getElementById("filter-user").value;
  const toolId = document.getElementById("filter-tool").value;
  const status = document.getElementById("filter-status").value;

  return emprestimos.filter((emp) => {
    // Filtro por usuário
    if (userId && emp.id_usuario != userId) return false;

    // Filtro por ferramenta
    if (toolId && emp.id_ferramenta != toolId) return false;

    // Filtro por status
    if (status === "active" && emp.data_devolucao) return false;
    if (status === "returned" && !emp.data_devolucao) return false;
    if (status === "delayed") {
      if (emp.data_devolucao) return false;
      if (!emp.data_prevista || new Date() <= new Date(emp.data_prevista))
        return false;
    }

    return true;
  });
}

// Navegação entre páginas
function navigate(page) {
  alert(`Redirecionando para: ${page}`);
  // Na implementação real, carregar o conteúdo correspondente
}

// Logout
function logout() {
  if (confirm("Tem certeza que deseja sair do sistema?")) {
    alert("Logout realizado com sucesso!");
    // Redirecionar para página de login
  }
}

// Inicializar filtros
document.getElementById("filter-user").addEventListener("change", function () {
  currentPage = 1;
  loadLoans();
});
document.getElementById("filter-tool").addEventListener("change", function () {
  currentPage = 1;
  loadLoans();
});
document
  .getElementById("filter-status")
  .addEventListener("change", function () {
    currentPage = 1;
    loadLoans();
  });

// Paginação
document.getElementById("prev-page").addEventListener("click", function () {
  if (currentPage > 1) {
    currentPage--;
    loadLoans();
  }
});

document.getElementById("next-page").addEventListener("click", function () {
  const filteredLoans = filterLoans();
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);

  if (currentPage < totalPages) {
    currentPage++;
    loadLoans();
  }
});

// Carregar dados quando a página estiver pronta
document.addEventListener("DOMContentLoaded", loadLoans);
