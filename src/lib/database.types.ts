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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      business_settings: {
        Row: {
          daily_lunchbox_cap: number
          id: boolean
          lunchbox_price_cents: number
          order_cutoff_hour: number
          sales_tax_basis_points: number
          time_zone: string
          updated_at: string
        }
        Insert: {
          daily_lunchbox_cap: number
          id?: boolean
          lunchbox_price_cents: number
          order_cutoff_hour: number
          sales_tax_basis_points: number
          time_zone: string
          updated_at?: string
        }
        Update: {
          daily_lunchbox_cap?: number
          id?: boolean
          lunchbox_price_cents?: number
          order_cutoff_hour?: number
          sales_tax_basis_points?: number
          time_zone?: string
          updated_at?: string
        }
        Relationships: []
      }
      dishes: {
        Row: {
          created_at: string
          description_en: string
          description_zh: string
          id: string
          name: string
          photo_path: string | null
        }
        Insert: {
          created_at?: string
          description_en?: string
          description_zh?: string
          id?: string
          name: string
          photo_path?: string | null
        }
        Update: {
          created_at?: string
          description_en?: string
          description_zh?: string
          id?: string
          name?: string
          photo_path?: string | null
        }
        Relationships: []
      }
      lunchbox_dishes: {
        Row: {
          delivery_date: string
          dish_id: string
          position: number
        }
        Insert: {
          delivery_date: string
          dish_id: string
          position?: number
        }
        Update: {
          delivery_date?: string
          dish_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "lunchbox_dishes_delivery_date_fkey"
            columns: ["delivery_date"]
            isOneToOne: false
            referencedRelation: "lunchboxes"
            referencedColumns: ["delivery_date"]
          },
          {
            foreignKeyName: "lunchbox_dishes_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
        ]
      }
      lunchboxes: {
        Row: {
          created_at: string
          delivery_date: string
          sides_en: string
          sides_zh: string
        }
        Insert: {
          created_at?: string
          delivery_date: string
          sides_en?: string
          sides_zh?: string
        }
        Update: {
          created_at?: string
          delivery_date?: string
          sides_en?: string
          sides_zh?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          arrived_at: string | null
          confirmed_at: string | null
          created_at: string
          customer_id: string
          delivery_date: string
          id: string
          location_id: string
          picked_up_at: string | null
          quantity: number
          status: string
          subtotal_cents: number
          tax_cents: number
          total_cents: number
          unit_price_cents: number
        }
        Insert: {
          arrived_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_id: string
          delivery_date: string
          id?: string
          location_id: string
          picked_up_at?: string | null
          quantity: number
          status?: string
          subtotal_cents: number
          tax_cents: number
          total_cents: number
          unit_price_cents: number
        }
        Update: {
          arrived_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_id?: string
          delivery_date?: string
          id?: string
          location_id?: string
          picked_up_at?: string | null
          quantity?: number
          status?: string
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_date_fkey"
            columns: ["delivery_date"]
            isOneToOne: false
            referencedRelation: "lunchboxes"
            referencedColumns: ["delivery_date"]
          },
          {
            foreignKeyName: "orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "pickup_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_locations: {
        Row: {
          active: boolean
          address: string
          created_at: string
          id: string
          name_en: string
          name_zh: string
          pickup_note_en: string
          pickup_note_zh: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          address: string
          created_at?: string
          id?: string
          name_en: string
          name_zh: string
          pickup_note_en: string
          pickup_note_zh: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          address?: string
          created_at?: string
          id?: string
          name_en?: string
          name_zh?: string
          pickup_note_en?: string
          pickup_note_zh?: string
          sort_order?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
          sms_consent_at: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          sms_consent_at?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          sms_consent_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      lunchboxes_remaining: { Args: { day: string }; Returns: number }
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
    Enums: {},
  },
} as const
