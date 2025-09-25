document.addEventListener("DOMContentLoaded", () => {
  const translations = {
    pt: {
      "main-title": "FaceShield",
      "glowing-button-login": "Entrar",
      "glowing-button-register": "Novo Cadastro",
    },
    es: {
      "main-title": "FaceShield",
      "glowing-button-login": "Ingresar",
      "glowing-button-register": "Nuevo Registro",
    },
  };

  const elementsToTranslate = document.querySelectorAll("[data-i18n]");
  const langButtons = document.querySelectorAll(".lang-btn");

  function setLanguage(lang) {
    elementsToTranslate.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

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

  // Define o idioma padrão
  setLanguage("pt");
});