 document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('locais-container');
    const searchInput = document.getElementById('search');
    let todosLocais = [];

    async function carregarLocais() {
      try {
        const response = await axios.get('https://sua-api.com/locais', {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
          }
        });

        todosLocais = response.data;
        exibirLocais(todosLocais);
      } catch (error) {
        console.error('Erro ao carregar locais:', error);
        Swal.fire('Erro', 'Erro ao carregar locais', 'error');
      }
    }

    function exibirLocais(locais) {
      container.innerHTML = '';
      locais.forEach(local => {
        const card = document.createElement('div');
        card.className = 'local-card';
        card.innerHTML = `
          <h3>${local.nome_espaco}</h3>
          <p>Armário: ${local.armario}<br>
             Prateleira: ${local.prateleira}<br>
             Estojo: ${local.estojo || 'Nenhum'}</p>
          <button class="editar-btn" data-id="${local.id}">Editar</button>
          <button class="excluir-btn" data-id="${local.id}">Excluir</button>
        `;
        container.appendChild(card);
      });

      document.querySelectorAll('.editar-btn').forEach(btn => {
        btn.addEventListener('click', () => editarLocal(btn.dataset.id));
      });

      document.querySelectorAll('.excluir-btn').forEach(btn => {
        btn.addEventListener('click', () => excluirLocal(btn.dataset.id));
      });
    }

    searchInput.addEventListener('input', () => {
      const termo = searchInput.value.toLowerCase();
      const filtrados = todosLocais.filter(local =>
        local.nome_espaco.toLowerCase().includes(termo)
      );
      exibirLocais(filtrados);
    });

    document.getElementById('add-local').addEventListener('click', async () => {
      const { value: formValues } = await Swal.fire({
        title: 'Cadastrar Local',
        html:
          '<input id="nome_espaco" class="swal2-input" placeholder="Nome do Espaço">' +
          '<input id="armario" class="swal2-input" placeholder="Armário">' +
          '<input id="prateleira" class="swal2-input" placeholder="Prateleira">' +
          '<input id="estojo" class="swal2-input" placeholder="Estojo (opcional)">',
        focusConfirm: false,
        showCancelButton: true,
        preConfirm: () => {
          const nome_espaco = document.getElementById('nome_espaco').value.trim();
          const armario = document.getElementById('armario').value.trim();
          const prateleira = document.getElementById('prateleira').value.trim();
          const estojo = document.getElementById('estojo').value.trim();

          if (!nome_espaco || !armario || !prateleira) {
            Swal.showValidationMessage('Preencha todos os campos obrigatórios.');
            return false;
          }

          return { nome_espaco, armario, prateleira, estojo };
        }
      });

      if (formValues) {
        adicionarLocal(formValues);
      }
    });

    async function adicionarLocal(dados) {
      try {
        await axios.post('https://sua-api.com/locais', dados, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
          }
        });
        await carregarLocais();
        Swal.fire('Sucesso', 'Local adicionado com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao adicionar local:', error);
        Swal.fire('Erro', 'Erro ao adicionar local', 'error');
      }
    }

    async function editarLocal(id) {
      const local = todosLocais.find(l => l.id == id);
      if (!local) return;

      const { value: formValues } = await Swal.fire({
        title: 'Editar Local',
        html:
          `<input id="nome_espaco" class="swal2-input" value="${local.nome_espaco}" placeholder="Nome do Espaço">` +
          `<input id="armario" class="swal2-input" value="${local.armario}" placeholder="Armário">` +
          `<input id="prateleira" class="swal2-input" value="${local.prateleira}" placeholder="Prateleira">` +
          `<input id="estojo" class="swal2-input" value="${local.estojo || ''}" placeholder="Estojo (opcional)">`,
        focusConfirm: false,
        showCancelButton: true,
        preConfirm: () => {
          const nome_espaco = document.getElementById('nome_espaco').value.trim();
          const armario = document.getElementById('armario').value.trim();
          const prateleira = document.getElementById('prateleira').value.trim();
          const estojo = document.getElementById('estojo').value.trim();

          if (!nome_espaco || !armario || !prateleira) {
            Swal.showValidationMessage('Preencha todos os campos obrigatórios.');
            return false;
          }

          return { nome_espaco, armario, prateleira, estojo };
        }
      });

      if (formValues) {
        try {
          await axios.put(`https://sua-api.com/locais/${id}`, formValues, {
            headers: {
              'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            }
          });
          await carregarLocais();
          Swal.fire('Sucesso', 'Local atualizado com sucesso!', 'success');
        } catch (error) {
          console.error('Erro ao editar local:', error);
          Swal.fire('Erro', 'Erro ao editar local', 'error');
        }
      }
    }

    async function excluirLocal(id) {
      const confirm = await Swal.fire({
        title: 'Tem certeza?',
        text: 'Esta ação não poderá ser desfeita.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
      });

      if (confirm.isConfirmed) {
        try {
          await axios.delete(`https://sua-api.com/locais/${id}`, {
            headers: {
              'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            }
          });
          await carregarLocais();
          Swal.fire('Excluído!', 'Local excluído com sucesso.', 'success');
        } catch (error) {
          console.error('Erro ao excluir local:', error);
          Swal.fire('Erro', 'Erro ao excluir local', 'error');
        }
      }
    }

    carregarLocais();

    document.getElementById('logout').addEventListener('click', () => {
      localStorage.removeItem('authToken');
      window.location.href = '../index.html';
    });
  });