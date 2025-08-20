// URLs da API
const API_BASE = "http://localhost:8080/usuarios";
const API_GET = `${API_BASE}/buscar`;
const API_POST = `${API_BASE}/novoUsuario`;
const API_PUT = `${API_BASE}/editar`;
const API_DELETE = `${API_BASE}/deletar`;

// Objeto para manipular os alunos via API
const alunoService = {
    // Buscar todos os alunos - CORRIGIDO
    getAll: async function () {
        try {
            const response = await fetch(API_GET);
            
            if (!response.ok) {
                // Se a resposta não for bem-sucedida, tentar obter detalhes do erro
                let errorMessage = `Erro ${response.status}: ${response.statusText}`;
                
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (e) {
                    // Se não conseguir extrair JSON, usar texto simples
                    const errorText = await response.text();
                    if (errorText) errorMessage = errorText;
                }
                
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            
            // Filtrar apenas os dados necessários (nome, sobrenome, turma)
            return data.map(user => ({
                id: user.id,
                nome: user.nome,
                sobrenome: user.sobrenome,
                turma: user.turma,
                tipoUsuario: user.tipoUsuario
            }));
            
        } catch (error) {
            console.error("Erro ao buscar alunos:", error);
            showFeedback(`Erro ao carregar usuários: ${error.message}`, "error");
            return [];
        }
    },

    // Buscar aluno por ID - CORRIGIDO
    getById: async function (id) {
        try {
            const response = await fetch(`${API_GET}/${id}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ${response.status}: ${errorText || 'Falha ao buscar aluno'}`);
            }
            
            const user = await response.json();
            
            // Retornar apenas os dados necessários
            return {
                id: user.id,
                nome: user.nome,
                sobrenome: user.sobrenome,
                turma: user.turma
            };
            
        } catch (error) {
            console.error("Erro:", error);
            showFeedback(`Erro ao buscar usuário: ${error.message}`, "error");
            return null;
        }
    },

    // Salvar aluno (criar ou atualizar) - CORRIGIDO
    save: async function (aluno) {
        try {
            const url = aluno.id ? `${API_PUT}/${aluno.id}` : API_POST;
            const method = aluno.id ? "PUT" : "POST";

            // Gerar username automaticamente a partir do nome e sobrenome
            const username = `${aluno.nome.toLowerCase()}.${aluno.sobrenome.toLowerCase()}`;
            
            // Preparar dados para enviar para a API
            const userData = {
                id: aluno.id || null,
                nome: aluno.nome,
                sobrenome: aluno.sobrenome,
                turma: aluno.turma,
                username: username,
                tipoUsuario: "ALUNO"
            };

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ${response.status}: ${errorText || 'Falha ao salvar aluno'}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Erro:", error);
            throw error;
        }
    },

    // Deletar aluno - CORRIGIDO
    delete: async function (id) {
        try {
            const response = await fetch(`${API_DELETE}/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ${response.status}: ${errorText || 'Falha ao deletar aluno'}`);
            }

            return true;
        } catch (error) {
            console.error("Erro:", error);
            throw error;
        }
    }
};

// Variável global para armazenar todos os alunos
let allStudents = [];

// Função para exibir mensagem de feedback
function showFeedback(message, type = "error") {
    // Implementação depende do seu HTML
    const feedbackElement = document.getElementById("feedback-message");
    if (feedbackElement) {
        feedbackElement.textContent = message;
        feedbackElement.className = `feedback-message feedback-${type}`;
        feedbackElement.style.display = "block";

        if (type === "success") {
            setTimeout(() => {
                feedbackElement.style.display = "none";
            }, 3000);
        }
    } else {
        // Fallback para alert se o elemento não existir
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

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
        showFeedback("Por favor, preencha todos os campos!", "error");
        return;
    }

    // Objeto com dados do aluno
    const aluno = {
        id: studentId ? parseInt(studentId) : null,
        nome: firstName,
        sobrenome: lastName,
        turma: studentClass
    };

    try {
        await alunoService.save(aluno);
        loadStudentsTable();
        closeModal();
        showFeedback("Aluno salvo com sucesso!", "success");
    } catch (error) {
        console.error("Erro ao salvar aluno:", error);
        showFeedback(`Erro ao salvar aluno: ${error.message}`, "error");
    }
}

async function deleteStudent(id) {
    if (confirm("Tem certeza que deseja excluir este aluno?")) {
        try {
            const success = await alunoService.delete(id);
            if (success) {
                loadStudentsTable();
                showFeedback("Aluno excluído com sucesso!", "success");
            }
        } catch (error) {
            console.error("Erro ao excluir aluno:", error);
            showFeedback(`Erro ao excluir aluno: ${error.message}`, "error");
        }
    }
}

function searchStudents() {
    const searchTerm = document.getElementById("search-input").value.toLowerCase();

    if (searchTerm === "") {
        loadStudentsTable();
        return;
    }

    // Filtrar alunos localmente
    const filteredStudents = allStudents.filter(
        (student) =>
            (student.nome && student.nome.toLowerCase().includes(searchTerm)) ||
            (student.sobrenome && student.sobrenome.toLowerCase().includes(searchTerm)) ||
            (student.turma && student.turma.toLowerCase().includes(searchTerm)) ||
            (student.id && student.id.toString().includes(searchTerm))
    );

    // Carregar a tabela com os alunos filtrados
    loadStudentsTable(filteredStudents);
}

// ==================== FUNÇÕES AUXILIARES ====================

// Função para carregar alunos na tabela
async function loadStudentsTable(studentsArray = null) {
    const tableBody = document.getElementById("students-table-body");
    
    try {
        const students = studentsArray || (await alunoService.getAll());

        // Armazenar todos os alunos para pesquisa
        if (!studentsArray) {
            allStudents = students;
        }

        if (students.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px;">
                        Nenhum usuário encontrado
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = '';
        students.forEach((student) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.nome || 'N/A'}</td>
                <td>${student.sobrenome || 'N/A'}</td>
                <td>${student.turma || 'N/A'}</td>
                <td>${student.tipoUsuario || 'N/A'}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="editStudent(${student.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteStudent(${student.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Erro ao carregar alunos:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: #e74c3c;">
                    <i class="fas fa-exclamation-circle"></i> Erro ao carregar usuários. 
                    Verifique se o servidor está respondendo.
                </td>
            </tr>
        `;
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
            document.getElementById("modal-title").textContent = "Editar Aluno";
            document.getElementById("student-modal").style.display = "flex";
        }
    } catch (error) {
        console.error("Erro ao abrir modal de edição:", error);
        showFeedback(`Erro ao carregar dados do aluno: ${error.message}`, "error");
    }
}

// ==================== INICIALIZAÇÃO ====================

// Inicializa a tabela quando a página carregar
document.addEventListener("DOMContentLoaded", function () {
    loadStudentsTable();
    
    // Adicionar event listener para a pesquisa
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", searchStudents);
    }
});

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById("student-modal");
    if (modal && event.target === modal) {
        closeModal();
    }
};