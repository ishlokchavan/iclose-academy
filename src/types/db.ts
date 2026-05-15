// =============================================================================
// AUTO-GENERATED — do not edit by hand.
// Regenerate with: pnpm db:types  (or via the Supabase MCP `generate_typescript_types`).
// =============================================================================

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
      areas: {
        Row: {
          archived_at: string | null
          created_at: string
          description: string | null
          educator_id: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          description?: string | null
          educator_id?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          description?: string | null
          educator_id?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "areas_educator_id_fkey"
            columns: ["educator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      educator_assignments: {
        Row: {
          area_id: string
          created_at: string
          educator_id: string
          id: string
          subarea: string | null
          type_id: string | null
        }
        Insert: {
          area_id: string
          created_at?: string
          educator_id: string
          id?: string
          subarea?: string | null
          type_id?: string | null
        }
        Update: {
          area_id?: string
          created_at?: string
          educator_id?: string
          id?: string
          subarea?: string | null
          type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "educator_assignments_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "educator_assignments_educator_id_fkey"
            columns: ["educator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "educator_assignments_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "property_types"
            referencedColumns: ["id"]
          },
        ]
      }
      educators: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          expertise: string | null
          first_name: string | null
          id: string
          is_verified: boolean
          last_name: string | null
          name: string
          phone: string | null
          photo_url: string | null
          status: string
          updated_at: string
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          expertise?: string | null
          first_name?: string | null
          id?: string
          is_verified?: boolean
          last_name?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          status?: string
          updated_at?: string
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          expertise?: string | null
          first_name?: string | null
          id?: string
          is_verified?: boolean
          last_name?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          status?: string
          updated_at?: string
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      email_otps: {
        Row: {
          code_hash: string
          consumed_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
        }
        Insert: {
          code_hash: string
          consumed_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
        }
        Update: {
          code_hash?: string
          consumed_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          area_id: string | null
          assigned_educator_id: string | null
          created_at: string
          description: string
          email: string
          id: string
          learner_id: string
          phone: string | null
          resolved_at: string | null
          source_topic_id: string | null
          status: Database["public"]["Enums"]["inquiry_status"]
          subarea: string | null
          type_id: string | null
          updated_at: string
        }
        Insert: {
          area_id?: string | null
          assigned_educator_id?: string | null
          created_at?: string
          description: string
          email: string
          id?: string
          learner_id: string
          phone?: string | null
          resolved_at?: string | null
          source_topic_id?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          subarea?: string | null
          type_id?: string | null
          updated_at?: string
        }
        Update: {
          area_id?: string | null
          assigned_educator_id?: string | null
          created_at?: string
          description?: string
          email?: string
          id?: string
          learner_id?: string
          phone?: string | null
          resolved_at?: string | null
          source_topic_id?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          subarea?: string | null
          type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_assigned_educator_id_fkey"
            columns: ["assigned_educator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_source_topic_id_fkey"
            columns: ["source_topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "property_types"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiry_subtypes: {
        Row: {
          inquiry_id: string
          subtype_id: string
        }
        Insert: {
          inquiry_id: string
          subtype_id: string
        }
        Update: {
          inquiry_id?: string
          subtype_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_subtypes_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_subtypes_subtype_id_fkey"
            columns: ["subtype_id"]
            isOneToOne: false
            referencedRelation: "property_subtypes"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_verified: boolean
          last_name: string | null
          name: string
          phone: string
          plan_key: string
          referer: string | null
          source: string | null
          user_agent: string | null
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          is_verified?: boolean
          last_name?: string | null
          name: string
          phone: string
          plan_key?: string
          referer?: string | null
          source?: string | null
          user_agent?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_verified?: boolean
          last_name?: string | null
          name?: string
          phone?: string
          plan_key?: string
          referer?: string | null
          source?: string | null
          user_agent?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_plan_key_fkey"
            columns: ["plan_key"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["key"]
          },
        ]
      }
      membership_plans: {
        Row: {
          agent_split_pct: number
          billing_cycle: string
          created_at: string
          features_json: Json
          id: string
          is_active: boolean
          is_star: boolean
          key: string
          label: string
          order: number
          price_monthly_aed: number | null
          price_yearly_aed: number | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          agent_split_pct?: number
          billing_cycle?: string
          created_at?: string
          features_json?: Json
          id?: string
          is_active?: boolean
          is_star?: boolean
          key: string
          label: string
          order?: number
          price_monthly_aed?: number | null
          price_yearly_aed?: number | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          agent_split_pct?: number
          billing_cycle?: string
          created_at?: string
          features_json?: Json
          id?: string
          is_active?: boolean
          is_star?: boolean
          key?: string
          label?: string
          order?: number
          price_monthly_aed?: number | null
          price_yearly_aed?: number | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "platform_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          headline: string | null
          id: string
          plan_key: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          headline?: string | null
          id: string
          plan_key?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          headline?: string | null
          id?: string
          plan_key?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_plan_key_fkey"
            columns: ["plan_key"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["key"]
          },
        ]
      }
      property_subtypes: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
          type_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
          type_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_subtypes_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "property_types"
            referencedColumns: ["id"]
          },
        ]
      }
      property_types: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      saved_items: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_applications: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          message: string
          phone: string
          referer: string | null
          status: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          message: string
          phone: string
          referer?: string | null
          status?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string
          phone?: string
          referer?: string | null
          status?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      topic_resources: {
        Row: {
          created_at: string
          id: string
          kind: string
          label: string
          sort_order: number
          storage_path: string | null
          topic_id: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          label: string
          sort_order?: number
          storage_path?: string | null
          topic_id: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          label?: string
          sort_order?: number
          storage_path?: string | null
          topic_id?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topic_resources_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_subtypes: {
        Row: {
          subtype_id: string
          topic_id: string
        }
        Insert: {
          subtype_id: string
          topic_id: string
        }
        Update: {
          subtype_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_subtypes_subtype_id_fkey"
            columns: ["subtype_id"]
            isOneToOne: false
            referencedRelation: "property_subtypes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_subtypes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          archived_at: string | null
          area_id: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          educator_id: string
          educator_record_id: string | null
          id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["topic_status"]
          subarea: string | null
          title: string
          type_id: string | null
          updated_at: string
          youtube_id: string | null
        }
        Insert: {
          archived_at?: string | null
          area_id?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          educator_id: string
          educator_record_id?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["topic_status"]
          subarea?: string | null
          title: string
          type_id?: string | null
          updated_at?: string
          youtube_id?: string | null
        }
        Update: {
          archived_at?: string | null
          area_id?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          educator_id?: string
          educator_record_id?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["topic_status"]
          subarea?: string | null
          title?: string
          type_id?: string | null
          updated_at?: string
          youtube_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_educator_id_fkey"
            columns: ["educator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_educator_record_id_fkey"
            columns: ["educator_record_id"]
            isOneToOne: false
            referencedRelation: "educators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "property_types"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_emails: {
        Row: {
          email: string | null
          id: string | null
        }
        Insert: {
          email?: string | null
          id?: string | null
        }
        Update: {
          email?: string | null
          id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_user_role: { Args: never; Returns: string }
      get_auth_user_id_by_email: { Args: { p_email: string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      reroute_inquiry: { Args: { p_inquiry_id: string }; Returns: undefined }
      set_app_metadata_role: {
        Args: { p_role: string; p_user_id: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "learner" | "educator" | "manager" | "admin"
      inquiry_status: "open" | "assigned" | "in_progress" | "closed"
      topic_status: "draft" | "in_review" | "published" | "archived"
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
    Enums: {
      app_role: ["learner", "educator", "manager", "admin"],
      inquiry_status: ["open", "assigned", "in_progress", "closed"],
      topic_status: ["draft", "in_review", "published", "archived"],
    },
  },
} as const
