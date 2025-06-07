// Simulação de dados (poderiam vir de um arquivo JSON, banco local, etc.)
const emprestimos = [
  { aluno: 'Maria Oliveira', livro: 'Dom Casmurro', dataHora: '2025-06-06T09:30:00' },
  { aluno: 'João Silva', livro: 'Capitães da Areia', dataHora: '2025-06-06T10:15:00' },
  { aluno: 'Ana Costa', livro: 'O Pequeno Príncipe', dataHora: '2025-06-05T14:45:00' },
];

// Função para exibir empréstimos do dia atual
function mostrarEmprestimosDoDia() {
  const container = document.getElementById('lista-emprestimos');
  const hoje = new Date().toISOString().split('T')[0];

  const emprestimosHoje = emprestimos.filter(e =>
    e.dataHora.startsWith(hoje)
  );

  if (emprestimosHoje.length === 0) {
    container.innerHTML = '<p>Nenhum empréstimo feito hoje.</p>';
    return;
  }

  emprestimosHoje.forEach(e => {
    const div = document.createElement('div');
    div.classList.add('emprestimo');
    div.innerHTML = `
      <strong>Aluno:</strong> ${e.aluno}<br>
      <strong>Livro:</strong> ${e.livro}<br>
      <strong>Hora:</strong> ${new Date(e.dataHora).toLocaleTimeString()}
    `;
    container.appendChild(div);
  });
}

// Chamar ao carregar a página
mostrarEmprestimosDoDia();
