document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroForm");
  if (!form) {
    console.error("Elemento #cadastroForm não encontrado!");
    return;
  }

  // Elementos DOM
  const feedback = document.getElementById("feedback");
  const tipoUsuarioSelect = document.getElementById("tipoUsuario");
  const usernameGroup = document.getElementById("username-group");
  const usernameInput = document.getElementById("username");
  const senhaGroup = document.getElementById("senha-group");
  const senhaInput = document.getElementById("senha");

  const API_URL = "http://localhost:8080/usuarios/novoUsuario";

  // =================================================================
  // LÓGICA DE TRADUÇÃO (I18n) - CORRIGIDA E VERIFICADA
  // =================================================================
  const elementsToTranslate = document.querySelectorAll("[data-i18n]");
  const langButtons = document.querySelectorAll(".lang-btn");
  let currentLanguage = "pt";
  let i18n_messages = {}; // Objeto para armazenar o JSON do idioma atual

  // Função para aplicar as traduções nos elementos da página
  function applyTranslations(translations) {
    // 1. Atualiza a tag <title>
    const titleElement = document.querySelector("title");
    if (titleElement) {
      const titleKey = titleElement.getAttribute("data-i18n");
      if (titleKey && translations[titleKey]) {
        titleElement.textContent = translations[titleKey];
      }
    }

    // 2. Atualiza todos os elementos com o atributo data-i18n
    elementsToTranslate.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (translations[key]) {
        // Trata placeholders (para inputs)
        if (element.placeholder !== undefined) {
          element.placeholder = translations[key];
        }
        // Trata conteúdo de outros elementos (botões, links, labels, etc.)
        else {
          element.textContent = translations[key];
        }
      }
    });

    // 3. Atualiza os textos das options do select (se tiverem data-i18n)
    if (tipoUsuarioSelect) {
      tipoUsuarioSelect.querySelectorAll("option").forEach((option) => {
        const key = option.getAttribute("data-i18n");
        if (key && translations[key]) {
          option.textContent = translations[key];
        }
      });
    }
  }

  // Função principal para carregar e aplicar o idioma
  async function changeLanguage(langCode) {
    // Não recarrega o mesmo idioma
    if (currentLanguage === langCode && Object.keys(i18n_messages).length > 0)
      return;

    try {
      // 1. Busca o arquivo JSON
      const response = await fetch(`${langCode}.json`);
      if (!response.ok) {
        throw new Error(`Não foi possível carregar ${langCode}.json`);
      }
      const translations = await response.json();

      // 2. Armazena e aplica as traduções
      i18n_messages = translations;
      applyTranslations(translations);
      currentLanguage = langCode;

      // 3. Atualiza o estado visual dos botões
      langButtons.forEach((button) => {
        if (button.getAttribute("data-lang") === langCode) {
          button.classList.add("active");
        } else {
          button.classList.remove("active");
        }
      });
    } catch (error) {
      console.error(`Erro ao carregar o idioma ${langCode}:`, error);
      // Mensagem de fallback com o código do erro
      // O 'null' na mensagem de erro será resolvido se o HTML estiver correto
      showFeedback(
        "error",
        `Erro ao carregar idioma ${langCode}. Verifique se o arquivo ${langCode}.json existe.`
      );
    }
  }

  // 4. Adiciona event listeners aos botões
  langButtons.forEach((button) => {
    const langCode = button.getAttribute("data-lang");

    // ESTA VERIFICAÇÃO É CRÍTICA E CORRIGE O ERRO 'null.json'
    if (langCode) {
      button.addEventListener("click", () => changeLanguage(langCode));
    } else {
      console.warn(
        "AVISO: Um botão de idioma não tem o atributo data-lang. Corrija o HTML."
      );
    }
  });

  // 5. Carrega o idioma padrão ao iniciar (Português)
  changeLanguage(currentLanguage);

  // =================================================================
  // FIM DA LÓGICA DE TRADUÇÃO
  // =================================================================

  // Exibir mensagens de feedback - AGORA USA AS CHAVES DO JSON
  function showFeedback(tipo, mensagemKey, ...args) {
    if (!feedback) return;

    // Tenta usar a chave de tradução, senão usa a string como mensagem literal.
    let mensagem = i18n_messages[mensagemKey] || mensagemKey;

    // Aplica formatação se necessário (ex: {progress}%)
    args.forEach((arg, index) => {
      // {0}, {1}, etc.
      mensagem = mensagem.replace(`{${index}}`, arg);
      // {message}
      mensagem = mensagem.replace(`{message}`, arg); 
    });

    feedback.textContent = mensagem;
    feedback.className = "feedback " + tipo;
    feedback.style.display = "block";

    setTimeout(() => {
      feedback.style.display = "none";
    }, 5000);
  }

  // Função para mostrar/ocultar campos de professor
  function toggleUsernameField() {
    if (!tipoUsuarioSelect) return;

    const isProfessor = tipoUsuarioSelect.value === "2";

    setTimeout(() => {
      if (usernameGroup)
        usernameGroup.style.display = isProfessor ? "block" : "none";
      if (senhaGroup) senhaGroup.style.display = isProfessor ? "block" : "none";

      if (senhaInput) senhaInput.required = isProfessor;
      if (usernameInput) usernameInput.required = isProfessor;

      if (!isProfessor) {
        if (usernameInput) usernameInput.value = "";
        if (senhaInput) senhaInput.value = "";
      }
    }, 300);
  }

  // Event listeners
  if (tipoUsuarioSelect) {
    tipoUsuarioSelect.addEventListener("change", toggleUsernameField);
    toggleUsernameField(); // Chamada inicial para configurar campos
  }

  // Validação em tempo real
  function validarCampo(input) {
    const parent = input.parentElement;
    if (!parent) return;

    if (input.checkValidity()) {
      parent.classList.add("valid");
      parent.classList.remove("invalid");
    } else {
      parent.classList.add("invalid");
      parent.classList.remove("valid");
    }
  }

  document.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => validarCampo(input));
  });

  // Submit do formulário
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Validação dos campos
    const tipoUsuario = tipoUsuarioSelect ? tipoUsuarioSelect.value : "";
    const campos = ["nome", "sobrenome", "turma"];

    if (tipoUsuario === "2") {
      campos.push("username", "senha");
    }

    const invalidos = [];
    let isValid = true;

    campos.forEach((id) => {
      const campo = document.getElementById(id);
      if (!campo) return;

      let erroMensagem = campo.parentElement.querySelector(".error-message");

      if (!campo.value.trim()) {
        invalidos.push(id);
        campo.classList.add("input-error");
        isValid = false;

        // Usa a tradução
        const requiredMsg = i18n_messages["feedback-required-field"] || "Este campo é obrigatório."; 
        
        if (!erroMensagem) {
          const errorElement = document.createElement("div");
          errorElement.classList.add("error-message");
          errorElement.textContent = requiredMsg;
          campo.parentElement.appendChild(errorElement);
        } else {
          erroMensagem.textContent = requiredMsg;
        }
      } else {
        campo.classList.remove("input-error");
        if (erroMensagem) {
          erroMensagem.remove();
        }
      }
    });

    if (!tipoUsuario) {
      showFeedback("error", "feedback-select-user-type"); // Usa chave de tradução
      return;
    }

    if (!isValid) {
      const firstInvalid = document.getElementById(invalidos[0]);
      if (firstInvalid) firstInvalid.focus();
      showFeedback("error", "feedback-fill-all-fields"); // Usa chave de tradução
      return;
    }

    // Obter valores dos campos
    const nome = document.getElementById("nome").value.trim();
    const sobrenome = document.getElementById("sobrenome").value.trim();
    const isAluno = tipoUsuario === "1";

    // Montar objeto com os dados do formulário
    const formData = {
      nome: nome,
      sobrenome: sobrenome,
      turma: document.getElementById("turma").value.trim(),
      tipoUsuario: isAluno ? "ALUNO" : "PROFESSOR",

      // Gerar username automático para alunos
      username: isAluno
        ? `${nome.toLowerCase()}.${sobrenome.toLowerCase()}`
        : document.getElementById("username").value.trim(),

      // Alunos não usam senha
      senha: isAluno ? null : document.getElementById("senha").value,
    };

    try {
      console.log("Enviando dados para o backend:", formData);
      showFeedback("info", "feedback-sending-data"); // Usa chave de tradução

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Verificação inicial da resposta
      if (!response.ok) {
        let errorMessage = `Erro HTTP! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage += ` - ${errorData.message}`;
          }
        } catch (e) {}
        throw new Error(errorMessage);
      }

      // Tentar parsear a resposta como JSON
      const responseData = await response.json();
      console.log("Resposta completa:", {
        status: response.status,
        data: responseData,
      });

      // Verificação robusta de sucesso
      if (response.status === 201 && responseData.id) {
        showFeedback("success", "feedback-register-success"); // Usa chave de tradução
        form.reset();
        toggleUsernameField();

        // Foco no primeiro campo após sucesso
        setTimeout(() => {
          const firstInput = form.querySelector("input");
          if (firstInput) firstInput.focus();
        }, 100);
      } else {
        // Tratar casos onde o status é 201 mas sem confirmação real
        const warningKey = "feedback-register-warning";
        const errorMsg = responseData.message || i18n_messages[warningKey];
        showFeedback("warning", errorMsg);
      }
    } catch (error) {
      console.error("Erro completo na requisição:", error);

      let errorMessage;
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("ERR_CONNECTION_REFUSED")
      ) {
        errorMessage = i18n_messages["error-server-offline"]; // Usa chave de tradução
      } else if (error.message.includes("PropertyValueException")) {
        errorMessage = i18n_messages["error-server-validation"]; // Usa chave de tradução
      } else if (error.message.includes("Erro HTTP")) {
        // Usa a chave de erro genérica e injeta a mensagem HTTP
        errorMessage = (i18n_messages["error-server-generic"] || "Erro no servidor: {message}").replace('{message}', error.message);
      } else {
        errorMessage =
          error.message || i18n_messages["error-processing-register"]; // Usa chave de tradução
      }

      showFeedback("error", errorMessage);

      // Log detalhado para debug
      console.error("Detalhes do erro:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
  });
});