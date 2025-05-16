```bash
frontend/
├── js/
│   ├── api.js                 # Configuração do Axios
│   ├── utils.js               # Funções utilitárias (formatação, validação, etc.)
│   ├── dom/                   # Manipulação de DOM separada por recurso
│   │   ├── produtosDOM.js     # Criação de elementos HTML dos produtos
│   │   └── carrinhoDOM.js     # Criação de elementos do carrinho
│   ├── services/              # Comunicação com o backend (Spring)
│   │   ├── produtoService.js  # Chamada da API para produtos
│   │   └── usuarioService.js  # Cadastro, login, etc.
│   └── pages/                 # Lógica principal de cada página
│       ├── index.js           # Página inicial
│       ├── produto.js         # Página individual do produto
│       └── carrinho.js        # Página do carrinho
├── index.html                 # Página principal
├── produto.html               # Página de produto
└── carrinho.html              # Página do carrinho

📂 services/
Guarda funções que comunicam com o backend (Spring) usando Axios ou o fetch padrão, depende do que forem usar

📂 dom/
Cria elementos HTML dinamicamente com base nos dados.Ex criar um card de produto ou pedido, carrinho..., *gerar html dinamicamente*

📂 pages/
É onde fica a lógica principal de cada página. Chama os services, monta elementos com dom/, adiciona eventos. Exemplo os eventos do funcionamento do carrinho

📄 utils.js
Guarda funções úteis reutilizáveis como validação de formulário, máscara de campos, formatação de preços, etc.

DUVIDAS É SO PESQUISAR OU PERGUNTAR.
