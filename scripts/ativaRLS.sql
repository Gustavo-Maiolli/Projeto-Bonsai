-- Ativa RLS nas tabelas (Row Level Security)
ALTER TABLE public.tb01_perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb02_plantas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb03_publicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb04_curtidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb05_comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb06_lembretes_cuidado ENABLE ROW LEVEL SECURITY;

-- #######################################################
-- TABELA: tb01_perfis - Armazena perfis de usuário.
-- RLS usa a coluna 'tb01_id'.
-- #######################################################

CREATE POLICY "Users can view all profiles" ON public.tb01_perfis
 FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.tb01_perfis
 FOR INSERT WITH CHECK (auth.uid() = tb01_id);

CREATE POLICY "Users can update their own profile" ON public.tb01_perfis
 FOR UPDATE USING (auth.uid() = tb01_id);

CREATE POLICY "Users can delete their own profile" ON public.tb01_perfis
 FOR DELETE USING (auth.uid() = tb01_id);

-- #######################################################
-- TABELA: tb02_plantas - Armazena as plantas do usuário.
-- RLS usa 'tb02_publica' (visibilidade) e 'tb02_id_usuario'.
-- #######################################################

CREATE POLICY "Users can view public plants" ON public.tb02_plantas
 FOR SELECT USING (tb02_publica = true OR auth.uid() = tb02_id_usuario);

CREATE POLICY "Users can insert their own plants" ON public.tb02_plantas
 FOR INSERT WITH CHECK (auth.uid() = tb02_id_usuario);

CREATE POLICY "Users can update their own plants" ON public.tb02_plantas
 FOR UPDATE USING (auth.uid() = tb02_id_usuario);

CREATE POLICY "Users can delete their own plants" ON public.tb02_plantas
 FOR DELETE USING (auth.uid() = tb02_id_usuario);

-- #######################################################
-- TABELA: tb03_publicacoes - Armazena fotos de evolução (posts).
-- RLS usa 'tb03_id_usuario' e checa a visibilidade em 'tb02_plantas'.
-- #######################################################

CREATE POLICY "Users can view posts from public plants" ON public.tb03_publicacoes
 FOR SELECT USING (
  EXISTS (
   SELECT 1 FROM public.tb02_plantas
   WHERE tb02_plantas.tb02_id = tb03_publicacoes.tb03_id_planta
   AND (tb02_plantas.tb02_publica = true OR tb02_plantas.tb02_id_usuario = auth.uid())
  )
 );

CREATE POLICY "Users can insert posts for their own plants" ON public.tb03_publicacoes
 FOR INSERT WITH CHECK (
  auth.uid() = tb03_id_usuario AND
  EXISTS (SELECT 1 FROM public.tb02_plantas WHERE tb02_plantas.tb02_id = tb03_publicacoes.tb03_id_planta AND tb02_plantas.tb02_id_usuario = auth.uid())
 );

CREATE POLICY "Users can update their own posts" ON public.tb03_publicacoes
 FOR UPDATE USING (auth.uid() = tb03_id_usuario);

CREATE POLICY "Users can delete their own posts" ON public.tb03_publicacoes
 FOR DELETE USING (auth.uid() = tb03_id_usuario);

-- #######################################################
-- TABELA: tb04_curtidas - Rastreia as curtidas em publicações.
-- RLS usa a coluna 'tb04_id_usuario'.
-- #######################################################

CREATE POLICY "Users can view all likes" ON public.tb04_curtidas
 FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON public.tb04_curtidas
 FOR INSERT WITH CHECK (auth.uid() = tb04_id_usuario);

CREATE POLICY "Users can delete their own likes" ON public.tb04_curtidas
 FOR DELETE USING (auth.uid() = tb04_id_usuario);

-- #######################################################
-- TABELA: tb05_comentarios - Armazena comentários em publicações.
-- RLS usa a coluna 'tb05_id_usuario'.
-- #######################################################

CREATE POLICY "Users can view all comments" ON public.tb05_comentarios
 FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments" ON public.tb05_comentarios
 FOR INSERT WITH CHECK (auth.uid() = tb05_id_usuario);

CREATE POLICY "Users can update their own comments" ON public.tb05_comentarios
 FOR UPDATE USING (auth.uid() = tb05_id_usuario);

CREATE POLICY "Users can delete their own comments" ON public.tb05_comentarios
 FOR DELETE USING (auth.uid() = tb05_id_usuario);

-- #######################################################
-- TABELA: tb06_lembretes_cuidado - Armazena lembretes de rega/sol.
-- RLS usa a coluna 'tb06_id_usuario'.
-- #######################################################

CREATE POLICY "Users can view their own reminders" ON public.tb06_lembretes_cuidado
 FOR SELECT USING (auth.uid() = tb06_id_usuario);

CREATE POLICY "Users can insert their own reminders" ON public.tb06_lembretes_cuidado
 FOR INSERT WITH CHECK (auth.uid() = tb06_id_usuario);

CREATE POLICY "Users can update their own reminders" ON public.tb06_lembretes_cuidado
 FOR UPDATE USING (auth.uid() = tb06_id_usuario);

CREATE POLICY "Users can delete their own reminders" ON public.tb06_lembretes_cuidado
 FOR DELETE USING (auth.uid() = tb06_id_usuario);