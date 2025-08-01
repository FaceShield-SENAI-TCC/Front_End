// URL base da sua API (ajuste conforme sua configuração)
const API_URL = "http://localhost/seu_projeto/api/alunos.php";

// Objeto para manipular os alunos via API
const alunoService = {
  // Buscar todos os alunos
  getAll: async function () {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Erro ao buscar todos alunos");
      }
      return await response.json();
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao carregar todos alunos");
      return [];
    }
  },

  // Buscar aluno por ID
  getById: async function (id) {
    try {
      const response = await fetch(`${API_URL}?id=${id}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar aluno por id");
      }
      return await response.json();
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao buscar aluno por id");
      return null;
    }
  },

  // Salvar aluno (criar ou atualizar)
  save: async function (aluno) {
    try {
      const method = aluno.id ? "PUT" : "POST";
      const response = await fetch(API_URL, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(aluno),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar aluno");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar aluno");
      return null;
    }
  },

  // Deletar aluno
  delete: async function (id) {
    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar aluno");
      }

      return true;
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao deletar aluno");
      return false;
    }
  },

  // Pesquisar alunos
  search: async function (term) {
    try {
      const response = await fetch(`${API_URL}?search=${term}`);
      if (!response.ok) {
        throw new Error("Erro ao pesquisar alunos");
      }
      return await response.json();
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao pesquisar alunos");
      return [];
    }
  },
};

// Função para carregar alunos na tabela
async function loadStudentsTable(studentsArray = null) {
  const tableBody = document.getElementById("students-table-body");
  tableBody.innerHTML = "";

  try {
    const students = studentsArray || (await alunoService.getAll());

    students.forEach((student) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.firstName}</td>
                <td>${student.lastName}</td>
                <td>${student.class}</td>
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
    console.error("Erro ao carregar alunos:", error);
  }
}

// Função de pesquisa
async function searchStudents() {
  const searchTerm = document.getElementById("search-input").value;
  const filteredStudents = await alunoService.search(searchTerm);
  loadStudentsTable(filteredStudents);
}

// Funções do modal
function openAddStudentModal() {
  document.getElementById("student-form").reset();
  document.getElementById("student-id").value = "";
  document.getElementById("modal-title").textContent = "Adicionar Novo Aluno";
  document.getElementById("student-modal").style.display = "flex";
}

async function openEditStudentModal(id) {
  try {
    const student = await alunoService.getById(id);
    if (student) {
      document.getElementById("student-id").value = student.id;
      document.getElementById("first-name").value = student.firstName;
      document.getElementById("last-name").value = student.lastName;
      document.getElementById("class").value = student.class;
      document.getElementById("modal-title").textContent = "Editar Aluno";
      document.getElementById("student-modal").style.display = "flex";
    }
  } catch (error) {
    console.error("Erro ao abrir modal de edição:", error);
  }
}

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

  const aluno = {
    id: studentId ? parseInt(studentId) : null,
    firstName,
    lastName,
    class: studentClass,
  };

  try {
    await alunoService.save(aluno);
    loadStudentsTable();
    closeModal();
  } catch (error) {
    console.error("Erro ao salvar aluno:", error);
  }
}

// Função para editar aluno
function editStudent(id) {
  openEditStudentModal(id);
}

// Função para deletar aluno
async function deleteStudent(id) {
  if (confirm("Tem certeza que deseja excluir este aluno?")) {
    const success = await alunoService.delete(id);
    if (success) {
      loadStudentsTable();
    }
  }
}

// Inicializa a tabela quando a página carregar
document.addEventListener("DOMContentLoaded", function () {
  loadStudentsTable();
});
