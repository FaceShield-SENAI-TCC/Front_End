// ========================== TRADUÇÃO ==========================
let translations = {};

function t(key) {
  return translations[key] || key;
}

async function loadTranslations(lang) {
  try {
    const response = await fetch(`./translate/${lang}.json`);
    if (!response.ok) throw new Error(`File not found for: ${lang}`);
    translations = await response.json();
  } catch (error) {
    console.error("Failed to load translation file:", error);
  }
}

function updateUI() {
  document.querySelectorAll("[data-translate-key]").forEach((el) => {
    const key = el.getAttribute("data-translate-key");
    if (key) el.textContent = t(key);
  });
  document.title = t("page-title");
}

async function switchLanguage(lang) {
  localStorage.setItem("language", lang);
  await loadTranslations(lang);
  updateUI();
}
window.switchLanguage = switchLanguage;

// ========================== INICIALIZAÇÃO ==========================
document.addEventListener("DOMContentLoaded", async () => {
  const currentLanguage = localStorage.getItem("language") || "pt";
  await loadTranslations(currentLanguage);
  updateUI();
});
