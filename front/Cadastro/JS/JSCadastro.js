document.addEventListener("DOMContentLoaded", async () => { // Async aqui
    const form = document.getElementById("cadastroForm");
    if (!form) {
        console.error("Elemento #cadastroForm não encontrado!");
        return;
    }

    // Elementos DOM
    const feedback = document.getElementById("feedback");
    const tipoUsuarioSelect = document.getElementById("tipoUsuario");
    const usernameGroup = document.getElementById("username-group");
    const usernameInput = document.getElementById("username");
    const senhaGroup = document.getElementById("senha-group");
    const senhaInput = document.getElementById("senha");

    const API_URL = "http://localhost:8080/usuarios/novoUsuario";

    // =================================================================
    // LÓGICA DE TRADUÇÃO (I18n)
    // =================================================================
    let translations = {}; // Objeto para armazenar o JSON do idioma atual

    // Função para buscar a tradução
    function t(key, replacements = {}) {
        let text = translations[key] || key;
        // Simples substituição para placeholders como {message} ou {0}
        Object.entries(replacements).forEach(([placeholder, value], index) => {
            text = text.replace(`{${placeholder}}`, value).replace(`{${index}}`, value);
        });
        return text;
    }

    // Função para aplicar as traduções nos elementos da página
    function applyTranslations() {
        // Título
        const titleElement = document.querySelector("title");
        const titleKey = titleElement?.getAttribute("data-translate-key");
        if (titleKey) titleElement.textContent = t(titleKey);

        // Outros elementos
        document.querySelectorAll("[data-translate-key]").forEach(el => {
            const key = el.getAttribute("data-translate-key");
            if (!key) return;

            const icon = el.querySelector('i'); // Preserva ícones
            const textNode = icon ? icon.nextSibling : el.firstChild;

            if (el.placeholder) {
                el.placeholder = t(key);
            } else if (el.tagName === 'OPTION') { // Traduz options
                el.textContent = t(key);
            } else if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                textNode.textContent = ` ${t(key)}`; // Adiciona espaço após ícone
            } else if (!icon) {
                el.textContent = t(key);
            }
        });
    }

    // Função para carregar o arquivo JSON do idioma
    async function loadTranslations(lang) {
        try {
            // *** AJUSTE O CAMINHO SE NECESSÁRIO ***
            const response = await fetch(`./translate/${lang}.json`); 
            if (!response.ok) throw new Error(`Arquivo não encontrado: ${lang}.json`);
            translations = await response.json();
        } catch (error) {
            console.error(`Erro ao carregar idioma ${lang}:`, error);
            showFeedback("error", `Erro ao carregar idioma ${lang}. Verifique se o arquivo ${lang}.json existe.`);
            translations = {}; // Usa objeto vazio em caso de erro para evitar falhas no t()
        }
    }

    // Função PRINCIPAL para trocar o idioma <<-- RENOMEADA
    async function switchLanguage(langCode) {
        localStorage.setItem("language", langCode); // Salva a preferência
        await loadTranslations(langCode);
        applyTranslations();
    }
    // *** LINHA ADICIONADA PARA EXPOR A FUNÇÃO ***
    window.switchLanguage = switchLanguage; 

    // =================================================================
    // FIM DA LÓGICA DE TRADUÇÃO
    // =================================================================

    // Exibir mensagens de feedback - AGORA USA a função t()
    function showFeedback(tipo, messageKey, replacements = {}) {
        if (!feedback) return;
        feedback.textContent = t(messageKey, replacements); // Usa t()
        feedback.className = "feedback " + tipo;
        feedback.style.display = "block";
        setTimeout(() => { feedback.style.display = "none"; }, 5000);
    }

    // Função para mostrar/ocultar campos de professor
    function toggleUsernameField() {
        if (!tipoUsuarioSelect) return;
        const isProfessor = tipoUsuarioSelect.value === "2";
        // ... (resto da função original) ...
    }

    // Validação em tempo real
    function validarCampo(input) {
         // ... (resto da função original) ...
    }

    // Event listeners iniciais
    if (tipoUsuarioSelect) {
        tipoUsuarioSelect.addEventListener("change", toggleUsernameField);
        toggleUsernameField(); 
    }
    document.querySelectorAll("input, select").forEach((input) => { // Inclui select na validação
        input.addEventListener("input", () => validarCampo(input));
        input.addEventListener("change", () => validarCampo(input)); // Adiciona validação no change também
    });

    // Submit do formulário (com traduções)
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        let isValid = true;
        const requiredFields = ["tipoUsuario", "nome", "sobrenome", "turma"];
        if (tipoUsuarioSelect.value === "2") {
            requiredFields.push("username", "senha");
        }

        requiredFields.forEach(id => {
            const field = document.getElementById(id);
            if (field && !field.value.trim()) {
                isValid = false;
                // Marcar campo inválido (você pode adicionar uma classe CSS para isso)
                field.classList.add('invalid'); 
                // Exibe mensagem de erro (opcional, pode ser só visual)
                 const parent = field.parentElement;
                 let errorMsgEl = parent.querySelector('.error-message');
                 if (!errorMsgEl) {
                     errorMsgEl = document.createElement('div');
                     errorMsgEl.className = 'error-message';
                     parent.appendChild(errorMsgEl);
                 }
                 errorMsgEl.textContent = t('feedback-required-field');
                 errorMsgEl.style.display = 'block';

            } else if (field) {
                field.classList.remove('invalid');
                 const parent = field.parentElement;
                 const errorMsgEl = parent.querySelector('.error-message');
                 if(errorMsgEl) errorMsgEl.style.display = 'none';
            }
        });
        
        if (!isValid) {
             showFeedback("error", "feedback-fill-all-fields");
             return;
        }

        const nome = document.getElementById("nome").value.trim();
        const sobrenome = document.getElementById("sobrenome").value.trim();
        const isAluno = tipoUsuarioSelect.value === "1";

        const formData = {
             // ... (seu objeto formData original) ...
        };

        try {
            showFeedback("info", "feedback-sending-data");
            const response = await fetch(API_URL, { /* ... */ });
            if (!response.ok) { /* ... */ }
            const responseData = await response.json();

            if (response.status === 201 && responseData.id) {
                showFeedback("success", "feedback-register-success");
                form.reset();
                toggleUsernameField();
                // Limpa classes de validação e mensagens de erro
                 form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
                 form.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
            } else {
                 showFeedback("warning", responseData.message || "feedback-register-warning");
            }
        } catch (error) {
            console.error("Erro completo na requisição:", error);
            let errorKey = "error-processing-register"; // Default
            if (error.message.includes("Failed to fetch") || error.message.includes("ERR_CONNECTION_REFUSED")) {
                errorKey = "error-server-offline";
            } else if (error.message.includes("PropertyValueException")) {
                errorKey = "error-server-validation";
            } else if (error.message.includes("Erro HTTP")) {
                 // Para erro genérico, passamos a mensagem original como replacement
                 showFeedback("error", "error-server-generic", { message: error.message });
                 return; // Sai para não mostrar a mensagem default
            }
            showFeedback("error", errorKey);
        }
    });

    // Carrega o idioma inicial ao final de tudo
    const currentLanguage = localStorage.getItem("language") || "pt";
    await switchLanguage(currentLanguage); // Usa a função renomeada

}); // Fim do DOMContentLoaded