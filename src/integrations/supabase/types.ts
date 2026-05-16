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
      chat_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          nutrition_data: Json | null
          started_at: string | null
          summary: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          nutrition_data?: Json | null
          started_at?: string | null
          summary?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          nutrition_data?: Json | null
          started_at?: string | null
          summary?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_summaries: {
        Row: {
          ai_notes: string | null
          calories_consumed: number | null
          carbs_g: number | null
          created_at: string
          date: string
          fat_g: number | null
          fiber_g: number | null
          goal_hit_percent: number | null
          id: string
          protein_g: number | null
          streak_day: number | null
          user_id: string
          water_ml: number | null
        }
        Insert: {
          ai_notes?: string | null
          calories_consumed?: number | null
          carbs_g?: number | null
          created_at?: string
          date: string
          fat_g?: number | null
          fiber_g?: number | null
          goal_hit_percent?: number | null
          id?: string
          protein_g?: number | null
          streak_day?: number | null
          user_id: string
          water_ml?: number | null
        }
        Update: {
          ai_notes?: string | null
          calories_consumed?: number | null
          carbs_g?: number | null
          created_at?: string
          date?: string
          fat_g?: number | null
          fiber_g?: number | null
          goal_hit_percent?: number | null
          id?: string
          protein_g?: number | null
          streak_day?: number | null
          user_id?: string
          water_ml?: number | null
        }
        Relationships: []
      }
      monthly_summaries: {
        Row: {
          ai_notes: string | null
          avg_daily_calories: number | null
          avg_goal_percent: number | null
          avg_protein_g: number | null
          best_week: string | null
          created_at: string
          id: string
          month: string
          user_id: string
          weight_change_kg: number | null
        }
        Insert: {
          ai_notes?: string | null
          avg_daily_calories?: number | null
          avg_goal_percent?: number | null
          avg_protein_g?: number | null
          best_week?: string | null
          created_at?: string
          id?: string
          month: string
          user_id: string
          weight_change_kg?: number | null
        }
        Update: {
          ai_notes?: string | null
          avg_daily_calories?: number | null
          avg_goal_percent?: number | null
          avg_protein_g?: number | null
          best_week?: string | null
          created_at?: string
          id?: string
          month?: string
          user_id?: string
          weight_change_kg?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          calcium_mg: number | null
          calories: number | null
          carbs_g: number | null
          fat_g: number | null
          fiber_g: number | null
          id: string
          iron_mg: number | null
          protein_g: number | null
          updated_at: string
          user_id: string
          vitamin_c_mg: number | null
          water_ml: number | null
        }
        Insert: {
          calcium_mg?: number | null
          calories?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          id?: string
          iron_mg?: number | null
          protein_g?: number | null
          updated_at?: string
          user_id: string
          vitamin_c_mg?: number | null
          water_ml?: number | null
        }
        Update: {
          calcium_mg?: number | null
          calories?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          id?: string
          iron_mg?: number | null
          protein_g?: number | null
          updated_at?: string
          user_id?: string
          vitamin_c_mg?: number | null
          water_ml?: number | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          created_at: string
          dietary_preferences: string[] | null
          goal: string | null
          health_conditions: string[] | null
          height_cm: number | null
          id: string
          name: string | null
          onboarding_complete: boolean
          sex: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          dietary_preferences?: string[] | null
          goal?: string | null
          health_conditions?: string[] | null
          height_cm?: number | null
          id: string
          name?: string | null
          onboarding_complete?: boolean
          sex?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          dietary_preferences?: string[] | null
          goal?: string | null
          health_conditions?: string[] | null
          height_cm?: number | null
          id?: string
          name?: string | null
          onboarding_complete?: boolean
          sex?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      weekly_summaries: {
        Row: {
          ai_notes: string | null
          avg_calories: number | null
          avg_fiber_g: number | null
          avg_goal_percent: number | null
          avg_protein_g: number | null
          best_day: string | null
          created_at: string
          id: string
          user_id: string
          week_start: string
          weight_end_kg: number | null
          weight_start_kg: number | null
          worst_day: string | null
        }
        Insert: {
          ai_notes?: string | null
          avg_calories?: number | null
          avg_fiber_g?: number | null
          avg_goal_percent?: number | null
          avg_protein_g?: number | null
          best_day?: string | null
          created_at?: string
          id?: string
          user_id: string
          week_start: string
          weight_end_kg?: number | null
          weight_start_kg?: number | null
          worst_day?: string | null
        }
        Update: {
          ai_notes?: string | null
          avg_calories?: number | null
          avg_fiber_g?: number | null
          avg_goal_percent?: number | null
          avg_protein_g?: number | null
          best_day?: string | null
          created_at?: string
          id?: string
          user_id?: string
          week_start?: string
          weight_end_kg?: number | null
          weight_start_kg?: number | null
          worst_day?: string | null
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          id: string
          logged_at: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          id?: string
          logged_at?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          id?: string
          logged_at?: string
          user_id?: string
          weight_kg?: number
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
