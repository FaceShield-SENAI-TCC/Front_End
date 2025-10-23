document.addEventListener("DOMContentLoaded", () => {
  const translations = {
    pt: {
      "main-title": "Login com Reconhecimento Facial",
      "status-message": "Aguardando reconhecimento...",
      "back-button": "Voltar",
      "teacher-login": "Login Professor",
    },
    es: {
      "main-title": "Ingreso con Reconocimiento Facial",
      "status-message": "Esperando el reconocimiento...",
      "back-button": "Volver",
      "teacher-login": "Ingreso del Profesor",
    },
  };

  const elementsToTranslate = document.querySelectorAll("[data-i18n]");
  const langButtons = document.querySelectorAll(".lang-btn");
  const mensagemElement = document.getElementById("mensagem");

  function setLanguage(lang) {
    elementsToTranslate.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    // Atualiza a mensagem da câmera separadamente
    if (mensagemElement) {
        mensagemElement.textContent = translations[lang]["status-message"];
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

  // Define o idioma padrão
  setLanguage("pt");
});