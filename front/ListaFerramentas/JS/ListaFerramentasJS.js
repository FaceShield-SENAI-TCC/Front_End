 let tools = [
            { 
                id: 1, 
                name: "Alicate Universal", 
                brand: "Tramontina", 
                model: "ACR 8", 
                stock: 7,
                nome_espaco: "Oficina Mecânica",
                armario: "Armário 1",
                prateleira: "Prateleira A",
                estojo: "Estojo 3"
            },
            { 
                id: 2, 
                name: "Chave de Fenda", 
                brand: "Stanley", 
                model: "F-15", 
                stock: 12,
                nome_espaco: "Laboratório de Elétrica",
                armario: "Armário 3",
                prateleira: "Prateleira B",
                estojo: ""
            },
            { 
                id: 3, 
                name: "Multímetro Digital", 
                brand: "Minipa", 
                model: "ET-2082", 
                stock: 8,
                nome_espaco: "Laboratório de Elétrica",
                armario: "Armário 2",
                prateleira: "Prateleira C",
                estojo: "Estojo 1"
            },
            { 
                id: 4, 
                name: "Serra Tico-Tico", 
                brand: "Bosch", 
                model: "GKS 190", 
                stock: 5,
                nome_espaco: "Oficina Mecânica",
                armario: "Armário 1",
                prateleira: "Prateleira D",
                estojo: ""
            },
            { 
                id: 5, 
                name: "Furadeira Parafusadeira", 
                brand: "Makita", 
                model: "DF457DWE", 
                stock: 3,
                nome_espaco: "Oficina de Marcenaria",
                armario: "Armário 5",
                prateleira: "Prateleira A",
                estojo: "Estojo 2"
            },
            { 
                id: 6, 
                name: "Martelo de Unha", 
                brand: "Vonder", 
                model: "MTH-500", 
                stock: 12,
                nome_espaco: "Oficina Mecânica",
                armario: "Armário 4",
                prateleira: "Prateleira E",
                estojo: ""
            },
            { 
                id: 7, 
                name: "Trena a Laser", 
                brand: "Leica", 
                model: "Disto D2", 
                stock: 2,
                nome_espaco: "Laboratório de Topografia",
                armario: "Armário 1",
                prateleira: "Prateleira B",
                estojo: "Estojo 4"
            },
            { 
                id: 8, 
                name: "Nível a Laser", 
                brand: "DeWalt", 
                model: "DW088K", 
                stock: 4,
                nome_espaco: "Laboratório de Topografia",
                armario: "Armário 2",
                prateleira: "Prateleira C",
                estojo: "Estojo 1"
            }
        ];

        // Elementos DOM
        const toolsTableBody = document.getElementById('tools-table-body');
        const searchInput = document.getElementById('search-input');
        const toolModal = document.getElementById('tool-modal');
        const modalTitle = document.getElementById('modal-title');
        const toolForm = document.getElementById('tool-form');
        const toolId = document.getElementById('tool-id');
        const toolName = document.getElementById('tool-name');
        const toolBrand = document.getElementById('tool-brand');
        const toolModel = document.getElementById('tool-model');
        const toolStock = document.getElementById('tool-stock');
        const toolNomeEspaco = document.getElementById('tool-nome_espaco');
        const toolArmario = document.getElementById('tool-armario');
        const toolPrateleira = document.getElementById('tool-prateleira');
        const toolEstojo = document.getElementById('tool-estojo');
        const addToolBtn = document.getElementById('add-tool-btn');
        const saveBtn = document.getElementById('save-btn');
        const cancelBtn = document.getElementById('cancel-btn');
        const closeBtn = document.querySelector('.close-btn');

        // Função para carregar ferramentas na tabela
        function loadToolsTable(toolsArray = tools) {
            toolsTableBody.innerHTML = '';

            toolsArray.forEach(tool => {
                const row = document.createElement('tr');
                
                // Formatar campos de localização
                const estojoDisplay = tool.estojo ? 
                    `<span class="location-badge"><i class="fas fa-box"></i> ${tool.estojo}</span>` : 
                    '<span class="location-badge"><i class="fas fa-box"></i> N/A</span>';
                
                row.innerHTML = `
                    <td>${tool.id}</td>
                    <td>${tool.name}</td>
                    <td>${tool.brand}</td>
                    <td>${tool.model}</td>
                    <td class="${tool.stock < 5 ? 'quantity-low' : ''}">${tool.stock}</td>
                    <td><span class="location-badge"><i class="fas fa-building"></i> ${tool.nome_espaco}</span></td>
                    <td><span class="location-badge"><i class="fas fa-archive"></i> ${tool.armario}</span></td>
                    <td><span class="location-badge"><i class="fas fa-layer-group"></i> ${tool.prateleira}</span></td>
                    <td>${estojoDisplay}</td>
                    <td class="action-buttons-cell">
                        <button class="btn-action btn-edit" data-id="${tool.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-action btn-delete" data-id="${tool.id}">
                            <i class="fas fa-trash-alt"></i> Excluir
                        </button>
                    </td>
                `;
                toolsTableBody.appendChild(row);
            });
            
            // Adicionar event listeners para os novos botões
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    openEditToolModal(id);
                });
            });
            
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    deleteTool(id);
                });
            });
        }

        // Função de pesquisa
        function searchTools() {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredTools = tools.filter(tool => 
                tool.name.toLowerCase().includes(searchTerm) ||
                tool.brand.toLowerCase().includes(searchTerm) ||
                tool.model.toLowerCase().includes(searchTerm) ||
                tool.nome_espaco.toLowerCase().includes(searchTerm) ||
                tool.armario.toLowerCase().includes(searchTerm) ||
                tool.prateleira.toLowerCase().includes(searchTerm) ||
                (tool.estojo && tool.estojo.toLowerCase().includes(searchTerm))
            );
            loadToolsTable(filteredTools);
        }

        // Funções do modal
        function openAddToolModal() {
            toolForm.reset();
            toolId.value = '';
            modalTitle.textContent = 'Adicionar Nova Ferramenta';
            toolModal.style.display = 'flex';
        }

        function openEditToolModal(id) {
            const tool = tools.find(t => t.id == id);
            if (tool) {
                toolId.value = tool.id;
                toolName.value = tool.name;
                toolBrand.value = tool.brand;
                toolModel.value = tool.model;
                toolStock.value = tool.stock;
                toolNomeEspaco.value = tool.nome_espaco;
                toolArmario.value = tool.armario;
                toolPrateleira.value = tool.prateleira;
                toolEstojo.value = tool.estojo || '';
                
                modalTitle.textContent = 'Editar Ferramenta';
                toolModal.style.display = 'flex';
            }
        }

        function closeModal() {
            toolModal.style.display = 'none';
        }

        function saveTool() {
            const id = toolId.value;
            const name = toolName.value;
            const brand = toolBrand.value;
            const model = toolModel.value;
            const stock = parseInt(toolStock.value);
            const nome_espaco = toolNomeEspaco.value;
            const armario = toolArmario.value;
            const prateleira = toolPrateleira.value;
            const estojo = toolEstojo.value;

            if (id) {
                // Atualizar ferramenta existente
                const index = tools.findIndex(t => t.id == id);
                if (index !== -1) {
                    tools[index] = {
                        ...tools[index],
                        name,
                        brand,
                        model,
                        stock,
                        nome_espaco,
                        armario,
                        prateleira,
                        estojo
                    };
                }
            } else {
                // Adicionar nova ferramenta
                const newId = tools.length > 0 ? Math.max(...tools.map(t => t.id)) + 1 : 1;
                tools.push({
                    id: newId,
                    name,
                    brand,
                    model,
                    stock,
                    nome_espaco,
                    armario,
                    prateleira,
                    estojo
                });
            }

            loadToolsTable();
            closeModal();
        }

        // Função para excluir ferramenta
        function deleteTool(id) {
            if (confirm('Tem certeza que deseja excluir esta ferramenta?')) {
                tools = tools.filter(tool => tool.id != id);
                loadToolsTable();
            }
        }

        // Event Listeners
        addToolBtn.addEventListener('click', openAddToolModal);
        saveBtn.addEventListener('click', saveTool);
        cancelBtn.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        searchInput.addEventListener('input', searchTools);

        // Fechar modal ao clicar fora do conteúdo
        window.addEventListener('click', (e) => {
            if (e.target === toolModal) {
                closeModal();
            }
        });

        // Inicializa a tabela quando a página carregar
        document.addEventListener('DOMContentLoaded', function() {
            loadToolsTable();
        });