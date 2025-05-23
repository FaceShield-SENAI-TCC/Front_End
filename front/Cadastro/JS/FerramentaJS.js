// Gerar QR Code Único
function generateQR() {
    const qr = new QRCode(document.getElementById("qrcode"), {
        text: `TOOL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        width: 200,
        height: 200
    });
}

// Iniciar Scanner
const scanner = new Instascan.Scanner({
    video: document.getElementById('qrScanner'),
    mirror: false
});

scanner.addListener('scan', function(content) {
    fetchToolData(content);
});

Instascan.Camera.getCameras().then(function(cameras) {
    if (cameras.length > 0) {
        scanner.start(cameras[0]);
    } else {
        alert('Nenhuma câmera encontrada!');
    }
});

// Buscar dados da ferramenta
async function fetchToolData(qrData) {
    try {
        const response = await fetch(`/api/tools?qr=${qrData}`);
        const tool = await response.json();
        
        document.getElementById('toolInfo').innerHTML = `
            <p>Nome: ${tool.nome}</p>
            <p>Status: ${tool.status}</p>
            ${tool.status === 'disponivel' ? 
                '<input type="text" placeholder="Nome do Responsável">' : 
                '<p>Emprestado para: ${tool.usuario_emprestimo}</p>'}
        `;
    } catch (error) {
        alert('Ferramenta não encontrada!');
    }
}

// Processar Empréstimo
async function processLoan() {
    const user = document.querySelector('input[type="text"]').value;
    
    await fetch('/api/loan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            qr: qrData,
            user: user
        })
    });
    
    alert('Operação realizada com sucesso!');
}