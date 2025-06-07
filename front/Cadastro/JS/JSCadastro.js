document.addEventListener('DOMContentLoaded', () => {
        // Referências ao tipo de usuário e campo de username
        const form = document.getElementById('cadastroForm');
        const feedback = document.getElementById('feedback');
        const tipoUsuarioSelect = document.getElementById('tipoUsuario');
        const usernameGroup = document.getElementById('username-group');
        const usernameInput = document.getElementById('username');
        const scanWidget = document.querySelector('.face-scan-widget');
        const senhaGroup = document.getElementById('senha-group');
        const senhaInput = document.getElementById('senha');
        let isScanning = false;

        // Mostrar ou esconder o campo de Nome de Usuário e Senha com base na seleção
        function toggleUsernameField() {
                const isProfessor = tipoUsuarioSelect.value === 'professor';

                setTimeout(() => {
            
                usernameGroup.classList.toggle('hidden', !isProfessor);
                senhaGroup.classList.toggle('hidden', !isProfessor);
                senhaInput.required = isProfessor;
                usernameInput.required = isProfessor;
                
                if (!isProfessor) {
                    usernameInput.value = '';
                    senhaInput.value = '';
                }
            }, 300);
        }
        
        // Chamar quando o select mudar
        tipoUsuarioSelect.addEventListener('change', toggleUsernameField);
        
        // Executar ao carregar a página (caso valor já esteja setado)
        if (tipoUsuarioSelect.value !== '') {
            toggleUsernameField();
        }

        // Validação em Tempo Real
        function validarCampo(input) {
        const parent = input.parentElement;
        if (input.checkValidity()) {
            parent.classList.add('valid');
            parent.classList.remove('invalid');
        } else {
            parent.classList.add('invalid');
            parent.classList.remove('valid');
        }
        }

        document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => validarCampo(input));
        });

        // Simulação da Captura Biométrica
        if (scanWidget) {
            scanWidget.addEventListener('click', async () => {
                if (isScanning) return;

                isScanning = true;
                scanWidget.style.pointerEvents = 'none';
                document.querySelector('.upload-instruction').textContent = 'Capturando...';

                try {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    scanWidget.classList.add('scan-success');
                    showFeedback('success', 'Biometria capturada!');
                } catch (error) {
                    scanWidget.classList.add('scan-error');
                    showFeedback('error', 'Falha na captura');
                } finally {
                    isScanning = false;
                    scanWidget.style.pointerEvents = 'auto';
                    setTimeout(() => {
                        scanWidget.classList.remove('scan-success', 'scan-error');
                        document.querySelector('.upload-instruction').textContent = 'Clique para captura biométrica';
                    }, 2000);
                }
            });
        }

        // Sistema de Feedback
        function showFeedback(tipo, mensagem) {
            feedback.textContent = mensagem;
            feedback.className = 'feedback ' + tipo;
            feedback.style.display = 'block';

            setTimeout(() => {
                feedback.style.display = 'none';
            }, 3000);
        }

        // Envio do formulário
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            const tipoUsuario = tipoUsuarioSelect.value;
            const campos = ['nome', 'sobrenome', 'turma'];
            if (tipoUsuario === 'professor') {
                campos.push('username', 'senha');
            }

            const invalidos = [];
            
            campos.forEach(id => {
                const campo = document.getElementById(id);
                const erroMensagem = campo.parentElement.querySelector('.error-message'); // Buscar mensagem de erro, se existir

                if (!campo.value.trim()) {
                    invalidos.push(id);
                    campo.classList.add('input-error');

                     // Se não tiver uma mensagem de erro, criar uma nova
                    if (!erroMensagem) {
                        const errorElement = document.createElement('div');
                        errorElement.classList.add('error-message');
                        errorElement.textContent = 'Este campo é obrigatório.'; // Mensagem genérica
                        campo.parentElement.appendChild(errorElement);
                    }
                } else {
                    campo.classList.remove('input-error');
                    // Remover a mensagem de erro se o campo for preenchido corretamente
                    if (erroMensagem) {
                        erroMensagem.remove();
                    }
                }
            });

            if (!tipoUsuario) {
                showFeedback('error', 'Selecione o tipo de usuário');
                return;
            }

            if (invalidos.length > 0) {
                document.getElementById(invalidos[0]).focus();
                showFeedback('error', 'Por favor, preencha todos os campos.');
                return;
            }

            // Aqui você pode salvar os dados no banco de dados ou enviar para API
            showFeedback('success', 'Cadastro realizado com sucesso!');
            form.reset();
            toggleUsernameField(); // para reavaliar os campos escondidos

    })
});