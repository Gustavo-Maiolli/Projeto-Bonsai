## Bonsai Care Documentação e Estrutura do Projeto

Aplicativo web para o gerenciamento de cuidados com bonsais, desenvolvido em Next.js, TypeScript e Supabase.
Este documento detalha a arquitetura, a estrutura de pastas, o funcionamento do backend e integrações, além de informações para desenvolvedores que desejam contribuir ou realizar manutenção.

## Tecnologias/Linguagens 

1. Next.js:
> O que é:
Framework baseado em React, usado para criar sites e aplicações web.
Funciona tanto no frontend quanto no backend.
> Exemplo/descrição:
Permite criar páginas que carregam rápido, podem ser atualizadas em tempo real e ser responsivas.
> Papel no projeto:
Todas as telas e rotas (Caminhos para as paginas) do sistema são construídas com Next.js, o que garante melhor desempenho e organização do projeto.

2. React:
> O que é:
É uma biblioteca de js para criação de interfaces(UI).
> Exemplo/descrição:
Cada parte da tela (botões, cards, formulários) é um “componente” independente, o que facilita ajustes e reutilização, ou seja é como se eu criasse um único desing e reutilizasse, como nos botões.
> Papel no projeto:
É usado para montar as telas e deixar o app responsivo, sem precisar recarregar a página inteira.

3. TypeScript:
> O que é:
Uma linguagem baseada em JavaScript, mas com tipagem, o que ajuda a evitar erros e tornar o código mais previsível (Tipagem é como definir o tipo da variavel, exemplo se é int ou string).
> Exemplo/descrição:
Enquanto o JavaScript aceita qualquer tipo de dado (número, txt, etc.), o TypeScript aceita somente o tipo pré-definido.
> Papel no projeto:
Utilizado para fazer o banckend, pois ajuda a garantir que os dados vindos do banco (como perfis e plantas) estejam sempre no formato certo.

4. Supabase:
> O que é:
Plataforma/site que oferece banco de dados de forma web, também fornece autenticação de usuários e armazenamento de arquivos em um único lugar.
> Exemplo/descrição:
É um banco de dados, mas baseado em PostgreSQL, o que faz ser um banco de dados robusto e seguro.
> Papel no projeto:
O Supabase cuida do login, do banco de dados e do envio de imagens (como fotos de perfil e plantas), sem precisar de um servidor próprio.

5. PostgreSQL:
> O que é:
É uma linguagem voltada para banco de dados (como por exemplo o SQL), que ao mesmo tempo é sistema de banco de dados relacional, usado para armazenar informações de forma organizada.
> Exemplo/descrição:
É o que permite criar as tabelas  e os relacionadas, como “usuários”, “plantas” e “postagens”, que se conectam entre si.
> Papel no projeto:

6. Tailwind CSS:
> O que é:
É um framework para estilizar sites diretamente no código, sem precisar criar arquivos CSS separados.
> Exemplo/descrição:
Usa classes como bg-green-500 ou text-center para definir cores, tamanhos e alinhamentos rapidamente (Ou seja, faz o css "inline").
> Papel no projeto:
Responsável pela parte visual — Espaçamento e responsividade são controlados por ele.

## Funcionalidades

> Autenticação de usuários com Supabase Auth
> Armazenamento de dados com PostgreSQL
> Upload e hospedagem de imagens com Supabase Storage
> Interface moderna com Next.js (App Router) e Tailwind CSS

Componentização via shadcn/ui e tipagem completa em TypeScript

## 🗂️ Estrutura geral

bonsai-care/
│
├─ public/                  # Arquivos estáticos e imagens
│  ├─ images/
│  │  ├─ logo.jpeg
│  │  └─ placeholder.svg
│
├─ prisma/                  # Esquema de como o banco é
│  └─ schema.prisma
│
├─ src/
│  ├─ app/                  # Páginas do site
│  │  ├─ layout.tsx         # Layout global (Desing padrão das telas)
│  │  ├─ page.tsx           # Página inicial (Página antes de realizar login)
│  │  ├─ dashboard/         # Tela dashboard principal do usuário (Tela inicial após logar)
│  │  ├─ plants/            # Telas que habilitam opção de criar, editar, excluir e consultar plantas
│  │  ├─ auth/              # Telas Login & Cadastro 
│  │  ├─ calendar/          # Tela de Calendario 
│  │  ├─ feed/              # Tela de feed que permite vizualizar post
│  │  ├─ posts/             # Tela que busca post + planta + perfil + curtidas + comentários
│  │  ├─ profile/           # Tela lhe mostra o perfil e lhe permite editar
│  │  └─ search/            # Tela que aparece após realizar uma pesquisa
│  │
│  ├─ components/           # Componentes reutilizáveis (Vão ser partes do desing)
│  │  ├─ calendar/          # Componentes do calendario
│  │  ├─ feed/              # Componentes do feed
│  │  ├─ search/            # Componentes da parte de busca
│  │  ├─ layout/            # Layouts e estruturas fixas (exemplo: Header)
│  │  ├─ plants/            # Componentes específicos de plantas
│  │  ├─ profile/           # Componentes de perfil
│  │  └─ ui/                # Componentes base (shadcn/ui)
│  │
│  ├─ hooks/                # Hooks customizados
│  │  ├─ use-toast.ts       # Notificações e toasts globais
│  │  └─ use-profile.ts     # Hook de carregamento de perfil do usuário logado
│  │
│  ├─ lib/                  # Integrações, utilitários e tipagens
│  │  ├─ supabase/
│  │  │  ├─ client.ts       # Cria uma conexão do Supabase para o frontend
│  │  │  ├─ serverClient.ts # Cria uma conexão do Supabase para o backend (SSR)
│  │  │  └─ middleware.ts   # Atualização de sessão e proteção de rotas para caso troque de tela/página
│  │  ├─ profile.ts         # Tipagens e helpers para perfis
│  │  └─ types.ts           # Esquema de como estão as tabelas no supabase
│  │
│  └─ styles/
│     └─ globals.css        # Paleta de cores do site, variáveis globais e estilo basico
│
└─ package.json             # Dependências e scripts do projeto


## Desing do site

> Este projeto usa Tailwind CSS para estilização e shadcn/ui para componentes visuais padronizados (Ou seja é um framework de CSS).
A paleta principal segue tons esverdeados e naturais, representando a temática de bonsais.

> Layout Global do site (src/app/layout.tsx), ele que define a estrutura base de todas as páginas e adiciona o Header e o Toaster global.

## Estrutura do Banco de Dados (Supabase)
1. O projeto utiliza o Supabase para o banco de dados, incluindo Autenticação e e funções do backend, sendo no modelo (Supabase PostgreSQL).

> Todas as tabelas seguem um padrão numérico (tb01_, tb02_...), segue descrição das tabelas:

tb01_perfis	            # Dados do perfil do usuário (nome, bio, avatar, etc)
tb02_plantas	        # Plantas cadastradas por cada usuário
tb03_publicacoes	    # Postagens e atualizações das plantas
tb04_curtidas	        # Likes das publicações
tb05_comentarios	    # Comentários nas publicações
tb06_lembretes_cuidado 	# Lembretes de cuidados (rega, poda, etc)

2. Autenticação e Sessões:

# Explicação:
> Login e registro por email/senha, sendo realizado uma verificação via email para cadastro.
> Armazenamento seguro de tokens em cookies HttpOnly. (Ou seja utiliza cookies)
> Middleware (lib/supabase/middleware.ts) mantém a sessão ativa entre SSR e navegação client-side. (Deixa o usuario sempre conectado)
> Redirecionamentos automáticos para /auth/login em páginas protegidas. (Nas telas caso você não esteja logado será redirecionado para realizar o login)

# Exemplo de como funciona o esquema de login com cookies:
> Supabase realiza a autenticação (auth.users)
> Se for verdadeiro ele vai gerar um token de sessão.
> Esse token é armazenado nos cookies e validado automaticamente via middleware.
> Em caso de não estar logado o middleware redireciona para /auth/login.
> O Header acessa o usuário e exibe seu avatar e nome.

3. Storage & bucket:

> Armazena imagens de avatares e plantas.
> Bucket: avatares e plantas

## Resumo:

### public/
> Contém os arquivos estáticos, como as imagens
public/
├─ images/
│ ├─ logo.jpeg
└─ placeholder.svg

### 💻 src/
> Contém o código fonte, segue a estrutura:
src/
├─ app/
├─ components
├─ hooks/
└─lib/

#### app/
> Cada pasta dentro de `app` corresponde a uma rota. Arquivos `page.tsx` representam páginas acessíveis via URL.

#### components/
> Contém todos os componentes reutilizáveis de interface (UI e layout), como por exemplo botões e header. Os componentes são organizados por função.
> Header não aparece diretamente no código das telas, pois ele é tratado como um componente que é importado em `src/app/layout.tsx`, fazendo com que as telas tenham o Header por padrão, é possível alterar o desing do Header acessando `src/components/layout/header.tsx`.

#### hooks/
> Contém custom hooks (funções que podem ser reutilizadas) do React, neste caso séria em sumo as notifações.
> `user-profile.ts` vai estar realizando a conexão básica para trazer o usuário para que possa ser carregado no Header.

#### lib/
> Contém integrações e utilitários de backend/front para acessar o banco de dados
Aqui ficam arquivos relacionados a:
- profile.ts: Realiza a tipagem de dados do perfil;
- types.ts: Realiza a tipagem de dados do supabase/banco de dados;
- Supabase (autenticação e banco), sendo:
    - client.ts (frontend);
    - severClient.ts (backend);
    - middleware.ts (sessões);

## Observações:
> O projeto utiliza nos imports "@", que seria o mesmo de "src/", está configuração é realizada em tsconfig.json
> Ao atualizar `src/app/layout.tsx` será realizada uma alteração em todas as `page.tsx`
> O global.css `src/app/global.css` é responsavel por trazer o desing básico de fundo das telas e guardar variasveis de cor

