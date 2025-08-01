document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroForm");
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
    const isProfessor = tipoUsuarioSelect.value === "2"; // Changed to check for "2" instead of "professor"

    setTimeout(() => {
      usernameGroup.classList.toggle("hidden", !isProfessor);
      senhaGroup.classList.toggle("hidden", !isProfessor);
      senhaInput.required = isProfessor;
      usernameInput.required = isProfessor;

      if (!isProfessor) {
        usernameInput.value = "";
        senhaInput.value = "";
        turmaInput.value = "";
      }
    }, 300);
  }

  tipoUsuarioSelect.addEventListener("change", toggleUsernameField);

  if (tipoUsuarioSelect.value !== "") {
    toggleUsernameField();
  }

  function validarCampo(input) {
    const parent = input.parentElement;
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
      document.querySelector(".upload-instruction").textContent =
        "Capturando...";

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
          document.querySelector(".upload-instruction").textContent =
            "Clique para captura biométrica";
        }, 2000);
      }
    });
  }

  function showFeedback(tipo, mensagem) {
    feedback.textContent = mensagem;
    feedback.className = "feedback " + tipo;
    feedback.style.display = "block";

    setTimeout(() => {
      feedback.style.display = "none";
    }, 3000);
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const tipoUsuario = tipoUsuarioSelect.value;
    const campos = ["nome", "sobrenome"];
    if (tipoUsuario === "2") {
      // Changed to check for "2" instead of "professor"
      campos.push("username", "senha");
    }

    const invalidos = [];

    campos.forEach((id) => {
      const campo = document.getElementById(id);
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
      document.getElementById(invalidos[0]).focus();
      showFeedback("error", "Por favor, preencha todos os campos.");
      return;
    }

    // Preparar os dados para envio
    const formData = {
      tipoUsuario: tipoUsuario,
      nome: document.getElementById("nome").value,
      sobrenome: document.getElementById("sobrenome").value,
      turma: document.getElementById("turma").value,
    };

    // Adicionar campos específicos de professor
    if (tipoUsuario === "2") {
      // Changed to check for "2" instead of "professor"
      formData.username = document.getElementById("username").value;
      formData.senha = document.getElementById("senha").value;
      formData.turma = document.getElementById("turma").value;
    }

    try {
      // Enviar dados para a API usando fetch
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar usuário");
      }

      const data = await response.json();

      if (data.success) {
        showFeedback("success", "Cadastro realizado com sucesso!");
        form.reset();
        toggleUsernameField();
      } else {
        showFeedback("error", data.message || "Erro no cadastro");
      }
    } catch (error) {
      console.error("Erro:", error);
      showFeedback("error", "Erro ao conectar com o servidor");
    }
  });
});
