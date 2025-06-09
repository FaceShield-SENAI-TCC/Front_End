let locations = [
            { 
                id: 1, 
                space: "Oficina Mecânica", 
                cabinet: "Armário 1", 
                shelf: "Prateleira A", 
                case: "Estojo 3" 
            },
            { 
                id: 2, 
                space: "Laboratório de Elétrica", 
                cabinet: "Armário 3", 
                shelf: "Prateleira B", 
                case: "" 
            },
            { 
                id: 3, 
                space: "Laboratório de Elétrica", 
                cabinet: "Armário 2", 
                shelf: "Prateleira C", 
                case: "Estojo 1" 
            },
            { 
                id: 4, 
                space: "Oficina Mecânica", 
                cabinet: "Armário 1", 
                shelf: "Prateleira D", 
                case: "" 
            },
            { 
                id: 5, 
                space: "Oficina de Marcenaria", 
                cabinet: "Armário 5", 
                shelf: "Prateleira A", 
                case: "Estojo 2" 
            }
        ];

        // Elementos DOM
        const locationsTableBody = document.getElementById('locations-table-body');
        const locationGrid = document.getElementById('location-grid');
        const searchInput = document.getElementById('search-input');
        const locationModal = document.getElementById('location-modal');
        const modalTitle = document.getElementById('modal-title');
        const locationForm = document.getElementById('location-form');
        const locationId = document.getElementById('location-id');
        const locationSpace = document.getElementById('location-space');
        const locationCabinet = document.getElementById('location-cabinet');
        const locationShelf = document.getElementById('location-shelf');
        const locationCase = document.getElementById('location-case');
        const addLocationBtn = document.getElementById('add-location-btn');
        const addFirstLocationBtn = document.getElementById('add-first-location');
        const saveBtn = document.getElementById('save-btn');
        const cancelBtn = document.getElementById('cancel-btn');
        const closeBtn = document.querySelector('.close-btn');
        const viewToggleBtn = document.getElementById('view-toggle-btn');
        const tableView = document.getElementById('table-view');
        const cardView = document.getElementById('card-view');
        const emptyState = document.getElementById('empty-state');

        // Função para carregar locais na tabela
        function loadLocationsTable(locationsArray = locations) {
            locationsTableBody.innerHTML = '';

            if (locationsArray.length === 0) {
                tableView.style.display = 'none';
                cardView.style.display = 'none';
                emptyState.style.display = 'block';
                return;
            }
            
            tableView.style.display = 'block';
            emptyState.style.display = 'none';

            locationsArray.forEach(location => {
                const row = document.createElement('tr');
                
                // Formatar campos de localização
                const caseDisplay = location.case ? 
                    `<span class="location-badge"><i class="fas fa-box"></i> ${location.case}</span>` : 
                    '<span class="location-badge"><i class="fas fa-box"></i> N/A</span>';
                
                row.innerHTML = `
                    <td>${location.id}</td>
                    <td><span class="location-badge"><i class="fas fa-building"></i> ${location.space}</span></td>
                    <td><span class="location-badge"><i class="fas fa-archive"></i> ${location.cabinet}</span></td>
                    <td><span class="location-badge"><i class="fas fa-layer-group"></i> ${location.shelf}</span></td>
                    <td>${caseDisplay}</td>
                    <td class="actions-cell">
                        <button class="action-btn edit-btn" data-id="${location.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="action-btn delete-btn" data-id="${location.id}">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </td>
                `;
                locationsTableBody.appendChild(row);
            });
            
            // Adicionar event listeners para os botões de ação
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    openEditLocationModal(id);
                });
            });
            
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    deleteLocation(id);
                });
            });
        }

        // Função para carregar locais em cards
        function loadLocationsCards(locationsArray = locations) {
            locationGrid.innerHTML = '';

            if (locationsArray.length === 0) {
                cardView.style.display = 'none';
                tableView.style.display = 'none';
                emptyState.style.display = 'block';
                return;
            }
            
            cardView.style.display = 'block';
            emptyState.style.display = 'none';

            locationsArray.forEach(location => {
                const card = document.createElement('div');
                card.className = 'location-card';
                
                const caseDisplay = location.case ? location.case : 'N/A';
                
                card.innerHTML = `
                    <div class="card-header">
                        <h3><i class="fas fa-map-marker-alt"></i> Local #${location.id}</h3>
                    </div>
                    <div class="card-body">
                        <div class="location-info">
                            <i class="fas fa-building"></i>
                            <span><strong>Espaço:</strong> ${location.space}</span>
                        </div>
                        <div class="location-info">
                            <i class="fas fa-archive"></i>
                            <span><strong>Armário:</strong> ${location.cabinet}</span>
                        </div>
                        <div class="location-info">
                            <i class="fas fa-layer-group"></i>
                            <span><strong>Prateleira:</strong> ${location.shelf}</span>
                        </div>
                        <div class="location-info">
                            <i class="fas fa-box"></i>
                            <span><strong>Estojo:</strong> ${caseDisplay}</span>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="action-btn edit-btn" data-id="${location.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="action-btn delete-btn" data-id="${location.id}">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                `;
                locationGrid.appendChild(card);
            });
            
            // Adicionar event listeners para os botões de ação nos cards
            document.querySelectorAll('.card-footer .edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    openEditLocationModal(id);
                });
            });
            
            document.querySelectorAll('.card-footer .delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    deleteLocation(id);
                });
            });
        }

        // Função de pesquisa
        function searchLocations() {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredLocations = locations.filter(location => 
                location.space.toLowerCase().includes(searchTerm) ||
                location.cabinet.toLowerCase().includes(searchTerm) ||
                location.shelf.toLowerCase().includes(searchTerm) ||
                (location.case && location.case.toLowerCase().includes(searchTerm))
            );
            
            if (cardView.style.display !== 'none') {
                loadLocationsCards(filteredLocations);
            } else {
                loadLocationsTable(filteredLocations);
            }
        }

        // Funções do modal
        function openAddLocationModal() {
            locationForm.reset();
            locationId.value = '';
            modalTitle.textContent = 'Adicionar Novo Local';
            locationModal.style.display = 'flex';
        }

        function openEditLocationModal(id) {
            const location = locations.find(l => l.id == id);
            if (location) {
                locationId.value = location.id;
                locationSpace.value = location.space;
                locationCabinet.value = location.cabinet;
                locationShelf.value = location.shelf;
                locationCase.value = location.case || '';
                
                modalTitle.textContent = 'Editar Local';
                locationModal.style.display = 'flex';
            }
        }

        function closeModal() {
            locationModal.style.display = 'none';
        }

        function saveLocation() {
            const id = locationId.value;
            const space = locationSpace.value;
            const cabinet = locationCabinet.value;
            const shelf = locationShelf.value;
            const caseValue = locationCase.value;

            if (id) {
                // Atualizar local existente
                const index = locations.findIndex(l => l.id == id);
                if (index !== -1) {
                    locations[index] = {
                        ...locations[index],
                        space,
                        cabinet,
                        shelf,
                        case: caseValue
                    };
                }
            } else {
                // Adicionar novo local
                const newId = locations.length > 0 ? Math.max(...locations.map(l => l.id)) + 1 : 1;
                locations.push({
                    id: newId,
                    space,
                    cabinet,
                    shelf,
                    case: caseValue
                });
            }

            if (cardView.style.display !== 'none') {
                loadLocationsCards();
            } else {
                loadLocationsTable();
            }
            
            closeModal();
        }

        function deleteLocation(id) {
            if (confirm('Tem certeza que deseja excluir este local?')) {
                locations = locations.filter(location => location.id != id);
                
                if (cardView.style.display !== 'none') {
                    loadLocationsCards();
                } else {
                    loadLocationsTable();
                }
            }
        }

        // Alternar entre visualizações
        function toggleView() {
            if (tableView.style.display !== 'none') {
                tableView.style.display = 'none';
                cardView.style.display = 'block';
                viewToggleBtn.innerHTML = '<i class="fas fa-list"></i> Visualização em Tabela';
                loadLocationsCards();
            } else {
                tableView.style.display = 'block';
                cardView.style.display = 'none';
                viewToggleBtn.innerHTML = '<i class="fas fa-th"></i> Visualização em Cards';
                loadLocationsTable();
            }
        }

        // Event Listeners
        addLocationBtn.addEventListener('click', openAddLocationModal);
        addFirstLocationBtn.addEventListener('click', openAddLocationModal);
        saveBtn.addEventListener('click', saveLocation);
        cancelBtn.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        searchInput.addEventListener('input', searchLocations);
        viewToggleBtn.addEventListener('click', toggleView);

        // Fechar modal ao clicar fora do conteúdo
        window.addEventListener('click', (e) => {
            if (e.target === locationModal) {
                closeModal();
            }
        });

        // Inicializa a tabela quando a página carregar
        document.addEventListener('DOMContentLoaded', function() {
            loadLocationsTable();
        });