async function logar(event) {
    event.preventDefault();

    const cpf = document.getElementById('cpf').value;
    const nome = document.getElementById('nome').value;
    const senha = document.getElementById('senha').value;

    const data = { cpf, nome, senha };

    try {
        const response = await fetch('http://localhost:3001/usuario/login', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const results = await response.json();
        console.log("Resposta do login:", results);

        if (results.success) {
            // salva objeto completo
            localStorage.setItem('user', JSON.stringify(results.data));

            // salva também idUsuario separado (garantia)
            // ajuste o campo conforme vier do backend:
            // pode ser results.data.id ou results.data.usuario_id
            if (results.data.id) {
                localStorage.setItem('idUsuario', results.data.id);
            } else if (results.data.usuario_id) {
                localStorage.setItem('idUsuario', results.data.usuario_id);
            }

            switch (results.data.status) {
                case "administrador":
                    window.location.href = "../Adm/painelAdm.html";
                    break;
                case "aluno":
                    window.location.href = "../PagAlunos/painelAluno.html";
                    break;
                case "professor":
                    window.location.href = "../Professor/painelProfessor.html";
                    break;
                default:
                    alert("Status de usuário desconhecido!");
            }
        } else {
            alert(results.message);
        }
    } catch (erro) {
        console.error("Erro no login:", erro);
        alert("Erro ao tentar fazer login. Tente novamente.");
    }
}
