const API_URL = "http://localhost:3001";

// --- Funções de Toggle e Cancelamento de Popups ---

function togglePopup(popupId, show) {
    const popUp = document.getElementById(popupId);
    if (popUp) {
        popUp.style.display = show ? 'block' : 'none';
    }
}

function popUpTurma(event) {
    event.preventDefault();
    togglePopup("popUpAddTurma", true);
}

// Abertura imediata do popup
function popUpProf(event) {
    event.preventDefault();
    togglePopup("popUpAddProf", true);
    // As opções são preenchidas de forma assíncrona sem travar a exibição
    preencherOpcoes('ListaTurmasProf', 'listar/turmas', 'turma');
    preencherOpcoes('ListaMateriasProf', 'listar/materias', 'materia');
}

// Garante que tanto as turmas quanto as matérias estão carregadas ao abrir o popup
async function popUpAluno(event) {
    event.preventDefault();
    togglePopup("popUpAddAluno", true);
    // Carrega/Recarrega tanto as turmas quanto as matérias
    await preencherSelect('selectTurmaAluno', 'listar/turmas');
    await preencherOpcoes('ListaMateriasAluno', 'listar/materias', 'materia');
}

function cancelAdd() {
    togglePopup("popUpAddTurma", false);
    togglePopup("popUpAddProf", false);
    togglePopup("popUpAddAluno", false);
    togglePopup("popUpEditarProf", false);
    togglePopup("popUpEditarAluno", false);
}

// --- Funções de Adição (CREATE) ---

async function addTurma(event) {
    event.preventDefault();
    const nomeTurma = document.getElementById("nomeTurma").value;
    if (!nomeTurma) {
        alert("Por favor, insira o nome da turma.");
        return;
    }
    try {
        const response = await fetch(`${API_URL}/adm/addTurma`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nomeTurma })
        });
        const result = await response.json();
        alert(result.message);
        if (result.success) {
            window.location.reload();
        }
    } catch (err) {
        console.error("Erro ao adicionar turma:", err);
        alert("Erro ao salvar turma.");
    }
}

async function addProf(event) {
    event.preventDefault();
    const data = {
        nomeProf: document.getElementById("nomeProf").value,
        cpfProf: document.getElementById("cpfProf").value,
        senhaProf: document.getElementById("senhaProf").value,
        turmaIds: getSelectedCheckboxValues('ListaTurmasProf'),
        materiaIds: getSelectedCheckboxValues('ListaMateriasProf')
    };

    if (!data.nomeProf || !data.cpfProf || !data.senhaProf || data.turmaIds.length === 0 || data.materiaIds.length === 0) {
        alert("Todos os campos, incluindo turmas e matérias, são obrigatórios.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/adm/addProfs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        alert(result.message);
        if (result.success) {
            window.location.reload();
        }
    } catch (error) {
        console.error("Erro ao adicionar professor:", error);
        alert("Ocorreu um erro ao adicionar o professor.");
    }
}

// Converte IDs para números antes de enviar
async function addAluno(event) {
    event.preventDefault();

    const turmaIdValue = document.getElementById("selectTurmaAluno").value;
    const materiaIdsValues = getSelectedCheckboxValues('ListaMateriasAluno');

    if (!document.getElementById("nomeAluno").value || !document.getElementById("cpfAluno").value || !document.getElementById("senhaAluno").value || !turmaIdValue || materiaIdsValues.length === 0) {
        alert("Todos os campos, incluindo turma e pelo menos uma matéria, são obrigatórios.");
        return;
    }
    
    const data = {
        nomeAluno: document.getElementById("nomeAluno").value,
        cpfAluno: document.getElementById("cpfAluno").value,
        senhaAluno: document.getElementById("senhaAluno").value,
        // Garante que os IDs são enviados como números
        turmaId: parseInt(turmaIdValue, 10),
        materiaIds: materiaIdsValues.map(id => parseInt(id, 10))
    };

    try {
        const response = await fetch(`${API_URL}/adm/addAluno`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        alert(result.message);
        if (result.success) {
            window.location.reload();
        }
    } catch (err) {
        console.error("Erro ao adicionar aluno:", err);
        alert("Erro ao cadastrar aluno.");
    }
}


// --- Funções de Exclusão (DELETE) ---

async function excluir(id, tipo, nome) {
    if (!confirm(`Tem certeza que deseja excluir ${tipo} ${nome}?`)) return;
    const endpoint = tipo === 'o professor' ? 'excluirProf' : tipo === 'o aluno' ? 'excluirAluno' : 'excluirTurma';
    const idKey = tipo === 'a turma' ? 'idTurma' : 'idUsuario';

    try {
        const response = await fetch(`${API_URL}/adm/${endpoint}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [idKey]: id })
        });
        const result = await response.json();
        alert(result.message);
        if (result.success) {
            const trId = `${tipo.replace(/\s+/g, '-')}-${id}`.replace('a-turma', 'a-turma');
            const elementToRemove = document.getElementById(trId);
            if(elementToRemove) elementToRemove.remove();
            else window.location.reload();
        }
    } catch (error) {
        console.error(`Erro ao excluir ${tipo}:`, error);
        alert(`Erro ao excluir ${tipo}.`);
    }
}

// --- Funções de Edição (UPDATE) ---

async function abrirPopupEditarProf(id) {
    togglePopup("popUpEditarProf", true);
    document.getElementById('idProfEditar').value = id;

    const turmasPromise = preencherOpcoes('ListaTurmasProfEditar', 'listar/turmas', 'turma');
    const materiasPromise = preencherOpcoes('ListaMateriasProfEditar', 'listar/materias', 'materia');
    const profPromise = fetch(`${API_URL}/listar/professor/${id}`).then(res => res.json());

    const [, , profRes] = await Promise.all([turmasPromise, materiasPromise, profPromise]);

    if (profRes.success) {
        const { nome, cpf, turmaIds, materiaIds } = profRes.data;
        document.getElementById('nomeProfEditar').value = nome;
        document.getElementById('cpfProfEditar').value = cpf;
        document.getElementById('senhaProfEditar').value = '';

        turmaIds.forEach(id => {
            const checkbox = document.querySelector(`#ListaTurmasProfEditar input[value='${id}']`);
            if (checkbox) checkbox.checked = true;
        });
        materiaIds.forEach(id => {
            const checkbox = document.querySelector(`#ListaMateriasProfEditar input[value='${id}']`);
            if (checkbox) checkbox.checked = true;
        });
    } else {
        alert(profRes.message);
        cancelAdd();
    }
}

async function editarProf(event) {
    event.preventDefault();
    const data = {
        idUsuario: document.getElementById("idProfEditar").value,
        nomeProf: document.getElementById("nomeProfEditar").value,
        cpfProf: document.getElementById("cpfProfEditar").value,
        senhaProf: document.getElementById("senhaProfEditar").value,
        turmaIds: getSelectedCheckboxValues('ListaTurmasProfEditar'),
        materiaIds: getSelectedCheckboxValues('ListaMateriasProfEditar')
    };

    if (!data.nomeProf || !data.cpfProf) {
        alert("Nome e CPF são obrigatórios.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/adm/editarProf`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        alert(result.message);
        if (result.success) {
            window.location.reload();
        }
    } catch (error) {
        console.error("Erro ao editar professor:", error);
        alert("Ocorreu um erro ao editar o professor.");
    }
}

async function abrirPopupEditarAluno(id) {
    togglePopup("popUpEditarAluno", true);
    document.getElementById('idAlunoEditar').value = id;

    await preencherSelect('selectTurmaAlunoEditar', 'listar/turmas');
    await preencherOpcoes('ListaMateriasAlunoEditar', 'listar/materias', 'materia');

    const res = await fetch(`${API_URL}/listar/aluno/dados-edicao/${id}`);
    const alunoRes = await res.json();

    if (alunoRes.success) {
        const { nome, cpf, turmaId, materiaIds } = alunoRes.data;
        document.getElementById('nomeAlunoEditar').value = nome;
        document.getElementById('cpfAlunoEditar').value = cpf;
        document.getElementById('senhaAlunoEditar').value = '';
        document.getElementById('selectTurmaAlunoEditar').value = turmaId;

        materiaIds.forEach(id => {
            const checkbox = document.querySelector(`#ListaMateriasAlunoEditar input[value='${id}']`);
            if (checkbox) checkbox.checked = true;
        });
    } else {
        alert(alunoRes.message);
        cancelAdd();
    }
}

async function salvarEdicaoAluno(event) {
    event.preventDefault();
    const data = {
        idUsuario: document.getElementById("idAlunoEditar").value,
        nomeAluno: document.getElementById("nomeAlunoEditar").value,
        cpfAluno: document.getElementById("cpfAlunoEditar").value,
        senhaAluno: document.getElementById("senhaAlunoEditar").value,
        turmaId: document.getElementById("selectTurmaAlunoEditar").value,
        materiaIds: getSelectedCheckboxValues('ListaMateriasAlunoEditar')
    };

    if (!data.nomeAluno || !data.cpfAluno || !data.turmaId || data.materiaIds.length === 0) {
        alert("Nome, CPF, Turma e ao menos uma Matéria são obrigatórios.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/adm/editarAluno`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        alert(result.message);
        if (result.success) {
            window.location.reload();
        }
    } catch (error) {
        console.error("Erro ao editar aluno:", error);
        alert("Ocorreu um erro ao editar o aluno.");
    }
}

// --- Funções de Detalhes (READ) ---

// Popup de detalhes do aluno simplificado
async function mostrarDetalhes(id, tipo) {
    const res = await fetch(`${API_URL}/listar/${tipo}/detalhes/${id}`);
    const result = await res.json();
    if (!result.success) {
        alert(result.message);
        return;
    }
    const data = result.data;
    let detailsHtml = '';

    if (tipo === 'aluno') {
        detailsHtml = `<h2>Detalhes do Aluno</h2>
           <p><strong>Nome:</strong> ${data.nome}</p>
           <p><strong>CPF:</strong> ${data.cpf}</p>
           <p><strong>Turma:</strong> ${data.turma}</p>
           <h4>Matérias Matriculadas:</h4>
           ${data.materias.length > 0 ? `<ul>
           ${data.materias.map(m => `<li>${m.materia}</li>`).join('')}
           </ul>` : '<p>Nenhuma matéria matriculada.</p>'}`;
    } else { // para professor
        detailsHtml = `<h2>Detalhes do Professor</h2>
           <p><strong>Nome:</strong> ${data.nome}</p>
           <p><strong>Turmas:</strong> ${data.turmas.join(", ") || "Nenhuma"}</p>
           <p><strong>Matérias:</strong> ${data.materias.join(", ") || "Nenhuma"}</p>`;
    }

    criarPopupDetalhes(detailsHtml);
}

// --- Funções Auxiliares ---

function getSelectedCheckboxValues(containerId) {
    return [...document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`)].map(cb => cb.value);
}

async function preencherOpcoes(containerId, endpoint, tipo) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const res = await fetch(`${API_URL}/${endpoint}`);
        const data = await res.json();
        let html = `<h3>Selecione as ${tipo === 'turma' ? 'Turmas' : 'Matérias'}</h3>`;
        const containerDiv = document.createElement("div");
        containerDiv.className = "checkbox-group";

        data.forEach(item => {
            const id = item.id;
            const nome = tipo === 'turma' ? item.nomeTurma : item.nomeMateria;
            containerDiv.innerHTML += `
                <div class="checkbox-item">
                    <input type="checkbox" id="${containerId}-${tipo}${id}" value="${id}" name="${tipo}s">
                    <label for="${containerId}-${tipo}${id}">${nome}</label>
                </div>`;
        });
        container.innerHTML = html;
        container.appendChild(containerDiv);
    } catch (erro) {
        console.error(`Erro ao buscar ${tipo}s:`, erro);
        container.innerHTML = `<h3>Erro ao carregar ${tipo}s.</h3>`;
    }
}

async function preencherSelect(selectId, endpoint) {
    const select = document.getElementById(selectId);
    if (!select) return;
    try {
        const res = await fetch(`${API_URL}/${endpoint}`);
        const data = await res.json();
        select.innerHTML = '<option value="">Selecione uma turma</option>';
        data.forEach(turma => {
            select.innerHTML += `<option value="${turma.id}">${turma.nomeTurma}</option>`;
        });
    } catch (erro) {
        console.error("Erro ao preencher select:", erro);
        select.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

function criarPopupDetalhes(htmlContent) {
    const oldPopup = document.querySelector(".popup-detalhes");
    if (oldPopup) oldPopup.remove();

    const popup = document.createElement("div");
    popup.className = "popup-detalhes popup-aluno-detalhes";
    popup.innerHTML = `${htmlContent}<button>Fechar</button>`;
    document.body.appendChild(popup);
    popup.querySelector("button").addEventListener("click", () => popup.remove());
}


// --- Carregamento Inicial ---

document.addEventListener("DOMContentLoaded", async () => {

    // Carregar Turmas
    try {
        const res = await fetch(`${API_URL}/listar/turmas`);
        const turmas = await res.json();
        const tbody = document.querySelector("#turmas tbody");
        tbody.innerHTML = '';
        turmas.forEach(t => {
            const tr = document.createElement("tr");
            tr.id = `a-turma-${t.id}`;
            tr.innerHTML = `
                <td style="display:none;">${t.id}</td>
                <td>${t.nomeTurma}</td>
                <td><button class="excluirTurma" onclick="excluir(${t.id}, 'a turma', '${t.nomeTurma}')">Excluir</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (erro) { console.error("Erro ao carregar turmas:", erro); }

    // Carregar Professores
    try {
        const res = await fetch(`${API_URL}/listar/professores`);
        const professores = await res.json();
        const tbody = document.querySelector("#professores tbody");
        tbody.innerHTML = '';
        professores.forEach(p => {
            const tr = document.createElement("tr");
            tr.id = `o-professor-${p.id}`;
            tr.innerHTML = `
                <td style="display:none;">${p.id}</td>
                <td>${p.nome}</td>
                <td><button class="detalhes" onclick="mostrarDetalhes(${p.id}, 'professor')">Ver detalhes</button></td>
                <td>
                    <button class="editar" onclick="abrirPopupEditarProf(${p.id})">Editar</button>
                    <button class="excluirProf" onclick="excluir(${p.id}, 'o professor', '${p.nome}')">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (erro) { console.error("Erro ao carregar professores:", erro); }

    // Carregar Alunos
    try {
        const res = await fetch(`${API_URL}/listar/alunos`);
        const alunos = await res.json();
        const tbody = document.querySelector("#alunos #tabelaAlunos tbody");
        tbody.innerHTML = '';
        alunos.forEach(a => {
            const tr = document.createElement("tr");
            tr.id = `o-aluno-${a.id}`;
            tr.innerHTML = `
                <td style="display:none;">${a.id}</td>
                <td>${a.nome}</td>
                <td>${a.cpf}</td>
                <td>${a.nomeTurma || "Não definida"}</td>
                <td>
                    <button class="detalhes" onclick="mostrarDetalhes(${a.id}, 'aluno')">Detalhes</button>
                    <button class="editar" onclick="abrirPopupEditarAluno(${a.id})">Editar</button>
                    <button class="excluirAluno" onclick="excluir(${a.id}, 'o aluno', '${a.nome}')">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (erro) { console.error("Erro ao carregar alunos:", erro); }

    // Preencher selects iniciais
    preencherSelect('selectTurmaAluno', 'listar/turmas');
});