const API_BASE = "http://localhost:8080";
const API_ALUNOS = `${API_BASE}/usuarios/buscar`;
const API_FERRAMENTAS = `${API_BASE}/ferramentas/buscar`;
const API_EMPRESTIMOS = `${API_BASE}/emprestimos/novoEmprestimo`;
const API_LOCAIS = `${API_BASE}/locais/buscar`;

let alunos = [];
let ferramentas = [];
let locais = [];

const feedbackEl = document.getElementById("feedback");
const professorNameEl = document.getElementById("professor-name");
const professorDisplayEl = document.getElementById("professor-display");
const alunoSelect = document.getElementById("aluno");
const ferramentaSelect = document.getElementById("ferramenta");
const btnRegistrar = document.getElementById("btn-registrar");
const btnCancelar = document.getElementById("btn-cancelar");

/**
 * Pega o token do localStorage e retorna o cabeçalho de Autorização.
 * @param {boolean} includeContentType - Define se o 'Content-Type: application/json' deve ser incluído
 * @returns {HeadersInit} - Objeto de Headers pronto para o fetch
 */
function getAuthHeaders(includeContentType = false) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    alert("Sessão expirada ou usuário não logado.");
    window.location.href = "/front/Html/Login.html";
    throw new Error("Token não encontrado. Redirecionando para login.");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

/**
 * Função para tratar erros de resposta da API, especialmente 401/403.
 * @param {Response} response - O objeto de resposta do fetch
 */
async function handleResponseError(response) {
  if (response.status === 401 || response.status === 403) {
    alert("Acesso negado. Sua sessão pode ter expirado. Faça login novamente.");
    window.location.href = "/front/Html/Login.html";
    throw new Error("Acesso não autorizado (401/403).");
  }

  const errorText = await response.text();
  throw new Error(
    `Erro na requisição: ${errorText} (Status: ${response.status})`
  );
}

function showFeedback(type, message) {
  feedbackEl.textContent = message;
  feedbackEl.className = `feedback ${type}`;
  feedbackEl.style.display = "block";

  if (type === "success") {
    setTimeout(() => {
      feedbackEl.style.display = "none";
    }, 5000);
  }
}

function getDataHoraBrasilia() {
  return new Date();
}

function formatarDataBrasilia(date) {
  return date.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toISOLocal(date) {
  if (!date) return null;

  const pad = (n) => n.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toISOLocalString(date) {
  if (!date) return null;

  const pad = (n) => n.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function gerarIniciais(nome) {
  const nomes = nome.split(" ");
  if (nomes.length >= 2) {
    return nomes[0].charAt(0) + nomes[nomes.length - 1].charAt(0);
  }
  return nome.substring(0, 2).toUpperCase();
}

async function carregarAlunos() {
  try {
    const response = await fetch(API_ALUNOS, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) await handleResponseError(response);

    alunos = await response.json();

    alunoSelect.innerHTML = '<option value="">Selecione um aluno</option>';
    alunos.forEach((aluno) => {
      const option = document.createElement("option");
      option.value = aluno.id;
      option.textContent = `${aluno.nome} ${aluno.sobrenome} - ${aluno.turma}`;
      option.setAttribute("data-turma", aluno.turma);
      alunoSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar alunos:", error);
    alunoSelect.innerHTML = '<option value="">Erro ao carregar alunos</option>';
    if (!error.message.includes("Token") && !error.message.includes("401/403")) {
      showFeedback(
        "error",
        "Erro ao carregar lista de alunos. Tente recarregar a página."
      );
    }
  }
}

async function carregarFerramentas() {
  try {
    const response = await fetch(API_FERRAMENTAS, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) await handleResponseError(response);

    ferramentas = await response.json();

    ferramentaSelect.innerHTML =
      '<option value="">Selecione uma ferramenta</option>';
    ferramentas.forEach((ferramenta) => {
      const option = document.createElement("option");
      option.value = ferramenta.id;
      option.textContent = `${ferramenta.nome} (${ferramenta.marca})`;
      option.setAttribute("data-nome-local", ferramenta.nomeLocal);
      ferramentaSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar ferramentas:", error);
    ferramentaSelect.innerHTML =
      '<option value="">Erro ao carregar ferramentas</option>';
    if (!error.message.includes("Token") && !error.message.includes("401/403")) {
      showFeedback(
        "error",
        "Erro ao carregar lista de ferramentas. Tente recarregar a página."
      );
    }
  }
}

async function carregarLocais() {
  try {
    const response = await fetch(API_LOCAIS, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) await handleResponseError(response);

    locais = await response.json();
  } catch (error) {
    console.error("Erro ao carregar locais:", error);
    if (!error.message.includes("Token") && !error.message.includes("401/403")) {
      showFeedback(
        "warning",
        "Não foi possível carregar informações de localização."
      );
    }
  }
}

alunoSelect.addEventListener("change", function () {
  const selectedOption = this.options[this.selectedIndex];
  const turma = selectedOption.getAttribute("data-turma") || "";
  document.getElementById("turma").value = turma;
});

ferramentaSelect.addEventListener("change", function () {
  const selectedOption = this.options[this.selectedIndex];
  const nomeLocal = selectedOption.getAttribute("data-nome-local");

  if (nomeLocal && nomeLocal !== "null" && nomeLocal !== "undefined" && locais.length > 0) {
    const local = locais.find((l) => l.nomeEspaco == nomeLocal);

    if (local) {
      let localizacaoTexto = local.nomeEspaco || "";
      if (local.armario) localizacaoTexto += ` - Armário ${local.armario}`;
      if (local.prateleira)
        localizacaoTexto += `, Prateleira ${local.prateleira}`;
      if (local.estojo) localizacaoTexto += `, Estojo ${local.estojo}`;

      document.getElementById("localizacao").value = localizacaoTexto;
      return;
    }
  }
  document.getElementById("localizacao").value = nomeLocal || "Local não definido";
});

async function registrarEmprestimo() {
  const alunoId = alunoSelect.value;
  const ferramentaId = ferramentaSelect.value;
  const dataDevolucaoInput = document.getElementById("data-devolucao").value;
  const observacoes = document.getElementById("observacoes").value || "";

  if (!alunoId || !ferramentaId) {
    showFeedback("error", "Por favor, preencha todos os campos obrigatórios!");
    return;
  }

  const aluno = alunos.find((a) => a.id == alunoId);
  const ferramenta = ferramentas.find((f) => f.id == ferramentaId);

  if (!aluno || !ferramenta) {
    showFeedback(
      "error",
      "Dados inválidos. Recarregue a página e tente novamente."
    );
    return;
  }

  const dataRetirada = getDataHoraBrasilia();
  let dataDevolucao = null;
  if (dataDevolucaoInput) {
    dataDevolucao = new Date(dataDevolucaoInput);
  }

  const emprestimoData = {
    data_retirada: toISOLocalString(dataRetirada),
    data_devolucao: dataDevolucao ? toISOLocalString(dataDevolucao) : null,
    observacoes: observacoes,
    usuario: {
      id: parseInt(alunoId),
      nome: aluno.nome,
      sobrenome: aluno.sobrenome,
      turma: aluno.turma,
      username: aluno.username,
      senha: aluno.senha,
      tipoUsuario: aluno.tipoUsuario,
    },
    ferramenta: {
      id: parseInt(ferramentaId),
      nome: ferramenta.nome,
      marca: ferramenta.marca,
      modelo: ferramenta.modelo,
      qrcode: ferramenta.qrcode,
      estado: ferramenta.estado,
      disponibilidade: ferramenta.disponibilidade,
      descricao: ferramenta.descricao,
      id_local: ferramenta.id_local,
    },
  };

  console.log("Dados enviados:", emprestimoData);

  try {
    btnRegistrar.disabled = true;
    btnRegistrar.innerHTML =
      '<i class="fas fa-spinner spinner"></i> Registrando...';

    const response = await fetch(API_EMPRESTIMOS, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(emprestimoData),
    });

    if (!response.ok) await handleResponseError(response);

    const result = await response.json();
    console.log("Empréstimo registrado com sucesso:", result);

    showFeedback(
      "success",
      `Empréstimo registrado com sucesso! ID: ${result.id}`
    );

    alunoSelect.value = "";
    ferramentaSelect.value = "";
    document.getElementById("turma").value = "";
    document.getElementById("localizacao").value = "";
    document.getElementById("observacoes").value = "";

    const devolucao = getDataHoraBrasilia();
    devolucao.setDate(devolucao.getDate() + 7);
    document.getElementById("data-devolucao").value = toISOLocal(devolucao);
  } catch (error) {
    console.error("Erro ao registrar empréstimo:", error);
    if (!error.message.includes("Token") && !error.message.includes("401/403")) {
      showFeedback(
        "error",
        `Erro: ${error.message || "Falha ao registrar empréstimo"}`
      );
    }
  } finally {
    btnRegistrar.disabled = false;
    btnRegistrar.innerHTML =
      '<i class="fas fa-check"></i> Registrar Empréstimo';
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const professorNome = "Administrador";
  professorNameEl.textContent = professorNome;
  professorDisplayEl.textContent = professorNome;

  const iniciais = gerarIniciais(professorNome);
  userAvatar.textContent = iniciais;

  const agoraBrasilia = getDataHoraBrasilia();
  document.getElementById("data-retirada").value =
    formatarDataBrasilia(agoraBrasilia);
  document.getElementById("data-registro").textContent =
    formatarDataBrasilia(agoraBrasilia);

  const devolucao = getDataHoraBrasilia();
  devolucao.setDate(devolucao.getDate() + 7);
  document.getElementById("data-devolucao").value = toISOLocal(devolucao);

  try {
    await carregarLocais();
    await carregarAlunos();
    await carregarFerramentas();
  } catch (error) {
    console.error("Erro na inicialização:", error);
    if (!error.message.includes("Token") && !error.message.includes("401/403")) {
      showFeedback("error", "Erro ao carregar dados iniciais");
    }
  }

  btnRegistrar.addEventListener("click", registrarEmprestimo);

  btnCancelar.addEventListener("click", function () {
    if (
      confirm("Deseja realmente cancelar? Todas as alterações serão perdidas.")
    ) {
      window.location.href = "Emprestimos.html";
    }
  });

  console.log(
    "Hora local (São Carlos/Brasília):",
    formatarDataBrasilia(getDataHoraBrasilia())
  );
  console.log("Hora atual (objeto Date):", getDataHoraBrasilia().toString());
});

function navigate(page) {
  window.location.href = `${page}.html`;
}

function logout() {
  if (confirm("Deseja realmente sair do sistema?")) {
    localStorage.removeItem("authToken");
    window.location.href = "Menu.html";
  }
}