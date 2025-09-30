CREATE DATABASE sigeas;
USE sigeas;

-- Tabela de turmas
CREATE TABLE turma (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nomeTurma VARCHAR(255) NOT NULL
);

-- Tabela de usuários genérica
CREATE TABLE usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    status enum('aluno', 'administrador', 'professor')
);

-- Tabela de matérias
CREATE TABLE materia (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nomeMateria VARCHAR(255) NOT NULL
);

-- Tabela de alunos
CREATE TABLE aluno (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    turma_id INT NOT NULL,
    materia_id INT NOT NULL,
    notaPrimeiroTrimestre INT,
    notaSegundoTrimestre INT,
    notaTerceiroTrimestre INT,
    compareceu VARCHAR(3), -- Ex: 'SIM' ou 'NAO'
    faltas INT,
    presenca INT,
    media INT,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (turma_id) REFERENCES turma(id),
    FOREIGN KEY (materia_id) REFERENCES materia(id)
);

-- Tabela de professores
CREATE TABLE prof (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    turma_id INT NOT NULL,
    materia_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (turma_id) REFERENCES turma(id),
    FOREIGN KEY (materia_id) REFERENCES materia(id)
);

-- Tabela de administradores
CREATE TABLE adm (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);


INSERT INTO usuario (cpf, nome, senha, status) VALUES ('05263894007', 'a', '123', 'aluno');
INSERT INTO materia (nomeMateria) VALUES
('Química'),
('Matemática'),
('Geografia'),
('Projeto de Vida'),
('Técnico'),
('Ed. Física'),
('Artes'),
('Biologia'),
('Inglês'),
('Sociologia/Filosofia'),
('Português'),
('História'),
('PP'),
('Física');

select * from turma;
select * from usuario;
select * from prof;
select * from materia;
select * from aluno;
drop database sigeas;