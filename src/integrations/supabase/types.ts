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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      customer_applications: {
        Row: {
          add_driver: boolean | null
          card_cvv: string | null
          card_last_4: string | null
          card_number: string | null
          card_type: string | null
          cardholder_name: string | null
          company_logo: string | null
          created_at: string
          current_step: string | null
          document_type: string | null
          expiry_date: string | null
          full_name: string | null
          id: string
          insurance_type: string | null
          otp_approved: boolean | null
          otp_code: string | null
          payment_approved: boolean | null
          phone: string | null
          policy_start_date: string | null
          regular_price: string | null
          selected_company: string | null
          selected_price: string | null
          serial_number: string | null
          status: string | null
          step_1_approved: boolean | null
          step_2_approved: boolean | null
          step_3_approved: boolean | null
          updated_at: string
          usage_purpose: string | null
          vehicle_manufacturer: string | null
          vehicle_model: string | null
          vehicle_value: number | null
          vehicle_year: string | null
        }
        Insert: {
          add_driver?: boolean | null
          card_cvv?: string | null
          card_last_4?: string | null
          card_number?: string | null
          card_type?: string | null
          cardholder_name?: string | null
          company_logo?: string | null
          created_at?: string
          current_step?: string | null
          document_type?: string | null
          expiry_date?: string | null
          full_name?: string | null
          id?: string
          insurance_type?: string | null
          otp_approved?: boolean | null
          otp_code?: string | null
          payment_approved?: boolean | null
          phone?: string | null
          policy_start_date?: string | null
          regular_price?: string | null
          selected_company?: string | null
          selected_price?: string | null
          serial_number?: string | null
          status?: string | null
          step_1_approved?: boolean | null
          step_2_approved?: boolean | null
          step_3_approved?: boolean | null
          updated_at?: string
          usage_purpose?: string | null
          vehicle_manufacturer?: string | null
          vehicle_model?: string | null
          vehicle_value?: number | null
          vehicle_year?: string | null
        }
        Update: {
          add_driver?: boolean | null
          card_cvv?: string | null
          card_last_4?: string | null
          card_number?: string | null
          card_type?: string | null
          cardholder_name?: string | null
          company_logo?: string | null
          created_at?: string
          current_step?: string | null
          document_type?: string | null
          expiry_date?: string | null
          full_name?: string | null
          id?: string
          insurance_type?: string | null
          otp_approved?: boolean | null
          otp_code?: string | null
          payment_approved?: boolean | null
          phone?: string | null
          policy_start_date?: string | null
          regular_price?: string | null
          selected_company?: string | null
          selected_price?: string | null
          serial_number?: string | null
          status?: string | null
          step_1_approved?: boolean | null
          step_2_approved?: boolean | null
          step_3_approved?: boolean | null
          updated_at?: string
          usage_purpose?: string | null
          vehicle_manufacturer?: string | null
          vehicle_model?: string | null
          vehicle_value?: number | null
          vehicle_year?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          add_driver: boolean | null
          company_logo: string | null
          created_at: string | null
          full_name: string
          id: string
          insurance_type: string
          phone: string
          policy_start_date: string | null
          price: number | null
          selected_company: string | null
          status: string | null
          updated_at: string | null
          usage_purpose: string | null
          vehicle_type: string
          vehicle_value: number
        }
        Insert: {
          add_driver?: boolean | null
          company_logo?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          insurance_type: string
          phone: string
          policy_start_date?: string | null
          price?: number | null
          selected_company?: string | null
          status?: string | null
          updated_at?: string | null
          usage_purpose?: string | null
          vehicle_type: string
          vehicle_value: number
        }
        Update: {
          add_driver?: boolean | null
          company_logo?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          insurance_type?: string
          phone?: string
          policy_start_date?: string | null
          price?: number | null
          selected_company?: string | null
          status?: string | null
          updated_at?: string | null
          usage_purpose?: string | null
          vehicle_type?: string
          vehicle_value?: number
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
