document.addEventListener("DOMContentLoaded", () => {
  const translations = {
    pt: {
      "page-title": "Controle de Usuários",
      "sidebar-users": "Usuários",
      "sidebar-loans": "Empréstimos",
      "sidebar-tools": "Ferramentas",
      "sidebar-locations": "Locais",
      "sidebar-new-loan": "Novo Empréstimo",
      "header-title": "Lista de Usuários",
      "add-user-button": "Adicionar Usuário",
      "search-placeholder": "Pesquisar por nome, sobrenome ou matrícula...",
      "table-header-id": "ID",
      "table-header-first-name": "Nome",
      "table-header-last-name": "Sobrenome",
      "table-header-enrollment": "Matrícula",
      "table-header-class": "Turma",
      "table-header-type": "Tipo",
      "table-header-actions": "Ações",
      "modal-title-add": "Adicionar Usuário",
      "modal-title-edit": "Editar Usuário",
      "modal-first-name": "Nome",
      "modal-last-name": "Sobrenome",
      "modal-enrollment": "Matrícula",
      "modal-class": "Turma",
      "modal-class-placeholder": "Selecione uma turma",
      "modal-user-type": "Tipo de Usuário",
      "modal-type-student": "Aluno",
      "modal-type-professor": "Professor",
      "modal-save-button": "Salvar Usuário",
      "modal-cancel-button": "Cancelar",
      "modal-no-data": "Nenhum usuário encontrado.",
      "loading-users": "Carregando usuários...",
      "server-error": "Erro ao carregar os dados. O servidor pode estar offline.",
    },
    es: {
      "page-title": "Control de Usuarios",
      "sidebar-users": "Usuarios",
      "sidebar-loans": "Préstamos",
      "sidebar-tools": "Herramientas",
      "sidebar-locations": "Ubicaciones",
      "sidebar-new-loan": "Nuevo Préstamo",
      "header-title": "Lista de Usuarios",
      "add-user-button": "Agregar Usuario",
      "search-placeholder": "Buscar por nombre, apellido o matrícula...",
      "table-header-id": "ID",
      "table-header-first-name": "Nombre",
      "table-header-last-name": "Apellido",
      "table-header-enrollment": "Matrícula",
      "table-header-class": "Clase",
      "table-header-type": "Tipo",
      "table-header-actions": "Acciones",
      "modal-title-add": "Agregar Usuario",
      "modal-title-edit": "Editar Usuario",
      "modal-first-name": "Nombre",
      "modal-last-name": "Apellido",
      "modal-enrollment": "Matrícula",
      "modal-class": "Clase",
      "modal-class-placeholder": "Seleccione una clase",
      "modal-user-type": "Tipo de Usuario",
      "modal-type-student": "Estudiante",
      "modal-type-professor": "Profesor",
      "modal-save-button": "Guardar Usuario",
      "modal-cancel-button": "Cancelar",
      "modal-no-data": "No se encontró ningún usuario.",
      "loading-users": "Cargando usuarios...",
      "server-error": "Error al cargar los datos. El servidor puede estar fuera de línea.",
    },
  };

  const elementsToTranslate = document.querySelectorAll("[data-i18n]");
  const langButtons = document.querySelectorAll(".lang-btn");
  const searchInput = document.getElementById("search-input");
  const classSelect = document.getElementById("class");

  function setLanguage(lang) {
    elementsToTranslate.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    if (searchInput) {
      searchInput.setAttribute("placeholder", translations[lang]["search-placeholder"]);
    }
    
    if (classSelect) {
      const defaultOption = classSelect.querySelector('option[value=""]');
      if (defaultOption) {
        defaultOption.textContent = translations[lang]["modal-class-placeholder"];
      }
    }

    langButtons.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-lang") === lang) {
        btn.classList.add("active");
      }
    });

    // Atualiza o texto do modal quando a língua é alterada
    const modalTitle = document.getElementById("modal-title");
    if (modalTitle) {
      const currentId = document.getElementById("student-id").value;
      modalTitle.textContent = currentId
        ? translations[lang]["modal-title-edit"]
        : translations[lang]["modal-title-add"];
    }
    
    // Atualiza o texto da mensagem de carregamento ou erro
    const tableBody = document.getElementById("users-table-body");
    if (tableBody) {
        if (tableBody.querySelector('.loading-message')) {
            tableBody.querySelector('.loading-message').textContent = translations[lang]["loading-users"];
        }
    }
  }

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      setLanguage(lang);
    });
  });

  // Define o idioma padrão ao carregar a página
  setLanguage("pt");
});