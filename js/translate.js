// Arquivo: translate.js

// ========================== TRANSLATION DATA ==========================
const translations = {
  // PT-BR (Português - Padrão)
  pt: {
    // --- CHAVES DE CADASTRO/LOGIN ---
    title: "FaceShield - Cadastro",
    "site-name": "FaceShield",
    "login-btn": "Entrar",
    "register-btn": "Novo Cadastro",
    "back-btn": "Voltar",

    // CAMPOS DE FORMULÁRIO (HTML)
    "select-user-type": "Selecione o tipo de usuário",
    student: "Aluno",
    teacher: "Professor",
    "user-type": "Tipo de Usuário",
    "first-name": "Nome",
    "last-name": "Sobrenome",
    class: "Turma",
    username: "Nome de Usuário",
    password: "Senha",

    // BIOMETRIA (HTML)
    "view-camera": "Visualizar Câmera",
    "upload-instruction": "Clique para captura biométrica",

    // MENSAGENS DE FEEDBACK E ERRO (JS) - CADASTRO
    "required-field": "Este campo é obrigatório.",
    "success-register": "Cadastro realizado com sucesso!",
    "capture-failed": "Falha na captura. Clique para tentar novamente.",
    "preparing-camera": "Preparando câmera...",
    "fill-before-capture":
      "Preencha nome, sobrenome e turma antes da captura biométrica.",
    "viewing-camera": "Visualizando câmera...",
    "stop-view": "Parar Visualização",
    "connection-error": "Erro de conexão com o servidor de captura.",
    "connection-failed": "Conexão falhou. Tente novamente.",
    "follow-instructions": "Siga as instruções na tela para capturar a face.",
    capturing: "Capturando:",
    "biometric-captured": "Biometria capturada!",
    "biometric-error": "Erro na captura biométrica:",
    "perform-capture": "Realize a captura biométrica antes de cadastrar.",
    "capture-not-successful": "Captura biométrica não concluída com sucesso.",
    "sending-data": "Enviando dados de cadastro...",
    "server-no-confirmation":
      "Cadastro enviado, mas sem confirmação do servidor. Verifique o console.",
    "server-offline": "Servidor de cadastro offline! Verifique o backend.",
    "server-validation-error":
      "Erro de validação: Campo obrigatório não preenchido no servidor.",
    "server-error": "Erro no servidor: ",

    // --- CHAVES DE LISTA DE USUÁRIOS ---
    "list-title": "Sistema de Empréstimos - Usuários",
    "page-title": "Usuários", // Título da página (header)
    "add-user-btn": "Adicionar Usuário",
    "search-placeholder": "Pesquisar Usuário...",

    // Turmas
    "class-mechanic-maintenance": "Mecânico de Manutenção",
    "class-mechanic-machining": "Mecânico de Usinagem",
    "class-system-development": "Desenvolvimento de Sistema",

    // Cabeçalho da Tabela
    "table-name": "Nome",
    "table-last-name": "Sobrenome",
    "table-class": "Turma",
    "table-user-type": "Tipo de Usuário",
    "table-actions": "Ações",

    // Modal (Formulário)
    "modal-add-title": "Adicionar Novo Usuário",
    "modal-edit-title": "Editar Usuário",
    "modal-label-name": "Nome",
    "modal-label-last-name": "Sobrenome",
    "modal-label-class": "Turma",
    "modal-label-user-type": "Tipo de Usuário",
    "modal-select-class": "Selecione uma turma",
    "modal-btn-save": "Salvar Usuário",
    "user-type-student": "Aluno",
    "user-type-teacher": "Professor",

    // Mensagens de JS - LISTA DE USUÁRIOS
    "alert-fetch-all-error": "Erro ao carregar todos alunos",
    "alert-fetch-id-error": "Erro ao buscar aluno por ID",
    "alert-save-fail-error": "Erro ao salvar aluno:",
    "alert-delete-confirm": "Tem certeza que deseja excluir este usuário?",
    "alert-save-success": "Usuário salvo com sucesso!",
    "alert-fill-required": "Por favor, preencha todos os campos!",
    "alert-delete-fail": "Erro ao deletar aluno:",
    "alert-search-fail": "Erro ao pesquisar alunos",

    // --- CHAVES DA LISTA DE FERRAMENTAS (NOVAS) ---
    "tools-list-title": "Sistema de Empréstimos - Ferramentas",
    "loading-data": "Carregando dados...",

    // Ações e Geral
    "add-tool-btn": "Adicionar Ferramenta",
    "search-tool-placeholder": "Pesquisar ferramenta...",
    "table-id": "ID",
    "table-edit-btn": "Editar",
    "table-delete-btn": "Excluir",
    "table-na": "N/A", // Não Aplicável
    "no-tools-found": "Nenhuma ferramenta cadastrada",

    // Detalhes da Ferramenta
    "tool-name": "Nome",
    "tool-brand": "Marca",
    "tool-model": "Modelo",
    "tool-qrcode": "QR Code",
    "tool-state": "Estado",
    "tool-available": "Disponível",
    "tool-description": "Descrição",
    "tool-location": "Local",
    "tool-status-available": "Disponível",
    "tool-status-unavailable": "Indisponível",
    "location-not-found": "Local não encontrado",

    // CHAVES DE ESTADO DA FERRAMENTA (ADICIONADAS)
    Novo: "Novo",
    Usado: "Usado",
    Desgastado: "Desgastado",
    Danificado: "Danificado",

    // Modal Ferramenta
    "modal-tool-add-title": "Adicionar Nova Ferramenta",
    "modal-tool-edit-title": "Editar Ferramenta",
    "modal-btn-cancel": "Cancelar",
    "modal-btn-save-tool": "Salvar Ferramenta",
    "tool-name-label": "Nome da Ferramenta *",
    "tool-brand-label": "Marca *",
    "tool-model-label": "Modelo *",
    "tool-state-label": "Estado *",
    "tool-available-label": "Disponibilidade *",
    "tool-description-label": "Descrição",
    "tool-location-label": "Local *",
    "select-default": "Selecione...",
    "loading-locations": "Carregando locais...",
    "select-location-default": "Selecione um local...",

    // Alertas JS Ferramenta
    "alert-tool-save-success": "Ferramenta salva com sucesso!",
    "alert-tool-save-fail-error": "Erro ao salvar ferramenta:",
    "alert-tool-delete-confirm":
      "Tem certeza que deseja excluir esta ferramenta?",
    "alert-tool-delete-success": "Ferramenta excluída com sucesso!",
    "alert-tool-delete-fail": "Não foi possível excluir a ferramenta:",
    "alert-fetch-locations-error": "Erro ao carregar locais",

    // --- SIDEBAR (UNIFICADAS) ---
    "sidebar-header": "Controle de Usuários", // Manter a chave antiga por compatibilidade
    "sidebar-tools-header": "Controle de Ferramentas", // Usada na lista de ferramentas
    "sidebar-users": "Usuários",
    "sidebar-loans": "Empréstimos",
    "sidebar-tools": "Ferramentas",
    "sidebar-locations": "Locais",
    "sidebar-new-loan": "Novo Empréstimo",
    "sidebar-logout": "Sair",
    "menu-back-btn": "Sair para Menu", // Botão no Header

    // --- GERAIS (UNIFICADAS) ---
    "app-title": "Sistema de Empréstimos",
    "generic-error": "Ocorreu um erro inesperado.",
    "fill-required-fields": "Por favor, preencha todos os campos obrigatórios.",
    "alert-fetch-all-error": "Erro ao carregar dados", // Usado na lista de alunos e ferramentas
    "alert-fetch-id-error": "Erro ao buscar dados",
  },

  // EN (Inglês)
  en: {
    // --- CHAVES DE CADASTRO/LOGIN ---
    title: "FaceShield - Registration",
    "site-name": "FaceShield",
    "login-btn": "Login",
    "register-btn": "New Registration",
    "back-btn": "Back",

    // CAMPOS DE FORMULÁRIO (HTML)
    "select-user-type": "Select user type",
    student: "Student",
    teacher: "Teacher",
    "user-type": "User Type",
    "first-name": "First Name",
    "last-name": "Last Name",
    class: "Class",
    username: "Username",
    password: "Password",

    // BIOMETRIA (HTML)
    "view-camera": "View Camera",
    "upload-instruction": "Click to take biometric capture",

    // MENSAGENS DE FEEDBACK E ERRO (JS) - CADASTRO
    "required-field": "This field is required.",
    "success-register": "Registration successful!",
    "capture-failed": "Capture failed. Click to try again.",
    "preparing-camera": "Preparing camera...",
    "fill-before-capture":
      "Fill in first name, last name, and class before biometric capture.",
    "viewing-camera": "Viewing camera...",
    "stop-view": "Stop View",
    "connection-error": "Connection error with the capture server.",
    "connection-failed": "Connection failed. Please try again.",
    "follow-instructions":
      "Follow the on-screen instructions for face capture.",
    capturing: "Capturing:",
    "biometric-captured": "Biometric capture completed!",
    "biometric-error": "Biometric capture error:",
    "perform-capture": "Perform biometric capture before registering.",
    "capture-not-successful": "Biometric capture not completed successfully.",
    "sending-data": "Sending registration data...",
    "server-no-confirmation":
      "Registration sent, but no server confirmation. Check the console.",
    "server-offline": "Registration server offline! Check the backend.",
    "server-validation-error":
      "Validation error: Required field missing on server.",
    "server-error": "Server error: ",

    // --- CHAVES DE LISTA DE USUÁRIOS ---
    "list-title": "Loan System - Users",
    "page-title": "Users",
    "add-user-btn": "Add User",
    "search-placeholder": "Search User...",

    // Turmas (Mantidas em PT para simular nomes próprios)
    "class-mechanic-maintenance": "Mecânico de Manutenção",
    "class-mechanic-machining": "Mecânico de Usinagem",
    "class-system-development": "Desenvolvimento de Sistema",

    // Cabeçalho da Tabela
    "table-name": "Name",
    "table-last-name": "Last Name",
    "table-class": "Class",
    "table-user-type": "User Type",
    "table-actions": "Actions",

    // Modal (Formulário)
    "modal-add-title": "Add New User",
    "modal-edit-title": "Edit User",
    "modal-label-name": "Name",
    "modal-label-last-name": "Last Name",
    "modal-label-class": "Class",
    "modal-label-user-type": "User Type",
    "modal-select-class": "Select a class",
    "modal-btn-save": "Save User",
    "user-type-student": "Student",
    "user-type-teacher": "Teacher",

    // Mensagens de JS - LISTA DE USUÁRIOS
    "alert-fetch-all-error": "Error loading all students",
    "alert-fetch-id-error": "Error fetching student by ID",
    "alert-save-fail-error": "Error saving student:",
    "alert-delete-confirm": "Are you sure you want to delete this user?",
    "alert-save-success": "User saved successfully!",
    "alert-fill-required": "Please fill in all fields!",
    "alert-delete-fail": "Error deleting student:",
    "alert-search-fail": "Error searching students",

    // --- CHAVES DA LISTA DE FERRAMENTAS (NOVAS) ---
    "tools-list-title": "Loan System - Tools",
    "loading-data": "Loading data...",

    // Ações e Geral
    "add-tool-btn": "Add Tool",
    "search-tool-placeholder": "Search tool...",
    "table-id": "ID",
    "table-edit-btn": "Edit",
    "table-delete-btn": "Delete",
    "table-na": "N/A",
    "no-tools-found": "No tools registered",

    // Detalhes da Ferramenta
    "tool-name": "Name",
    "tool-brand": "Brand",
    "tool-model": "Model",
    "tool-qrcode": "QR Code",
    "tool-state": "State",
    "tool-available": "Available",
    "tool-description": "Description",
    "tool-location": "Location",
    "tool-status-available": "Available",
    "tool-status-unavailable": "Unavailable",
    "location-not-found": "Location not found",

    // CHAVES DE ESTADO DA FERRAMENTA (ADICIONADAS)
    Novo: "New",
    Usado: "Used",
    Desgastado: "Worn",
    Danificado: "Damaged",

    // Modal Ferramenta
    "modal-tool-add-title": "Add New Tool",
    "modal-tool-edit-title": "Edit Tool",
    "modal-btn-cancel": "Cancel",
    "modal-btn-save-tool": "Save Tool",
    "tool-name-label": "Tool Name *",
    "tool-brand-label": "Brand *",
    "tool-model-label": "Model *",
    "tool-state-label": "State *",
    "tool-available-label": "Availability *",
    "tool-description-label": "Description",
    "tool-location-label": "Location *",
    "select-default": "Select...",
    "loading-locations": "Loading locations...",
    "select-location-default": "Select a location...",

    // Alertas JS Ferramenta
    "alert-tool-save-success": "Tool saved successfully!",
    "alert-tool-save-fail-error": "Error saving tool:",
    "alert-tool-delete-confirm": "Are you sure you want to delete this tool?",
    "alert-tool-delete-success": "Tool deleted successfully!",
    "alert-tool-delete-fail": "Could not delete the tool:",
    "alert-fetch-locations-error": "Error loading locations",

    // --- SIDEBAR (UNIFICADAS) ---
    "sidebar-header": "User Control",
    "sidebar-tools-header": "Tool Control",
    "sidebar-users": "Users",
    "sidebar-loans": "Loans",
    "sidebar-tools": "Tools",
    "sidebar-locations": "Locations",
    "sidebar-new-loan": "New Loan",
    "sidebar-logout": "Logout",
    "menu-back-btn": "Exit to Menu",

    // --- GERAIS (UNIFICADAS) ---
    "app-title": "Loan System",
    "generic-error": "An unexpected error occurred.",
    "fill-required-fields": "Please fill in all required fields.",
    "alert-fetch-all-error": "Error loading data",
    "alert-fetch-id-error": "Error fetching data",
  },
};

// ========================== TRANSLATION FUNCTIONS ==========================

// Variável que rastreia o idioma atual
// Tenta carregar do localStorage ou usa 'pt' como padrão.
let currentLanguage = localStorage.getItem("language") || "pt";

/**
 * Função principal para obter a tradução de uma chave.
 * Esta função precisa ser globalmente acessível (window.t).
 * @param {string} key - A chave de tradução (ex: "login-btn").
 * @returns {string} - O texto traduzido ou a chave original (se não houver tradução).
 */
function t(key) {
  // Retorna a tradução do idioma atual; se não encontrar, retorna a chave (fallback)
  return (
    (translations[currentLanguage] && translations[currentLanguage][key]) || key
  );
}

/**
 * Aplica as traduções a todos os elementos HTML com o atributo data-translate-key.
 * @param {string} language - O código do idioma (ex: "pt" ou "en").
 */
function translatePage(language) {
  const elements = document.querySelectorAll("[data-translate-key]");

  // Atualiza o título da página
  const titleElement = document.querySelector("title");
  if (titleElement) {
    const key = titleElement.getAttribute("data-translate-key") || "app-title";
    titleElement.textContent = t(key);
  }

  elements.forEach((element) => {
    const key = element.getAttribute("data-translate-key");
    const translatedText = t(key);

    if (translatedText) {
      if (element.tagName === "INPUT" && element.hasAttribute("placeholder")) {
        // Traduz o placeholder para inputs
        element.setAttribute("placeholder", translatedText);
      } else {
        // Caso padrão: atualiza o texto interno
        element.textContent = translatedText;
      }
    }
  });
}

/**
 * Altera o idioma global, salva no localStorage e traduz a página.
 * @param {string} language - O novo código do idioma.
 */
function switchLanguage(language) {
  if (translations[language]) {
    currentLanguage = language;
    localStorage.setItem("language", language);
    translatePage(language);

    // Dispara um evento para notificar scripts dinâmicos (ex: JS da ListaFerramentas)
    const event = new CustomEvent("languageChanged", {
      detail: { lang: language },
    });
    window.dispatchEvent(event);
  } else {
    console.warn(`Idioma ${language} não suportado.`);
  }
}

// Expõe as funções globalmente para uso em outros arquivos JS
window.t = t;
window.switchLanguage = switchLanguage;
window.currentLanguage = currentLanguage;

// Inicializa a tradução ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  translatePage(currentLanguage);
});
