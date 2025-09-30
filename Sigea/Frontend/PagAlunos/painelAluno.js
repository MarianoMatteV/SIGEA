document.addEventListener("DOMContentLoaded", async () => {
    try {
      let idUsuario;
      
      // Tenta pegar o ID de várias formas (ordem de prioridade)
      
      // 1. Primeiro tenta da URL (mais confiável)
      const urlParams = new URLSearchParams(window.location.search);
      idUsuario = urlParams.get('id');
      
      // 2. Se não tiver na URL, tenta do sessionStorage (se disponível)
      if (!idUsuario && typeof sessionStorage !== 'undefined') {
          idUsuario = sessionStorage.getItem("idUsuario");
      }
      
      // 3. Se não tiver na URL nem no storage, tenta do localStorage (se disponível)
      if (!idUsuario && typeof localStorage !== 'undefined') {
          idUsuario = localStorage.getItem("idUsuario");
      }
      
      // Se ainda não encontrou o ID, mostra erro e redireciona
      if (!idUsuario) {
          alert('ID do usuário não encontrado. Redirecionando para login...');
          window.location.href = '/index.html';
          return;
      }

      console.log('Buscando dados do aluno ID:', idUsuario);

      const resposta = await fetch(`http://localhost:3001/listar/aluno/${idUsuario}`);
      
      if (!resposta.ok) {
        const errorData = await resposta.json();
        throw new Error(errorData.erro || `Erro HTTP: ${resposta.status}`);
      }
      
      const aluno = await resposta.json();
      console.log('Dados recebidos:', aluno);

      // Atualizar o nome do aluno no header
      document.querySelector("header p").textContent = `Bem-vindo, ${aluno.nome}`;

      // Atualizar o nome da classe na main section
      document.querySelector("#turma p").innerHTML =
        `Você está matriculado na turma <strong>${aluno.turma}</strong>.`;

      // --- Preencher a tabela de presença ---
      const tabelaPresencas = document.querySelector("#presencas table tbody");
      tabelaPresencas.innerHTML = ''; // Limpar conteúdo estático existente
      
      if (aluno.presencas && aluno.presencas.length > 0) {
        aluno.presencas.forEach(item => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${item.disciplina}</td>
            <td class="sucesso">${item.presencas || 0}</td>
            <td class="erro">${item.faltas || 0}</td>
            <td>${item.professor || 'Não atribuído'}</td>
          `;
          tabelaPresencas.appendChild(tr);
        });
      } else {
        tabelaPresencas.innerHTML = '<tr><td colspan="4">Nenhuma presença registrada</td></tr>';
      }
  
      // --- Preencher tabela de notas ---
      const tabelaNotas = document.querySelector("#notas table tbody");
      tabelaNotas.innerHTML = ''; // Limpar conteúdo estático existente
      
      if (aluno.notas && aluno.notas.length > 0) {
        aluno.notas.forEach(item => {
          let status = "sucesso";
          const media = parseFloat(item.media) || 0;
          if (media < 5) status = "erro";
          else if (media < 7) status = "aviso";
    
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${item.disciplina}</td>
            <td>${item.n1 !== null && item.n1 !== undefined ? item.n1 : '-'}</td>
            <td>${item.n2 !== null && item.n2 !== undefined ? item.n2 : '-'}</td>
            <td>${item.n3 !== null && item.n3 !== undefined ? item.n3 : '-'}</td>
            <td class="${status}">${media.toFixed(1)}</td>
            <td>${item.professor || 'Não atribuído'}</td>
          `;
          tabelaNotas.appendChild(tr);
        });
      } else {
        tabelaNotas.innerHTML = '<tr><td colspan="6">Nenhuma nota registrada</td></tr>';
      }
  
    } catch (erro) {
      console.error("Erro ao buscar dados:", erro);
      // Exibir uma mensagem de erro para o usuário na página
      const errorMsg = erro.message || "Não foi possível carregar seus dados. Tente novamente mais tarde.";
      document.querySelector("main").innerHTML = `<p class='erro'>${errorMsg}</p>`;
    }
});