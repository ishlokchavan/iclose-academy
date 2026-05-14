// =============================================================================
// AUTO-GENERATED — do not edit by hand.
// Regenerate with: pnpm db:types  (or via the Supabase MCP `generate_typescript_types`).
// `__InternalSupabase` is intentionally stripped — see src/lib/supabase/{server,client}.ts
// for the cast back to SupabaseClient<Database> (compat with @supabase/ssr@0.5.2).
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      areas: {
        Row: {
          archived_at: string | null;
          created_at: string;
          description: string | null;
          educator_id: string | null;
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          description?: string | null;
          educator_id?: string | null;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          description?: string | null;
          educator_id?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      educator_assignments: {
        Row: {
          id: string;
          educator_id: string;
          area_id: string;
          type_id: string | null;
          subarea: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          educator_id: string;
          area_id: string;
          type_id?: string | null;
          subarea?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          educator_id?: string;
          area_id?: string;
          type_id?: string | null;
          subarea?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      inquiries: {
        Row: {
          area_id: string | null;
          assigned_educator_id: string | null;
          created_at: string;
          description: string;
          email: string;
          id: string;
          learner_id: string;
          phone: string | null;
          resolved_at: string | null;
          source_topic_id: string | null;
          status: Database["public"]["Enums"]["inquiry_status"];
          subarea: string | null;
          type_id: string | null;
          updated_at: string;
        };
        Insert: {
          area_id?: string | null;
          assigned_educator_id?: string | null;
          created_at?: string;
          description: string;
          email: string;
          id?: string;
          learner_id: string;
          phone?: string | null;
          resolved_at?: string | null;
          source_topic_id?: string | null;
          status?: Database["public"]["Enums"]["inquiry_status"];
          subarea?: string | null;
          type_id?: string | null;
          updated_at?: string;
        };
        Update: {
          area_id?: string | null;
          assigned_educator_id?: string | null;
          created_at?: string;
          description?: string;
          email?: string;
          id?: string;
          learner_id?: string;
          phone?: string | null;
          resolved_at?: string | null;
          source_topic_id?: string | null;
          status?: Database["public"]["Enums"]["inquiry_status"];
          subarea?: string | null;
          type_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      inquiry_subtypes: {
        Row: { inquiry_id: string; subtype_id: string };
        Insert: { inquiry_id: string; subtype_id: string };
        Update: { inquiry_id?: string; subtype_id?: string };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          full_name: string | null;
          headline: string | null;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          full_name?: string | null;
          headline?: string | null;
          id: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          full_name?: string | null;
          headline?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      property_subtypes: {
        Row: {
          archived_at: string | null;
          created_at: string;
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          type_id: string;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          type_id: string;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          type_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_subtypes_type_id_fkey";
            columns: ["type_id"];
            isOneToOne: false;
            referencedRelation: "property_types";
            referencedColumns: ["id"];
          },
        ];
      };
      property_types: {
        Row: {
          archived_at: string | null;
          created_at: string;
          id: string;
          name: string;
          slug: string;
          sort_order: number;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      saved_items: {
        Row: {
          created_at: string;
          entity_id: string;
          entity_type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          entity_id: string;
          entity_type: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      topic_resources: {
        Row: {
          created_at: string;
          id: string;
          kind: string;
          label: string;
          sort_order: number;
          storage_path: string | null;
          topic_id: string;
          url: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          kind?: string;
          label: string;
          sort_order?: number;
          storage_path?: string | null;
          topic_id: string;
          url?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          kind?: string;
          label?: string;
          sort_order?: number;
          storage_path?: string | null;
          topic_id?: string;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "topic_resources_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
        ];
      };
      topic_subtypes: {
        Row: { subtype_id: string; topic_id: string };
        Insert: { subtype_id: string; topic_id: string };
        Update: { subtype_id?: string; topic_id?: string };
        Relationships: [];
      };
      topics: {
        Row: {
          archived_at: string | null;
          area_id: string | null;
          cover_url: string | null;
          created_at: string;
          description: string | null;
          educator_id: string;
          id: string;
          published_at: string | null;
          slug: string;
          status: Database["public"]["Enums"]["topic_status"];
          subarea: string | null;
          title: string;
          type_id: string | null;
          updated_at: string;
          youtube_id: string | null;
        };
        Insert: {
          archived_at?: string | null;
          area_id?: string | null;
          cover_url?: string | null;
          created_at?: string;
          description?: string | null;
          educator_id: string;
          id?: string;
          published_at?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["topic_status"];
          subarea?: string | null;
          title: string;
          type_id?: string | null;
          updated_at?: string;
          youtube_id?: string | null;
        };
        Update: {
          archived_at?: string | null;
          area_id?: string | null;
          cover_url?: string | null;
          created_at?: string;
          description?: string | null;
          educator_id?: string;
          id?: string;
          published_at?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["topic_status"];
          subarea?: string | null;
          title?: string;
          type_id?: string | null;
          updated_at?: string;
          youtube_id?: string | null;
        };
        Relationships: [];
      };
      platform_settings: {
        Row: {
          description: string | null;
          key: string;
          updated_at: string;
          updated_by: string | null;
          value: Json;
        };
        Insert: {
          description?: string | null;
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Update: {
          description?: string | null;
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
    };
    Views: {
      user_emails: {
        Row: { email: string | null; id: string | null };
        Insert: { email?: string | null; id?: string | null };
        Update: { email?: string | null; id?: string | null };
        Relationships: [];
      };
    };
    Functions: {
      current_user_role: { Args: never; Returns: string };
      is_admin: { Args: never; Returns: boolean };
      is_staff: { Args: never; Returns: boolean };
      reroute_inquiry: { Args: { p_inquiry_id: string }; Returns: undefined };
      set_app_metadata_role: {
        Args: { p_role: string; p_user_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      app_role: "learner" | "educator" | "content_manager" | "admin";
      inquiry_status: "open" | "assigned" | "in_progress" | "closed";
      topic_status: "draft" | "in_review" | "published" | "archived";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type DatabaseWithoutInternals = Database;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;
