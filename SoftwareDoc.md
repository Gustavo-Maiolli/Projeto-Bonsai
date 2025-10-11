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
├─ lib/
└─ style/

#### app/
> Cada pasta dentro de `app` corresponde a uma rota. Arquivos `page.tsx` representam páginas acessíveis via URL.

#### components/
> Contém todos os componentes reutilizáveis de interface (UI e layout), como por exemplo botões e header. Os componentes são organizados por função.

#### hooks/
> Contém custom hooks (funções que podem ser reutilizadas) do React, neste caso séria em sumo as notifações.

#### lib/
> Contém integrações e utilitários de backend/front para acessar o banco de dados
Aqui ficam arquivos relacionados a:
- Supabase (autenticação e banco), sendo:
    - client.ts (frontend)
    - severClient.ts (backend)
    - middleware.ts (sessões)

#### styles/
Contém estilos globais e variáveis de tema.

## ⚙️ Observações:
> O projeto utiliza nos imports "@", que seria o mesmo de "src/", está configuração é realizada em tsconfig.json

📘 Última atualização: 10 de outubro de 2025
Responsável: Gustavo Maiolli Turela