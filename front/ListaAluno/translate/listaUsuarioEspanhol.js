// ListaUsuariEsapnho.js

document.addEventListener("DOMContentLoaded", () => {
  // ===================================
  // FUNÇÕES DE MANIPULAÇÃO DE COOKIES
  // ===================================
  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    // Cookie válido para todo o site (path=/)
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  // ===================================

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
      "modal-username": "Nome de Usuário",
      "modal-password": "Senha",
      "modal-cancel-button": "Cancelar",
      "modal-save-button": "Salvar Usuário",
      // Mensagens dinâmicas
      "loading-users": "Carregando usuários...",
      "error-server-not-responding": "O servidor não está respondendo.",
      "error-loading-data": "Erro ao carregar dados.",
      "no-users-found": "Nenhum usuário encontrado.",
      "feedback-required-fields": "Preencha todos os campos obrigatórios.",
      "feedback-success-add": "Usuário adicionado com sucesso!",
      "feedback-success-edit": "Usuário editado com sucesso!",
      "feedback-success-delete": "Usuário excluído com sucesso!",
      "feedback-error-api": "Erro na requisição ao servidor:",
      "feedback-error-load": "Erro ao carregar a lista de usuários:",
      "feedback-error-delete-confirm":
        "Tem certeza que deseja excluir o usuário {name}?",
    },
    es: {
      "page-title": "Control de Usuarios",
      "sidebar-users": "Usuarios",
      "sidebar-loans": "Préstamos",
      "sidebar-tools": "Herramientas",
      "sidebar-locations": "Ubicaciones",
      "sidebar-new-loan": "Nuevo Préstamo",
      "header-title": "Lista de Usuarios",
      "add-user-button": "Añadir Usuario",
      "search-placeholder": "Buscar por nombre, apellido o matrícula...",
      "table-header-id": "ID",
      "table-header-first-name": "Nombre",
      "table-header-last-name": "Apellido",
      "table-header-enrollment": "Matrícula",
      "table-header-class": "Clase",
      "table-header-type": "Tipo",
      "table-header-actions": "Acciones",
      "modal-title-add": "Añadir Usuario",
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
      // Mensagens dinâmicas
      "loading-users": "Cargando usuarios...",
      "error-server-not-responding": "El servidor no está respondiendo.",
      "error-loading-data": "Error al cargar los datos.",
      "no-users-found": "No se encontraron usuarios.",
      "feedback-required-fields": "Rellene todos los campos obligatorios.",
      "feedback-success-add": "¡Usuario añadido con éxito!",
      "feedback-success-edit": "¡Usuario editado con éxito!",
      "feedback-success-delete": "¡Usuario eliminado con éxito!",
      "feedback-error-api": "Error en la solicitud al servidor:",
      "feedback-error-load": "Error al cargar la lista de usuarios:",
      "feedback-error-delete-confirm":
        "¿Está seguro que desea eliminar al usuario {name}?",
    },
  };

  const elementsToTranslate = document.querySelectorAll("[data-i18n]");
  const langButtons = document.querySelectorAll(".lang-btn");
  let currentLang = "pt";

  // Função principal para aplicar a tradução
  function setLanguage(lang) {
    // 1. SALVAR O IDIOMA NO COOKIE
    setCookie("appLanguage", lang, 30);
    currentLang = lang;

    // 2. Aplicar a tradução em elementos com data-i18n (estáticos)
    elementsToTranslate.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    // 3. Aplicar a tradução nos cabeçalhos da tabela
    const headerKeys = [
      "table-header-id",
      "table-header-first-name",
      "table-header-last-name",
      "table-header-enrollment",
      "table-header-class",
      "table-header-type",
      "table-header-actions",
    ];
    headerKeys.forEach((key, index) => {
      // Seleciona as células <th> na ordem correta
      const headerCell = document.querySelector(
        `#users-table thead th:nth-child(${index + 1})`
      );
      if (headerCell && translations[lang][key]) {
        headerCell.textContent = translations[lang][key];
      }
    });

    // 4. Aplicar a tradução no placeholder da busca
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.setAttribute(
        "placeholder",
        translations[lang]["search-placeholder"]
      );
    }

    // 5. Marca o botão de idioma ativo
    langButtons.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-lang") === lang) {
        btn.classList.add("active");
      }
    });
  }

  // EXPOR FUNÇÃO GLOBAL para o ListaUsuario.js usar as mensagens traduzidas
  window.getTranslatedMessage = function (key, customValue = "") {
    let message = translations[currentLang][key] || key;

    // Trata a mensagem de erro da API (Erro na requisição ao servidor: [Mensagem do servidor])
    if (key === "feedback-error-api" && customValue) {
      return `${message} ${customValue}`;
    }

    // Trata a mensagem de confirmação de exclusão
    if (key === "feedback-error-delete-confirm") {
      return message.replace("{name}", customValue);
    }

    return message;
  };

  // LÓGICA DE CARREGAMENTO: Recupera o idioma salvo no Cookie
  const savedLang = getCookie("appLanguage");
  setLanguage(savedLang || "pt");

  // Configura o clique dos botões para mudar e salvar o idioma
  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      setLanguage(lang);
      // Recarrega a tabela para garantir que mensagens dinâmicas sejam traduzidas
      if (typeof loadStudentsTable === "function") {
        loadStudentsTable();
      }
    });
  });

  // Expor a função setLanguage para ser usada pelo ListaUsuario.js se necessário (ex: no modal)
  window.setLanguage = setLanguage;
  window.getCookie = getCookie;
});
