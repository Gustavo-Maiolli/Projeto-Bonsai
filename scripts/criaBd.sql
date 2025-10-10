-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela tb01_perfis 
CREATE TABLE IF NOT EXISTS public.tb01_perfis (
 tb01_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 tb01_nome TEXT NOT NULL,
 tb01_bio TEXT,
 tb01_avatar_url TEXT,
 tb01_criacao TIMESTAMPTZ DEFAULT NOW(),
 tb01_atualizado TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (tb01_id) REFERENCES auth.users(id)
);

-- Tabela tb02_plantas
CREATE TABLE IF NOT EXISTS public.tb02_plantas (
 tb02_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 tb02_id_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 tb02_especie TEXT NOT NULL,
 tb02_apelido TEXT,
 tb02_localizacao TEXT,
 tb02_temperatura TEXT,
 tb02_data_inicio DATE NOT NULL,
 tb02_frequencia_rega INTEGER NOT NULL,
 tb02_frequencia_sol INTEGER,
 tb02_notas_cuidado TEXT,
 tb02_url_imagem TEXT,
 tb02_publica BOOLEAN DEFAULT true,
 tb02_criado_em TIMESTAMPTZ DEFAULT NOW(),
 tb02_atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT plants_user_id_fkey FOREIGN KEY (tb02_id_usuario) REFERENCES auth.users(id)
);

-- Tabela tb03_publicacoes (para fotos de evolução das plantas)
CREATE TABLE IF NOT EXISTS public.tb03_publicacoes (
 tb03_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 tb03_id_planta UUID NOT NULL REFERENCES public.tb02_plantas(tb02_id) ON DELETE CASCADE,
 tb03_id_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 tb03_url_imagem TEXT NOT NULL,
 tb03_descricao TEXT,
 tb03_criado_em TIMESTAMPTZ DEFAULT NOW(),
 tb03_atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT posts_plant_id_fkey FOREIGN KEY (tb03_id_planta) REFERENCES public.tb02_plantas(tb02_id),
  CONSTRAINT posts_user_id_fkey FOREIGN KEY (tb03_id_usuario) REFERENCES auth.users(id)
);

-- Tabela tb04_curtidas
CREATE TABLE IF NOT EXISTS public.tb04_curtidas (
 tb04_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 tb04_id_publicacao UUID NOT NULL REFERENCES public.tb03_publicacoes(tb03_id) ON DELETE CASCADE,
 tb04_id_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 tb04_criado_em TIMESTAMPTZ DEFAULT NOW(),
 CONSTRAINT tb04_id_publicacao_id_usuario_key UNIQUE(tb04_id_publicacao, tb04_id_usuario),
  CONSTRAINT likes_post_id_fkey FOREIGN KEY (tb04_id_publicacao) REFERENCES public.tb03_publicacoes(tb03_id),
  CONSTRAINT likes_user_id_fkey FOREIGN KEY (tb04_id_usuario) REFERENCES auth.users(id)
);

-- Tabela tb05_comentarios
CREATE TABLE IF NOT EXISTS public.tb05_comentarios (
 tb05_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 tb05_id_publicacao UUID NOT NULL REFERENCES public.tb03_publicacoes(tb03_id) ON DELETE CASCADE,
 tb05_id_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 tb05_conteudo TEXT NOT NULL,
 tb05_criado_em TIMESTAMPTZ DEFAULT NOW(),
 tb05_atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT comments_post_id_fkey FOREIGN KEY (tb05_id_publicacao) REFERENCES public.tb03_publicacoes(tb03_id),
  CONSTRAINT comments_user_id_fkey FOREIGN KEY (tb05_id_usuario) REFERENCES auth.users(id)
);

-- Tabela tb06_lembretes_cuidado
CREATE TABLE IF NOT EXISTS public.tb06_lembretes_cuidado (
 tb06_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 tb06_id_planta UUID NOT NULL REFERENCES public.tb02_plantas(tb02_id) ON DELETE CASCADE,
 tb06_id_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 tb06_data_lembrete DATE NOT NULL,
 tb06_tipo_lembrete TEXT NOT NULL CHECK (tb06_tipo_lembrete IN ('watering', 'sun')),
 tb06_concluido BOOLEAN DEFAULT false,
 tb06_data_conclusao TIMESTAMPTZ,
 tb06_criado_em TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT care_reminders_plant_id_fkey FOREIGN KEY (tb06_id_planta) REFERENCES public.tb02_plantas(tb02_id),
  CONSTRAINT care_reminders_user_id_fkey FOREIGN KEY (tb06_id_usuario) REFERENCES auth.users(id)
);

-- Create indexes for better performance (usando novos nomes padronizados)
CREATE INDEX IF NOT EXISTS idx_tb02_tb02_id_usuario ON public.tb02_plantas(tb02_id_usuario);
CREATE INDEX IF NOT EXISTS idx_tb03_tb03_id_planta ON public.tb03_publicacoes(tb03_id_planta);
CREATE INDEX IF NOT EXISTS idx_tb03_tb03_id_usuario ON public.tb03_publicacoes(tb03_id_usuario);
CREATE INDEX IF NOT EXISTS idx_tb04_tb04_id_publicacao ON public.tb04_curtidas(tb04_id_publicacao);
CREATE INDEX IF NOT EXISTS idx_tb04_tb04_id_usuario ON public.tb04_curtidas(tb04_id_usuario);
CREATE INDEX IF NOT EXISTS idx_tb05_tb05_id_publicacao ON public.tb05_comentarios(tb05_id_publicacao);
CREATE INDEX IF NOT EXISTS idx_tb06_tb06_id_usuario ON public.tb06_lembretes_cuidado(tb06_id_usuario);
CREATE INDEX IF NOT EXISTS idx_tb06_data_lembrete ON public.tb06_lembretes_cuidado(tb06_data_lembrete);