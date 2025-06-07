document.addEventListener('DOMContentLoaded', () => {
    const turmaSelect = document.getElementById('turma-select');
    const alunosContainer = document.getElementById('alunos-container');
    const logoutBtn = document.getElementById('logout');
    const nomeInput = document.getElementById('nome-input');

    let alunosDaTurma = [];

    async function carregarTurmas() {
        try {
            const response = await axios.get('https://sua-api.com/turmas', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
                }
            });
            turmaSelect.innerHTML = '<option value="">Selecione uma turma</option>';
            response.data.forEach(turma => {
                const option = document.createElement('option');
                option.value = turma.id;
                option.textContent = turma.nome;
                turmaSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar turmas:', error);
            turmaSelect.innerHTML = '<option value="">Erro ao carregar turmas</option>';
        }
    }

    async function carregarAlunos(turmaId) {
        alunosContainer.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Carregando alunos...</p>
            </div>
        `;
        try {
            const response = await axios.get(`https://sua-api.com/alunos?turma=${turmaId}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
                }
            });

            alunosDaTurma = response.data;
            filtrarEExibirAlunos();

        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
            alunosContainer.innerHTML = `
                <div class="no-results">
                    <i>⚠️</i>
                    <h3>Erro ao carregar alunos</h3>
                    <p>Tente novamente mais tarde</p>
                </div>
            `;
        }
    }

    function filtrarEExibirAlunos() {
        const termo = nomeInput.value.trim().toLowerCase();
        const alunosFiltrados = alunosDaTurma.filter(aluno =>
            aluno.nome.toLowerCase().includes(termo) ||
            aluno.sobrenome?.toLowerCase().includes(termo)
        );

        if (alunosFiltrados.length === 0) {
            alunosContainer.innerHTML = `
                <div class="no-results">
                    <i>📭</i>
                    <h3>Nenhum aluno encontrado</h3>
                    <p>Verifique o nome ou selecione outra turma</p>
                </div>
            `;
            return;
        }

        alunosContainer.innerHTML = '';
        alunosFiltrados.forEach(aluno => {
            const primeiraLetra = aluno.nome.charAt(0).toUpperCase();
            const alunoCard = document.createElement('div');
            alunoCard.className = 'aluno-card';
            alunoCard.innerHTML = `
                <span class="biometria-status ${aluno.biometria ? 'biometria-ativa' : 'biometria-inativa'}">
                    ${aluno.biometria ? 'Biometria ativa' : 'Sem biometria'}
                </span>
                <div class="aluno-header">
                    <div class="aluno-avatar">${primeiraLetra}</div>
                    <div class="aluno-info">
                        <h3>${aluno.nome} ${aluno.sobrenome}</h3>
                        <p>ID: ${aluno.id}</p>
                    </div>
                </div>
                <div class="aluno-details">
                    <div class="detail-item">
                        <span class="detail-label">Turma</span>
                        <span class="detail-value">${aluno.turma}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Cadastrado em</span>
                        <span class="detail-value">${new Date(aluno.data_cadastro).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Último acesso</span>
                        <span class="detail-value">${aluno.ultimo_acesso ? new Date(aluno.ultimo_acesso).toLocaleString() : 'Nunca'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Empréstimos</span>
                        <span class="detail-value">${aluno.emprestimos || 0}</span>
                    </div>
                </div>
            `;
            alunosContainer.appendChild(alunoCard);
        });
    }

    turmaSelect.addEventListener('change', () => {
        const turmaId = turmaSelect.value;
        if (turmaId) {
            carregarAlunos(turmaId);
        } else {
            alunosContainer.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                    <p>Selecione uma turma para ver os alunos</p>
                </div>
            `;
        }
    });

    nomeInput.addEventListener('input', filtrarEExibirAlunos);
/*
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = '../index.html';
    });

    if (!localStorage.getItem('authToken')) {
        window.location.href = '../Login/LoginProfessor.html';
    }
*/
    carregarTurmas();
});

