let students = [
            { 
                id: 1, 
                firstName: "Carlos", 
                lastName: "Silva", 
                class: "1º Oficina Industrial"
            },
            { 
                id: 2, 
                firstName: "Ana", 
                lastName: "Souza", 
                class: "2º Oficina"
            },
            { 
                id: 3, 
                firstName: "Mariana", 
                lastName: "Costa", 
                class: "1º Oficina Industrial"
            },
            { 
                id: 4, 
                firstName: "Pedro", 
                lastName: "Santos", 
                class: "2º Oficina"
            }
        ];

        // Função para carregar alunos na tabela
        function loadStudentsTable(studentsArray = students) {
            const tableBody = document.getElementById('students-table-body');
            tableBody.innerHTML = '';

            studentsArray.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.id}</td>
                    <td>${student.firstName}</td>
                    <td>${student.lastName}</td>
                    <td>${student.class}</td>
                `;
                tableBody.appendChild(row);
            });
        }

        // Função de pesquisa
        function searchStudents() {
            const searchTerm = document.getElementById('search-input').value.toLowerCase();
            const filteredStudents = students.filter(student => 
                student.firstName.toLowerCase().includes(searchTerm) ||
                student.lastName.toLowerCase().includes(searchTerm) ||
                student.class.toLowerCase().includes(searchTerm)
            );
            loadStudentsTable(filteredStudents);
        }

        // Funções do modal
        function openAddStudentModal() {
            document.getElementById('student-form').reset();
            document.getElementById('student-id').value = '';
            document.getElementById('modal-title').textContent = 'Adicionar Novo Aluno';
            document.getElementById('student-modal').style.display = 'flex';
        }

        function closeModal() {
            document.getElementById('student-modal').style.display = 'none';
        }

        function saveStudent() {
            const studentId = document.getElementById('student-id').value;
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const studentClass = document.getElementById('class').value;

            if (studentId) {
                // Atualizar aluno existente
                const index = students.findIndex(s => s.id == studentId);
                if (index !== -1) {
                    students[index] = {
                        ...students[index],
                        firstName,
                        lastName,
                        class: studentClass
                    };
                }
            } else {
                // Adicionar novo aluno
                const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
                students.push({
                    id: newId,
                    firstName,
                    lastName,
                    class: studentClass
                });
            }

            loadStudentsTable();
            closeModal();
        }

        // Inicializa a tabela quando a página carregar
        document.addEventListener('DOMContentLoaded', function() {
            loadStudentsTable();
        });
