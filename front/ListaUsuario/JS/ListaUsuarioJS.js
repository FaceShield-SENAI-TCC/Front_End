// URL base da sua API (ajuste conforme sua configuração)
const API_URL = "http://localhost:8080/usuarios/buscar";

// Objeto para manipular os usuarios via API
const usuarioService = {
  // Buscar todos os usuarios
  getAll: async function () {
    try {
      console.log("dwiaowdoia");
      const response = await fetch("http://localhost:8080/usuarios/buscar");
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

  // Buscar usuario por ID
  getById: async function (id) {
    try {
      const response = await fetch(`${API_URL}?id=${id}`);
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

  // Salvar usuario (criar ou atualizar)
  save: async function (usuario) {
    try {
      const method = usuario.id ? "PUT" : "POST";
      const response = await fetch(API_URL, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar usuario");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar usuario");
      return null;
    }
  },

  // Deletar usuario
  delete: async function (id) {
    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar usuario");
      }

      return true;
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao deletar usuario");
      return false;
    }
  },

  // Pesquisar usuarios
  search: async function (term) {
    try {
      const response = await fetch(`${API_URL}?search=${term}`);
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

// Função para carregar usuarios na tabela
async function loadStudentsTable(studentsArray = null) {
  const tableBody = document.getElementById("students-table-body");
  tableBody.innerHTML = "";

  try {
    const students = studentsArray || (await usuarioService.getAll());

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

// Inicializa a tabela quando a página carregar
document.addEventListener("DOMContentLoaded", function () {
  loadStudentsTable();
});
