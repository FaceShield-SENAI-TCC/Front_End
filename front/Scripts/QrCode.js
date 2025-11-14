const video = document.getElementById("video");
const mensagem = document.getElementById("mensagem");
const feedback = document.getElementById("feedback");
const loadingOverlay = document.querySelector(".loading-overlay");

let canvasElement = document.createElement("canvas");
let canvas = canvasElement.getContext("2d");
let scanning = false;

async function iniciarCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    video.srcObject = stream;
    video.play();

    requestAnimationFrame(detectarQRCode);
  } catch (err) {
    console.error("Erro ao acessar a câmera:", err);
    mostrarFeedback(
      "Erro ao acessar a câmera. Verifique as permissões.",
      "error"
    );
  }
}

function detectarQRCode() {
  if (video.readyState === video.HAVE_ENOUGH_DATA && !scanning) {
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;

    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

    const imageData = canvas.getImageData(
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
      scanning = true;
      processarQRCode(code.data);
    }
  }

  requestAnimationFrame(detectarQRCode);
}

function processarQRCode(data) {
  mostrarLoading(true);

  setTimeout(() => {
    if (data && data.length > 0) {
      mostrarFeedback("QR Code validado com sucesso!", "success");
      mensagem.textContent = "QR Code reconhecido! Redirecionando...";

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 2000);
    } else {
      mostrarFeedback("QR Code inválido. Tente novamente.", "error");
      mensagem.textContent = "QR Code inválido. Tente novamente.";
      scanning = false;
    }

    mostrarLoading(false);
  }, 1500);
}

function mostrarFeedback(texto, tipo) {
  feedback.textContent = texto;
  feedback.className = "feedback " + tipo;

  setTimeout(() => {
    feedback.className = "feedback";
  }, 4000);
}

function mostrarLoading(mostrar) {
  loadingOverlay.style.display = mostrar ? "grid" : "none";
}

window.addEventListener("DOMContentLoaded", () => {
  iniciarCamera();

  const botaoVoltar = document.getElementById("btn-voltar");

  if (botaoVoltar) {
    botaoVoltar.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "/front/Html/Login.html";
    });
  }
});
