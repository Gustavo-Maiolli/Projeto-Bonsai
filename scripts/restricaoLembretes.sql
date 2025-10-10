-- Garante que um usuário não possa ter o mesmo tipo de lembrete

-- Remove o índice antigo (se ele existiu com o nome antigo)
DROP INDEX IF EXISTS public.unique_reminder;

-- Adiciona o índice UNIQUE para prevenir lembretes duplicados
CREATE UNIQUE INDEX IF NOT EXISTS unique_tb06_lembrete 
ON public.tb06_lembretes_cuidado(
    tb06_id_usuario, 
    tb06_id_planta, 
    tb06_data_lembrete, 
    tb06_tipo_lembrete
);
