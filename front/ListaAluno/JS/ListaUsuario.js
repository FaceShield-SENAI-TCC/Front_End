// URLs corrigidas com base no Swagger
const API_BASE = "http://localhost:8080/usuarios";
const API_GET = `${API_BASE}/buscar`;
const API_POST = `${API_BASE}/novoUsuario`;
const API_PUT = `${API_BASE}/editar`;
const API_DELETE = `${API_BASE}/deletar`;

// ==================== FUNÇÃO AUXILIAR DE AUTENTICAÇÃO ====================

/**
 * Pega o token do localStorage e retorna o cabeçalho de Autorização.
 * Se o token não existir, lança um erro e redireciona para o login.
 * @param {boolean} includeContentType - Define se o 'Content-Type: application/json' deve ser incluído (padrão: false)
 * @returns {HeadersInit} - Objeto de Headers pronto para o fetch
 */
function getAuthHeaders(includeContentType = false) {
  // Pega o token que foi salvo no login
  const token = localStorage.getItem('authToken');
console.log("Token recuperado:", token);
  if (!token) {
    alert("Sessão expirada ou usuário não logado.");
    // ATENÇÃO: Ajuste a URL abaixo para a sua página de login de professor
    window.location.href = '../LoginProf/LoginProf.html'; // Exemplo
    throw new Error("Token não encontrado. Redirecionando para login.");
  }

  const headers = {
    'Authorization': `Bearer ${token}`
  };

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
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
    window.location.href = '../LoginProf/LoginProf.html'; // Exemplo
    throw new Error("Acesso não autorizado (401/403).");
  }
  
  const errorText = await response.text();
  throw new Error(`Erro na requisição: ${errorText} (Status: ${response.status})`);
}

// ==================== SERVICE COM TOKEN ====================

// Objeto para manipular os alunos via API (corrigido com Token)
const alunoService = {
  // Buscar todos os alunos
  getAll: async function () {
    try {
      const response = await fetch(API_GET, {
        method: 'GET',
        headers: getAuthHeaders() // Adiciona token
      });
      if (!response.ok) await handleResponseError(response);
      return await response.json();
    } catch (error) {
      console.error("Erro:", error);
      alert(error.message); // Exibe o erro (ex: "Token não encontrado")
      return [];
    }
  },

  // Buscar aluno por ID
  getById: async function (id) {
    try {
      const response = await fetch(`${API_GET}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders() // Adiciona token
      });
      if (!response.ok) await handleResponseError(response);
      return await response.json();
    } catch (error) {
      console.error("Erro:", error);
      alert(error.message);
      return null;
    }
  },

  // Salvar aluno (criar ou atualizar)
  save: async function (aluno) {
    try {
      const url = aluno.id ? `${API_PUT}/${aluno.id}` : API_POST;
      const method = aluno.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: getAuthHeaders(true), // Adiciona token + Content-Type
        body: JSON.stringify(aluno),
      });

      if (!response.ok) await handleResponseError(response);
      return await response.json();
    } catch (error) {
      console.error("Erro:", error);
      alert(error.message);
      return null;
    }
  },

  // Deletar aluno
  delete: async function (id) {
    try {
      const response = await fetch(`${API_DELETE}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders() // Adiciona token
      });

      if (!response.ok) await handleResponseError(response);
      return true;
    } catch (error) {
      console.error("Erro:", error);
      alert(error.message);
      return false;
    }
  },

  // Pesquisar alunos
  search: async function (term) {
    try {
      // ATENÇÃO: Verifique se sua API suporta 'search' ou se o parâmetro é outro (ex: 'nome')
      const response = await fetch(`${API_GET}?search=${term}`, {
          method: 'GET',
          headers: getAuthHeaders() // Adiciona token
      });
      
      if (!response.ok) await handleResponseError(response);
      return await response.json();
    } catch (error) {
      console.error("Erro:", error);
      alert(error.message);
      return [];
    }
  },
};

// Variável global para armazenar todos os alunos
let allStudents = [];

// ==================== FUNÇÕES GLOBAIS ====================

function openAddStudentModal() {
  document.getElementById("student-form").reset();
  document.getElementById("student-id").value = "";
  document.getElementById("user-type").value = "Aluno"; // Valor padrão para novos usuários
  document.getElementById("modal-title").textContent = "Adicionar Novo Usuário";
  document.getElementById("student-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("student-modal").style.display = "none";
}

function editStudent(id) {
  openEditStudentModal(id);
}

async function saveStudent() {
  const studentId = document.getElementById("student-id").value;
  const firstName = document.getElementById("first-name").value;
  const lastName = document.getElementById("last-name").value;
  const studentClass = document.getElementById("class").value;

  if (!firstName || !lastName || !studentClass) {
    alert("Por favor, preencha todos os campos!");
    return;
  }

  // Objeto corrigido com base no Swagger
  const aluno = {
    id: studentId ? parseInt(studentId) : null,
    nome: firstName,
    sobrenome: lastName,
    turma: studentClass,
    // Campos obrigatórios do Swagger com valores padrão
    // ATENÇÃO: Se for 'save' de um aluno existente, o username não deveria ser recriado.
    // Esta lógica pode precisar de ajuste dependendo da regra do seu back-end.
    username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    tipoUsuario: "ALUNO", // Valor fixo, não editável
  };

  try {
    await alunoService.save(aluno);
    loadStudentsTable();
    closeModal();
    alert("Usuário salvo com sucesso!");
  } catch (error) {
    // O alerta de erro já é tratado dentro do 'alunoService'
    console.error("Erro ao salvar usuário:", error);
  }
}

async function deleteStudent(id) {
  if (confirm("Tem certeza que deseja excluir este usuário?")) {
    const success = await alunoService.delete(id);
    if (success) {
      loadStudentsTable();
    }
  }
}

function searchStudents() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();

  if (searchTerm === "") {
    // Se o campo de pesquisa estiver vazio, mostrar todos os alunos
    loadStudentsTable();
    return;
  }

  // Filtrar alunos localmente
  const filteredStudents = allStudents.filter(
    (student) =>
      (student.nome && student.nome.toLowerCase().includes(searchTerm)) ||
      (student.sobrenome &&
        student.sobrenome.toLowerCase().includes(searchTerm)) ||
      (student.turma && student.turma.toLowerCase().includes(searchTerm)) ||
      (student.tipoUsuario &&
        student.tipoUsuario.toLowerCase().includes(searchTerm)) ||
      (student.id && student.id.toString().includes(searchTerm))
  );

  // Carregar a tabela com os alunos filtrados
  loadStudentsTable(filteredStudents);
}

// ==================== FUNÇÕES AUXILIARES ====================

// Função para carregar alunos na tabela
async function loadStudentsTable(studentsArray = null) {
  const tableBody = document.getElementById("students-table-body");
  tableBody.innerHTML = ""; // Limpa a tabela

  try {
    const students = studentsArray || (await alunoService.getAll());

    // Armazenar todos os alunos para pesquisa
    if (!studentsArray) {
      allStudents = students;
    }

    if (students.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">Nenhum usuário encontrado.</td></tr>';
        return;
    }

    students.forEach((student) => {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.nome}</td>
            <td>${student.sobrenome}</td>
            <td>${student.turma}</td>
            <td>${
              student.tipoUsuario === "ALUNO" ? "Aluno" : "Professor"
            }</td>
            <td class="actions">
              <button class="btn-icon" onclick="editStudent(${student.id})">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon btn-danger" onclick="deleteStudent(${
                student.id
              })">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    // O erro já é tratado e exibido pelo alunoService
    console.error("Erro ao carregar usuários:", error);
  }
}

async function openEditStudentModal(id) {
  try {
    const student = await alunoService.getById(id);
    if (student) {
      document.getElementById("student-id").value = student.id;
      document.getElementById("first-name").value = student.nome;
      document.getElementById("last-name").value = student.sobrenome;
      document.getElementById("class").value = student.turma;

      // Apenas exiba o tipo de usuário, não permita edição
      document.getElementById("user-type").value =
        student.tipoUsuario === "ALUNO" ? "Aluno" : "Professor";

      document.getElementById("modal-title").textContent = "Editar Usuário";
      document.getElementById("student-modal").style.display = "flex";
    }
  } catch (error) {
    // O erro já é tratado e exibido pelo alunoService
    console.error("Erro ao abrir modal de edição:", error);
  }
}

// ==================== INICIALIZAÇÃO ====================

// Inicializa a tabela quando a página carregar
document.addEventListener("DOMContentLoaded", function () {
  loadStudentsTable();
});