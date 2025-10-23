
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
    } catch (error) { console.error("Failed to load translation file:", error); }
}

function updateUI() {
    document.querySelectorAll("[data-translate-key]").forEach(el => {
        const key = el.getAttribute("data-translate-key");
        if (!key) return;

        // Preserva ícones dentro de botões e labels
        const icon = el.querySelector('i');
        const textNode = icon ? icon.nextSibling : el.firstChild;
        
        if (el.placeholder) {
            el.placeholder = t(key);
        } else if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            textNode.textContent = ` ${t(key)}`;
        } else if (!icon) {
             el.textContent = t(key);
        }
    });
    document.title = t("page-title");
    
    // Atualiza opções de select que são definidas no carregamento
    alunoSelect.querySelector('option[value=""]').textContent = t('loading-students');
    ferramentaSelect.querySelector('option[value=""]').textContent = t('loading-tools');
}

async function switchLanguage(lang) {
    localStorage.setItem("language", lang);
    await loadTranslations(lang);
    updateUI();
    // Re-traduz os selects após carregar os dados
    carregarAlunos(true); // 'true' para forçar a re-tradução sem refazer o fetch
    carregarFerramentas(true);
}
window.switchLanguage = switchLanguage;

// ========================== LÓGICA DA PÁGINA ==========================

// URLs da API
const API_BASE = "http://localhost:8080";
const API_ALUNOS = `${API_BASE}/usuarios/buscar`;
const API_FERRAMENTAS = `${API_BASE}/ferramentas/buscar`;
const API_EMPRESTIMOS = `${API_BASE}/emprestimos/novoEmprestimo`;
const API_LOCAIS = `${API_BASE}/locais/buscar`;

// Estado da aplicação
let alunos = [];
let ferramentas = [];
let locais = [];

// Elementos DOM
const feedbackEl = document.getElementById("feedback");
const professorNameEl = document.getElementById("professor-name");
const professorDisplayEl = document.getElementById("professor-display");
const alunoSelect = document.getElementById("aluno");
const ferramentaSelect = document.getElementById("ferramenta");
const btnRegistrar = document.getElementById("btn-registrar");
const btnCancelar = document.getElementById("btn-cancelar");
const userAvatar = document.getElementById("user-avatar");

// Função para exibir feedback (agora usa chaves de tradução)
function showFeedback(type, messageKey, replacements = {}) {
    feedbackEl.textContent = t(messageKey, replacements);
    feedbackEl.className = `feedback ${type}`;
    feedbackEl.style.display = "block";

    if (type === "success") {
        setTimeout(() => { feedbackEl.style.display = "none"; }, 5000);
    }
}

// Funções de data (não precisam de tradução, mantidas como estão)
function getDataHoraBrasilia() { /* ... (código original) ... */ }
function formatarDataBrasilia(date) { /* ... (código original) ... */ }
function toISOLocal(date) { /* ... (código original) ... */ }
function toISOLocalString(date) { /* ... (código original) ... */ }

// Gerar iniciais a partir do nome
function gerarIniciais(nome) {
    const nomes = nome.split(" ");
    if (nomes.length >= 2) {
        return nomes[0].charAt(0) + nomes[nomes.length - 1].charAt(0);
    }
    return nome.substring(0, 2).toUpperCase();
}

// Função para carregar alunos (com tradução)
async function carregarAlunos(forceUpdateUI = false) {
    // Se os alunos já foram carregados, apenas atualiza a UI (para troca de idioma)
    if (alunos.length > 0 && forceUpdateUI) {
        alunoSelect.innerHTML = `<option value="">${t("select-student")}</option>`;
        alunos.forEach(aluno => {
            const option = document.createElement("option");
            option.value = aluno.id;
            option.textContent = `${aluno.nome} ${aluno.sobrenome} - ${aluno.turma}`;
            option.setAttribute("data-turma", aluno.turma);
            alunoSelect.appendChild(option);
        });
        return;
    }

    try {
        const response = await fetch(API_ALUNOS);
        if (!response.ok) throw new Error(t("alert-load-students-fail"));
        alunos = await response.json();

        alunoSelect.innerHTML = `<option value="">${t("select-student")}</option>`;
        alunos.forEach((aluno) => {
            const option = document.createElement("option");
            option.value = aluno.id;
            option.textContent = `${aluno.nome} ${aluno.sobrenome} - ${aluno.turma}`;
            option.setAttribute("data-turma", aluno.turma);
            alunoSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar alunos:", error);
        alunoSelect.innerHTML = `<option value="">${t("error-loading-students")}</option>`;
        showFeedback("error", "alert-load-students-error");
    }
}

// Função para carregar ferramentas (com tradução)
async function carregarFerramentas(forceUpdateUI = false) {
    if (ferramentas.length > 0 && forceUpdateUI) {
        ferramentaSelect.innerHTML = `<option value="">${t("select-tool")}</option>`;
        ferramentas.forEach(ferramenta => {
            const option = document.createElement("option");
            option.value = ferramenta.id;
            option.textContent = `${ferramenta.nome} (${ferramenta.marca})`;
            option.setAttribute("data-local-id", ferramenta.id_local);
            ferramentaSelect.appendChild(option);
        });
        return;
    }
    
    try {
        const response = await fetch(API_FERRAMENTAS);
        if (!response.ok) throw new Error(t("alert-load-tools-fail"));
        ferramentas = await response.json();

        ferramentaSelect.innerHTML = `<option value="">${t("select-tool")}</option>`;
        ferramentas.forEach((ferramenta) => {
            const option = document.createElement("option");
            option.value = ferramenta.id;
            option.textContent = `${ferramenta.nome} (${ferramenta.marca})`;
            option.setAttribute("data-local-id", ferramenta.id_local);
            ferramentaSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar ferramentas:", error);
        ferramentaSelect.innerHTML = `<option value="">${t("error-loading-tools")}</option>`;
        showFeedback("error", "alert-load-tools-error");
    }
}

// Função para carregar locais (com tradução)
async function carregarLocais() {
    if (locais.length > 0) return; // Evita recarregar
    try {
        const response = await fetch(API_LOCAIS);
        if (!response.ok) throw new Error(t("alert-load-locations-fail"));
        locais = await response.json();
    } catch (error) {
        console.error("Erro ao carregar locais:", error);
        showFeedback("warning", "alert-load-locations-warn");
    }
}

// Event Listeners para os selects (com tradução)
alunoSelect.addEventListener("change", function () {
    const selectedOption = this.options[this.selectedIndex];
    const turma = selectedOption.getAttribute("data-turma") || "";
    document.getElementById("turma").value = turma;
});

ferramentaSelect.addEventListener("change", function () {
    const selectedOption = this.options[this.selectedIndex];
    const ferramentaId = selectedOption.value;
    const ferramenta = ferramentas.find((f) => f.id == ferramentaId);

    if (ferramenta && ferramenta.id_local && locais.length > 0) {
        const local = locais.find((l) => l.id == ferramenta.id_local);
        if (local) {
            let localizacaoTexto = local.nomeEspaco || "";
            if (local.armario) localizacaoTexto += t('location-format-cabinet', {num: local.armario});
            if (local.prateleira) localizacaoTexto += t('location-format-shelf', {num: local.prateleira});
            if (local.estojo) localizacaoTexto += t('location-format-case', {num: local.estojo});
            document.getElementById("localizacao").value = localizacaoTexto;
            return;
        }
    }
    document.getElementById("localizacao").value = t("location-not-defined");
});

// Função para registrar o empréstimo (com tradução)
async function registrarEmprestimo() {
    const alunoId = alunoSelect.value;
    const ferramentaId = ferramentaSelect.value;
    // ... (restante da sua lógica de obter dados) ...

    if (!alunoId || !ferramentaId) {
        showFeedback("error", "alert-fill-required");
        return;
    }

    const aluno = alunos.find((a) => a.id == alunoId);
    const ferramenta = ferramentas.find((f) => f.id == ferramentaId);

    if (!aluno || !ferramenta) {
        showFeedback("error", "alert-invalid-data");
        return;
    }
    
    // ... (sua lógica de datas e montagem do objeto 'emprestimoData' está perfeita) ...
    const dataRetirada = getDataHoraBrasilia();
    let dataDevolucao = null;
    // ...
    const emprestimoData = { /* ... (seu objeto original) ... */ };
    console.log("Dados enviados:", emprestimoData);

    try {
        btnRegistrar.disabled = true;
        btnRegistrar.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("btn-registering")}`;

        const response = await fetch(API_EMPRESTIMOS, { /* ... (seu fetch original) ... */ });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Erro HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log("Empréstimo registrado com sucesso:", result);
        
        showFeedback("success", "alert-register-success", { id: result.id });

        // Resetar formulário
        alunoSelect.value = "";
        ferramentaSelect.value = "";
        // ... (resto do seu reset) ...

    } catch (error) {
        console.error("Erro ao registrar empréstimo:", error);
        showFeedback("error", "alert-register-fail", { message: error.message || t("alert-load-tools-fail") });
    } finally {
        btnRegistrar.disabled = false;
        // Re-traduz o botão para o texto original
        btnRegistrar.innerHTML = `<i class="fas fa-check"></i> ${t("btn-register")}`;
    }
}

// Inicialização (com tradução)
document.addEventListener("DOMContentLoaded", async function () {
    // 1. Carrega traduções PRIMEIRO
    const currentLanguage = localStorage.getItem("language") || "pt";
    await loadTranslations(currentLanguage);
    updateUI(); // Traduz o HTML estático

    // 2. Continua com a lógica original
    const professorNome = t("admin-name"); // Pega o nome do admin do arquivo de tradução

    professorNameEl.textContent = professorNome;
    professorDisplayEl.textContent = professorNome;
    userAvatar.textContent = gerarIniciais(professorNome);

    // ... (toda a sua lógica de datas está perfeita e não mexe com texto) ...
    const agoraBrasilia = getDataHoraBrasilia();
    // ...

    // 3. Carregar dados das APIs
    await carregarLocais();
    await carregarAlunos();
    await carregarFerramentas();

    // 4. Configurar botões (com tradução)
    btnRegistrar.addEventListener("click", registrarEmprestimo);

    btnCancelar.addEventListener("click", function () {
        if (confirm(t("alert-cancel-confirm"))) {
            window.location.href = "../VerEmprestimo/Emprestimos.html";
        }
    });
});

// Funções de navegação (com tradução)
function navigate(page) { /* ... (código original) ... */ }
function logout() {
    if (confirm(t("alert-logout-confirm"))) {
        window.location.href = "index.html";
    }
}