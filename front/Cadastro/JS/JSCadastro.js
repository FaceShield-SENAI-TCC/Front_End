// ========================== LÓGICA DE TRADUÇÃO ==========================

// Objeto que guardará as traduções do arquivo JSON carregado.
let translations = {};

/**
 * Busca uma tradução a partir de uma chave.
 * @param {string} key - A chave da tradução (ex: "login-btn").
 * @returns {string} O texto traduzido.
 */
function t(key) {
  return translations[key] || key;
}

/**
 * Carrega o arquivo de tradução (JSON) do idioma especificado.
 * @param {string} lang - O idioma a ser carregado (ex: "pt" ou "en").
 */
async function loadTranslations(lang) {
  try {
    // Busca o arquivo JSON na pasta "translate" DENTRO da pasta "Inicio".
    const response = await fetch(`./Inicio/translate/${lang}.json`);
    if (!response.ok) {
      throw new Error(
        `Arquivo de tradução não encontrado: ./Inicio/translate/${lang}.json`
      );
    }
    translations = await response.json();
  } catch (error) {
    console.error("Falha ao carregar o arquivo de tradução:", error);
  }
}

/**
 * Atualiza todos os textos da interface (HTML) com base nas traduções carregadas.
 */
function updateUI() {
  document.querySelectorAll("[data-translate-key]").forEach((element) => {
    const key = element.getAttribute("data-translate-key");
    if (key) {
      element.textContent = t(key);
    }
  });
  document.title = t("title");
}

/**
 * Função global para trocar o idioma.
 * @param {string} lang - O novo idioma ("pt" ou "en").
 */
async function switchLanguage(lang) {
  localStorage.setItem("language", lang);
  await loadTranslations(lang);
  updateUI();
}

// Expõe a função para ser acessível pelo HTML (onclick)
window.switchLanguage = switchLanguage;

// ========================== LÓGICA DA PÁGINA DE INÍCIO ==========================

/**
 * Inicia o fluxo de autenticação (login ou registro).
 * @param {string} type - 'login' ou 'register'.
 * @param {Event} event - O evento do clique para prevenir o comportamento padrão.
 */
function initAuth(type, event) {
  if (event) event.preventDefault();

  const loadingOverlay = document.querySelector(".loading-overlay");
  loadingOverlay.style.display = "grid";

  // Simulação de processo de autenticação
  setTimeout(() => {
    loadingOverlay.style.display = "none";
    if (type === "login") {
      window.location.href = "Login/CameraLogin.html";
    } else {
      window.location.href = "Cadastro/cadastro.html";
    }
  }, 1000); // Reduzi o tempo para 1 segundo para melhorar a experiência
}

// Expõe a função para ser acessível pelo HTML (onclick)
window.initAuth = initAuth;

// --- INICIALIZAÇÃO QUANDO A PÁGINA CARREGA ---
document.addEventListener("DOMContentLoaded", async () => {
  const currentLanguage = localStorage.getItem("language") || "pt";
  await loadTranslations(currentLanguage);
  updateUI();
});
