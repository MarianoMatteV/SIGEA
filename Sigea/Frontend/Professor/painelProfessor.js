
// painelProfessor.js
// Função para abrir o pop-up de adicionar nota
function abrirPopupAdicionarNota(alunoId) {
    // Cria o pop-up
    const popup = document.createElement('div');
    popup.id = 'popupNota';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.background = '#fff';
    popup.style.padding = '20px';
    popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    popup.style.zIndex = '1000';
    popup.innerHTML = `
        <h3>Adicionar Nota</h3>
        <label>Nota: <input type="number" id="notaInput" min="0" max="10" step="0.1"></label><br><br>
        <label>Faltou? <input type="checkbox" id="faltouCheckbox" value="sim"></label><br><br>
        <button id="salvarNotaBtn">Salvar</button>
        <button id="fecharPopupBtn">Fechar</button>
    `;
    document.body.appendChild(popup);

    // Botão fechar
    document.getElementById('fecharPopupBtn').onclick = function() {
        popup.remove();
    };

    // Botão salvar
    document.getElementById('salvarNotaBtn').onclick = function() {
        const nota = document.getElementById('notaInput').value;
        const faltou = document.getElementById('faltouCheckbox').checked ? document.getElementById('faltouCheckbox').value : 'nao';
        salvarNotaNoBanco(alunoId, nota, faltou);
        popup.remove();
    };
}

// Função para enviar nota e falta para o backend
function salvarNotaNoBanco(alunoId, nota, faltou, materiaId = null, turmaId = null) {
    // Envia também materiaId e turmaId se disponíveis
    fetch('http://localhost:3001/adicionar-nota', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ alunoId, nota, faltou, materiaId, turmaId })
    })
    .then(response => response.json())
    .then(data => {
        alert('Nota salva com sucesso!');
    })
    .catch(error => {
        alert('Erro ao salvar nota.');
        console.error(error);
    });
}

// Exemplo de como adicionar o botão na lista de alunos
function adicionarBotaoNotaParaAlunos() {
    // Supondo que existe uma lista de alunos com id 'listaAlunos'
    const lista = document.getElementById('listaAlunos');
    if (!lista) return;
    lista.querySelectorAll('.aluno').forEach(aluno => {
        const alunoId = aluno.getAttribute('data-id');
        const btn = document.createElement('button');
        btn.textContent = 'Adicionar Nota';
        btn.onclick = () => abrirPopupAdicionarNota(alunoId);
        aluno.appendChild(btn);
    });
}

// Chame essa função após carregar a lista de alunos
// adicionarBotaoNotaParaAlunos();

// Registrar chamada (só atribui evento se o formulário existir)
function atribuirEventoChamada() {
    const formChamada = document.getElementById('formChamada');
    if (!formChamada) return;
    formChamada.onsubmit = async function (event) {
        event.preventDefault();
        const presentes = Array.from(document.querySelectorAll('input[name="presente"]')).map(cb => ({
            alunoId: cb.dataset.id,
            presente: cb.checked ? 'SIM' : 'NAO'
        }));
        for (const aluno of presentes) {
            await fetch('http://localhost:3001/chamadaAlunos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aluno)
            });
        }
        alert('Chamada registrada!');
    };
}
// Chame atribuirEventoChamada() após renderizar o formulário

// Registrar notas (só atribui evento se o formulário existir)
function atribuirEventoNotas() {
    const formNotas = document.getElementById('formNotas');
    if (!formNotas) return;
    formNotas.onsubmit = async function (event) {
        event.preventDefault();
        const linhas = document.querySelectorAll('#formNotas tr.aluno');
        for (const linha of linhas) {
            const alunoId = linha.getAttribute('data-id');
            const nota = parseFloat(linha.querySelector('input[name="nota"]').value) || 0;
            const faltou = linha.querySelector('input[name="faltou"]')?.checked ? 'sim' : 'nao';
            const materiaId = linha.getAttribute('data-materia-id') || null;
            const turmaId = linha.getAttribute('data-turma-id') || null;
            await salvarNotaNoBanco(alunoId, nota, faltou, materiaId, turmaId);
        }
        alert('Notas lançadas!');
    };
}
// Chame atribuirEventoNotas() após renderizar o formulário