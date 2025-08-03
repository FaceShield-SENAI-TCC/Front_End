document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroForm");
  if (!form) {
    console.error("Elemento #cadastroForm não encontrado!");
    return;
  }

  const feedback = document.getElementById("feedback");
  const tipoUsuarioSelect = document.getElementById("tipoUsuario");
  const usernameGroup = document.getElementById("username-group");
  const usernameInput = document.getElementById("username");
  const scanWidget = document.querySelector(".face-scan-widget");
  const senhaGroup = document.getElementById("senha-group");
  const senhaInput = document.getElementById("senha");
  const turmaInput = document.getElementById("turma");
  let isScanning = false;

  const API_URL = "http://localhost:8080/usuarios/novoUsuario";

  function toggleUsernameField() {
    if (!tipoUsuarioSelect) return;

    const isProfessor = tipoUsuarioSelect.value === "2";

    setTimeout(() => {
      if (usernameGroup) usernameGroup.style.display = isProfessor ? "block" : "none";
      if (senhaGroup) senhaGroup.style.display = isProfessor ? "block" : "none";
      
      if (senhaInput) senhaInput.required = isProfessor;
      if (usernameInput) usernameInput.required = isProfessor;

      if (!isProfessor) {
        if (usernameInput) usernameInput.value = "";
        if (senhaInput) senhaInput.value = "";
      }
    }, 300);
  }

  if (tipoUsuarioSelect) {
    tipoUsuarioSelect.addEventListener("change", toggleUsernameField);
    toggleUsernameField();
  }

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

  if (scanWidget) {
    scanWidget.addEventListener("click", async () => {
      if (isScanning) return;

      isScanning = true;
      scanWidget.style.pointerEvents = "none";
      const uploadInstruction = document.querySelector(".upload-instruction");
      if (uploadInstruction) {
        uploadInstruction.textContent = "Capturando...";
      }

      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        scanWidget.classList.add("scan-success");
        showFeedback("success", "Biometria capturada!");
      } catch (error) {
        scanWidget.classList.add("scan-error");
        showFeedback("error", "Falha na captura");
      } finally {
        isScanning = false;
        scanWidget.style.pointerEvents = "auto";
        setTimeout(() => {
          scanWidget.classList.remove("scan-success", "scan-error");
          if (uploadInstruction) {
            uploadInstruction.textContent = "Clique para captura biométrica";
          }
        }, 2000);
      }
    });
  }

  function showFeedback(tipo, mensagem) {
    if (!feedback) return;
    
    feedback.textContent = mensagem;
    feedback.className = "feedback " + tipo;
    feedback.style.display = "block";

    setTimeout(() => {
      feedback.style.display = "none";
    }, 5000);
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const tipoUsuario = tipoUsuarioSelect ? tipoUsuarioSelect.value : "";
    const campos = ["nome", "sobrenome", "turma"];
    
    if (tipoUsuario === "2") {
      campos.push("username", "senha");
    }

    const invalidos = [];

    campos.forEach((id) => {
      const campo = document.getElementById(id);
      if (!campo) return;
      
      const erroMensagem = campo.parentElement.querySelector(".error-message");

      if (!campo.value.trim()) {
        invalidos.push(id);
        campo.classList.add("input-error");

        if (!erroMensagem) {
          const errorElement = document.createElement("div");
          errorElement.classList.add("error-message");
          errorElement.textContent = "Este campo é obrigatório.";
          campo.parentElement.appendChild(errorElement);
        }
      } else {
        campo.classList.remove("input-error");
        if (erroMensagem) {
          erroMensagem.remove();
        }
      }
    });

    if (!tipoUsuario) {
      showFeedback("error", "Selecione o tipo de usuário");
      return;
    }

    if (invalidos.length > 0) {
      const firstInvalid = document.getElementById(invalidos[0]);
      if (firstInvalid) firstInvalid.focus();
      showFeedback("error", "Por favor, preencha todos os campos.");
      return;
    }

    // ESTRUTURA SIMPLIFICADA - compatível com o novo backend
    const formData = {
      nome: document.getElementById("nome").value,
      sobrenome: document.getElementById("sobrenome").value,
      turma: document.getElementById("turma").value,
      tipoUsuario: tipoUsuario === "1" ? "ALUNO" : "PROFESSOR", // String direta
      username: tipoUsuario === "2" ? document.getElementById("username").value : null,
      senha: tipoUsuario === "2" ? document.getElementById("senha").value : null
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      console.log("Dados enviados:", formData);

      // Obter resposta como texto para melhor tratamento
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        try {
          // Tentar parsear como JSON para obter mensagem de erro
          const errorData = JSON.parse(responseText);
          errorMessage += ` - ${errorData.message || errorData.error || responseText}`;
        } catch (e) {
          // Se não for JSON, usar texto completo
          errorMessage += ` - ${responseText}`;
        }
        throw new Error(errorMessage);
      }

      // Parsear resposta como JSON
      const responseData = JSON.parse(responseText);
      
      if (responseData.success) {
        showFeedback("success", "Cadastro realizado com sucesso!");
        form.reset();
        toggleUsernameField();
      } else {
        showFeedback("error", responseData.message || "Erro no cadastro");
      }
    } catch (error) {
      console.error("Erro completo na requisição:", error);
      
      // Mensagem mais detalhada para o usuário
      let userMessage = "Erro ao processar o cadastro: " + error.message;
      
      // Tentar extrair a mensagem de erro do backend
      try {
        const errorParts = error.message.split(" - ");
        if (errorParts.length > 1) {
          const serverError = JSON.parse(errorParts[1]);
          if (serverError.message) {
            userMessage = serverError.message;
          }
        }
      } catch (parseError) {
        console.warn("Não foi possível parsear mensagem de erro:", parseError);
      }
      
      showFeedback("error", userMessage);
    }
  });
});