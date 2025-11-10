// Elementos da página
const video = document.getElementById("video");
const mensagem = document.getElementById("mensagem");
const feedback = document.getElementById("feedback");
const loadingOverlay = document.querySelector(".loading-overlay");

// Variáveis para processamento de QR Code
let canvasElement = document.createElement("canvas");
let canvas = canvasElement.getContext("2d");
let scanning = false;

// Inicializar a câmera
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

    // Iniciar detecção de QR Code
    requestAnimationFrame(detectarQRCode);
  } catch (err) {
    console.error("Erro ao acessar a câmera:", err);
    mostrarFeedback(
      "Erro ao acessar a câmera. Verifique as permissões.",
      "error"
    );
  }
}

// Detectar QR Code
function detectarQRCode() {
  if (video.readyState === video.HAVE_ENOUGH_DATA && !scanning) {
    // Configurar canvas com as dimensões do vídeo
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;

    // Desenhar o frame atual do vídeo no canvas
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

    // Obter dados da imagem para processamento
    const imageData = canvas.getImageData(
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    // Tentar decodificar QR Code
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    // Se encontrou um QR Code válido
    if (code) {
      scanning = true;
      processarQRCode(code.data);
    }
  }

  // Continuar a detecção
  requestAnimationFrame(detectarQRCode);
}

// Processar QR Code encontrado
function processarQRCode(data) {
  mostrarLoading(true);

  // Simular processamento do QR Code
  setTimeout(() => {
    // Aqui você faria a validação do QR Code no seu sistema
    // Por enquanto, apenas simularemos um login bem-sucedido
    if (data && data.length > 0) {
      mostrarFeedback("QR Code validado com sucesso!", "success");
      mensagem.textContent = "QR Code reconhecido! Redirecionando...";

      // Simular redirecionamento após login bem-sucedido
      setTimeout(() => {
        // Aqui você redirecionaria para a página principal
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

// Funções auxiliares
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

// Iniciar quando a página carregar
window.addEventListener("DOMContentLoaded", iniciarCamera);
