const video = document.getElementById("video");
const mensagem = document.getElementById("mensagem");
const feedback = document.getElementById("feedback");
const loadingOverlay = document.querySelector(".loading-overlay");

let canvasElement = document.createElement("canvas");
let canvas = canvasElement.getContext("2d");
let scanning = false; // <<< Importante: Controla se já estamos processando um QR Code

async function iniciarCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment", // Câmera traseira
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
  // <<< Só continua se não estivermos já processando um scan
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
      // <<< QR Code encontrado!
      scanning = true; // Trava para não escanear de novo
      processarQRCode(code.data);
    }
  }

  // Continua o loop
  if (!scanning) {
    requestAnimationFrame(detectarQRCode);
  }
}

// ==================================================================
//  MUDANÇA PRINCIPAL AQUI
// ==================================================================

function processarQRCode(toolId) {
  mostrarLoading(true);
  mensagem.textContent = `QR Code lido [${toolId}]. Registrando empréstimo...`;

  // 1. Pegar os dados do aluno que foram salvos no Login
  const userId = localStorage.getItem("id");
  const authToken = localStorage.getItem("authToken");

  // 2. Verificar se o aluno está logado
  if (!userId || !authToken) {
    mostrarFeedback(
      "Usuário não autenticado. Faça o login novamente.",
      "error"
    );
    mostrarLoading(false);
    setTimeout(() => {
      window.location.href = "/front/Html/Login.html";
    }, 2000);
    return; // Para a execução
  }

  // 3. Verificar se o QR Code é válido
  if (!toolId || toolId.length === 0) {
    mostrarFeedback("QR Code inválido ou vazio. Tente novamente.", "error");
    mensagem.textContent = "QR Code inválido. Tente novamente.";
    mostrarLoading(false);
    scanning = false; // Libera para escanear de novo
    requestAnimationFrame(detectarQRCode); // Reinicia o scan
    return;
  }

  // 4. Chamar a função para fazer o POST no backend
  registrarEmprestimo(userId, toolId, authToken);
}

/**
 * Nova função para fazer o POST de Empréstimo no backend Java
 */
async function registrarEmprestimo(userId, toolId, token) {
  // ATENÇÃO: Confirme a URL da sua API de empréstimos!
  const URL_EMPRESTIMO = "http://localhost:8080/api/emprestimos/novo"; // <<< CONFIRME ESSA URL

  try {
    const response = await fetch(URL_EMPRESTIMO, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Envia o token de autenticação que pegamos no login facial
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        // Ajuste os nomes dos campos (usuarioId, ferramentaId)
        // para o que a sua API Java espera receber
        usuarioId: userId,
        ferramentaId: toolId,
      }),
    });

    if (!response.ok) {
      // Tenta ler a mensagem de erro da API
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Erro ${response.status} ao registrar empréstimo.`
      );
    }

    const data = await response.json();
    console.log("Empréstimo registrado:", data);

    // Sucesso!
    mostrarFeedback("Empréstimo registrado com sucesso!", "success");
    mensagem.textContent = "Sucesso! Você já pode pegar a ferramenta.";
    mostrarLoading(false);

    // Opcional: redirecionar para uma tela de "sucesso" ou de volta ao login
    setTimeout(() => {
      window.location.href = "/front/Html/Login.html"; // Volta pro login
    }, 3000);
  } catch (error) {
    console.error("Erro ao registrar empréstimo:", error);
    mostrarFeedback(`Falha: ${error.message}`, "error");
    mensagem.textContent = "Falha no registro. Tente escanear novamente.";
    mostrarLoading(false);
    scanning = false; // Libera para escanear de novo
    requestAnimationFrame(detectarQRCode); // Reinicia o scan
  }
}

// ==================================================================
//  FUNÇÕES AUXILIARES (Sem alteração)
// ==================================================================

function mostrarFeedback(texto, tipo) {
  feedback.textContent = texto;
  feedback.className = "feedback " + tipo;
  feedback.style.display = "block"; // Garante que está visível

  // Reseta os estilos de fade-out do Login.js (se houver)
  feedback.style.opacity = 1;
  feedback.style.transform = "translateX(0)";

  setTimeout(() => {
    // Adiciona estilos de fade-out
    feedback.style.opacity = 0;
    feedback.style.transform = "translateX(120%)";
    setTimeout(() => {
      feedback.style.display = "none";
    }, 400);
  }, 4000); // Feedback some em 4 segundos
}

function mostrarLoading(mostrar) {
  loadingOverlay.style.display = mostrar ? "grid" : "none";
}

window.addEventListener("DOMContentLoaded", () => {
  // Verifica se o usuário está logado ANTES de iniciar a câmera
  const userId = localStorage.getItem("id");
  const username = localStorage.getItem("username");

  if (!userId) {
    mensagem.textContent = "Você precisa fazer o login facial primeiro.";
    mostrarFeedback("Não autenticado. Redirecionando...", "error");
    setTimeout(() => {
      window.location.href = "/front/Html/Login.html";
    }, 2000);
  } else {
    mensagem.textContent = `Olá, ${username}. Aponte para o QR Code.`;
    iniciarCamera(); // Inicia a câmera só se o usuário estiver logado
  }

  const botaoVoltar = document.getElementById("btn-voltar");

  if (botaoVoltar) {
    botaoVoltar.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "/front/Html/Login.html";
    });
  }
});
