-- FUNÇÃO 1: handle_new_user - Cria um perfil na tb01_perfis
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
 INSERT INTO public.tb01_perfis (tb01_id, tb01_nome, tb01_bio, tb01_avatar_url)
 VALUES (
  new.id,
  COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
  COALESCE(new.raw_user_meta_data->>'bio', NULL),
  COALESCE(new.raw_user_meta_data->>'avatar_url', NULL)
 )
 ON CONFLICT (tb01_id) DO NOTHING;
 
 RETURN new;
END;
$$;

-- TRIGGER 1: on_auth_user_created
-- Ativa a função acima após um novo registro na tabela auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
 AFTER INSERT ON auth.users
 FOR EACH ROW
 EXECUTE FUNCTION public.handle_new_user();

-- FUNÇÃO 2: handle_updated_at - Atualiza o timestamp
-- A função é genérica, mas a lógica interna deve usar os nomes das colunas traduzidas
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_TABLE_NAME = 'tb01_perfis' THEN
        NEW.tb01_atualizado = NOW();
    ELSIF TG_TABLE_NAME = 'tb02_plantas' THEN
        NEW.tb02_atualizado_em = NOW();
    ELSIF TG_TABLE_NAME = 'tb03_publicacoes' THEN
        NEW.tb03_atualizado_em = NOW();
    ELSIF TG_TABLE_NAME = 'tb05_comentarios' THEN
        NEW.tb05_atualizado_em = NOW();
    END IF;
    RETURN NEW;
END;
$$;

-- tb01_perfis (tb01_atualizado)
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.tb01_perfis;
CREATE TRIGGER set_updated_at_tb01_perfis
 BEFORE UPDATE ON public.tb01_perfis
 FOR EACH ROW
 EXECUTE FUNCTION public.handle_updated_at();

-- tb02_plantas (tb02_atualizado_em)
DROP TRIGGER IF EXISTS set_updated_at_plants ON public.tb02_plantas;
CREATE TRIGGER set_updated_at_tb02_plantas
 BEFORE UPDATE ON public.tb02_plantas
 FOR EACH ROW
 EXECUTE FUNCTION public.handle_updated_at();

-- tb03_publicacoes (tb03_atualizado_em)
DROP TRIGGER IF EXISTS set_updated_at_posts ON public.tb03_publicacoes;
CREATE TRIGGER set_updated_at_tb03_publicacoes
 BEFORE UPDATE ON public.tb03_publicacoes
 FOR EACH ROW
 EXECUTE FUNCTION public.handle_updated_at();

-- tb05_comentarios (tb05_atualizado_em)
DROP TRIGGER IF EXISTS set_updated_at_comments ON public.tb05_comentarios;
CREATE TRIGGER set_updated_at_tb05_comentarios
 BEFORE UPDATE ON public.tb05_comentarios
 FOR EACH ROW
 EXECUTE FUNCTION public.handle_updated_at();