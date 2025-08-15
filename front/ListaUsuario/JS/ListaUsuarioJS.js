// URLs corrigidas com base no Swagger
const API_BASE = "http://localhost:8080/usuarios";
const API_GET = `${API_BASE}/buscar`;
const API_POST = `${API_BASE}/novoUsuario`;
const API_PUT = `${API_BASE}/editar`;
const API_DELETE = `${API_BASE}/deletar`;

<<<<<<< HEAD:front/ListaUsuario/JS/ListaUsuarioJS.js
// Objeto para manipular os usuarios via API
const usuarioService = {
  // Buscar todos os usuarios
=======
// Objeto para manipular os alunos via API (corrigido)
const alunoService = {
  // Buscar todos os alunos
>>>>>>> cdfa245928a408aa1ebe22f1e0b1480e7a2deee4:front/ListaAluno/JS/ListaAlunJS.js
  getAll: async function () {
    try {
      const response = await fetch(API_GET);
      if (!response.ok) {
        throw new Error("Erro ao buscar todos os usuarios");
      }
      return await response.json();
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao carregar todos usuarios");
      return [];
    }
  },

<<<<<<< HEAD:front/ListaUsuario/JS/ListaUsuarioJS.js
  // Buscar usuario por ID
=======
  // Buscar aluno por ID - CORRIGIDO
>>>>>>> cdfa245928a408aa1ebe22f1e0b1480e7a2deee4:front/ListaAluno/JS/ListaAlunJS.js
  getById: async function (id) {
    try {
      const response = await fetch(`${API_GET}/${id}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar usuario por id");
      }
      return await response.json();
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao buscar usuario por id");
      return null;
    }
  },

<<<<<<< HEAD:front/ListaUsuario/JS/ListaUsuarioJS.js
  // Salvar usuario (criar ou atualizar)
  save: async function (usuario) {
    try {
      const method = usuario.id ? "PUT" : "POST";
      const response = await fetch(API_URL, {
=======
  // Salvar aluno (criar ou atualizar) - CORRIGIDO
  save: async function (aluno) {
    try {
      const url = aluno.id ? `${API_PUT}/${aluno.id}` : API_POST;
      const method = aluno.id ? "PUT" : "POST";

      const response = await fetch(url, {
>>>>>>> cdfa245928a408aa1ebe22f1e0b1480e7a2deee4:front/ListaAluno/JS/ListaAlunJS.js
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
      });

      if (!response.ok) {
<<<<<<< HEAD:front/ListaUsuario/JS/ListaUsuarioJS.js
        throw new Error("Erro ao salvar usuario");
=======
        const errorText = await response.text();
        throw new Error(`Erro ao salvar aluno: ${errorText}`);
>>>>>>> cdfa245928a408aa1ebe22f1e0b1480e7a2deee4:front/ListaAluno/JS/ListaAlunJS.js
      }

      return await response.json();
    } catch (error) {
      console.error("Erro:", error);
<<<<<<< HEAD:front/ListaUsuario/JS/ListaUsuarioJS.js
      alert("Erro ao salvar usuario");
=======
      alert(error.message);
>>>>>>> cdfa245928a408aa1ebe22f1e0b1480e7a2deee4:front/ListaAluno/JS/ListaAlunJS.js
      return null;
    }
  },

<<<<<<< HEAD:front/ListaUsuario/JS/ListaUsuarioJS.js
  // Deletar usuario
=======
  // Deletar aluno - CORRIGIDO
>>>>>>> cdfa245928a408aa1ebe22f1e0b1480e7a2deee4:front/ListaAluno/JS/ListaAlunJS.js
  delete: async function (id) {
    try {
      const response = await fetch(`${API_DELETE}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
<<<<<<< HEAD:front/ListaUsuario/JS/ListaUsuarioJS.js
        throw new Error("Erro ao deletar usuario");
=======
        const errorText = await response.text();
        throw new Error(`Erro ao deletar aluno: ${errorText}`);
>>>>>>> cdfa245928a408aa1ebe22f1e0b1480e7a2deee4:front/ListaAluno/JS/ListaAlunJS.js
      }

      return true;
    } catch (error) {
      console.error("Erro:", error);
<<<<<<< HEAD:front/ListaUsuario/JS/ListaUsuarioJS.js
      alert("Erro ao deletar usuario");
=======
      alert(error.message);
>>>>>>> cdfa245928a408aa1ebe22f1e0b1480e7a2deee4:front/ListaAluno/JS/ListaAlunJS.js
      return false;
    }
  },

<<<<<<< HEAD:front/ListaUsuario/JS/ListaUsuarioJS.js
  // Pesquisar usuarios
=======
  // Pesquisar alunos - CORRIGIDO
>>>>>>> cdfa245928a408aa1ebe22f1e0b1480e7a2deee4:front/ListaAluno/JS/ListaAlunJS.js
  search: async function (term) {
    try {
      const response = await fetch(`${API_GET}?search=${term}`);
      if (!response.ok) {
        throw new Error("Erro ao pesquisar usuarios");
      }
      return await response.json();
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao pesquisar usuarios");
      return [];
    }
  },
};

<<<<<<< HEAD:front/ListaUsuario/JS/ListaUsuarioJS.js
// Função para carregar usuarios na tabela
=======
// Variável global para armazenar todos os alunos
let allStudents = [];

// ==================== FUNÇÕES GLOBAIS ====================

function openAddStudentModal() {
  document.getElementById("student-form").reset();
  document.getElementById("student-id").value = "";
  document.getElementById("modal-title").textContent = "Adicionar Novo Aluno";
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
    username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    tipoUsuario: "ALUNO",
  };

  try {
    await alunoService.save(aluno);
    loadStudentsTable();
    closeModal();
    alert("Aluno salvo com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar aluno:", error);
    alert(`Erro ao salvar aluno: ${error.message}`);
  }
}

async function deleteStudent(id) {
  if (confirm("Tem certeza que deseja excluir este aluno?")) {
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
      (student.id && student.id.toString().includes(searchTerm))
  );

  // Carregar a tabela com os alunos filtrados
  loadStudentsTable(filteredStudents);
}

// ==================== FUNÇÕES AUXILIARES ====================

// Função para carregar alunos na tabela
>>>>>>> cdfa245928a408aa1ebe22f1e0b1480e7a2deee4:front/ListaAluno/JS/ListaAlunJS.js
async function loadStudentsTable(studentsArray = null) {
  const tableBody = document.getElementById("students-table-body");
  tableBody.innerHTML = "";

  try {
    const students = studentsArray || (await usuarioService.getAll());

    // Armazenar todos os alunos para pesquisa
    if (!studentsArray) {
      allStudents = students;
    }

    students.forEach((student) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${student.id}</td>
        <td>${student.nome}</td>
        <td>${student.sobrenome}</td>
        <td>${student.turma}</td>
        <td class="actions">
          <button class="btn-icon" onclick="editStudent(${student.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon btn-danger" onclick="deleteStudent(${student.id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Erro ao carregar usuarios:", error);
  }
}

<<<<<<< HEAD:front/ListaUsuario/JS/ListaUsuarioJS.js
// Função de pesquisa
async function searchStudents() {
  const searchTerm = document.getElementById("search-input").value;
  const filteredStudents = await usuarioService.search(searchTerm);
  loadStudentsTable(filteredStudents);
}

// Funções do modal
function openAddStudentModal() {
  document.getElementById("student-form").reset();
  document.getElementById("student-id").value = "";
  document.getElementById("modal-title").textContent = "Adicionar Novo Usuario";
  document.getElementById("student-modal").style.display = "flex";
}

=======
>>>>>>> cdfa245928a408aa1ebe22f1e0b1480e7a2deee4:front/ListaAluno/JS/ListaAlunJS.js
async function openEditStudentModal(id) {
  try {
    const student = await usuarioService.getById(id);
    if (student) {
      document.getElementById("student-id").value = student.id;
      document.getElementById("first-name").value = student.nome;
      document.getElementById("last-name").value = student.sobrenome;
      document.getElementById("class").value = student.turma;
      document.getElementById("modal-title").textContent = "Editar Usuario";
      document.getElementById("student-modal").style.display = "flex";
    }
  } catch (error) {
    console.error("Erro ao abrir modal de edição:", error);
  }
}

<<<<<<< HEAD:front/ListaUsuario/JS/ListaUsuarioJS.js
function closeModal() {
  document.getElementById("student-modal").style.display = "none";
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

  const usuario = {
    id: studentId ? parseInt(studentId) : null,
    nome,
    sobrenome,
    turma: studentClass,
  };

  try {
    await usuarioService.save(usuario);
    loadStudentsTable();
    closeModal();
  } catch (error) {
    console.error("Erro ao salvar usuario:", error);
  }
}

// Função para editar usuario
function editStudent(id) {
  openEditStudentModal(id);
}

// Função para deletar usuario
async function deleteStudent(id) {
  if (confirm("Tem certeza que deseja excluir este usuario?")) {
    const success = await usuarioService.delete(id);
    if (success) {
      loadStudentsTable();
    }
  }
}
=======
// ==================== INICIALIZAÇÃO ====================
>>>>>>> cdfa245928a408aa1ebe22f1e0b1480e7a2deee4:front/ListaAluno/JS/ListaAlunJS.js

// Inicializa a tabela quando a página carregar
document.addEventListener("DOMContentLoaded", function () {
  loadStudentsTable();
});
