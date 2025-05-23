async function pedirPermissaoCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.getElementById('video');
      video.srcObject = stream;
      console.log('Permissão concedida. Câmera ativada.');
    } catch (erro) {
      console.error('Erro ao acessar a câmera:', erro);
      alert('Você precisa permitir o uso da câmera para continuar.');
    }
  }

  pedirPermissaoCamera();