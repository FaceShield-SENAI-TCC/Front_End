// ========================== TRANSLATION ==========================
const translations = {
  pt: {
    "title": "FaceShield - Auth 3.0",
    "site-name": "FaceShield",
    "login-btn": "Entrar",
    "register-btn": "Cadastrar",
    "back-btn": "Voltar",
    "select-user-type": "Selecione o tipo de usuário",
    "student": "Aluno",
    "teacher": "Professor",
    "user-type": "Tipo de Usuário",
    "first-name": "Nome",
    "last-name": "Sobrenome",
    "class": "Turma",
    "username": "Nome de Usuário",
    "password": "Senha",
    "view-camera": "Visualizar Câmera",
    "upload-instruction": "Clique para captura biométrica",
  },
  en: {
    "title": "FaceShield - Auth 3.0",
    "site-name": "FaceShield",
    "login-btn": "Login",
    "register-btn": "Register",
    "back-btn": "Back",
    "select-user-type": "Select user type",
    "student": "Student",
    "teacher": "Teacher",
    "user-type": "User Type",
    "first-name": "First Name",
    "last-name": "Last Name",
    "class": "Class",
    "username": "Username",
    "password": "Password",
    "view-camera": "View Camera",
    "upload-instruction": "Click to take biometric capture",
  }
};

let currentLanguage = "pt"; // idioma padrão

function translatePage(language) {
  const elements = document.querySelectorAll("[data-translate-key]");

  elements.forEach(el => {
    const key = el.getAttribute("data-translate-key");
    if (translations[language] && translations[language][key]) {
      if (el.tagName === "INPUT" || el.tagName === "SELECT") {
        el.placeholder = translations[language][key];
      } else {
        el.innerText = translations[language][key];
      }
    }
  });

  // Atualiza o título da página
  const title = document.querySelector("title");
  if (title) title.innerText = translations[language]["title"];
}

function switchLanguage(language) {
  currentLanguage = language;
  translatePage(language);
}

// ========================== FORM JS ==========================
document.addEventListener("DOMContentLoaded", () => {
  switchLanguage(currentLanguage); // aplica idioma padrão

  const form = document.getElementById("cadastroForm");
  if (!form) return console.error("Elemento #cadastroForm não encontrado!");

  const feedback = document.getElementById("feedback");
  const tipoUsuarioSelect = document.getElementById("tipoUsuario");
  const usernameGroup = document.getElementById("username-group");
  const usernameInput = document.getElementById("username");
  const scanWidget = document.querySelector(".face-scan-widget");
  const scanInstruction = scanWidget.querySelector(".upload-instruction");
  const senhaGroup = document.getElementById("senha-group");
  const senhaInput = document.getElementById("senha");
  const nomeInput = document.getElementById("nome");
  const sobrenomeInput = document.getElementById("sobrenome");
  const turmaInput = document.getElementById("turma");
  const viewCameraBtn = document.querySelector(".view-camera-btn");

  const API_URL = "http://localhost:8080/usuarios/novoUsuario";
  const CAPTURE_API_URL = "http://localhost:7001";

  let isScanning = false;
  let isViewingCamera = false;
  let captureSessionId = null;
  let faceCaptureComplete = false;
  let faceCaptureSuccess = false;

  const cameraFeed = document.getElementById("camera-feed");

  const checkmark = document.createElement("div");
  checkmark.innerHTML = "&#10004;";
  checkmark.style.position = "absolute";
  checkmark.style.top = "50%";
  checkmark.style.left = "50%";
  checkmark.style.transform = "translate(-50%, -50%) scale(0)";
  checkmark.style.fontSize = "0rem";
  checkmark.style.color = "#00ffaa";
  checkmark.style.textShadow = "0 0 20px rgba(0, 255, 170, 0.8)";
  checkmark.style.zIndex = "10";
  checkmark.style.opacity = "0";
  checkmark.style.transition = "all 0.8s ease-out";
  scanWidget.appendChild(checkmark);

  const socket = io(CAPTURE_API_URL, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    autoConnect: false,
  });

  // Toggle campos professor
  function toggleUsernameField() {
    if (!tipoUsuarioSelect) return;
    const isProfessor = tipoUsuarioSelect.value === "2";

    setTimeout(() => {
      usernameGroup.style.display = isProfessor ? "block" : "none";
      senhaGroup.style.display = isProfessor ? "block" : "none";

      senhaInput.required = isProfessor;
      usernameInput.required = isProfessor;

      if (!isProfessor) {
        usernameInput.value = "";
        senhaInput.value = "";
      }
    }, 300);
  }

  // Validação em tempo real
  function validarCampo(input) {
    const parent = input.parentElement;
    if (!parent) return;

    const errorElement = parent.querySelector(".error-message");

    if (input.checkValidity()) {
      parent.classList.add("valid");
      parent.classList.remove("invalid");
      if (errorElement) errorElement.style.display = "none";
    } else {
      parent.classList.add("invalid");
      parent.classList.remove("valid");
      if (errorElement) {
        errorElement.textContent = currentLanguage === "pt" ? "Este campo é obrigatório." : "This field is required.";
        errorElement.style.display = "block";
      }
    }
  }

  function showFeedback(tipo, mensagem) {
    if (!feedback) return;
    feedback.textContent = mensagem;
    feedback.className = "feedback " + tipo;
    feedback.style.display = "block";

    setTimeout(() => {
      feedback.style.opacity = 0;
      feedback.style.transform = "translateX(120%)";
      setTimeout(() => { feedback.style.display = "none"; }, 400);
    }, 5000);
  }

  // Event listeners iniciais
  if (tipoUsuarioSelect) {
    tipoUsuarioSelect.addEventListener("change", toggleUsernameField);
    toggleUsernameField(); // inicializa
  }

  document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", () => validarCampo(input));
  });

  // O restante do código de captura biométrica e envio do form mantém-se igual...
  // (Socket.IO e submit do form)
});
