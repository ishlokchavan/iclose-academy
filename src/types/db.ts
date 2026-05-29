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
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          actor_role: string | null
          created_at: string
          diff: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_hash: string | null
          request_id: string | null
          source: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          diff?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_hash?: string | null
          request_id?: string | null
          source?: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          diff?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_hash?: string | null
          request_id?: string | null
          source?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      commissions: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          partner_id: string | null
          period: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          partner_id?: string | null
          period?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          partner_id?: string | null
          period?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
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
      hire_remarks: {
        Row: {
          application_id: string
          content: string
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          id: string
        }
        Insert: {
          application_id: string
          content: string
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          id?: string
        }
        Update: {
          application_id?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hire_remarks_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "intern_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hire_remarks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_emails"
            referencedColumns: ["id"]
          },
        ]
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
      intern_applications: {
        Row: {
          consent_marketing: boolean
          consented_at: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          instagram: string | null
          last_name: string
          message: string | null
          phone: string
          referer: string | null
          resume_path: string | null
          status: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          consent_marketing?: boolean
          consented_at?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          instagram?: string | null
          last_name: string
          message?: string | null
          phone: string
          referer?: string | null
          resume_path?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          consent_marketing?: boolean
          consented_at?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          instagram?: string | null
          last_name?: string
          message?: string | null
          phone?: string
          referer?: string | null
          resume_path?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          consent_marketing: boolean
          consented_at: string | null
          created_at: string
          email: string
          first_name: string | null
          focus: string[] | null
          id: string
          intent: string | null
          is_verified: boolean
          last_name: string | null
          name: string
          phone: string
          plan_key: string
          referer: string | null
          referral_code: string | null
          referral_count: number
          referred_by_code: string | null
          referred_by_lead_id: string | null
          source: string | null
          updated_at: string
          user_agent: string | null
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          consent_marketing?: boolean
          consented_at?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          focus?: string[] | null
          id?: string
          intent?: string | null
          is_verified?: boolean
          last_name?: string | null
          name: string
          phone: string
          plan_key?: string
          referer?: string | null
          referral_code?: string | null
          referral_count?: number
          referred_by_code?: string | null
          referred_by_lead_id?: string | null
          source?: string | null
          updated_at?: string
          user_agent?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          consent_marketing?: boolean
          consented_at?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          focus?: string[] | null
          id?: string
          intent?: string | null
          is_verified?: boolean
          last_name?: string | null
          name?: string
          phone?: string
          plan_key?: string
          referer?: string | null
          referral_code?: string | null
          referral_count?: number
          referred_by_code?: string | null
          referred_by_lead_id?: string | null
          source?: string | null
          updated_at?: string
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
          {
            foreignKeyName: "leads_referred_by_lead_id_fkey"
            columns: ["referred_by_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
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
      notifications: {
        Row: {
          actor_id: string | null
          body: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          entity_url: string | null
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          body: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          entity_url?: string | null
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          body?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          entity_url?: string | null
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          code: string
          consent_marketing: boolean
          consented_at: string | null
          created_at: string | null
          email: string
          id: string
          is_verified: boolean
          name: string
          phone: string | null
          referer: string | null
          status: string | null
          updated_at: string
          user_agent: string | null
          user_id: string | null
          verification_token: string
          verified_at: string | null
        }
        Insert: {
          code: string
          consent_marketing?: boolean
          consented_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_verified?: boolean
          name: string
          phone?: string | null
          referer?: string | null
          status?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          verification_token?: string
          verified_at?: string | null
        }
        Update: {
          code?: string
          consent_marketing?: boolean
          consented_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_verified?: boolean
          name?: string
          phone?: string | null
          referer?: string | null
          status?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          verification_token?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_emails"
            referencedColumns: ["id"]
          },
        ]
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
          email: string | null
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
          email?: string | null
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
          email?: string | null
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
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_clicks: {
        Row: {
          code: string
          converted_lead_id: string | null
          country: string | null
          created_at: string
          id: string
          ip_hash: string | null
          landing_path: string | null
          lead_id: string | null
          referer: string | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          code: string
          converted_lead_id?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          landing_path?: string | null
          lead_id?: string | null
          referer?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          code?: string
          converted_lead_id?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          landing_path?: string | null
          lead_id?: string | null
          referer?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_clicks_converted_lead_id_fkey"
            columns: ["converted_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_clicks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_conversions: {
        Row: {
          converted_user_id: string | null
          created_at: string | null
          id: string
          partner_id: string | null
          type: string | null
        }
        Insert: {
          converted_user_id?: string | null
          created_at?: string | null
          id?: string
          partner_id?: string | null
          type?: string | null
        }
        Update: {
          converted_user_id?: string | null
          created_at?: string | null
          id?: string
          partner_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_conversions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
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
          consented_at: string | null
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
          consented_at?: string | null
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
          consented_at?: string | null
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
          educator_id: string | null
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
          educator_id?: string | null
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
          educator_id?: string | null
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
      bump_referral_count: { Args: { p_lead_id: string }; Returns: undefined }
      current_user_role: { Args: never; Returns: string }
      delete_user: { Args: { p_profile_id: string }; Returns: undefined }
      generate_referral_code: { Args: { p_len?: number }; Returns: string }
      get_auth_user_id_by_email: { Args: { p_email: string }; Returns: string }
      get_full_user_profile: { Args: { p_id: string }; Returns: Json }
      insert_notification: {
        Args: {
          p_actor_id: string
          p_body: string
          p_entity_id?: string
          p_entity_type?: string
          p_entity_url?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      notify_min_role: {
        Args: {
          p_actor_id: string
          p_body: string
          p_entity_id?: string
          p_entity_type?: string
          p_entity_url?: string
          p_min_role: string
          p_title: string
          p_type: string
        }
        Returns: undefined
      }
      notify_role: {
        Args: {
          p_actor_id: string
          p_body: string
          p_entity_id?: string
          p_entity_type?: string
          p_entity_url?: string
          p_role: string
          p_title: string
          p_type: string
        }
        Returns: undefined
      }
      referral_stats_for_code: {
        Args: { p_code: string }
        Returns: {
          total_clicks: number
          total_referrals: number
          unique_visitors: number
        }[]
      }
      referral_tree_ancestors: {
        Args: { p_lead_id: string; p_max_depth?: number }
        Returns: {
          created_at: string
          depth: number
          email: string
          id: string
          name: string
          referral_code: string
          referred_by_code: string
          referred_by_lead_id: string
        }[]
      }
      referral_tree_descendants: {
        Args: { p_code: string; p_max_depth?: number }
        Returns: {
          created_at: string
          depth: number
          email: string
          id: string
          is_verified: boolean
          name: string
          parent_id: string
          referral_code: string
          referred_by_code: string
          referred_by_lead_id: string
        }[]
      }
      reroute_inquiry: { Args: { p_inquiry_id: string }; Returns: undefined }
      set_app_metadata_role: {
        Args: { p_role: string; p_user_id: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      upsert_user_lead: {
        Args: {
          p_email: string
          p_first_name: string
          p_last_name: string
          p_phone: string
          p_profile_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "learner" | "educator" | "manager" | "admin" | "partner"
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
      app_role: ["learner", "educator", "manager", "admin", "partner"],
      inquiry_status: ["open", "assigned", "in_progress", "closed"],
      topic_status: ["draft", "in_review", "published", "archived"],
    },
  },
} as const
