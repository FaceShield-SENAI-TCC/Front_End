const video = document.getElementById("video");
const mensagem = document.getElementById("mensagem");

async function iniciarCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    mensagem.textContent = "Câmera ativada, aguardando reconhecimento...";
  } catch (error) {
    mensagem.textContent = "Não foi possível ativar a câmera.";
    console.error("Erro ao acessar câmera:", error);
  }
}

iniciarCamera();
