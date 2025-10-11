-- **** CONFIGURAÇÃO FINAL DE BUCKETS E RLS (DEFINITIVO) ****

-- 1. CRIAÇÃO DE BUCKETS (Usando prefixos tb0X_ consistentes)
--------------------------------------------------------------------------------
-- Bucket para Avatares (Suporte a tb01_perfis)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tb01_avatares', 'tb01_avatares', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para Plantas (Suporte a tb02_plantas)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tb02_plantas', 'tb02_plantas', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para Publicações (Suporte a tb03_publicacoes)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tb03_publicacoes', 'tb03_publicacoes', true)
ON CONFLICT (id) DO NOTHING;


-- 2. REMOÇÃO DE POLÍTICAS ANTIGAS (Limpeza)
--------------------------------------------------------------------------------
-- Remove todas as políticas antigas para evitar conflitos de nome/ID.
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados podem enviar imagens de plantas" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios podem atualizar suas proprias imagens de plantas" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios podem deletar suas proprias imagens de plantas" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados podem enviar imagens de publicacoes" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios podem atualizar suas proprias imagens de publicacoes" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios podem deletar suas proprias imagens de publicacoes" ON storage.objects;
DROP POLICY IF EXISTS "Imagens de plantas sao publicas" ON storage.objects;
DROP POLICY IF EXISTS "Imagens de publicacoes sao publicas" ON storage.objects;
DROP POLICY IF EXISTS "RLS - Select em tb01_avatares - Imagens sao publicas" ON storage.objects;
DROP POLICY IF EXISTS "RLS - Insert em tb01_avatares - Apenas na sua pasta" ON storage.objects;
DROP POLICY IF EXISTS "RLS - Update em tb01_avatares - Apenas na sua pasta" ON storage.objects;
DROP POLICY IF EXISTS "RLS - Delete em tb01_avatares - Apenas na sua pasta" ON storage.objects;
DROP POLICY IF EXISTS "RLS - Select em tb02_plantas - Imagens sao publicas" ON storage.objects;
DROP POLICY IF EXISTS "RLS - Insert em tb02_plantas - Apenas na sua pasta" ON storage.objects;
DROP POLICY IF EXISTS "RLS - Update em tb02_plantas - Apenas na sua pasta" ON storage.objects;
DROP POLICY IF EXISTS "RLS - Delete em tb02_plantas - Apenas na sua pasta" ON storage.objects;
DROP POLICY IF EXISTS "RLS - Select em tb03_publicacoes - Imagens sao publicas" ON storage.objects;
DROP POLICY IF EXISTS "RLS - Insert em tb03_publicacoes - Apenas na sua pasta" ON storage.objects;
DROP POLICY IF EXISTS "RLS - Update em tb03_publicacoes - Apenas na sua pasta" ON storage.objects;
DROP POLICY IF EXISTS "RLS - Delete em tb03_publicacoes - Apenas na sua pasta" ON storage.objects;


-- 3. POLÍTICAS RLS (CORRIGIDAS E LIMPAS DE CARACTERES INVISÍVEIS)
--------------------------------------------------------------------------------

-- BUCKET 'tb01_avatares'
CREATE POLICY "RLS - Select em tb01_avatares - Imagens sao publicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'tb01_avatares');

CREATE POLICY "RLS - Insert em tb01_avatares - Apenas na sua pasta"
ON storage.objects FOR INSERT
WITH CHECK (
bucket_id = 'tb01_avatares' AND
auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "RLS - Update em tb01_avatares - Apenas na sua pasta"
ON storage.objects FOR UPDATE
USING (
bucket_id = 'tb01_avatares' AND
auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "RLS - Delete em tb01_avatares - Apenas na sua pasta"
ON storage.objects FOR DELETE
USING (
bucket_id = 'tb01_avatares' AND
auth.uid()::text = (storage.foldername(name))[1]
);


-- BUCKET 'tb02_plantas' (CORREÇÃO CRÍTICA DO 400 BAD REQUEST)
CREATE POLICY "RLS - Select em tb02_plantas - Imagens sao publicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'tb02_plantas');

CREATE POLICY "RLS - Insert em tb02_plantas - Apenas na sua pasta"
ON storage.objects FOR INSERT
WITH CHECK (
bucket_id = 'tb02_plantas' AND
auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "RLS - Update em tb02_plantas - Apenas na sua pasta"
ON storage.objects FOR UPDATE
USING (
bucket_id = 'tb02_plantas' AND
auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "RLS - Delete em tb02_plantas - Apenas na sua pasta"
ON storage.objects FOR DELETE
USING (
bucket_id = 'tb02_plantas' AND
auth.uid()::text = (storage.foldername(name))[1]
);


-- BUCKET 'tb03_publicacoes' (CORREÇÃO CRÍTICA DO 400 BAD REQUEST)
CREATE POLICY "RLS - Select em tb03_publicacoes - Imagens sao publicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'tb03_publicacoes');

CREATE POLICY "RLS - Insert em tb03_publicacoes - Apenas na sua pasta"
ON storage.objects FOR INSERT
WITH CHECK (
bucket_id = 'tb03_publicacoes' AND
auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "RLS - Update em tb03_publicacoes - Apenas na sua pasta"
ON storage.objects FOR UPDATE
USING (
bucket_id = 'tb03_publicacoes' AND
auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "RLS - Delete em tb03_publicacoes - Apenas na sua pasta"
ON storage.objects FOR DELETE
USING (
bucket_id = 'tb03_publicacoes' AND
auth.uid()::text = (storage.foldername(name))[1]
);