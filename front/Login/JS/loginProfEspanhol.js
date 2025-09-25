document.addEventListener("DOMContentLoaded", () => {
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

  function setLanguage(lang) {
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

    // Traduz as labels de forma diferente
    if (usernameLabel) {
      usernameLabel.textContent = translations[lang]["username-label"];
    }
    if (passwordLabel) {
      passwordLabel.textContent = translations[lang]["password-label"];
    }


    // Marca o botão de idioma ativo
    langButtons.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-lang") === lang) {
        btn.classList.add("active");
      }
    });
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