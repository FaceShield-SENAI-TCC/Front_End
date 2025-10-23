
// ========================== TRADUÇÃO ==========================
let translations = {};

function t(key, replacements = {}) {
  let text = translations[key] || key;
  for (const placeholder in replacements) {
    text = text.replace(`{${placeholder}}`, replacements[placeholder]);
  }
  return text;
}

async function loadTranslations(lang) {
  try {
    const response = await fetch(`./translate/${lang}.json`);
    if (!response.ok) throw new Error(`File not found for: ${lang}`);
    translations = await response.json();
  } catch (error) {
    console.error("Failed to load translation file:", error);
  }
}

function updateUI() {
  document.querySelectorAll("[data-translate-key]").forEach((el) => {
    const key = el.getAttribute("data-translate-key");
    if (!key) return;
    el.textContent = t(key);
  });
  const titleElement = document.querySelector("title");
  const titleKey = titleElement.getAttribute("data-translate-key");
  if (titleKey) document.title = t(titleKey);
}

async function switchLanguage(lang) {
  localStorage.setItem("language", lang);
  await loadTranslations(lang);
  updateUI();
}
window.switchLanguage = switchLanguage;

// ========================== LÓGICA DAS PÁGINAS DE LOGIN ==========================

// Função de feedback genérica (pode ser usada por ambas as páginas)
function showFeedback(type, messageKey, replacements = {}) {
  const feedbackEl = document.getElementById("feedback"); // Procura o elemento de feedback na página atual
  if (!feedbackEl) return;

  feedbackEl.textContent = t(messageKey, replacements);
  feedbackEl.className = "feedback " + type;
  feedbackEl.style.display = "block";
  feedbackEl.style.opacity = 1;

  setTimeout(() => {
    feedbackEl.style.opacity = 0;
    setTimeout(() => {
      feedbackEl.style.display = "none";
    }, 400);
  }, 5000);
}

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Carrega as traduções
  const currentLanguage = localStorage.getItem("language") || "pt";
  await loadTranslations(currentLanguage);
  updateUI();

  // 2. Lógica da Página de Login com Câmera
  const video = document.getElementById("video");
  if (video) {
    const mensagem = document.getElementById("mensagem");
    let recognitionInterval;
    let isProcessing = false;

    const toggleLoading = (show) => {
      const loadingOverlay = document.querySelector(".loading-overlay");
      if (loadingOverlay) loadingOverlay.style.display = show ? "grid" : "none";
    };

    const reconhecerFace = (imageData) => {
      toggleLoading(true);
      // Simulação (seu código de fetch vai aqui)
      console.log("Enviando imagem para reconhecimento...");
      setTimeout(() => {
        // Simule um resultado de sucesso ou falha para testar
        const success = Math.random() > 0.5; // 50% de chance de sucesso
        const data = success
          ? { authenticated: true, user: "Usuário Teste" }
          : { authenticated: false, message: t("camera-status-fail") };

        toggleLoading(false);
        isProcessing = false;

        if (data.authenticated) {
          mensagem.textContent = t("camera-status-success", {
            name: data.user,
          });
          showFeedback("success", "alert-login-camera-success", {
            name: data.user,
          });
          // setTimeout(() => { window.location.href = "pagina-inicial.html"; }, 2000);
        } else {
          mensagem.textContent = data.message;
          showFeedback("error", "camera-status-fail");
        }
      }, 2000);
    };

    const capturarEReconhecer = () => {
      if (isProcessing) return;
      isProcessing = true;
      mensagem.textContent = t("camera-status-recognizing");

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg");
      reconhecerFace(imageData);
    };

    const iniciarReconhecimentoFacial = () => {
      if (recognitionInterval) clearInterval(recognitionInterval);
      recognitionInterval = setInterval(() => {
        if (!isProcessing) capturarEReconhecer();
      }, 3000);
    };

    const iniciarCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 640 },
            facingMode: "user",
          },
        });
        video.srcObject = stream;
        mensagem.textContent = t("camera-status-activated");
        setTimeout(iniciarReconhecimentoFacial, 1000);
      } catch (error) {
        mensagem.textContent = t("camera-error-access");
        console.error("Erro ao acessar câmera:", error);
        showFeedback("error", "camera-error-access");
      }
    };

    iniciarCamera();

    window.addEventListener("beforeunload", () => {
      if (recognitionInterval) clearInterval(recognitionInterval);
      if (video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
    });
  }

  // 3. Lógica da Página de Login de Professor
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      console.log("Formulário de login do professor enviado.");

      // ###############################################################
      // ## ADICIONE AQUI a sua lógica de fetch para o login do prof. ##
      // ## Exemplo de como usar as traduções:                        ##
      // ## if (success) { showFeedback("success", "alert-login-success"); }   ##
      // ## else { showFeedback("error", "alert-login-fail"); }        ##
      // ###############################################################

      // Redirecionamento temporário
      showFeedback("success", "alert-login-success");
      setTimeout(() => {
        window.location.href = "../MenuProf/MenuProf.html";
      }, 1500);
    });
  }
});
