export interface Profile {
  tb01_id: string
  tb01_nome: string
  tb01_bio: string | null
  tb01_avatar_url: string | null
  tb01_criacao: string
  tb01_atualizado: string
}

export interface Plant {
  tb02_id: string
  tb02_id_usuario: string
  tb02_especie: string
  tb02_apelido: string | null
  tb02_localizacao: string | null
  tb02_temperatura: string | null
  tb02_data_inicio: string
  tb02_frequencia_rega: number
  tb02_frequencia_sol: number | null
  tb02_notas_cuidado: string | null
  tb02_url_imagem: string | null
  tb02_publica: boolean
  tb02_criado_em: string
  tb02_atualizado_em: string
  tb01_perfis?: Profile
}

export interface Post {
  tb03_id: string
  tb03_id_planta: string
  tb03_id_usuario: string
  tb03_url_imagem: string
  tb03_descricao: string | null
  tb03_criado_em: string
  tb03_atualizado_em: string
  tb02_plantas?: Plant
  tb01_perfis?: Profile
  tb04_curtidas?: Like[]
  tb05_comentarios?: Comment[]
  _count?: {
    tb04_curtidas: number
    tb05_comentarios: number
  }
}

export interface Like {
  tb04_id: string
  tb04_id_publicacao: string
  tb04_id_usuario: string
  tb04_criado_em: string
}

export interface Comment {
  tb05_id: string
  tb05_id_publicacao: string
  tb05_id_usuario: string
  tb05_conteudo: string
  tb05_criado_em: string
  tb05_atualizado_em: string
  tb01_perfis?: Profile
}

export interface CareReminder {
  tb06_id: string
  tb06_id_planta: string
  tb06_id_usuario: string
  tb06_data_lembrete: string
  tb06_tipo_lembrete: "watering" | "sun"
  tb06_concluido: boolean
  tb06_data_conclusao: string | null
  tb06_criado_em: string
  tb02_plantas?: Plant
}