# Bonsai Care App — Estrutura do Projeto

> Contém a estrutura e organização do projeto Bonsai Care, detalhando o propósito de cada pasta e funções

## 🗂️ Estrutura geral

public/
 └─ images/
src/
 ├─ app/
 │   ├─ page.tsx
 │   ├─ dashboard/
 │   ├─ plants/
 │   └─ auth/
 ├─ components/
 │   ├─ ui/
 ├─ hooks/
 ├─ lib/
 │   ├─ supabase/
 └─  styles/
     └─ globals.css

## ☁️ Estrutura do Banco de Dados (Supabase)
> O projeto utiliza o Supabase para o backend, incluindo Autenticação e Banco de Dados (PostgreSQL).

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

## ⚙️ Observações:
> O projeto utiliza nos imports "@", que seria o mesmo de "src/", está configuração é realizada em tsconfig.json
> Ao atualizar `src/app/layout.tsx` será realizada uma alteração em todas as `page.tsx`
> O global.css `src/app/global.css` é responsavel por trazer o desing básico de fundo das telas e guardar variasveis de cor

📘 Última atualização: 13 de outubro de 2025
Responsável: Gustavo Maiolli Turela