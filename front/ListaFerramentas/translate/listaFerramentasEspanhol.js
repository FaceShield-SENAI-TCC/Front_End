document.addEventListener("DOMContentLoaded", () => {
  const translations = {
    // ... (Suas traduções 'pt' e 'es' aqui, como já estão no arquivo)
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
      "modal-username": "Nome de Usuário",
      "modal-password": "Senha",
      "modal-cancel-button": "Cancelar",
      "modal-save-button": "Salvar Usuário",
      "loading-users": "Carregando usuários...",
      "error-loading-users": "Erro ao carregar usuários.",
      "confirm-delete": "Tem certeza que deseja deletar este usuário?",
      "delete-success": "Usuário deletado com sucesso!",
      "delete-error": "Erro ao deletar usuário.",
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
      "modal-class-placeholder": "Selecciona una clase",
      "modal-user-type": "Tipo de Usuario",
      "modal-type-student": "Estudiante",
      "modal-type-professor": "Profesor",
      "modal-username": "Nombre de Usuario",
      "modal-password": "Contraseña",
      "modal-cancel-button": "Cancelar",
      "modal-save-button": "Guardar Usuario",
      "loading-users": "Cargando usuarios...",
      "error-loading-users": "Error al cargar usuarios.",
      "confirm-delete": "¿Estás seguro de que quieres eliminar este usuario?",
      "delete-success": "Usuario eliminado con éxito!",
      "delete-error": "Error al eliminar usuario.",
    },
  };

  const elementsToTranslate = document.querySelectorAll("[data-i18n]");
  const langButtons = document.querySelectorAll(".lang-btn");
  const searchInput = document.getElementById("search-input");
  const classSelect = document.getElementById("class");

  function setLanguage(lang) {
    // Salva o idioma selecionado no Local Storage
    localStorage.setItem("userLanguage", lang);

    // Altera o atributo 'lang' do HTML
    document.documentElement.lang = lang;

    elementsToTranslate.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (translations[lang] && translations[lang][key]) {
        if (el.tagName === "INPUT" && el.hasAttribute("placeholder")) {
          el.setAttribute("placeholder", translations[lang][key]);
        } else if (el.tagName === "OPTION" && el.value === "") {
          // Atualiza o placeholder da opção de turma
          el.textContent = translations[lang][key];
        } else {
          el.textContent = translations[lang][key];
        }
      }
    });

    // Atualiza o placeholder da busca
    if (searchInput) {
      searchInput.setAttribute(
        "placeholder",
        translations[lang]["search-placeholder"]
      );
    }

    // Atualiza o placeholder da opção de turma (caso não tenha sido pega acima)
    if (classSelect) {
      const defaultOption = classSelect.querySelector('option[value=""]');
      if (defaultOption) {
        defaultOption.textContent =
          translations[lang]["modal-class-placeholder"];
      }
    }

    // Marca o botão de idioma ativo
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
      // Encontra o elemento com a mensagem de carregamento/erro e atualiza
      const loadingMessage = tableBody.querySelector(".loading-message");
      if (loadingMessage) {
        loadingMessage.textContent = translations[lang]["loading-users"];
      }
    }
  }

  // Função para carregar o idioma inicial
  function setInitialLanguage() {
    // Tenta carregar do Local Storage, ou usa 'pt' como padrão
    const savedLang = localStorage.getItem("userLanguage") || "pt";
    setLanguage(savedLang);
  }

  // Adiciona listeners aos botões de idioma
  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      setLanguage(lang);
    });
  });

  // Define o idioma padrão/salvo quando o documento carrega
  setInitialLanguage();
});
