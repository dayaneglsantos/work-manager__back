# Work Manager — Contexto do projeto

## Visão geral

O Work Manager é um sistema interno de gestão de trabalho e funcionários.

O domínio inclui:

- autenticação e recuperação de senha;
- usuários e situação do vínculo;
- perfis e permissões;
- departamentos e supervisão;
- tarefas, subtarefas e dependências;
- tags, comentários, menções e histórico.

O projeto tem finalidade prática e educacional. Ao propor implementações,
explique decisões técnicas, alternativas e consequências.

## Organização dos repositórios

O Work Manager está dividido em dois repositórios Git independentes:

- `work-manager__back`: API e banco de dados;
- `work-manager__front`: interface web.

Os repositórios são irmãos dentro da pasta `work-manager`.

Uma funcionalidade pode exigir investigação e alterações nos dois projetos.
Antes de implementar uma mudança transversal:

1. Inspecione o contrato existente no back e no front.
2. Explique quais repositórios e arquivos serão afetados.
3. Obtenha autorização antes de modificar cada projeto.
4. Mantenha tipos, payloads, respostas e regras de validação sincronizados.
5. Execute `git status` separadamente em cada repositório.
6. Preserve alterações preexistentes da usuária em ambos os projetos.

A autorização para alterar um repositório não implica automaticamente
autorização para alterar o outro.

## Documentação funcional

A documentação funcional está no Notion, na base:

`Documentação de Funcionalidades — Work Manager`

Cada página deve documentar somente sua própria funcionalidade. Evite colocar
detalhes de Usuários na documentação de Autenticação, por exemplo.

Antes de atualizar uma página:

1. Localize a página dentro da base correta.
2. Leia o conteúdo atual.
3. Apresente a atualização proposta.
4. Aguarde autorização.
5. Faça alterações localizadas e preserve o restante.
6. Confira o conteúdo depois da atualização.

## Contratos e regras de negócio

- O schema do Prisma é a principal referência para o modelo persistido.
- Mudanças no modelo devem considerar schema, migrations, seed, controllers,
  validações, tipos do front e documentação da funcionalidade correspondente.
- Regras de negócio importantes devem ser protegidas no backend, mesmo quando
  o frontend também possui validação.
- O frontend não deve ser considerado uma barreira de segurança.
- Não invente endpoints, campos ou comportamentos sem conferir o código atual.
- Diferencie claramente comportamento implementado, planejado e documentado.

## Backend

O backend utiliza:

- Node.js e TypeScript;
- Express;
- Prisma;
- MySQL;
- JWT e bcrypt;
- Docker Compose para aplicação e banco.

Diretórios principais:

- `src/controllers`: entrada e saída HTTP;
- `src/services`: regras reutilizáveis e integração de dados;
- `src/middlewares`: autenticação, validação e tratamento de erros;
- `src/routes`: definição das rotas;
- `prisma/schema.prisma`: modelo de dados;
- `prisma/migrations`: histórico do banco;
- `prisma/seed.ts`: dados locais de desenvolvimento.

A API utiliza normalmente a porta `3000`.

Antes de executar migrations, reset ou seed:

1. Confirme host, porta e nome do banco sem exibir credenciais.
2. Explique se o comando modifica ou apaga dados.
3. Solicite autorização específica.
4. Diferencie o Prisma Client do host e o existente dentro do container.

Não altere migrations já aplicadas sem confirmar se o ambiente possui dados
reais ou compartilhados.
