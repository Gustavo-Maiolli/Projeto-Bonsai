-- Novo bucket para avatares (tb01_perfis)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatares', 'avatares', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('plantas', 'plantas', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('publicacoes', 'publicacoes', true)
ON CONFLICT (id) DO NOTHING;

-- Remove políticas antigas para evitar conflitos de nome (mantendo o nome original)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Políticas para 'avatares'
CREATE POLICY "Imagens de avatar sao publicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatares');

CREATE POLICY "Usuarios podem enviar seu proprio avatar"
ON storage.objects FOR INSERT
WITH CHECK (
 bucket_id = 'avatares' AND
 auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuarios podem atualizar seu proprio avatar"
ON storage.objects FOR UPDATE
USING (
 bucket_id = 'avatares' AND
 auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuarios podem deletar seu proprio avatar"
ON storage.objects FOR DELETE
USING (
 bucket_id = 'avatares' AND
 auth.uid()::text = (storage.foldername(name))[1]
);


CREATE POLICY "Imagens de plantas sao publicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'plantas');

CREATE POLICY "Usuarios autenticados podem enviar imagens de plantas"
ON storage.objects FOR INSERT
WITH CHECK (
 bucket_id = 'plantas' AND
 auth.role() = 'authenticated'
);

CREATE POLICY "Usuarios podem atualizar suas proprias imagens de plantas"
ON storage.objects FOR UPDATE
USING (
 bucket_id = 'plantas' AND
 auth.role() = 'authenticated'
);

CREATE POLICY "Usuarios podem deletar suas proprias imagens de plantas"
ON storage.objects FOR DELETE
USING (
 bucket_id = 'plantas' AND
 auth.role() = 'authenticated'
);

CREATE POLICY "Imagens de publicacoes sao publicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'publicacoes');

CREATE POLICY "Usuarios autenticados podem enviar imagens de publicacoes"
ON storage.objects FOR INSERT
WITH CHECK (
 bucket_id = 'publicacoes' AND
 auth.role() = 'authenticated'
);

CREATE POLICY "Usuarios podem atualizar suas proprias imagens de publicacoes"
ON storage.objects FOR UPDATE
USING (
 bucket_id = 'publicacoes' AND
 auth.role() = 'authenticated'
);

CREATE POLICY "Usuarios podem deletar suas proprias imagens de publicacoes"
ON storage.objects FOR DELETE
USING (
 bucket_id = 'publicacoes' AND
 auth.role() = 'authenticated'
);