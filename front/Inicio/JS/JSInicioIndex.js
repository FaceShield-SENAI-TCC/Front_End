// ========================== LÓGICA DE TRADUÇÃO ==========================
let translations = {};

function t(key) { return translations[key] || key; }

async function loadTranslations(lang) {
    try {
        // CORREÇÃO IMPORTANTE: O caminho precisa incluir a pasta "Inicio"
        // porque o index.html está na raiz, mas o JS e o translate estão dentro de "Inicio".
        const response = await fetch(`./Inicio/translate/${lang}.json`); 
        if (!response.ok) throw new Error(`Arquivo não encontrado para: ${lang}`);
        translations = await response.json();
    } catch (error) {
        console.error("Falha ao carregar arquivo de tradução:", error);
        translations = {}; // Usa objeto vazio em caso de erro
        alert(`Erro ao carregar idioma ${lang}. Verifique o console (F12).`); // Alerta para o usuário
    }
}

function updateUI() {
    document.querySelectorAll("[data-translate-key]").forEach(element => {
        const key = element.getAttribute("data-translate-key");
        if (key) {
             const icon = element.querySelector('i');
             if (icon) { // Preserva ícone se houver
                 const textNode = icon.nextSibling;
                 if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                     textNode.textContent = ` ${t(key)}`;
                 } else {
                     element.appendChild(document.createTextNode(` ${t(key)}`));
                 }
             } else {
                 element.textContent = t(key);
             }
        }
    });
    // Traduz o título da página
    const titleElement = document.querySelector('title');
    const titleKey = titleElement?.getAttribute('data-translate-key');
    if(titleKey) titleElement.textContent = t(titleKey);
}

async function switchLanguage(lang) {
    localStorage.setItem("language", lang);
    await loadTranslations(lang);
    updateUI();
}
// ESSA LINHA É ESSENCIAL PARA O ONCLICK FUNCIONAR:
window.switchLanguage = switchLanguage;

// ========================== LÓGICA ESPECÍFICA DA PÁGINA INDEX ==========================

function initAuth(type, event) {
    if (event) event.preventDefault();
    const loadingOverlay = document.querySelector(".loading-overlay");
    if(loadingOverlay) loadingOverlay.style.display = "grid";

    // Simulação (você pode ajustar o tempo)
    setTimeout(() => {
        if(loadingOverlay) loadingOverlay.style.display = "none";
        if (type === "login") {
            window.location.href = "Login/CameraLogin.html";
        } else {
            window.location.href = "Cadastro/cadastro.html";
        }
    }, 1000); // Reduzi para 1 segundo
}
// ESSA LINHA TAMBÉM É ESSENCIAL PARA O ONCLICK FUNCIONAR:
window.initAuth = initAuth;


// ========================== INICIALIZAÇÃO ==========================
document.addEventListener("DOMContentLoaded", async () => {
    // Carrega o idioma salvo ou o padrão (pt)
    const currentLanguage = localStorage.getItem("language") || "pt";
    await loadTranslations(currentLanguage);
    updateUI(); // Aplica a tradução inicial
});