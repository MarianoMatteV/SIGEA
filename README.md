# Atividade de técnico - SIGEAS
## Nesta atividade de técnico, realizada em dupla (Matheus Sarconi e Mariano Matte), foi proposto o desenvolvimento de um sistema de gestão de aulas.

Tabela de conteúdos

=================

<!--ts-->
   * [Sobre](#sobre)
   * [Pré-requisitos](#pre-requisitos)
   * [Instalação](#instalacao)
   * [Como usar](#como-usar)
   * [Testando as API](#testando-api)
   * [Tecnologias utilizadas](#tecnologias)
   * [Desafios encontrados](#desafios-encontrados)
   * [Conclusões](#conclusoes)
<!--te-->


### Sobre

Este projeto foi feito para a atividade de técnico, onde foi solicitado criar um sistema de gestão de aulas funcional e responsivo, com página de login, de administrador, de aluno e de professor, como forma de medir nosso nível atual. Para fazer a base e o layout do site foram utilizados o HTML, JS e CSS, para a parte do banco de dados foi utilizado o MySQL Workbench, e no backend foi utilizado o CRUD API para tornar o site funcional.


### Pré-requisitos

- Certifique-se de ter instalado em seu computador o MySQL Workbench, [Node.js](https://nodejs.org/en/), [VSCode](https://code.visualstudio.com/) e Git Bash.

### Instalação (Node JS)

```bash
# Clone este repositório
$ git clone <https://github.com/MarianoMatteV/SIGEA.git>

# Acesse a pasta do projeto no terminal/cmd
$ cd SIGEA

# Vá para a pasta do backend
$ cd backend

# Instale as dependências
$ npm i express mysql2 cors nodemon dotenv

# Execute a aplicação
$ npm start


```

### Como usar

#### MySQL
- Abra o MySQL e selecione o workbench, use a senha "root" para acessá-la.

- Copie o código do arquivo MySQL presente no arquivo do VScode, cole no workbench do MySQL e certifique-se de salvar para testar o código, utilizando "ctrl + enter" em todo ele, ou selecionando todo código e clicando no ícone do raio.

### Testando as API

- Para testar as API, certifique-se de que esteja instalado no computador o thunder client (Caso não tenha instalado o thunder client, clique na opção extensões, no VScode, e pesquise por thunder client, então é só instalar).

- Abra o Thunder client no Visual code.

- Clique na opção New request.

- Selecione o método a ser utilizado.

- Adicione a URL aonde se pede.

- Clique na opção "Body", abaixo de onde é inserido a URL, e teste de acordo com os exemplos mostrados abaixo.

- Após isso, clique na opção "Send" (certifique-se de que o npm esteja rodando. Caso não esteja, utilize o "npm start").


### Tecnologias utilizadas

As seguintes ferramentas foram usadas na construção do projeto:

- [Node.js](https://nodejs.org/en/)
- [VSCode](https://code.visualstudio.com/) - Plataforma utilizada para desenvolver o frontend e o backend do site. No frontend foi utilizado HTML, CSS e JS, já no backend foi utilizado o CRUD API, para o desenvolvimento das rotas, e o JS.
- [MySQL Workbench](https://https://www.mysql.com/) - Plataforma utilizada para desenvolver o banco de dados do projeto.
- Bibliotecas utilizadas: Nodemon, mysql2, express, cors e dotenv.


### Desafios encontrados

Ao decorrer do desenvolvimento desse projeto, foram encontradas alguns desafios, sendo o maior deles a página de administrador, pois muitas tabelas estão relacionadas através do foreign key, dificultando fazer com que o insert através da página de ADM funcionasse, além de ser necessário realizar essa parte primeiro para depois realizar a página dos professores e dos alunos. Antes, o maior desafio encontrado foi o curto prazo para realizar as atividades, pois era um sistema complexo, que tinha diversas funcionalidades, sendo difícil realizar um projeto como esse em um curto período de tempo, porém o professor Iuri estendeu o prazo, tornando possível concluir o site sem muitos problemas.


### Conclusões

O desenvolvimento do SIGEAS proporcionou uma experiência prática completa, envolvendo desde a construção do banco de dados até a implementação do frontend e backend. Apesar das dificuldades encontradas — principalmente na integração das tabelas do banco via foreign keys — foi possível estruturar um sistema funcional de gestão de aulas, com páginas específicas para administradores, professores e alunos.

Esse processo mostrou a importância do planejamento, da divisão de tarefas e do domínio de diferentes tecnologias para alcançar um resultado integrado. Por fim, o projeto reforçou que o trabalho em dupla favorece a troca de conhecimentos e a solução colaborativa de problemas, preparando-nos melhor para desafios futuros, tanto no mercado de trabalho, quanto em desenvolvimento de sistemas.
