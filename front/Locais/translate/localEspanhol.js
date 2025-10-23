/**
 * Funções para gerenciamento de Cookies
 * Usadas para persistir o idioma escolhido pelo usuário.
 */
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

document.addEventListener("DOMContentLoaded", () => {
  // Objeto de traduções
  const translations = {
    pt: {
      "page-title": "Sistema de Gerenciamento de Locais",
      "sidebar-title": "Sistema Locais",
      "sidebar-users": "Usuários",
      "sidebar-loans": "Empréstimos",
      "sidebar-tools": "Ferramentas",
      "sidebar-locations": "Locais",
      "header-title": "Lista de Locais",
      "add-location-button": "Adicionar Local",
      "search-placeholder":
        "Pesquisar por espaço, armário, prateleira ou estojo...",
      "toggle-to-table": "Visualização em Tabela",
      "toggle-to-cards": "Visualização em Cards",
      "table-header-space": "Espaço",
      "table-header-cabinet": "Armário",
      "table-header-shelf": "Prateleira",
      "table-header-case": "Estojo",
      "table-header-actions": "Ações",
      "modal-title-add": "Adicionar Local",
      "modal-title-edit": "Editar Local",
      "modal-label-space": "Espaço *",
      "modal-label-cabinet": "Armário *",
      "modal-label-shelf": "Prateleira *",
      "modal-label-case": "Estojo (opcional)",
      "modal-cancel-button": "Cancelar",
      "modal-save-button": "Salvar Local",
      "empty-state-title": "Nenhum local encontrado",
      "empty-state-text":
        'Clique em "Adicionar Local" para cadastrar o primeiro item.',
      "empty-state-button": "Adicionar Local",
      "loading-message": "Carregando locais...",
      // Mensagens de notificação
      "notif-success": "Operação realizada com sucesso!",
      "notif-fail-init": "Falha ao iniciar a aplicação",
      "notif-fail-fetch": "Erro ao buscar locais:",
      "notif-fail-delete": "Erro ao deletar local:",
      "notif-fail-save": "Erro ao salvar local:",
    },
    es: {
      "page-title": "Sistema de Gestión de Ubicaciones",
      "sidebar-title": "Sistema Ubicaciones",
      "sidebar-users": "Usuarios",
      "sidebar-loans": "Préstamos",
      "sidebar-tools": "Herramientas",
      "sidebar-locations": "Ubicaciones",
      "header-title": "Lista de Ubicaciones",
      "add-location-button": "Agregar Ubicación",
      "search-placeholder": "Buscar por espacio, armario, estante o estuche...",
      "toggle-to-table": "Vista de Tabla",
      "toggle-to-cards": "Vista de Tarjetas",
      "table-header-space": "Espacio",
      "table-header-cabinet": "Armario",
      "table-header-shelf": "Estante",
      "table-header-case": "Estuche",
      "table-header-actions": "Acciones",
      "modal-title-add": "Agregar Ubicación",
      "modal-title-edit": "Editar Ubicación",
      "modal-label-space": "Espacio *",
      "modal-label-cabinet": "Armario *",
      "modal-label-shelf": "Estante *",
      "modal-label-case": "Estuche (opcional)",
      "modal-cancel-button": "Cancelar",
      "modal-save-button": "Guardar Ubicación",
      "empty-state-title": "No se encontró ninguna ubicación",
      "empty-state-text":
        'Haz clic en "Agregar Ubicación" para registrar el primer elemento.',
      "empty-state-button": "Agregar Ubicación",
      "loading-message": "Cargando ubicaciones...",
      // Mensajes de notificação
      "notif-success": "¡Operación realizada con éxito!",
      "notif-fail-init": "Error al iniciar la aplicación",
      "notif-fail-fetch": "Error al buscar ubicaciones:",
      "notif-fail-delete": "Error al eliminar la ubicación:",
      "notif-fail-save": "Error al guardar ubicación:",
    },
  };

  const elementsToTranslate = document.querySelectorAll("[data-i18n]");
  const langButtons = document.querySelectorAll(".lang-btn");
  const searchInput = document.getElementById("search-input");
  const classSelectOption = document.querySelector(
    "#tool-id_local option[value='']"
  );

  function setLanguage(lang) {
    // 1. Salva o idioma no cookie por 30 dias
    setCookie("userLanguage", lang, 30);

    elementsToTranslate.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (translations[lang] && translations[lang][key]) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = translations[lang][key];
        } else {
          el.textContent = translations[lang][key];
        }
      }
    });

    // 2. Atualiza o placeholder da pesquisa
    if (searchInput) {
      const placeholderText = translations[lang]["search-placeholder"];
      searchInput.setAttribute("placeholder", placeholderText);
    }

    // 3. Atualiza o texto do botão de alternar visualização
    const viewToggleBtn = document.getElementById("view-toggle-btn");
    if (viewToggleBtn) {
      if (viewToggleBtn.innerHTML.includes("Visualização em Tabela")) {
        viewToggleBtn.innerHTML = `<i class="fas fa-list"></i> ${translations[lang]["toggle-to-table"]}`;
      } else if (viewToggleBtn.innerHTML.includes("Visualização em Cards")) {
        viewToggleBtn.innerHTML = `<i class="fas fa-th"></i> ${translations[lang]["toggle-to-cards"]}`;
      }
    }

    // 4. Marca o botão de idioma ativo
    langButtons.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-lang") === lang) {
        btn.classList.add("active");
      }
    });
  }

  // --- CÓDIGO DE CARREGAMENTO DO IDIOMA ---
  const savedLang = getCookie("userLanguage");
  // Define o idioma, usando o salvo no cookie ou 'pt' (Português) como padrão
  setLanguage(savedLang || "pt");
  // ----------------------------------------

  // Adiciona Event Listeners aos botões de idioma
  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      setLanguage(lang);
    });
  });

  // Torna a função de tradução acessível globalmente (para ser usada no LocalJS.JS)
  window.translateText = (key, lang = getCookie("userLanguage") || "pt") => {
    return translations[lang] ? translations[lang][key] : key;
  };
});
