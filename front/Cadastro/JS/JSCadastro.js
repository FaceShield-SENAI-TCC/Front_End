document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.registration-form');
    const scanWidget = document.querySelector('.face-scan-widget');
    const loadingOverlay = document.querySelector('.loading-overlay');
    let isScanning = false;

    // Validação em Tempo Real
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            const parent = input.parentElement;
            if(input.checkValidity()) {
                parent.classList.add('valid');
                parent.classList.remove('invalid');
            } else {
                parent.classList.add('invalid');
                parent.classList.remove('valid');
            }
        });
    });

    // Sistema de Captura Biométrica
    scanWidget.addEventListener('click', async () => {
        if(isScanning) return;
        
        isScanning = true;
        scanWidget.style.pointerEvents = 'none';
        document.querySelector('.upload-instruction').textContent = 'Capturando...';

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            scanWidget.classList.add('scan-success');
            showFeedback('success', 'Biometria capturada!');
        } catch(error) {
            showFeedback('error', 'Falha na captura');
            scanWidget.classList.add('scan-error');
        } finally {
            isScanning = false;
            scanWidget.style.pointerEvents = 'auto';
            setTimeout(() => {
                scanWidget.classList.remove('scan-success', 'scan-error');
                document.querySelector('.upload-instruction').textContent = 'Clique para captura biométrica';
            }, 2000);
        }
    });

    // Envio do Formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = form.querySelector('.glowing-button');
        const loader = submitButton.querySelector('.button-loader');
        const buttonText = submitButton.querySelector('.button-text');

        // Validação Básica
        const campos = ['nome', 'sobrenome', 'turma'];
        const invalidos = campos.filter(id => !document.getElementById(id).value.trim());

        if(invalidos.length > 0) {
            showFeedback('error', `Preencha: ${invalidos.join(', ')}`);
            return;
        }

        // Simular Processamento
        buttonText.textContent = 'Processando...';
        loader.style.opacity = '1';
        loadingOverlay.style.display = 'grid';

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if(!isScanning) {
                throw new Error('Captura biométrica não realizada');
            }

            showFeedback('success', 'Cadastro realizado com sucesso!');
            form.reset();
            window.location.href = 'confirmacao.html';
        } catch(error) {
            showFeedback('error', error.message);
        } finally {
            buttonText.textContent = 'Cadastrar';
            loader.style.opacity = '0';
            loadingOverlay.style.display = 'none';
        }
    });

    // Sistema de Feedback
    function showFeedback(type, message) {
        const feedback = document.createElement('div');
        feedback.className = `feedback ${type}`;
        feedback.textContent = message;
        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.style.opacity = '0';
            setTimeout(() => feedback.remove(), 500);
        }, 2500);
    }
});

const form = document.getElementById('cadastroForm');
const feedback = document.getElementById('feedback');

form.addEventListener('submit', function(event) {
    event.preventDefault();
    const campos = ['nome', 'sobrenome', 'turma', 'username', 'senha'];
    const tipoUsuario = document.getElementById('tipoUsuario').value;
    const invalidos = [];

    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (!campo.value.trim()) {
            invalidos.push(id);
            campo.classList.add('input-error');
        } else {
            campo.classList.remove('input-error');
        }
    });

    if (!tipoUsuario) {
        showFeedback('error', 'Selecione o tipo de usuário');
        return;
    }

    if (invalidos.length > 0) {
        showFeedback('error', 'Por favor, preencha todos os campos.');
        return;
    }

    // Aqui você pode salvar os dados no banco de dados ou enviar para API

    showFeedback('success', 'Cadastro realizado com sucesso!');

    setTimeout(() => {
        if (tipoUsuario === 'professor') {
            window.location.href = 'historico.html';
        } else {
            window.location.href = '../index.html';
        }
    }, 1500);
});

function showFeedback(tipo, mensagem) {
    feedback.textContent = mensagem;
    feedback.className = 'feedback ' + tipo;
    feedback.style.display = 'block';
    setTimeout(() => {
        feedback.style.display = 'none';
    }, 3000);
}