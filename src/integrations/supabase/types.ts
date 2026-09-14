export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          acao: string
          created_at: string
          id: string
          registro_id: string | null
          tabela: string
          usuario_id: string | null
          usuario_nome: string | null
          valor_anterior: Json | null
          valor_novo: Json | null
        }
        Insert: {
          acao: string
          created_at?: string
          id?: string
          registro_id?: string | null
          tabela: string
          usuario_id?: string | null
          usuario_nome?: string | null
          valor_anterior?: Json | null
          valor_novo?: Json | null
        }
        Update: {
          acao?: string
          created_at?: string
          id?: string
          registro_id?: string | null
          tabela?: string
          usuario_id?: string | null
          usuario_nome?: string | null
          valor_anterior?: Json | null
          valor_novo?: Json | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          ativo: boolean
          cnpj: string | null
          contato: string | null
          created_at: string
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cnpj?: string | null
          contato?: string | null
          created_at?: string
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cnpj?: string | null
          contato?: string | null
          created_at?: string
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          arquivo_path: string | null
          conferido: boolean
          created_at: string
          created_by: string | null
          dados_ia: Json | null
          data: string | null
          divergencia: string | null
          divergencia_situacao: string | null
          empresa_id: string | null
          id: string
          installation_id: string | null
          numero: string | null
          observacoes: string | null
          paciente_id: string | null
          refill_id: string | null
          removal_id: string | null
          servico: string | null
          tipo: string
          updated_at: string
          valor: number | null
        }
        Insert: {
          arquivo_path?: string | null
          conferido?: boolean
          created_at?: string
          created_by?: string | null
          dados_ia?: Json | null
          data?: string | null
          divergencia?: string | null
          divergencia_situacao?: string | null
          empresa_id?: string | null
          id?: string
          installation_id?: string | null
          numero?: string | null
          observacoes?: string | null
          paciente_id?: string | null
          refill_id?: string | null
          removal_id?: string | null
          servico?: string | null
          tipo?: string
          updated_at?: string
          valor?: number | null
        }
        Update: {
          arquivo_path?: string | null
          conferido?: boolean
          created_at?: string
          created_by?: string | null
          dados_ia?: Json | null
          data?: string | null
          divergencia?: string | null
          divergencia_situacao?: string | null
          empresa_id?: string | null
          id?: string
          installation_id?: string | null
          numero?: string | null
          observacoes?: string | null
          paciente_id?: string | null
          refill_id?: string | null
          removal_id?: string | null
          servico?: string | null
          tipo?: string
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "installations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_refill_id_fkey"
            columns: ["refill_id"]
            isOneToOne: false
            referencedRelation: "refills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_removal_id_fkey"
            columns: ["removal_id"]
            isOneToOne: false
            referencedRelation: "removals"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          created_at: string
          data_entrega: string | null
          data_retirada: string | null
          empresa_id: string | null
          id: string
          modelo: string | null
          numero: string
          observacoes: string | null
          paciente_id: string | null
          status: Database["public"]["Enums"]["equipment_status"]
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_entrega?: string | null
          data_retirada?: string | null
          empresa_id?: string | null
          id?: string
          modelo?: string | null
          numero: string
          observacoes?: string | null
          paciente_id?: string | null
          status?: Database["public"]["Enums"]["equipment_status"]
          tipo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_entrega?: string | null
          data_retirada?: string | null
          empresa_id?: string | null
          id?: string
          modelo?: string | null
          numero?: string
          observacoes?: string | null
          paciente_id?: string | null
          status?: Database["public"]["Enums"]["equipment_status"]
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      installations: {
        Row: {
          created_at: string
          created_by: string | null
          data_agendada: string | null
          data_prevista: string | null
          data_realizada: string | null
          data_solicitacao: string | null
          empresa_id: string | null
          equipamento_id: string | null
          id: string
          motivo_nao_realizacao: string | null
          numero_equipamento: string | null
          observacoes: string | null
          paciente_id: string
          responsavel: string | null
          status: Database["public"]["Enums"]["service_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_agendada?: string | null
          data_prevista?: string | null
          data_realizada?: string | null
          data_solicitacao?: string | null
          empresa_id?: string | null
          equipamento_id?: string | null
          id?: string
          motivo_nao_realizacao?: string | null
          numero_equipamento?: string | null
          observacoes?: string | null
          paciente_id: string
          responsavel?: string | null
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_agendada?: string | null
          data_prevista?: string | null
          data_realizada?: string | null
          data_solicitacao?: string | null
          empresa_id?: string | null
          equipamento_id?: string | null
          id?: string
          motivo_nao_realizacao?: string | null
          numero_equipamento?: string | null
          observacoes?: string | null
          paciente_id?: string
          responsavel?: string | null
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "installations_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installations_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installations_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      occurrences: {
        Row: {
          created_at: string
          created_by: string | null
          descricao: string | null
          gravidade: string
          id: string
          paciente_id: string | null
          situacao: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          gravidade?: string
          id?: string
          paciente_id?: string | null
          situacao?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          gravidade?: string
          id?: string
          paciente_id?: string | null
          situacao?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "occurrences_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_history: {
        Row: {
          categoria: string | null
          detalhe: string | null
          evento: string
          id: string
          ocorrido_em: string
          paciente_id: string
          usuario_id: string | null
        }
        Insert: {
          categoria?: string | null
          detalhe?: string | null
          evento: string
          id?: string
          ocorrido_em?: string
          paciente_id: string
          usuario_id?: string | null
        }
        Update: {
          categoria?: string | null
          detalhe?: string | null
          evento?: string
          id?: string
          ocorrido_em?: string
          paciente_id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_history_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          ativo: boolean
          bairro: string | null
          cartao_sus: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          cpf: string | null
          created_at: string
          created_by: string | null
          data_autorizacao: string | null
          data_implantacao: string | null
          data_nascimento: string | null
          data_prevista_implantacao: string | null
          data_prevista_retirada: string | null
          data_retirada: string | null
          data_solicitacao: string | null
          empresa_id: string | null
          estado: string | null
          id: string
          logradouro: string | null
          nome: string
          numero: string | null
          numero_equipamento: string | null
          obs_admin: string | null
          observacoes: string | null
          parentesco: string | null
          periodicidade_recarga_dias: number | null
          proxima_recarga: string | null
          referencia: string | null
          responsavel: string | null
          status: Database["public"]["Enums"]["patient_status"]
          telefone: string | null
          telefone_alt: string | null
          tipo_equipamento: string | null
          tipo_oxigenio: string | null
          ultima_recarga: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ativo?: boolean
          bairro?: string | null
          cartao_sus?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          data_autorizacao?: string | null
          data_implantacao?: string | null
          data_nascimento?: string | null
          data_prevista_implantacao?: string | null
          data_prevista_retirada?: string | null
          data_retirada?: string | null
          data_solicitacao?: string | null
          empresa_id?: string | null
          estado?: string | null
          id?: string
          logradouro?: string | null
          nome: string
          numero?: string | null
          numero_equipamento?: string | null
          obs_admin?: string | null
          observacoes?: string | null
          parentesco?: string | null
          periodicidade_recarga_dias?: number | null
          proxima_recarga?: string | null
          referencia?: string | null
          responsavel?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          telefone?: string | null
          telefone_alt?: string | null
          tipo_equipamento?: string | null
          tipo_oxigenio?: string | null
          ultima_recarga?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ativo?: boolean
          bairro?: string | null
          cartao_sus?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          data_autorizacao?: string | null
          data_implantacao?: string | null
          data_nascimento?: string | null
          data_prevista_implantacao?: string | null
          data_prevista_retirada?: string | null
          data_retirada?: string | null
          data_solicitacao?: string | null
          empresa_id?: string | null
          estado?: string | null
          id?: string
          logradouro?: string | null
          nome?: string
          numero?: string | null
          numero_equipamento?: string | null
          obs_admin?: string | null
          observacoes?: string | null
          parentesco?: string | null
          periodicidade_recarga_dias?: number | null
          proxima_recarga?: string | null
          referencia?: string | null
          responsavel?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          telefone?: string | null
          telefone_alt?: string | null
          tipo_equipamento?: string | null
          tipo_oxigenio?: string | null
          ultima_recarga?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cargo: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          email?: string | null
          id: string
          nome?: string
          updated_at?: string
        }
        Update: {
          cargo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      refills: {
        Row: {
          created_at: string
          created_by: string | null
          data_agendada: string | null
          data_prevista: string | null
          data_realizada: string | null
          data_solicitacao: string | null
          empresa_id: string | null
          id: string
          numero_nota: string | null
          numero_os: string | null
          numero_pedido: string | null
          observacoes: string | null
          paciente_id: string
          quantidade: number | null
          status: Database["public"]["Enums"]["service_status"]
          tipo_oxigenio: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_agendada?: string | null
          data_prevista?: string | null
          data_realizada?: string | null
          data_solicitacao?: string | null
          empresa_id?: string | null
          id?: string
          numero_nota?: string | null
          numero_os?: string | null
          numero_pedido?: string | null
          observacoes?: string | null
          paciente_id: string
          quantidade?: number | null
          status?: Database["public"]["Enums"]["service_status"]
          tipo_oxigenio?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_agendada?: string | null
          data_prevista?: string | null
          data_realizada?: string | null
          data_solicitacao?: string | null
          empresa_id?: string | null
          id?: string
          numero_nota?: string | null
          numero_os?: string | null
          numero_pedido?: string | null
          observacoes?: string | null
          paciente_id?: string
          quantidade?: number | null
          status?: Database["public"]["Enums"]["service_status"]
          tipo_oxigenio?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refills_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refills_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      removals: {
        Row: {
          created_at: string
          created_by: string | null
          data_agendada: string | null
          data_prevista: string | null
          data_realizada: string | null
          data_solicitacao: string | null
          empresa_id: string | null
          equipamento_id: string | null
          id: string
          motivo: string | null
          motivo_nao_realizacao: string | null
          numero_equipamento: string | null
          observacoes: string | null
          paciente_id: string
          responsavel: string | null
          status: Database["public"]["Enums"]["service_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_agendada?: string | null
          data_prevista?: string | null
          data_realizada?: string | null
          data_solicitacao?: string | null
          empresa_id?: string | null
          equipamento_id?: string | null
          id?: string
          motivo?: string | null
          motivo_nao_realizacao?: string | null
          numero_equipamento?: string | null
          observacoes?: string | null
          paciente_id: string
          responsavel?: string | null
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_agendada?: string | null
          data_prevista?: string | null
          data_realizada?: string | null
          data_solicitacao?: string | null
          empresa_id?: string | null
          equipamento_id?: string | null
          id?: string
          motivo?: string | null
          motivo_nao_realizacao?: string | null
          numero_equipamento?: string | null
          observacoes?: string | null
          paciente_id?: string
          responsavel?: string | null
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "removals_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "removals_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "removals_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      pode_editar: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "gestor" | "operador" | "consulta" | "auditor"
      equipment_status:
        | "disponivel"
        | "em_uso"
        | "em_manutencao"
        | "retirado"
        | "inativo"
      patient_status:
        | "solicitacao_recebida"
        | "em_analise"
        | "aguardando_implantacao"
        | "implantacao_agendada"
        | "implantacao_realizada"
        | "oxigenio_ativo"
        | "recarga_solicitada"
        | "recarga_agendada"
        | "recarga_realizada"
        | "retirada_solicitada"
        | "retirada_agendada"
        | "retirada_realizada"
        | "encerrado"
        | "cancelado"
      service_status:
        | "solicitada"
        | "agendada"
        | "realizada"
        | "nao_realizada"
        | "cancelada"
        | "atrasada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "gestor", "operador", "consulta", "auditor"],
      equipment_status: [
        "disponivel",
        "em_uso",
        "em_manutencao",
        "retirado",
        "inativo",
      ],
      patient_status: [
        "solicitacao_recebida",
        "em_analise",
        "aguardando_implantacao",
        "implantacao_agendada",
        "implantacao_realizada",
        "oxigenio_ativo",
        "recarga_solicitada",
        "recarga_agendada",
        "recarga_realizada",
        "retirada_solicitada",
        "retirada_agendada",
        "retirada_realizada",
        "encerrado",
        "cancelado",
      ],
      service_status: [
        "solicitada",
        "agendada",
        "realizada",
        "nao_realizada",
        "cancelada",
        "atrasada",
      ],
    },
  },
} as const
