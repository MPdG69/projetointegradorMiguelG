# Sistema de Gerenciamento de Personagens e Campanhas de RPG

## 1. Apresentação

Este projeto consiste em uma aplicação web desenvolvida para auxiliar na organização de sessões de RPG, permitindo o gerenciamento de usuários, personagens e campanhas.

O sistema possui funcionalidades para criação e edição de fichas de personagens, gerenciamento de campanhas, associação de personagens a campanhas por meio de convites e controle de permissões de usuários.

A aplicação utiliza uma arquitetura dividida entre o frontend, responsável pela interface e interação com o usuário, e o backend, responsável pelo processamento das requisições e pela comunicação com o banco de dados.

## 2. Tecnologias utilizadas

As principais tecnologias utilizadas no desenvolvimento são:

| Tecnologia | Aplicação no projeto |
|---|---|
| HTML5 | Estrutura das páginas e dos elementos da interface. |
| CSS3 | Estilização, organização visual e apresentação dos componentes. |
| JavaScript | Interatividade, manipulação dos dados e comunicação com o backend. |
| PHP | Processamento das requisições, validações e regras de negócio. |
| MySQL | Armazenamento persistente das informações do sistema. |
| PDO | Conexão entre o PHP e o banco de dados, utilizando consultas preparadas. |
| XAMPP | Ambiente local utilizado para executar o servidor Apache e o MySQL. |

## 3. Estrutura do projeto

A organização dos arquivos separa as páginas, os estilos, os scripts e os recursos responsáveis pelo processamento no servidor.

```text
projetointegradorMiguelG-main/
│
├── api/
│   ├── conexao.php
│   ├── cadastrar.php
│   ├── login.php
│   ├── verificar_sessao.php
│   ├── logout.php
│   ├── personagens_listar.php
│   ├── personagens_criar.php
│   ├── personagem_buscar.php
│   ├── personagem_salvar.php
│   ├── campanhas_listar.php
│   ├── campanhas_criar.php
│   ├── convite_buscar.php
│   ├── convite_personagens.php
│   ├── convite_entrar.php
│   ├── party_buscar.php
│   ├── usuarios_listar.php
│   └── usuario_permissao.php
│
├── css/
│   ├── index.css
│   └── ficha.css
│
├── js/
│   ├── index.js
│   ├── ficha.js
│   ├── utils.js
│   └── services/
│       └── diceService.js
│
├── obs/
│   ├── party-obs.html
│   └── portrait.html
│
├── index.html
├── ficha.html
├── party.html
├── dados.mp3
├── acra.png
└── README.md
```

A pasta `api` concentra os arquivos PHP que recebem e processam as requisições do frontend. A pasta `css` contém os estilos visuais, enquanto `js` reúne os scripts responsáveis pelas funcionalidades da aplicação.

A pasta `obs` contém páginas complementares para exibição de informações durante transmissões de RPG utilizando o OBS Studio.

## 4. Instalação e configuração

### 4.1. Requisitos

Para executar o projeto localmente, são necessários:

- XAMPP;
- Apache;
- MySQL;
- PHP com suporte a PDO e PDO MySQL;
- Navegador atualizado;
- phpMyAdmin para gerenciamento do banco de dados.

### 4.2. Configuração do servidor

1. Instale e execute o XAMPP.
2. Inicie os serviços Apache e MySQL.
3. Copie a pasta do projeto para o diretório `htdocs` do XAMPP.
4. Acesse o phpMyAdmin pelo navegador.
5. Crie um banco de dados chamado `rpg_db`.
6. Importe ou crie as tabelas necessárias utilizando a estrutura apresentada nesta documentação.
7. Confira as configurações de conexão no arquivo `api/conexao.php`.

No ambiente utilizado durante o desenvolvimento, o MySQL está configurado para utilizar a porta `3307`.

### 4.3. Configuração da conexão

O arquivo `api/conexao.php` centraliza os parâmetros de conexão com o banco de dados.

A conexão utiliza PDO e define o modo de tratamento de erros por exceções.

Configuração utilizada no ambiente local:

```php
$host = "localhost";
$banco = "rpg_db";
$usuario = "root";
$senha = "";

$pdo = new PDO(
    "mysql:host=$host;port=3307;dbname=$banco;charset=utf8mb4",
    $usuario,
    $senha
);

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
```

Caso o MySQL esteja utilizando outra porta, o valor deverá ser ajustado na configuração.

Em um ambiente de produção, recomenda-se utilizar credenciais próprias para a aplicação, armazenar as informações de conexão fora dos arquivos públicos e não utilizar uma conta administrativa do banco de dados.

### 4.4. Acesso à aplicação

Depois de iniciar os serviços e configurar o banco, a aplicação pode ser acessada pelo endereço:

`http://localhost/projetointegradorMiguelG-main/`

O caminho pode variar de acordo com o nome da pasta utilizada dentro de `htdocs`.

## 5. Organização do frontend

### 5.1. Páginas HTML

**index.html**

É a página inicial da aplicação. Reúne os elementos de acesso, cadastro e visualização de personagens e campanhas, além das áreas destinadas às funcionalidades administrativas.

**ficha.html**

Apresenta a ficha individual de um personagem. Os dados são carregados a partir do identificador recebido pela página, permitindo consultar e editar as informações correspondentes.

**party.html**

Apresenta informações de uma campanha e dos personagens associados a ela.

**obs/party-obs.html**

Página complementar voltada à exibição de informações de uma campanha em transmissões.

**obs/portrait.html**

Página complementar utilizada para exibir informações visuais de um personagem durante transmissões.

### 5.2. Estilos CSS

**css/index.css**

Contém as regras de apresentação da página inicial, incluindo organização dos componentes, formulários, botões e elementos visuais.

**css/ficha.css**

Contém os estilos da ficha de personagem, organizando os campos e as diferentes seções de informações.

### 5.3. Scripts JavaScript

**js/index.js**

Controla as interações da página inicial. É responsável por realizar operações como autenticação, cadastro, carregamento de personagens e campanhas e execução das funcionalidades administrativas.

**js/ficha.js**

Controla o funcionamento da ficha de personagem. Realiza o carregamento dos dados, atualização dos campos, cálculo e apresentação de informações e envio das alterações ao backend.

**js/utils.js**

Reúne funções auxiliares utilizadas para evitar repetição de operações em diferentes partes do frontend.

**js/services/diceService.js**

Concentra a lógica relacionada às rolagens de dados, incluindo processamento dos resultados e operações utilizadas pelo sistema de RPG.

## 6. Backend e API

O backend foi desenvolvido em PHP. Cada arquivo da pasta `api` é responsável por uma operação específica, recebendo dados do frontend, realizando as validações necessárias e interagindo com o banco de dados.

A comunicação entre frontend e backend utiliza requisições HTTP. Os dados são enviados e recebidos em formato JSON nas operações correspondentes.

### 6.1. Conexão e autenticação

| Arquivo | Responsabilidade |
|---|---|
| `conexao.php` | Inicializa a conexão PDO com o banco de dados MySQL. |
| `cadastrar.php` | Recebe os dados de cadastro, valida as informações e registra um novo usuário. A senha é armazenada utilizando hash. |
| `login.php` | Confere as credenciais informadas, valida a senha armazenada e inicia a sessão do usuário. |
| `verificar_sessao.php` | Consulta a sessão atual para verificar se existe um usuário autenticado. |
| `logout.php` | Encerra a sessão ativa. |

O sistema utiliza sessões PHP para manter o estado de autenticação entre as requisições. As informações do usuário autenticado ficam disponíveis para os endpoints que precisam verificar sua identidade e permissões.

### 6.2. Gerenciamento de personagens

| Arquivo | Responsabilidade |
|---|---|
| `personagens_listar.php` | Consulta os personagens disponíveis para o usuário de acordo com suas permissões. |
| `personagens_criar.php` | Registra um novo personagem associado ao usuário autenticado. |
| `personagem_buscar.php` | Recupera os dados de um personagem específico, verificando se o solicitante possui autorização para acessá-lo. |
| `personagem_salvar.php` | Recebe as alterações da ficha e atualiza as informações correspondentes no banco de dados. |

As informações dos personagens são armazenadas na tabela `personagens`. Dados complementares, como perícias, habilidades, resistências e itens de inventário, são organizados em tabelas relacionadas por meio do identificador do personagem.

O carregamento da ficha utiliza o identificador do personagem para recuperar seus dados e montar a estrutura que será apresentada ao usuário.

### 6.3. Gerenciamento de campanhas

| Arquivo | Responsabilidade |
|---|---|
| `campanhas_listar.php` | Consulta as campanhas disponíveis, considerando o estado de autenticação do usuário. |
| `campanhas_criar.php` | Realiza o cadastro de campanhas, com acesso restrito a administradores. |

As campanhas possuem informações como nome, descrição, imagem, privacidade e identificador de convite.

Campanhas privadas possuem uma senha armazenada em formato de hash, permitindo a validação de acesso sem guardar a senha original no banco de dados.

### 6.4. Sistema de convites

| Arquivo | Responsabilidade |
|---|---|
| `convite_buscar.php` | Localiza uma campanha utilizando o código presente no link de convite. |
| `convite_personagens.php` | Consulta os personagens do usuário que podem ser associados à campanha. |
| `convite_entrar.php` | Valida o convite e associa o personagem selecionado à campanha. |

O sistema utiliza um código único de convite para identificar a campanha de destino.

Durante a associação, o backend verifica a existência da campanha, a autenticação do usuário e a propriedade do personagem. Também verifica se o personagem está disponível para associação.

A operação de associação utiliza uma transação no banco de dados para manter a consistência da atualização.

### 6.5. Visualização de campanhas

**party_buscar.php**

Disponibiliza os dados necessários para a página `party.html`, incluindo informações da campanha e personagens associados. O endpoint também considera as permissões de acesso às campanhas privadas.

### 6.6. Administração de usuários

| Arquivo | Responsabilidade |
|---|---|
| `usuarios_listar.php` | Disponibiliza a listagem de usuários para a área administrativa. |
| `usuario_permissao.php` | Processa alterações de permissões dos usuários, com acesso restrito a administradores. |

O sistema diferencia usuários comuns e administradores. As permissões são verificadas no backend, evitando que o controle de acesso dependa exclusivamente da interface do navegador.

## 7. Banco de dados

O banco de dados utilizado é o MySQL, com nome `rpg_db`.

A estrutura foi dividida em tabelas para separar os diferentes tipos de informação e estabelecer relacionamentos entre os registros.

### 7.1. Tabelas e responsabilidades

| Tabela | Finalidade |
|---|---|
| `usuarios` | Armazena os dados de cadastro, autenticação e permissões dos usuários. |
| `campanhas` | Armazena as informações das campanhas, incluindo privacidade, senha e código de convite. |
| `personagens` | Armazena os dados principais das fichas de personagens. |
| `pericias` | Armazena as perícias associadas a cada personagem. |
| `inventario` | Armazena os itens e equipamentos de cada personagem. |
| `habilidades` | Armazena habilidades, dons e informações relacionadas às suas características. |
| `resistencias` | Armazena os tipos e descrições das resistências dos personagens. |
| `rolagens` | Armazena registros de rolagens realizadas, incluindo tipo, resultado e detalhes. |

### 7.2. Relacionamentos

A tabela `usuarios` possui relacionamento com `personagens`, permitindo identificar o proprietário de cada ficha.

A tabela `campanhas` possui relacionamento com o usuário responsável por sua criação. Os personagens podem ser associados a uma campanha por meio do campo `campanha_id`.

As tabelas `pericias`, `inventario`, `habilidades`, `resistencias` e `rolagens` utilizam o identificador do personagem para relacionar seus registros à ficha correspondente.

Essa organização permite armazenar diferentes conjuntos de informações sem concentrar todos os dados em uma única tabela.

### 7.3. Campos principais

**usuarios**

- `id`: identificador do usuário.
- `username`: nome de usuário.
- `nome`: nome apresentado no sistema.
- `email`: endereço de e-mail.
- `senha_hash`: senha armazenada em formato de hash.
- `tipo`: nível de permissão do usuário.
- `foto`: referência à imagem do perfil.
- `criado_em`: data de criação do cadastro.

**campanhas**

- `id`: identificador da campanha.
- `nome`: nome da campanha.
- `descricao`: descrição.
- `img`: imagem associada.
- `privada`: indica se a campanha é privada.
- `senha_hash`: hash da senha de acesso, quando aplicável.
- `link`: código único utilizado no convite.
- `criado_por_usuario_id`: usuário responsável pela criação.

**personagens**

A tabela armazena o identificador, proprietário e campanha associada, além de informações como nome, classe, nível, atributos, recursos, valores de defesa, imagem e anotações.

Também contém campos relacionados aos pontos de vida, energia, vigor, esquiva, carga e demais características utilizadas pela ficha.

**pericias**

- `id`: identificador do registro.
- `personagem_id`: personagem relacionado.
- `nome`: nome da perícia.
- `atributo_associado`: atributo utilizado pela perícia.
- `treino`: valor de treinamento.
- `outros`: modificadores adicionais.

**inventario**

Armazena o nome, peso, tipo e descrição dos itens, além de informações específicas para armas, como dano, teste e crítico.

**habilidades**

Armazena informações sobre habilidades e dons, incluindo nome, tipo, categoria, descrição e propriedades específicas, como arcanos, forma, função, efeito, duração, alvos e custo.

**resistencias**

Armazena o tipo e a descrição das resistências associadas ao personagem.

**rolagens**

Registra informações das rolagens, como personagem relacionado, tipo, nome, resultado, detalhes, indicação de crítico e data de criação.

## 8. Segurança e controle de acesso

O sistema possui mecanismos de controle de acesso implementados no backend.

Entre os principais recursos estão:

- Autenticação utilizando sessões PHP.
- Armazenamento de senhas por meio de hash.
- Verificação das credenciais durante o login.
- Consultas preparadas utilizando PDO.
- Validação de propriedade dos personagens.
- Restrição de determinadas operações a administradores.
- Verificação de permissões para acesso a campanhas privadas.
- Geração de códigos de convite aleatórios.

As consultas preparadas ajudam a reduzir riscos de SQL Injection, enquanto a validação das permissões no servidor impede que a simples alteração da interface permita acessar operações restritas.

## 9. Fluxos principais do sistema

### 9.1. Cadastro e login

1. O usuário acessa a página inicial.
2. Informa seus dados de cadastro ou suas credenciais de acesso.
3. O JavaScript envia os dados ao endpoint correspondente.
4. O PHP valida as informações e consulta ou atualiza o banco.
5. Em caso de autenticação válida, uma sessão é iniciada.
6. A interface passa a disponibilizar as funcionalidades permitidas ao usuário.

### 9.2. Criação e edição de personagens

1. O usuário autenticado solicita a criação de um personagem.
2. O backend registra o personagem vinculado à conta.
3. A ficha pode ser aberta utilizando o identificador do personagem.
4. O frontend solicita os dados ao endpoint de busca.
5. O PHP verifica as permissões e retorna as informações.
6. As alterações realizadas na ficha são enviadas ao endpoint de salvamento.

### 9.3. Criação e entrada em campanhas

1. Um administrador cria uma campanha.
2. O sistema gera um código de convite.
3. O convite pode ser compartilhado com outros usuários.
4. O usuário acessa o convite e consulta as informações da campanha.
5. O sistema apresenta os personagens disponíveis para associação.
6. Após a seleção, o backend valida as informações e associa o personagem à campanha.

### 9.4. Administração

1. Um usuário com permissão administrativa acessa a área correspondente.
2. O sistema consulta a lista de usuários.
3. O administrador pode solicitar alterações de permissões.
4. O backend verifica se o solicitante possui autorização antes de processar a operação.

## 10. Considerações sobre o estado atual do projeto

O sistema possui funcionalidades de cadastro e autenticação, gerenciamento de personagens, criação e listagem de campanhas, associação por convites e controle de permissões.

Durante a etapa de integração entre a ficha e o banco de dados, foi identificado um problema específico na persistência das perícias. Os demais dados da ficha são processados pelo fluxo de salvamento, mas os registros da tabela `pericias` não estão sendo gravados corretamente na versão atual.

Esse comportamento permanece como uma pendência de desenvolvimento e deve ser considerado ao testar a persistência completa de uma ficha.

## 11. Possíveis melhorias futuras

Entre as melhorias que podem ser realizadas em versões posteriores estão:

- Finalização e validação do salvamento das perícias. 9(CONSEGUI ARRUMAR)!!!!
- Implementação completa da edição e exclusão de campanhas.
- Integração das funcionalidades de perfil e alteração de senha com o banco de dados.
- Aprimoramento do controle de acesso a campanhas privadas.
- Ampliação dos registros de rolagens e histórico de alterações.
- Implementação de validações adicionais nos formulários.
- Melhorias na responsividade das páginas.
- Configuração de ambiente de produção com credenciais e parâmetros seguros.

## 12. Considerações finais

O projeto foi desenvolvido com o objetivo de oferecer uma ferramenta web para organização de personagens e campanhas de RPG.

A separação entre frontend, backend e banco de dados permite organizar as responsabilidades da aplicação, facilitando a manutenção e a expansão das funcionalidades.

A utilização de PHP, JavaScript e MySQL possibilita a comunicação entre a interface e o servidor, enquanto as sessões e as verificações de permissão oferecem uma estrutura básica de autenticação e controle de acesso.
