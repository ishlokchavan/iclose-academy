// =============================================================================
// AUTO-GENERATED — do not edit by hand.
// Regenerate with: pnpm db:types  (which calls `supabase gen types typescript`)
// or via the Supabase MCP `generate_typescript_types` tool.
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      enrollments: {
        Row: {
          completed_at: string | null;
          enrolled_at: string;
          id: string;
          status: Database["public"]["Enums"]["enrollment_status"];
          track_id: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          enrolled_at?: string;
          id?: string;
          status?: Database["public"]["Enums"]["enrollment_status"];
          track_id: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          enrolled_at?: string;
          id?: string;
          status?: Database["public"]["Enums"]["enrollment_status"];
          track_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "tracks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      entitlements: {
        Row: {
          expires_at: string | null;
          granted_at: string;
          id: string;
          source_id: string | null;
          source_type: string;
          user_id: string;
        };
        Insert: {
          expires_at?: string | null;
          granted_at?: string;
          id?: string;
          source_id?: string | null;
          source_type: string;
          user_id: string;
        };
        Update: {
          expires_at?: string | null;
          granted_at?: string;
          id?: string;
          source_id?: string | null;
          source_type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "entitlements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_resources: {
        Row: {
          created_at: string;
          id: string;
          kind: string;
          label: string;
          lesson_id: string;
          sort_order: number;
          storage_path: string | null;
          url: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          kind?: string;
          label: string;
          lesson_id: string;
          sort_order?: number;
          storage_path?: string | null;
          url?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          kind?: string;
          label?: string;
          lesson_id?: string;
          sort_order?: number;
          storage_path?: string | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_resources_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          chapters: Json;
          created_at: string;
          duration_seconds: number | null;
          id: string;
          is_preview: boolean;
          module_id: string;
          position: number;
          summary: string | null;
          title: string;
          updated_at: string;
          youtube_id: string | null;
        };
        Insert: {
          chapters?: Json;
          created_at?: string;
          duration_seconds?: number | null;
          id?: string;
          is_preview?: boolean;
          module_id: string;
          position: number;
          summary?: string | null;
          title: string;
          updated_at?: string;
          youtube_id?: string | null;
        };
        Update: {
          chapters?: Json;
          created_at?: string;
          duration_seconds?: number | null;
          id?: string;
          is_preview?: boolean;
          module_id?: string;
          position?: number;
          summary?: string | null;
          title?: string;
          updated_at?: string;
          youtube_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
        ];
      };
      modules: {
        Row: {
          created_at: string;
          id: string;
          position: number;
          summary: string | null;
          title: string;
          track_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          position: number;
          summary?: string | null;
          title: string;
          track_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          position?: number;
          summary?: string | null;
          title?: string;
          track_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "modules_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "tracks";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          monthly_price_cents: number | null;
          name: string;
          slug: string;
          updated_at: string;
          yearly_price_cents: number | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          monthly_price_cents?: number | null;
          name: string;
          slug: string;
          updated_at?: string;
          yearly_price_cents?: number | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          monthly_price_cents?: number | null;
          name?: string;
          slug?: string;
          updated_at?: string;
          yearly_price_cents?: number | null;
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
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          full_name: string | null;
          headline: string | null;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          specialty_id: string | null;
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
          specialty_id?: string | null;
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
          specialty_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_specialty_fk";
            columns: ["specialty_id"];
            isOneToOne: false;
            referencedRelation: "specialties";
            referencedColumns: ["id"];
          },
        ];
      };
      progress: {
        Row: {
          completed_at: string | null;
          id: string;
          lesson_id: string;
          position_seconds: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          id?: string;
          lesson_id: string;
          position_seconds?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          id?: string;
          lesson_id?: string;
          position_seconds?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "progress_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          rating: number;
          track_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          rating: number;
          track_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          rating?: number;
          track_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "tracks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "saved_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      search_documents: {
        Row: {
          body: string | null;
          entity_id: string;
          entity_type: string;
          level_id: string | null;
          search_vec: unknown;
          specialty_id: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          body?: string | null;
          entity_id: string;
          entity_type: string;
          level_id?: string | null;
          search_vec?: unknown;
          specialty_id?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          body?: string | null;
          entity_id?: string;
          entity_type?: string;
          level_id?: string | null;
          search_vec?: unknown;
          specialty_id?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "search_documents_level_id_fkey";
            columns: ["level_id"];
            isOneToOne: false;
            referencedRelation: "track_levels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "search_documents_specialty_id_fkey";
            columns: ["specialty_id"];
            isOneToOne: false;
            referencedRelation: "specialties";
            referencedColumns: ["id"];
          },
        ];
      };
      specialties: {
        Row: {
          archived_at: string | null;
          created_at: string;
          description: string | null;
          icon: string | null;
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
          icon?: string | null;
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
          icon?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: { created_at: string; id: string; name: string; slug: string };
        Insert: { created_at?: string; id?: string; name: string; slug: string };
        Update: { created_at?: string; id?: string; name?: string; slug?: string };
        Relationships: [];
      };
      track_categories: {
        Row: {
          archived_at: string | null;
          created_at: string;
          id: string;
          name: string;
          parent_id: string | null;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          parent_id?: string | null;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          parent_id?: string | null;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "track_categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "track_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      track_levels: {
        Row: {
          archived_at: string | null;
          created_at: string;
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      track_tags: {
        Row: { tag_id: string; track_id: string };
        Insert: { tag_id: string; track_id: string };
        Update: { tag_id?: string; track_id?: string };
        Relationships: [
          {
            foreignKeyName: "track_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "track_tags_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "tracks";
            referencedColumns: ["id"];
          },
        ];
      };
      tracks: {
        Row: {
          archived_at: string | null;
          category_id: string | null;
          cover_url: string | null;
          created_at: string;
          description: string | null;
          duration_minutes: number | null;
          educator_id: string;
          hero_url: string | null;
          id: string;
          level_id: string | null;
          outcomes: Json;
          prerequisites: Json;
          published_at: string | null;
          slug: string;
          specialty_id: string | null;
          status: Database["public"]["Enums"]["track_status"];
          subtitle: string | null;
          summary: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          category_id?: string | null;
          cover_url?: string | null;
          created_at?: string;
          description?: string | null;
          duration_minutes?: number | null;
          educator_id: string;
          hero_url?: string | null;
          id?: string;
          level_id?: string | null;
          outcomes?: Json;
          prerequisites?: Json;
          published_at?: string | null;
          slug: string;
          specialty_id?: string | null;
          status?: Database["public"]["Enums"]["track_status"];
          subtitle?: string | null;
          summary?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          category_id?: string | null;
          cover_url?: string | null;
          created_at?: string;
          description?: string | null;
          duration_minutes?: number | null;
          educator_id?: string;
          hero_url?: string | null;
          id?: string;
          level_id?: string | null;
          outcomes?: Json;
          prerequisites?: Json;
          published_at?: string | null;
          slug?: string;
          specialty_id?: string | null;
          status?: Database["public"]["Enums"]["track_status"];
          subtitle?: string | null;
          summary?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tracks_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "track_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tracks_educator_id_fkey";
            columns: ["educator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tracks_level_id_fkey";
            columns: ["level_id"];
            isOneToOne: false;
            referencedRelation: "track_levels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tracks_specialty_id_fkey";
            columns: ["specialty_id"];
            isOneToOne: false;
            referencedRelation: "specialties";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      current_user_role: { Args: never; Returns: string };
      is_admin: { Args: never; Returns: boolean };
      is_staff: { Args: never; Returns: boolean };
    };
    Enums: {
      app_role: "learner" | "educator" | "content_manager" | "admin";
      enrollment_status: "active" | "paused" | "completed" | "revoked";
      track_status: "draft" | "in_review" | "published" | "archived";
    };
    CompositeTypes: { [_ in never]: never };
  };
};
