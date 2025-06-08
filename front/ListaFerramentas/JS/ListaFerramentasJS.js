 let tools = [
            { 
                id: 1, 
                name: "Alicate Universal", 
                brand: "Tramontina", 
                model: "ACR 8", 
                quantity: 7,
                available: true
            },
            { 
                id: 2, 
                name: "Chave de Fenda", 
                brand: "Stanley", 
                model: "F-15", 
                quantity: 12,
                available: true
            },
            { 
                id: 3, 
                name: "Multímetro Digital", 
                brand: "Minipa", 
                model: "ET-2082", 
                quantity: 8,
                available: false
            },
            { 
                id: 4, 
                name: "Serra Tico-Tico", 
                brand: "Bosch", 
                model: "GKS 190", 
                quantity: 5,
                available: true
            },
            { 
                id: 5, 
                name: "Furadeira Parafusadeira", 
                brand: "Makita", 
                model: "DF457DWE", 
                quantity: 3,
                available: true
            },
            { 
                id: 6, 
                name: "Martelo de Unha", 
                brand: "Vonder", 
                model: "MTH-500", 
                quantity: 12,
                available: true
            },
            { 
                id: 7, 
                name: "Trena a Laser", 
                brand: "Leica", 
                model: "Disto D2", 
                quantity: 2,
                available: false
            },
            { 
                id: 8, 
                name: "Nível a Laser", 
                brand: "DeWalt", 
                model: "DW088K", 
                quantity: 4,
                available: true
            }
        ];

        // Função para carregar ferramentas na tabela
        function loadToolsTable(toolsArray = tools) {
            const tableBody = document.getElementById('tools-table-body');
            tableBody.innerHTML = '';

            toolsArray.forEach(tool => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${tool.id}</td>
                    <td>${tool.name}</td>
                    <td>${tool.brand}</td>
                    <td>${tool.model}</td>
                    <td class="${tool.quantity < 5 ? 'quantity-low' : ''}">${tool.quantity}</td>
                    <td>
                        <span class="${tool.available ? 'status-available' : 'status-unavailable'}">
                            ${tool.available ? 'Disponível' : 'Indisponível'}
                        </span>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }

        // Função de pesquisa
        function searchTools() {
            const searchTerm = document.getElementById('search-input').value.toLowerCase();
            const filteredTools = tools.filter(tool => 
                tool.name.toLowerCase().includes(searchTerm) ||
                tool.brand.toLowerCase().includes(searchTerm) ||
                tool.model.toLowerCase().includes(searchTerm)
            );
            loadToolsTable(filteredTools);
        }

        // Funções do modal
        function openAddToolModal() {
            document.getElementById('tool-form').reset();
            document.getElementById('tool-id').value = '';
            document.getElementById('tool-available').value = 'true';
            document.getElementById('modal-title').textContent = 'Adicionar Nova Ferramenta';
            document.getElementById('tool-modal').style.display = 'flex';
        }

        function openEditToolModal(id) {
            const tool = tools.find(t => t.id == id);
            if (tool) {
                document.getElementById('tool-id').value = tool.id;
                document.getElementById('tool-name').value = tool.name;
                document.getElementById('tool-brand').value = tool.brand;
                document.getElementById('tool-model').value = tool.model;
                document.getElementById('tool-quantity').value = tool.quantity;
                document.getElementById('tool-available').value = tool.available.toString();
                
                document.getElementById('modal-title').textContent = 'Editar Ferramenta';
                document.getElementById('tool-modal').style.display = 'flex';
            }
        }

        function closeModal() {
            document.getElementById('tool-modal').style.display = 'none';
        }

        function saveTool() {
            const toolId = document.getElementById('tool-id').value;
            const name = document.getElementById('tool-name').value;
            const brand = document.getElementById('tool-brand').value;
            const model = document.getElementById('tool-model').value;
            const quantity = parseInt(document.getElementById('tool-quantity').value);
            const available = document.getElementById('tool-available').value === 'true';

            if (toolId) {
                // Atualizar ferramenta existente
                const index = tools.findIndex(t => t.id == toolId);
                if (index !== -1) {
                    tools[index] = {
                        ...tools[index],
                        name,
                        brand,
                        model,
                        quantity,
                        available
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
                    quantity,
                    available
                });
            }

            loadToolsTable();
            closeModal();
        }

        // Inicializa a tabela quando a página carregar
        document.addEventListener('DOMContentLoaded', function() {
            loadToolsTable();
        });