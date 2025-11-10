// ========================== TRADUÇÃO ==========================
let translations = {};

function t(key, replacements = {}) {
  let text = translations[key] || key;
  for (const placeholder in replacements) {
    text = text.replace(`{${placeholder}}`, replacements[placeholder]);
  }
  return text;
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
    if (!key) return;

    // Específico para o span de paginação
    if (key === "pagination-page-info") {
      el.textContent = t(key, {
        currentPage: el.dataset.page,
        totalPages: el.dataset.total,
      });
      return;
    }

    // Preserva ícones e atualiza texto
    const icon = el.querySelector("i");
    const textNode = icon
      ? icon.nextSibling
      : el.firstChild && el.firstChild.nodeType === Node.TEXT_NODE
      ? el.firstChild
      : null;

    if (el.placeholder) {
      el.placeholder = t(key);
      return;
    }

    if (icon) {
      // Se houver ícone, atualiza o texto após ele
      if (textNode) {
        textNode.textContent = ` ${t(key)}`;
      } else {
        el.appendChild(document.createTextNode(` ${t(key)}`));
      }
    } else {
      // Se não houver ícone, atualiza o texto diretamente
      el.textContent = t(key);
    }
  });

  // Atualiza o título da página
  const titleElement = document.querySelector("title");
  const titleKey = titleElement?.getAttribute("data-translate-key");
  if (titleKey) titleElement.textContent = t(titleKey);

  // Atualiza a tabela (necessário para traduzir cabeçalhos e conteúdo dinâmico)
  renderTable();
}

// ============== CORREÇÃO DE IDIOMA: GESTÃO DO ESTADO ATIVO E GLOBALIZAÇÃO ==============

function updateLanguageButtons(lang) {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-lang") === lang) {
      btn.classList.add("active");
    }
  });
}

async function switchLanguage(lang) {
  localStorage.setItem("language", lang);
  updateLanguageButtons(lang); // Atualiza as classes CSS
  await loadTranslations(lang);
  updateUI();
}

// ESSENCIAL: Torna a função acessível pelo onclick no HTML
window.switchLanguage = switchLanguage;

// ========================== DADOS DE TESTE E FUNÇÕES DA PÁGINA ==========================

// ... (Restante do seu código da página JSEmpVisu.js) ...

// Aqui está o código que você já tinha na inicialização:

const loansTableBody = document.querySelector("#loansTableBody");
const prevPageBtn = document.querySelector("#prevPage");
const nextPageBtn = document.querySelector("#nextPage");
const pageInfoSpan = document.querySelector("#pageInfo");
const userFilter = document.querySelector("#userFilter");
const toolFilter = document.querySelector("#toolFilter");
const statusFilter = document.querySelector("#statusFilter");
const searchInput = document.querySelector("#searchInput");
const modal = document.querySelector("#loanDetailsModal");
const closeModalBtn = document.querySelector(".close-btn");
const loanDetailsContent = document.querySelector("#loanDetailsContent");

let allLoans = []; // Seus dados de empréstimos
let filteredLoans = [];
let currentPage = 1;
const rowsPerPage = 10;

// Exemplo de dados (você deve carregar isso da sua API/JSON)
allLoans = [
  {
    id: 1,
    user: "Joao Silva",
    tool: "Multimetro",
    checkoutDate: "2023-10-20",
    returnDate: "2023-10-25",
    status: "returned",
    notes: "Sem observações.",
    location: {
      space: "Laboratório 1",
      cabinet: "Armário B",
      shelf: "Prateleira 3",
      case: "Caixa P",
    },
  },
  {
    id: 2,
    user: "Maria Souza",
    tool: "Osciloscópio",
    checkoutDate: "2023-11-01",
    returnDate: "2023-11-10",
    status: "active",
    notes: "Uso em projeto X.",
    location: {
      space: "Laboratório 2",
      cabinet: "Armário A",
      shelf: "Prateleira 1",
      case: "Caixa G",
    },
  },
  {
    id: 3,
    user: "Carlos Lima",
    tool: "Ferro de Solda",
    checkoutDate: "2023-11-05",
    returnDate: "2023-11-12",
    status: "delayed",
    notes: "Componente danificado.",
    location: {
      space: "Laboratório 1",
      cabinet: "Armário C",
      shelf: "Prateleira 2",
      case: "Caixa M",
    },
  },
  // Adicione mais dados conforme necessário
];

function renderTable() {
  // Implementação da renderização da tabela (código existente)
  // ... (Seu código para preencher a tabela) ...
}

function setupPagination() {
  // Implementação da paginação (código existente)
  // ... (Seu código de paginação) ...
}

function applyFilters() {
  // Implementação dos filtros (código existente)
  // ... (Seu código de filtro) ...
}

function openModal(loanId) {
  // Implementação da abertura do modal (código existente)
  // ... (Seu código de modal) ...
}

function closeModal() {
  // Implementação do fechamento do modal (código existente)
  // ... (Seu código de modal) ...
}

function finalizarEmprestimo(loanId) {
  // Implementação da finalização do empréstimo (código existente)
  // ... (Seu código de finalização) ...
}

// ========================== INICIALIZAÇÃO ==========================
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Determina o idioma
  const lang = localStorage.getItem("language") || "pt";

  // 2. Atualiza a classe ativa dos botões (para o CSS refletir o estado correto)
  updateLanguageButtons(lang);

  // 3. Carrega o arquivo de tradução
  await loadTranslations(lang);

  // 4. Renderiza a UI com as traduções
  updateUI();

  // 5. Carrega os dados da página (filtragem/tabela)
  filteredLoans = [...allLoans];
  renderTable();
  setupPagination();

  // 6. Configura Listeners de Filtro
  userFilter.oninput = applyFilters;
  toolFilter.oninput = applyFilters;
  statusFilter.onchange = applyFilters;
  searchInput.oninput = applyFilters; // Assumindo que você usa isso para busca geral

  // 7. Configura Listeners do Modal
  closeModalBtn.onclick = closeModal;
  document.getElementById("modal-return-btn").addEventListener("click", () => {
    // ... (Seu código para finalizar no modal) ...
  });
  window.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  // 8. Listeners da Tabela (Delegação de Eventos)
  // ... (Seu código de listeners de tabela) ...

  // 9. Listeners da Paginação
  // ... (Seu código de paginação) ...
});
