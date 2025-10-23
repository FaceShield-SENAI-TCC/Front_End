// loginProfEspanhol.js

document.addEventListener("DOMContentLoaded", () => {
  // ===================================
  // FUNÇÕES DE MANIPULAÇÃO DE COOKIES (NOVO)
  // ===================================
  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    // Define o cookie para todo o site (path=/)
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
      "back-button": "Voltar",
      "main-title": "Login Professor",
      "username-label": "Nome de Usuário",
      "password-label": "Senha",
      "submit-button": "Entrar",
      "forgot-password": "Esqueci a senha",
    },
    es: {
      "back-button": "Volver",
      "main-title": "Ingreso del Profesor",
      "username-label": "Nombre de Usuario",
      "password-label": "Contraseña",
      "submit-button": "Entrar",
      "forgot-password": "Olvidé mi contraseña",
    },
  };

  const elementsToTranslate = document.querySelectorAll("[data-i18n]");
  const langButtons = document.querySelectorAll(".lang-btn");
  const usernameLabel = document.querySelector('label[for="username"]');
  const passwordLabel = document.querySelector('label[for="senha"]');

  // Função que aplica as traduções e SALVA o idioma no Cookie
  function setLanguage(lang) {
    // 1. SALVAR O IDIOMA NO COOKIE (DURAÇÃO: 30 DIAS)
    setCookie("appLanguage", lang, 30); // NOVO!

    // 2. Aplicar a tradução aos elementos
    elementsToTranslate.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (translations[lang] && translations[lang][key]) {
        if (el.tagName === "INPUT" && el.hasAttribute("placeholder")) {
          el.setAttribute("placeholder", translations[lang][key]);
        } else {
          el.textContent = translations[lang][key];
        }
      }
    });

    // Traduz as labels
    if (usernameLabel) {
      usernameLabel.textContent = translations[lang]["username-label"];
    }
    if (passwordLabel) {
      passwordLabel.textContent = translations[lang]["password-label"];
    }

    // 3. Marca o botão de idioma ativo
    langButtons.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-lang") === lang) {
        btn.classList.add("active");
      }
    });
  }

  // 4. LÓGICA DE CARREGAMENTO: Tenta recuperar o idioma salvo no Cookie
  const savedLang = getCookie("appLanguage");

  // Aplica o idioma salvo, ou 'pt' (Português) como padrão
  setLanguage(savedLang || "pt");

  // 5. Configura o clique dos botões para mudar e salvar o idioma
  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setLanguage(btn.getAttribute("data-lang"));
    });
  });
});
