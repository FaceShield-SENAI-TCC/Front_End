// inicioEspanhol.js

document.addEventListener("DOMContentLoaded", () => {
  // ===================================
  // FUNÇÕES DE MANIPULAÇÃO DE COOKIES
  // ===================================
  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    // Cookie válido para todo o site
    document.cookie = name + "=" + (value || "") + expires + "; path=/"; 
  }

  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  // ===================================
    
  const translations = {
    pt: {
      "main-title": "FaceShield",
      "glowing-button-login": "Entrar",
      "glowing-button-register": "Novo Cadastro",
      // Novas traduções para o feedback do js.js
      "feedback-login-success": "Login realizado com sucesso!",
      "feedback-register-success": "Perfil cadastrado com sucesso!",
      "feedback-error": "Erro:",
    },
    es: {
      "main-title": "FaceShield",
      "glowing-button-login": "Ingresar",
      "glowing-button-register": "Nuevo Registro",
      // Novas traduções para o feedback do js.js
      "feedback-login-success": "¡Ingreso realizado con éxito!",
      "feedback-register-success": "¡Perfil registrado con éxito!",
      "feedback-error": "Error:",
    },
  };

  const elementsToTranslate = document.querySelectorAll("[data-i18n]");
  const langButtons = document.querySelectorAll(".lang-btn");
  let currentLang = "pt";

  function setLanguage(lang) {
    // 1. SALVAR O IDIOMA NO COOKIE
    setCookie('appLanguage', lang, 30);
    currentLang = lang;

    // 2. Aplicar a tradução
    elementsToTranslate.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    // 3. Marca o botão de idioma ativo
    langButtons.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-lang") === lang) {
        btn.classList.add("active");
      }
    });
  }
  
  // 4. EXPOR FUNÇÃO GLOBAL para o js.js usar as mensagens traduzidas
  window.getTranslatedMessage = function(key, customError = "") {
      const message = translations[currentLang][key];
      // Se for um erro, anexa o erro customizado
      if (key === "feedback-error" && customError) {
          return `${message} ${customError}`;
      }
      return message || key;
  };


  // 5. LÓGICA DE CARREGAMENTO: Recupera o idioma salvo ao carregar a página
  const savedLang = getCookie('appLanguage');
  setLanguage(savedLang || 'pt'); // Aplica o idioma salvo, ou 'pt' como padrão

  // Configura o clique dos botões para mudar e salvar o idioma
  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      setLanguage(lang);
    });
  });
});