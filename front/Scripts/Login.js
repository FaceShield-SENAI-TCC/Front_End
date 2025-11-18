const video = document.getElementById("video");
const mensagem = document.getElementById("mensagem");
const feedback = document.getElementById("feedback");
let recognitionInterval;
let isProcessing = false;

function showFeedback(tipo, mensagemTexto) {
  if (!feedback) return;

  feedback.textContent = mensagemTexto;
  feedback.className = "feedback " + tipo;
  feedback.style.display = "block";

  setTimeout(() => {
    feedback.style.opacity = 0;
    feedback.style.transform = "translateX(120%)";
    setTimeout(() => {
      feedback.style.display = "none";
    }, 400);
  }, 5000);
}

function toggleLoading(show) {
  const loadingOverlay = document.querySelector(".loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.style.display = show ? "grid" : "none";
  }
}

async function iniciarCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 640 },
        facingMode: "user",
      },
    });
    video.srcObject = stream;
    mensagem.textContent = "Câmera ativada, aguardando reconhecimento...";

    setTimeout(iniciarReconhecimentoFacial, 1000);
  } catch (error) {
    mensagem.textContent = "Não foi possível ativar a câmera.";
    console.error("Erro ao acessar câmera:", error);
    showFeedback("error", "Erro ao acessar a câmera. Verifique as permissões.");
  }
}

function iniciarReconhecimentoFacial() {
  if (recognitionInterval) {
    clearInterval(recognitionInterval);
  }

  recognitionInterval = setInterval(() => {
    if (!isProcessing) {
      capturarEReconhecer();
    }
  }, 1000);
}

function capturarEReconhecer() {
  if (isProcessing) return;

  isProcessing = true;
  mensagem.textContent = "Processando reconhecimento...";

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = canvas.toDataURL("image/jpeg");

  reconhecerFace(imageData);
}

function registrarLoginFacial(username, id) {
  const URL_REGISTRO = "http://localhost:8080/auth/generate-token";

  console.log(`Registrando evento de login para: ${username} (ID: ${id})`);

  fetch(URL_REGISTRO, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        console.warn(
          `Não foi possível registrar o evento de login. Status: ${response.status}`
        );
        return Promise.reject(
          `Erro ${response.status}: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then((data) => {
      console.log("Token recebido:", data.id);

      if (data.token) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("username", username);
        localStorage.setItem("id", id);
        console.log("authToken, Username e ID salvos no localStorage.");
      } else {
        console.warn("Token não encontrado na resposta do backend Java.");
      }
    })
    .catch((error) => {
      console.error("Erro ao registrar evento de login:", error);
    });
}

function reconhecerFace(imageData) {
  toggleLoading(true);

  fetch("http://localhost:5005/face-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imagem: imageData }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Resposta completa do Python:", data.id);

      toggleLoading(false);
      isProcessing = false;

      if (data.authenticated) {
        const username = data.user_info.username;
        const tipoUsuario = data.tipo_usuario;
        const id = data.user_info.id;

        mensagem.textContent = `Bem-vindo, ${username}!`;
        showFeedback(
          "success",
          `Login realizado com sucesso! Bem-vindo, ${username}.`
        );

        registrarLoginFacial(username, id);

        setTimeout(() => {
          if (tipoUsuario === "PROFESSOR") {
            window.location.href = "/front/Html/Menu.html";
          } else {
            window.location.href = "/front/Html/QrCode.html";
          }
        }, 1500);
      } else {
        mensagem.textContent =
          data.message || "Usuário não reconhecido. Tente novamente.";
        showFeedback(
          "error",
          data.message || "Usuário não reconhecido. Por favor, tente novamente."
        );
      }
    })
    .catch((error) => {
      toggleLoading(false);
      isProcessing = false;
      console.error("Erro:", error);
      mensagem.textContent = "Erro no reconhecimento. Tente novamente.";
      showFeedback("error", "Erro de conexão com o servidor. Tente novamente.");
    });
}

const botaoVoltar = document.querySelector(".buttonVoltar");

if (botaoVoltar) {
  botaoVoltar.addEventListener("click", () => {
    console.log("Botão Voltar clicado, limpando localStorage...");
    localStorage.clear();
  });
}

window.addEventListener("load", iniciarCamera);

window.addEventListener("beforeunload", () => {
  if (recognitionInterval) {
    clearInterval(recognitionInterval);
  }

  if (video.srcObject) {
    const tracks = video.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
  }
});
