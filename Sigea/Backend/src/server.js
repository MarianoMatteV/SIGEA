const express = require('express');
const cors = require('cors');
//definir a porta
const porta = 3001;
const app = express();
//habilitar o cors e utilizar json
app.use(cors());
app.use(express.json());
//testar
app.listen(porta, () => console.log(`Servidor rodando na porta ${porta}`));

const connection = require('./db_config');

// LOGIN

app.post('/usuario/login', (request, response) => {
    let params = Array(
        request.body.cpf
    );
    let query = "SELECT id,cpf,nome,senha,status FROM usuario WHERE cpf = ?";

    connection.query(query, params, (err, results) => {
        if(results.length > 0) {
            let senhaDigitada = request.body.senha
            let senhaBanco = results[0].senha

            if (senhaBanco === senhaDigitada) {

                response
                .status(201)
                .json({
                  success: true,
                  message: "Sucesso",
                  data: results[0]
                })
            } else {
                response
                    .status(400)
                    .json({
                    success: false,
                    message: "Verifique sua senha!",
                    data: err
                })
            }

        } else {
            response
            .status(400)
            .json({
                success: false,
                message: "Usuário não cadastrado",
                data: err
            })
        }

    })
})


// ADD TURMA
app.post('/adm/addTurma', (request, response) => {
    let params = Array(
        request.body.nomeTurma
    );
    let query = "INSERT INTO turma (nomeTurma) VALUES (?)";
    connection.query(query, params, (err, results) => {
        if(err) {
            response
            .status(400)
            .json({
                success: false,
                message: "Erro ao cadastrar turma",
                data: err
            })
        } else {
            response
            .status(201)
            .json({
                success: true,
                message: "Turma cadastrada com sucesso",
                data: results
            })
        }
    })
})
// EXCLUIR TURMA
app.delete('/adm/excluirTurma', (request, response) => {
    let params = [request.body.idTurma];
    let query = "DELETE FROM turma WHERE id = ?";
    connection.query(query, params, (err, results) => {
        if (err) {
            response.status(500).json({ success: false, message: "Erro ao excluir turma", data: err });
        } else {
            response.json({ success: true, message: "Turma excluída com sucesso" });
        }
    });
});

// LISTAR TURMAS
app.get('/listar/turmas', (req, res) => {
    const query = "SELECT * FROM turma";
    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Erro ao buscar turmas", data: err });
        }
        res.json(results);
    });
});

// LISTAR TURMAS DO PROFESSOR
app.get('/listar/turmas/professor/:id', (req, res) => {
    const { id } = req.params;
    console.log(`Buscando turmas para o professor ID: ${id}`);
    
    const query = `
        SELECT DISTINCT t.id, t.nomeTurma
        FROM turma t
        INNER JOIN prof p ON t.id = p.turma_id
        WHERE p.usuario_id = ?
    `;
    
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error("Erro ao buscar turmas do professor:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Erro ao buscar turmas do professor", 
                data: err 
            });
        }
        
        console.log(`Turmas encontradas para professor ${id}:`, results);
        res.json(results);
    });
});
//LISTAR MATERIAS
app.get('/listar/materias', (req, res) => {
    const query = "SELECT * FROM materia";
    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Erro ao buscar materias", data: err });
        }
        res.json(results);
    });
});

// --- ROTAS DE ALUNO PARA O ADM ---
// (Mantive igual ao seu, não repeti aqui pra não ficar gigante, já estavam corretas)

// --- ROTAS DE PROFESSOR PARA O ADM ---
// (Mantive igual ao seu também, já estavam corretas)

// ROTAS DE PROFESSOR

// ROTA PARA ADICIONAR NOTA E PRESENÇA DO ALUNO
app.post('/adicionar-nota', (req, res) => {
    const { alunoId, nota, faltou, materiaId, turmaId } = req.body;
    if (!alunoId || nota === undefined || faltou === undefined) {
        return res.status(400).json({ success: false, message: 'Dados insuficientes.' });
    }
    const compareceu = faltou === 'sim' ? 'NAO' : 'SIM';
    if (materiaId && turmaId) {
        const query = 'UPDATE aluno SET nota = ?, compareceu = ? WHERE usuario_id = ? AND materia_id = ? AND turma_id = ?';
        connection.query(query, [nota, compareceu, alunoId, materiaId, turmaId], (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Erro ao atualizar nota.', data: err });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Registro de aluno não encontrado.' });
            }
            res.json({ success: true, message: 'Nota atualizada com sucesso!' });
        });
    } else {
        const query = 'UPDATE aluno SET nota = ?, compareceu = ? WHERE usuario_id = ?';
        connection.query(query, [nota, compareceu, alunoId], (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Erro ao atualizar nota.', data: err });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Registro de aluno não encontrado.' });
            }
            res.json({ success: true, message: 'Nota atualizada com sucesso!' });
        });
    }
});

// LISTAR ALUNOS DE UMA TURMA ESPECÍFICA (PARA O PROFESSOR)
app.get('/listar/alunos/turma/:turmaId', (req, res) => {
    const { turmaId } = req.params;
    
    const query = `
        SELECT 
            a.usuario_id,
            u.nome,
            MAX(a.notaPrimeiroTrimestre) as nota1,
            MAX(a.notaSegundoTrimestre) as nota2,
            MAX(a.notaTerceiroTrimestre) as nota3,
            MAX(a.compareceu) as compareceu,
            MAX(a.presenca) as presenca,
            MAX(a.faltas) as faltas,
            MAX(a.media) as media
        FROM aluno a
        INNER JOIN usuario u ON a.usuario_id = u.id
        WHERE a.turma_id = ?
        GROUP BY a.usuario_id, u.nome
        ORDER BY u.nome
    `;
    
    connection.query(query, [turmaId], (err, results) => {
        if (err) {
            console.error("Erro ao buscar alunos da turma:", err);
            return res.status(500).json({ success: false, message: "Erro ao buscar alunos da turma", data: err });
        }
        
        res.json(results);
    });
});

// ROTA PARA BUSCAR DETALHES ESPECÍFICOS DE UM ALUNO EM UMA TURMA
app.get('/aluno-detalhes/:alunoId/:turmaId', (req, res) => {
    const { alunoId, turmaId } = req.params;
    
    const query = `
        SELECT 
            u.nome,
            a.nota,
            a.compareceu,
            a.presenca,
            a.faltas,
            a.media,
            t.nomeTurma,
            m.nomeMateria
        FROM aluno a
        INNER JOIN usuario u ON a.usuario_id = u.id
        INNER JOIN turma t ON a.turma_id = t.id
        INNER JOIN materia m ON a.materia_id = m.id
        WHERE a.usuario_id = ? AND a.turma_id = ?
    `;
    
    connection.query(query, [alunoId, turmaId], (err, results) => {
        if (err) {
            console.error("Erro ao buscar detalhes do aluno:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Erro ao buscar detalhes do aluno", 
                data: err 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Aluno não encontrado" 
            });
        }
        
        res.json({ success: true, data: results[0] });
    });
});


// NOVA ROTA PARA ATUALIZAR NOTAS/PRESENÇA (usada no painelProfessor.js)
app.put('/atualizar-aluno-dados', (req, res) => {
    const { alunoId, turmaId, nota1, nota2, nota3, media, compareceu } = req.body;

    if (!alunoId || !turmaId) {
        return res.status(400).json({ success: false, message: "ID do aluno ou turma não informado." });
    }

    const query = `
        UPDATE aluno
        SET notaPrimeiroTrimestre = ?, 
            notaSegundoTrimestre = ?, 
            notaTerceiroTrimestre = ?, 
            media = ?, 
            compareceu = ?
        WHERE usuario_id = ? AND turma_id = ?
    `;

    connection.query(query, [nota1, nota2, nota3, media, compareceu, alunoId, turmaId], (err, result) => {
        if (err) {
            console.error("Erro ao atualizar aluno:", err);
            return res.status(500).json({ success: false, message: "Erro ao atualizar aluno", data: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Aluno não encontrado" });
        }

        res.json({ success: true, message: "Dados do aluno atualizados com sucesso!" });
    });
});

// GET ALUNO (STUDENT-FACING) - ROTA CORRETA
app.get("/listar/aluno/:idUsuario", (req, res) => {
    const { idUsuario } = req.params;

    const sql = `
      SELECT
          u_aluno.nome AS nomeAluno,
          t.nomeTurma,
          m.nomeMateria AS disciplina,
          a.notaPrimeiroTrimestre,
          a.notaSegundoTrimestre,
          a.notaTerceiroTrimestre,
          a.presenca,
          a.faltas,
          a.media,
          u_prof.nome AS nomeProfessor
      FROM aluno a
      INNER JOIN usuario u_aluno ON a.usuario_id = u_aluno.id
      INNER JOIN turma t ON a.turma_id = t.id
      INNER JOIN materia m ON a.materia_id = m.id
      LEFT JOIN prof p ON a.materia_id = p.materia_id AND a.turma_id = p.turma_id
      LEFT JOIN usuario u_prof ON p.usuario_id = u_prof.id
      WHERE u_aluno.id = ?;
    `;

    connection.query(sql, [idUsuario], (err, results) => {
        if (err) {
            console.error("Erro ao buscar aluno:", err);
            return res.status(500).json({ erro: "Erro no servidor ao buscar dados do aluno." });
        }

        if (results.length === 0) {
            return res.status(404).json({ erro: "Aluno não encontrado" });
        }

        const aluno = {
            nome: results[0].nomeAluno,
            turma: results[0].nomeTurma,
            presencas: results.map(r => ({
                disciplina: r.disciplina,
                presencas: r.presenca,
                faltas: r.faltas,
                professor: r.nomeProfessor || 'Não atribuído'
            })),
            notas: results.map(r => ({
                disciplina: r.disciplina,
                n1: r.notaPrimeiroTrimestre,
                n2: r.notaSegundoTrimestre,
                n3: r.notaTerceiroTrimestre,
                media: r.media,
                professor: r.nomeProfessor || 'Não atribuído'
            }))
        };

        res.json(aluno);
    });
});