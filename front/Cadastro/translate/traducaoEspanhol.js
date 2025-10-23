document.addEventListener("DOMContentLoaded", () => {
  const translations = {
    pt: {
      "cadastro-title": "Cadastro de Usuário",
      "tipo-usuario-label": "Tipo de Usuário",
      "aluno-option": "Aluno",
      "professor-option": "Professor",
      "nome-label": "Nome",
      "sobrenome-label": "Sobrenome",
      "matricula-label": "Matrícula",
      "turma-label": "Turma",
      "username-label": "Nome de Usuário",
      "senha-label": "Senha",
      "scan-instruction": "Clique para captura biométrica",
      "cadastro-btn": "Cadastrar",
      "feedback-success": "Cadastro realizado com sucesso!",
      "feedback-error": "Falha no cadastro. Tente novamente.",
      "feedback-warning": "Aviso do servidor. O cadastro pode não estar completo.",
      "go-back-btn": "Voltar",
    },
    es: {
      "cadastro-title": "Registro de Usuario",
      "tipo-usuario-label": "Tipo de Usuario",
      "aluno-option": "Estudiante",
      "professor-option": "Profesor",
      "nome-label": "Nombre",
      "sobrenome-label": "Apellido",
      "matricula-label": "Número de Matrícula",
      "turma-label": "Clase",
      "username-label": "Nombre de Usuario",
      "senha-label": "Contraseña",
      "scan-instruction": "Haga clic para la captura biométrica",
      "cadastro-btn": "Registrar",
      "feedback-success": "¡Registro exitoso!",
      "feedback-error": "Fallo en el registro. Inténtelo de nuevo.",
      "feedback-warning": "Advertencia del servidor. Es posible que el registro no esté completo.",
      "go-back-btn": "Volver",
    },
  };

  const elementsToTranslate = document.querySelectorAll("[data-i18n]");
  const langButtons = document.querySelectorAll(".lang-btn");

  function setLanguage(lang) {
    elementsToTranslate.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (translations[lang] && translations[lang][key]) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = translations[lang][key];
        } else if (el.tagName === "OPTION") {
          el.textContent = translations[lang][key];
        } else {
          el.textContent = translations[lang][key];
        }
      }
    });

    // Atualiza o texto dos botões específicos
    const backButton = document.querySelector(".buttonVoltar");
    if (backButton) {
      backButton.textContent = translations[lang]["go-back-btn"];
    }

    const registerButton = document.querySelector(".botao");
    if (registerButton) {
      registerButton.textContent = translations[lang]["cadastro-btn"];
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
