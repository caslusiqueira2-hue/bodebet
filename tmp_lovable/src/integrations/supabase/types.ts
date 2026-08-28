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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      athletes: {
        Row: {
          age_months: number
          attrs: Json
          belt: string
          created_at: string
          gameplan: Json
          id: string
          legacy: number
          mentors: Json
          name: string
          origin: string | null
          reputation: string
          retired: boolean
          style: string | null
          talent: string | null
          team: string
          titles_count: number
          training_energy: number
          traits: Json
          unspent_xp: number
          updated_at: string
          user_id: string
          weight_class: string
        }
        Insert: {
          age_months?: number
          attrs?: Json
          belt?: string
          created_at?: string
          gameplan?: Json
          id?: string
          legacy?: number
          mentors?: Json
          name: string
          origin?: string | null
          reputation?: string
          retired?: boolean
          style?: string | null
          talent?: string | null
          team: string
          titles_count?: number
          training_energy?: number
          traits?: Json
          unspent_xp?: number
          updated_at?: string
          user_id: string
          weight_class: string
        }
        Update: {
          age_months?: number
          attrs?: Json
          belt?: string
          created_at?: string
          gameplan?: Json
          id?: string
          legacy?: number
          mentors?: Json
          name?: string
          origin?: string | null
          reputation?: string
          retired?: boolean
          style?: string | null
          talent?: string | null
          team?: string
          titles_count?: number
          training_energy?: number
          traits?: Json
          unspent_xp?: number
          updated_at?: string
          user_id?: string
          weight_class?: string
        }
        Relationships: []
      }
      career_fights: {
        Row: {
          athlete_id: string
          athlete_score: number
          bracket: Json
          category: string
          championship_id: string | null
          championship_label: string
          created_at: string
          id: string
          method: string | null
          narrative: string | null
          opp_last_strategy: string | null
          opponent_attrs: Json
          opponent_name: string
          opponent_score: number
          opponent_style: string
          opponent_team: string
          player_strategy_counts: Json
          position: string
          round_index: number
          rounds_log: Json
          started: boolean
          status: string
          time_left_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          athlete_id: string
          athlete_score?: number
          bracket?: Json
          category: string
          championship_id?: string | null
          championship_label: string
          created_at?: string
          id?: string
          method?: string | null
          narrative?: string | null
          opp_last_strategy?: string | null
          opponent_attrs: Json
          opponent_name: string
          opponent_score?: number
          opponent_style: string
          opponent_team: string
          player_strategy_counts?: Json
          position?: string
          round_index: number
          rounds_log?: Json
          started?: boolean
          status?: string
          time_left_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          athlete_id?: string
          athlete_score?: number
          bracket?: Json
          category?: string
          championship_id?: string | null
          championship_label?: string
          created_at?: string
          id?: string
          method?: string | null
          narrative?: string | null
          opp_last_strategy?: string | null
          opponent_attrs?: Json
          opponent_name?: string
          opponent_score?: number
          opponent_style?: string
          opponent_team?: string
          player_strategy_counts?: Json
          position?: string
          round_index?: number
          rounds_log?: Json
          started?: boolean
          status?: string
          time_left_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_fights_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_fights_championship_id_fkey"
            columns: ["championship_id"]
            isOneToOne: false
            referencedRelation: "championships"
            referencedColumns: ["id"]
          },
        ]
      }
      career_results: {
        Row: {
          athlete_id: string
          belt_at_event: string
          category: string
          championship_label: string
          created_at: string
          id: string
          placement: number
          user_id: string
        }
        Insert: {
          athlete_id: string
          belt_at_event: string
          category: string
          championship_label: string
          created_at?: string
          id?: string
          placement: number
          user_id: string
        }
        Update: {
          athlete_id?: string
          belt_at_event?: string
          category?: string
          championship_label?: string
          created_at?: string
          id?: string
          placement?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_results_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      championships: {
        Row: {
          created_at: string
          event: string
          id: string
          year: number
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          year: number
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          year?: number
        }
        Relationships: []
      }
      opponents: {
        Row: {
          attrs: Json
          belt: string
          created_at: string
          era_end: number
          era_start: number
          id: string
          name: string
          style: string
          team: string
          weight_class: string
        }
        Insert: {
          attrs: Json
          belt?: string
          created_at?: string
          era_end: number
          era_start: number
          id?: string
          name: string
          style: string
          team: string
          weight_class: string
        }
        Update: {
          attrs?: Json
          belt?: string
          created_at?: string
          era_end?: number
          era_start?: number
          id?: string
          name?: string
          style?: string
          team?: string
          weight_class?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          display_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      worlds_results: {
        Row: {
          athlete_name: string
          created_at: string
          id: string
          place: number
          team: string | null
          weight_class: string
          year: number
        }
        Insert: {
          athlete_name: string
          created_at?: string
          id?: string
          place: number
          team?: string | null
          weight_class: string
          year: number
        }
        Update: {
          athlete_name?: string
          created_at?: string
          id?: string
          place?: number
          team?: string | null
          weight_class?: string
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
