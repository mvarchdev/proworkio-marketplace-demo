export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  billing: {
    Tables: {
      accounts: {
        Row: {
          company_id: string | null
          created_at: string
          email: string
          fakturownia_client_id: string | null
          id: string
          locale: string
          owner_type: Database["public"]["Enums"]["billing_owner_type"]
          profile_id: string | null
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email: string
          fakturownia_client_id?: string | null
          id?: string
          locale?: string
          owner_type: Database["public"]["Enums"]["billing_owner_type"]
          profile_id?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string
          fakturownia_client_id?: string | null
          id?: string
          locale?: string
          owner_type?: Database["public"]["Enums"]["billing_owner_type"]
          profile_id?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          billing_account_id: string
          created_at: string
          currency: string
          due_at: string | null
          external_invoice_id: string | null
          external_number: string | null
          id: string
          issued_at: string | null
          metadata: Json
          payment_id: string | null
          provider: Database["public"]["Enums"]["webhook_provider"]
          public_url: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subscription_id: string | null
          total_cents: number
          updated_at: string
        }
        Insert: {
          billing_account_id: string
          created_at?: string
          currency?: string
          due_at?: string | null
          external_invoice_id?: string | null
          external_number?: string | null
          id?: string
          issued_at?: string | null
          metadata?: Json
          payment_id?: string | null
          provider?: Database["public"]["Enums"]["webhook_provider"]
          public_url?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subscription_id?: string | null
          total_cents?: number
          updated_at?: string
        }
        Update: {
          billing_account_id?: string
          created_at?: string
          currency?: string
          due_at?: string | null
          external_invoice_id?: string | null
          external_number?: string | null
          id?: string
          issued_at?: string | null
          metadata?: Json
          payment_id?: string | null
          provider?: Database["public"]["Enums"]["webhook_provider"]
          public_url?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subscription_id?: string | null
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_billing_account_id_fkey"
            columns: ["billing_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_unlock_entitlements: {
        Row: {
          amount_cents: number
          company_id: string
          created_at: string
          currency: string
          granted_at: string | null
          id: string
          payment_id: string | null
          request_id: string
          revoked_at: string | null
          status: Database["public"]["Enums"]["unlock_status"]
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          company_id: string
          created_at?: string
          currency?: string
          granted_at?: string | null
          id?: string
          payment_id?: string | null
          request_id: string
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["unlock_status"]
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          company_id?: string
          created_at?: string
          currency?: string
          granted_at?: string | null
          id?: string
          payment_id?: string | null
          request_id?: string
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["unlock_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_unlock_entitlements_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          billing_account_id: string
          checkout_session_id: string | null
          company_id: string | null
          created_at: string
          currency: string
          failed_at: string | null
          id: string
          metadata: Json
          payment_intent_id: string | null
          provider: Database["public"]["Enums"]["webhook_provider"]
          purpose: Database["public"]["Enums"]["payment_purpose"]
          request_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_invoice_id: string | null
          succeeded_at: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          billing_account_id: string
          checkout_session_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          failed_at?: string | null
          id?: string
          metadata?: Json
          payment_intent_id?: string | null
          provider?: Database["public"]["Enums"]["webhook_provider"]
          purpose: Database["public"]["Enums"]["payment_purpose"]
          request_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_invoice_id?: string | null
          succeeded_at?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          billing_account_id?: string
          checkout_session_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          failed_at?: string | null
          id?: string
          metadata?: Json
          payment_intent_id?: string | null
          provider?: Database["public"]["Enums"]["webhook_provider"]
          purpose?: Database["public"]["Enums"]["payment_purpose"]
          request_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_invoice_id?: string | null
          succeeded_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_billing_account_id_fkey"
            columns: ["billing_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_account_id: string
          cancel_at_period_end: boolean
          canceled_at: string | null
          company_id: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          metadata: Json
          plan_code: string
          provider: Database["public"]["Enums"]["webhook_provider"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          billing_account_id: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          company_id: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json
          plan_code?: string
          provider?: Database["public"]["Enums"]["webhook_provider"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          billing_account_id?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          company_id?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json
          plan_code?: string
          provider?: Database["public"]["Enums"]["webhook_provider"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_billing_account_id_fkey"
            columns: ["billing_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  ops: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_profile_id: string | null
          actor_role: Database["public"]["Enums"]["user_role"] | null
          after_payload: Json
          before_payload: Json
          created_at: string
          entity_id: string
          entity_schema: string
          entity_table: string
          id: string
          request_context: Json
        }
        Insert: {
          action: string
          actor_profile_id?: string | null
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          after_payload?: Json
          before_payload?: Json
          created_at?: string
          entity_id: string
          entity_schema: string
          entity_table: string
          id?: string
          request_context?: Json
        }
        Update: {
          action?: string
          actor_profile_id?: string | null
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          after_payload?: Json
          before_payload?: Json
          created_at?: string
          entity_id?: string
          entity_schema?: string
          entity_table?: string
          id?: string
          request_context?: Json
        }
        Relationships: []
      }
      notification_delivery_attempts: {
        Row: {
          attempt_number: number
          attempted_at: string
          channel: Database["public"]["Enums"]["notification_channel"]
          error_code: string | null
          error_message: string | null
          id: string
          message_id: string
          provider: Database["public"]["Enums"]["notification_provider"]
          provider_message_id: string | null
          provider_response: Json
          status: Database["public"]["Enums"]["notification_attempt_status"]
        }
        Insert: {
          attempt_number?: number
          attempted_at?: string
          channel: Database["public"]["Enums"]["notification_channel"]
          error_code?: string | null
          error_message?: string | null
          id?: string
          message_id: string
          provider: Database["public"]["Enums"]["notification_provider"]
          provider_message_id?: string | null
          provider_response?: Json
          status?: Database["public"]["Enums"]["notification_attempt_status"]
        }
        Update: {
          attempt_number?: number
          attempted_at?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          error_code?: string | null
          error_message?: string | null
          id?: string
          message_id?: string
          provider?: Database["public"]["Enums"]["notification_provider"]
          provider_message_id?: string | null
          provider_response?: Json
          status?: Database["public"]["Enums"]["notification_attempt_status"]
        }
        Relationships: [
          {
            foreignKeyName: "notification_delivery_attempts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "notification_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_messages: {
        Row: {
          aggregate_id: string | null
          aggregate_type: string
          created_at: string
          failed_at: string | null
          fallback_channels: Database["public"]["Enums"]["notification_channel"][]
          final_channel:
            | Database["public"]["Enums"]["notification_channel"]
            | null
          id: string
          locale: string
          payload: Json
          preferred_channels: Database["public"]["Enums"]["notification_channel"][]
          recipient_email: string | null
          recipient_name: string | null
          recipient_phone: string | null
          recipient_whatsapp: string | null
          scheduled_at: string
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          template_code: string
          updated_at: string
        }
        Insert: {
          aggregate_id?: string | null
          aggregate_type: string
          created_at?: string
          failed_at?: string | null
          fallback_channels?: Database["public"]["Enums"]["notification_channel"][]
          final_channel?:
            | Database["public"]["Enums"]["notification_channel"]
            | null
          id?: string
          locale?: string
          payload?: Json
          preferred_channels?: Database["public"]["Enums"]["notification_channel"][]
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          recipient_whatsapp?: string | null
          scheduled_at?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          template_code: string
          updated_at?: string
        }
        Update: {
          aggregate_id?: string | null
          aggregate_type?: string
          created_at?: string
          failed_at?: string | null
          fallback_channels?: Database["public"]["Enums"]["notification_channel"][]
          final_channel?:
            | Database["public"]["Enums"]["notification_channel"]
            | null
          id?: string
          locale?: string
          payload?: Json
          preferred_channels?: Database["public"]["Enums"]["notification_channel"][]
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          recipient_whatsapp?: string | null
          scheduled_at?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          template_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      outbox_events: {
        Row: {
          aggregate_id: string | null
          aggregate_type: string
          attempts: number
          available_at: string
          created_at: string
          dedupe_key: string | null
          event_type: string
          id: string
          last_error: string | null
          payload: Json
          processed_at: string | null
          status: Database["public"]["Enums"]["outbox_status"]
          updated_at: string
        }
        Insert: {
          aggregate_id?: string | null
          aggregate_type: string
          attempts?: number
          available_at?: string
          created_at?: string
          dedupe_key?: string | null
          event_type: string
          id?: string
          last_error?: string | null
          payload?: Json
          processed_at?: string | null
          status?: Database["public"]["Enums"]["outbox_status"]
          updated_at?: string
        }
        Update: {
          aggregate_id?: string | null
          aggregate_type?: string
          attempts?: number
          available_at?: string
          created_at?: string
          dedupe_key?: string | null
          event_type?: string
          id?: string
          last_error?: string | null
          payload?: Json
          processed_at?: string | null
          status?: Database["public"]["Enums"]["outbox_status"]
          updated_at?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          event_type: string
          headers: Json
          id: string
          last_error: string | null
          payload: Json
          processed_at: string | null
          provider: Database["public"]["Enums"]["webhook_provider"]
          provider_event_id: string
          received_at: string
          signature_valid: boolean
          status: Database["public"]["Enums"]["outbox_status"]
        }
        Insert: {
          event_type: string
          headers?: Json
          id?: string
          last_error?: string | null
          payload?: Json
          processed_at?: string | null
          provider: Database["public"]["Enums"]["webhook_provider"]
          provider_event_id: string
          received_at?: string
          signature_valid?: boolean
          status?: Database["public"]["Enums"]["outbox_status"]
        }
        Update: {
          event_type?: string
          headers?: Json
          id?: string
          last_error?: string | null
          payload?: Json
          processed_at?: string | null
          provider?: Database["public"]["Enums"]["webhook_provider"]
          provider_event_id?: string
          received_at?: string
          signature_valid?: boolean
          status?: Database["public"]["Enums"]["outbox_status"]
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
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_profile_id: string | null
          body_markdown_sk: string
          category_id: string | null
          cover_bucket: string | null
          cover_path: string | null
          created_at: string
          excerpt_sk: string
          id: string
          published_at: string | null
          seo_description_sk: string | null
          seo_title_sk: string | null
          slug: string
          status: Database["public"]["Enums"]["blog_post_status"]
          title_sk: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author_profile_id?: string | null
          body_markdown_sk: string
          category_id?: string | null
          cover_bucket?: string | null
          cover_path?: string | null
          created_at?: string
          excerpt_sk: string
          id?: string
          published_at?: string | null
          seo_description_sk?: string | null
          seo_title_sk?: string | null
          slug: string
          status?: Database["public"]["Enums"]["blog_post_status"]
          title_sk: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author_profile_id?: string | null
          body_markdown_sk?: string
          category_id?: string | null
          cover_bucket?: string | null
          cover_path?: string | null
          created_at?: string
          excerpt_sk?: string
          id?: string
          published_at?: string | null
          seo_description_sk?: string | null
          seo_title_sk?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["blog_post_status"]
          title_sk?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_profile_id_fkey"
            columns: ["author_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          depth: number
          description_sk: string
          icon: string
          id: string
          is_active: boolean
          name_sk: string
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          depth?: number
          description_sk: string
          icon: string
          id?: string
          is_active?: boolean
          name_sk: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          depth?: number
          description_sk?: string
          icon?: string
          id?: string
          is_active?: boolean
          name_sk?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      category_field_definitions: {
        Row: {
          created_at: string
          field_key: string
          field_set_id: string
          field_type: Database["public"]["Enums"]["dynamic_field_type"]
          help_text_sk: string | null
          id: string
          is_filterable: boolean
          is_required: boolean
          label_sk: string
          options: Json
          placeholder_sk: string | null
          sort_order: number
          updated_at: string
          validation_rules: Json
        }
        Insert: {
          created_at?: string
          field_key: string
          field_set_id: string
          field_type: Database["public"]["Enums"]["dynamic_field_type"]
          help_text_sk?: string | null
          id?: string
          is_filterable?: boolean
          is_required?: boolean
          label_sk: string
          options?: Json
          placeholder_sk?: string | null
          sort_order?: number
          updated_at?: string
          validation_rules?: Json
        }
        Update: {
          created_at?: string
          field_key?: string
          field_set_id?: string
          field_type?: Database["public"]["Enums"]["dynamic_field_type"]
          help_text_sk?: string | null
          id?: string
          is_filterable?: boolean
          is_required?: boolean
          label_sk?: string
          options?: Json
          placeholder_sk?: string | null
          sort_order?: number
          updated_at?: string
          validation_rules?: Json
        }
        Relationships: [
          {
            foreignKeyName: "category_field_definitions_field_set_id_fkey"
            columns: ["field_set_id"]
            isOneToOne: false
            referencedRelation: "category_field_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      category_field_sets: {
        Row: {
          category_id: string
          created_at: string
          created_by_profile_id: string | null
          description_sk: string | null
          id: string
          is_active: boolean
          scope: Database["public"]["Enums"]["dynamic_field_scope"]
          status: Database["public"]["Enums"]["moderation_status"]
          title_sk: string
          updated_at: string
          version: number
        }
        Insert: {
          category_id: string
          created_at?: string
          created_by_profile_id?: string | null
          description_sk?: string | null
          id?: string
          is_active?: boolean
          scope: Database["public"]["Enums"]["dynamic_field_scope"]
          status?: Database["public"]["Enums"]["moderation_status"]
          title_sk: string
          updated_at?: string
          version: number
        }
        Update: {
          category_id?: string
          created_at?: string
          created_by_profile_id?: string | null
          description_sk?: string | null
          id?: string
          is_active?: boolean
          scope?: Database["public"]["Enums"]["dynamic_field_scope"]
          status?: Database["public"]["Enums"]["moderation_status"]
          title_sk?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "category_field_sets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_field_sets_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          approved_at: string | null
          approved_by_profile_id: string | null
          archived_at: string | null
          base_location: unknown
          city: string
          company_id_number: string | null
          completeness_score: number
          country_code: string
          created_at: string
          created_by_profile_id: string | null
          display_name: string
          duplicate_fingerprint: string | null
          duplicate_of_company_id: string | null
          hero_image_path: string | null
          id: string
          legal_name: string
          logo_bucket: string | null
          logo_path: string | null
          long_description_sk: string
          metadata: Json
          moderation_status: Database["public"]["Enums"]["moderation_status"]
          postal_code: string
          radius_meters: number
          service_area: Json
          short_description_sk: string
          slug: string
          status: Database["public"]["Enums"]["company_status"]
          suspended_at: string | null
          updated_at: string
          vat_id: string | null
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          approved_at?: string | null
          approved_by_profile_id?: string | null
          archived_at?: string | null
          base_location?: unknown
          city: string
          company_id_number?: string | null
          completeness_score?: number
          country_code?: string
          created_at?: string
          created_by_profile_id?: string | null
          display_name: string
          duplicate_fingerprint?: string | null
          duplicate_of_company_id?: string | null
          hero_image_path?: string | null
          id?: string
          legal_name: string
          logo_bucket?: string | null
          logo_path?: string | null
          long_description_sk: string
          metadata?: Json
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          postal_code: string
          radius_meters?: number
          service_area?: Json
          short_description_sk: string
          slug: string
          status?: Database["public"]["Enums"]["company_status"]
          suspended_at?: string | null
          updated_at?: string
          vat_id?: string | null
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          approved_at?: string | null
          approved_by_profile_id?: string | null
          archived_at?: string | null
          base_location?: unknown
          city?: string
          company_id_number?: string | null
          completeness_score?: number
          country_code?: string
          created_at?: string
          created_by_profile_id?: string | null
          display_name?: string
          duplicate_fingerprint?: string | null
          duplicate_of_company_id?: string | null
          hero_image_path?: string | null
          id?: string
          legal_name?: string
          logo_bucket?: string | null
          logo_path?: string | null
          long_description_sk?: string
          metadata?: Json
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          postal_code?: string
          radius_meters?: number
          service_area?: Json
          short_description_sk?: string
          slug?: string
          status?: Database["public"]["Enums"]["company_status"]
          suspended_at?: string | null
          updated_at?: string
          vat_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_approved_by_profile_id_fkey"
            columns: ["approved_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_duplicate_of_company_id_fkey"
            columns: ["duplicate_of_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_duplicate_of_company_id_fkey"
            columns: ["duplicate_of_company_id"]
            isOneToOne: false
            referencedRelation: "company_public_profiles_v1"
            referencedColumns: ["id"]
          },
        ]
      }
      company_categories: {
        Row: {
          category_id: string
          company_id: string
          created_at: string
          id: string
        }
        Insert: {
          category_id: string
          company_id: string
          created_at?: string
          id?: string
        }
        Update: {
          category_id?: string
          company_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_public_profiles_v1"
            referencedColumns: ["id"]
          },
        ]
      }
      company_field_values: {
        Row: {
          company_id: string
          created_at: string
          field_definition_id: string
          id: string
          updated_at: string
          value: Json
        }
        Insert: {
          company_id: string
          created_at?: string
          field_definition_id: string
          id?: string
          updated_at?: string
          value: Json
        }
        Update: {
          company_id?: string
          created_at?: string
          field_definition_id?: string
          id?: string
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "company_field_values_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_field_values_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_public_profiles_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_field_values_field_definition_id_fkey"
            columns: ["field_definition_id"]
            isOneToOne: false
            referencedRelation: "category_field_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      company_gallery_assets: {
        Row: {
          alt_text_sk: string | null
          company_id: string
          created_at: string
          id: string
          sort_order: number
          storage_bucket: string
          storage_path: string
        }
        Insert: {
          alt_text_sk?: string | null
          company_id: string
          created_at?: string
          id?: string
          sort_order?: number
          storage_bucket?: string
          storage_path: string
        }
        Update: {
          alt_text_sk?: string | null
          company_id?: string
          created_at?: string
          id?: string
          sort_order?: number
          storage_bucket?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_gallery_assets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_gallery_assets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_public_profiles_v1"
            referencedColumns: ["id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          profile_id: string
          role: string
          status: Database["public"]["Enums"]["moderation_status"]
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          profile_id: string
          role?: string
          status?: Database["public"]["Enums"]["moderation_status"]
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          profile_id?: string
          role?: string
          status?: Database["public"]["Enums"]["moderation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_public_profiles_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          locale: string
          marketing_consent: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          locale?: string
          marketing_consent?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          locale?: string
          marketing_consent?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      request_company_matches: {
        Row: {
          company_id: string
          created_at: string
          dismissed_at: string | null
          distance_meters: number | null
          explanation: Json
          id: string
          matched_category_id: string | null
          notified_at: string | null
          request_id: string
          score: number
          status: Database["public"]["Enums"]["match_status"]
          unlocked_at: string | null
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          dismissed_at?: string | null
          distance_meters?: number | null
          explanation?: Json
          id?: string
          matched_category_id?: string | null
          notified_at?: string | null
          request_id: string
          score?: number
          status?: Database["public"]["Enums"]["match_status"]
          unlocked_at?: string | null
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          dismissed_at?: string | null
          distance_meters?: number | null
          explanation?: Json
          id?: string
          matched_category_id?: string | null
          notified_at?: string | null
          request_id?: string
          score?: number
          status?: Database["public"]["Enums"]["match_status"]
          unlocked_at?: string | null
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_company_matches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_company_matches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_public_profiles_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_company_matches_matched_category_id_fkey"
            columns: ["matched_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_company_matches_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "request_public_listings_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_company_matches_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_field_values: {
        Row: {
          created_at: string
          field_definition_id: string
          id: string
          request_id: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          field_definition_id: string
          id?: string
          request_id: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          field_definition_id?: string
          id?: string
          request_id?: string
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "request_field_values_field_definition_id_fkey"
            columns: ["field_definition_id"]
            isOneToOne: false
            referencedRelation: "category_field_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_field_values_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "request_public_listings_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_field_values_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_photos: {
        Row: {
          alt_text_sk: string | null
          created_at: string
          id: string
          request_id: string
          sort_order: number
          storage_bucket: string
          storage_path: string
        }
        Insert: {
          alt_text_sk?: string | null
          created_at?: string
          id?: string
          request_id: string
          sort_order?: number
          storage_bucket?: string
          storage_path: string
        }
        Update: {
          alt_text_sk?: string | null
          created_at?: string
          id?: string
          request_id?: string
          sort_order?: number
          storage_bucket?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_photos_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "request_public_listings_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_photos_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          archived_at: string | null
          budget_max_cents: number | null
          budget_min_cents: number | null
          category_id: string
          closed_at: string | null
          confirmation_status: Database["public"]["Enums"]["request_confirmation_status"]
          confirmed_at: string | null
          created_at: string
          customer_profile_id: string | null
          deadline_at: string | null
          description: string
          duplicate_fingerprint: string | null
          duplicate_of_request_id: string | null
          expires_at: string | null
          id: string
          location: unknown
          location_label: string
          metadata: Json
          postal_code: string
          public_code: string
          published_at: string | null
          status: Database["public"]["Enums"]["request_status"]
          subcategory_id: string | null
          subcategory_level2_id: string | null
          terms_accepted_at: string
          title: string
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"]
        }
        Insert: {
          archived_at?: string | null
          budget_max_cents?: number | null
          budget_min_cents?: number | null
          category_id: string
          closed_at?: string | null
          confirmation_status?: Database["public"]["Enums"]["request_confirmation_status"]
          confirmed_at?: string | null
          created_at?: string
          customer_profile_id?: string | null
          deadline_at?: string | null
          description: string
          duplicate_fingerprint?: string | null
          duplicate_of_request_id?: string | null
          expires_at?: string | null
          id?: string
          location?: unknown
          location_label: string
          metadata?: Json
          postal_code: string
          public_code: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          subcategory_id?: string | null
          subcategory_level2_id?: string | null
          terms_accepted_at?: string
          title: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Update: {
          archived_at?: string | null
          budget_max_cents?: number | null
          budget_min_cents?: number | null
          category_id?: string
          closed_at?: string | null
          confirmation_status?: Database["public"]["Enums"]["request_confirmation_status"]
          confirmed_at?: string | null
          created_at?: string
          customer_profile_id?: string | null
          deadline_at?: string | null
          description?: string
          duplicate_fingerprint?: string | null
          duplicate_of_request_id?: string | null
          expires_at?: string | null
          id?: string
          location?: unknown
          location_label?: string
          metadata?: Json
          postal_code?: string
          public_code?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          subcategory_id?: string | null
          subcategory_level2_id?: string | null
          terms_accepted_at?: string
          title?: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Relationships: [
          {
            foreignKeyName: "requests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_duplicate_of_request_id_fkey"
            columns: ["duplicate_of_request_id"]
            isOneToOne: false
            referencedRelation: "request_public_listings_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_duplicate_of_request_id_fkey"
            columns: ["duplicate_of_request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_subcategory_level2_id_fkey"
            columns: ["subcategory_level2_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_name: string
          body_sk: string
          company_id: string
          created_at: string
          customer_profile_id: string | null
          id: string
          moderation_notes: string | null
          published_at: string | null
          rating_percent: number
          request_id: string | null
          status: Database["public"]["Enums"]["review_status"]
          title_sk: string
          updated_at: string
          verified_interaction: boolean
        }
        Insert: {
          author_name: string
          body_sk: string
          company_id: string
          created_at?: string
          customer_profile_id?: string | null
          id?: string
          moderation_notes?: string | null
          published_at?: string | null
          rating_percent: number
          request_id?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          title_sk: string
          updated_at?: string
          verified_interaction?: boolean
        }
        Update: {
          author_name?: string
          body_sk?: string
          company_id?: string
          created_at?: string
          customer_profile_id?: string | null
          id?: string
          moderation_notes?: string | null
          published_at?: string | null
          rating_percent?: number
          request_id?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          title_sk?: string
          updated_at?: string
          verified_interaction?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_public_profiles_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "request_public_listings_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      company_public_profiles_v1: {
        Row: {
          city: string | null
          completeness_score: number | null
          display_name: string | null
          hero_image_path: string | null
          id: string | null
          is_vip: boolean | null
          legal_name: string | null
          logo_bucket: string | null
          logo_path: string | null
          long_description_sk: string | null
          postal_code: string | null
          radius_meters: number | null
          rating_percent: number | null
          reviews_count: number | null
          short_description_sk: string | null
          slug: string | null
        }
        Relationships: []
      }
      request_public_listings_v1: {
        Row: {
          budget_max_cents: number | null
          budget_min_cents: number | null
          category_id: string | null
          confirmation_status:
            | Database["public"]["Enums"]["request_confirmation_status"]
            | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string | null
          location_label: string | null
          public_code: string | null
          published_at: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          subcategory_id: string | null
          subcategory_level2_id: string | null
          title: string | null
          urgency: Database["public"]["Enums"]["urgency_level"] | null
        }
        Insert: {
          budget_max_cents?: number | null
          budget_min_cents?: number | null
          category_id?: string | null
          confirmation_status?:
            | Database["public"]["Enums"]["request_confirmation_status"]
            | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string | null
          location_label?: string | null
          public_code?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          subcategory_id?: string | null
          subcategory_level2_id?: string | null
          title?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Update: {
          budget_max_cents?: number | null
          budget_min_cents?: number | null
          category_id?: string | null
          confirmation_status?:
            | Database["public"]["Enums"]["request_confirmation_status"]
            | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string | null
          location_label?: string | null
          public_code?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          subcategory_id?: string | null
          subcategory_level2_id?: string | null
          title?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_subcategory_level2_id_fkey"
            columns: ["subcategory_level2_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      claim_guest_request: {
        Args: { raw_token: string }
        Returns: {
          archived_at: string | null
          budget_max_cents: number | null
          budget_min_cents: number | null
          category_id: string
          closed_at: string | null
          confirmation_status: Database["public"]["Enums"]["request_confirmation_status"]
          confirmed_at: string | null
          created_at: string
          customer_profile_id: string | null
          deadline_at: string | null
          description: string
          duplicate_fingerprint: string | null
          duplicate_of_request_id: string | null
          expires_at: string | null
          id: string
          location: unknown
          location_label: string
          metadata: Json
          postal_code: string
          public_code: string
          published_at: string | null
          status: Database["public"]["Enums"]["request_status"]
          subcategory_id: string | null
          subcategory_level2_id: string | null
          terms_accepted_at: string
          title: string
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"]
        }
        SetofOptions: {
          from: "*"
          to: "requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      confirm_request: {
        Args: { raw_token: string }
        Returns: {
          archived_at: string | null
          budget_max_cents: number | null
          budget_min_cents: number | null
          category_id: string
          closed_at: string | null
          confirmation_status: Database["public"]["Enums"]["request_confirmation_status"]
          confirmed_at: string | null
          created_at: string
          customer_profile_id: string | null
          deadline_at: string | null
          description: string
          duplicate_fingerprint: string | null
          duplicate_of_request_id: string | null
          expires_at: string | null
          id: string
          location: unknown
          location_label: string
          metadata: Json
          postal_code: string
          public_code: string
          published_at: string | null
          status: Database["public"]["Enums"]["request_status"]
          subcategory_id: string | null
          subcategory_level2_id: string | null
          terms_accepted_at: string
          title: string
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"]
        }
        SetofOptions: {
          from: "*"
          to: "requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_profile_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      enqueue_outbox_event: {
        Args: {
          target_aggregate_id: string
          target_aggregate_type: string
          target_dedupe_key: string
          target_event_type: string
          target_payload?: Json
        }
        Returns: string
      }
      explain_request_match: {
        Args: { target_match_id: string }
        Returns: Json
      }
      generate_public_code: { Args: { prefix?: string }; Returns: string }
      get_request_contact: {
        Args: { target_request_id: string }
        Returns: {
          email: string
          full_name: string
          phone: string
          preferred_channel: Database["public"]["Enums"]["notification_channel"]
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_company_member: {
        Args: { target_company_id: string }
        Returns: boolean
      }
      recompute_company_completeness: {
        Args: { target_company_id: string }
        Returns: number
      }
      run_request_matching: {
        Args: { target_request_id: string }
        Returns: number
      }
      sha256_hex: { Args: { input: string }; Returns: string }
      submit_guest_request: {
        Args: { input: Json }
        Returns: {
          claim_token: string
          confirmation_token: string
          public_code: string
          request_id: string
        }[]
      }
      upsert_company_profile: {
        Args: { input: Json }
        Returns: {
          address_line_1: string
          address_line_2: string | null
          approved_at: string | null
          approved_by_profile_id: string | null
          archived_at: string | null
          base_location: unknown
          city: string
          company_id_number: string | null
          completeness_score: number
          country_code: string
          created_at: string
          created_by_profile_id: string | null
          display_name: string
          duplicate_fingerprint: string | null
          duplicate_of_company_id: string | null
          hero_image_path: string | null
          id: string
          legal_name: string
          logo_bucket: string | null
          logo_path: string | null
          long_description_sk: string
          metadata: Json
          moderation_status: Database["public"]["Enums"]["moderation_status"]
          postal_code: string
          radius_meters: number
          service_area: Json
          short_description_sk: string
          slug: string
          status: Database["public"]["Enums"]["company_status"]
          suspended_at: string | null
          updated_at: string
          vat_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "companies"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      billing_owner_type: "profile" | "company"
      blog_post_status: "draft" | "scheduled" | "published" | "archived"
      company_status:
        | "draft"
        | "pending_verification"
        | "pending_review"
        | "active"
        | "suspended"
        | "rejected"
        | "archived"
      dynamic_field_scope: "request" | "company"
      dynamic_field_type:
        | "text"
        | "textarea"
        | "number"
        | "select"
        | "multi_select"
        | "boolean"
        | "date"
        | "file"
      invoice_status:
        | "draft"
        | "issued"
        | "paid"
        | "overdue"
        | "void"
        | "failed_sync"
      match_status:
        | "pending_notification"
        | "available"
        | "viewed"
        | "dismissed"
        | "expired"
        | "unlocked"
        | "won"
      moderation_status:
        | "unreviewed"
        | "approved"
        | "rejected"
        | "needs_changes"
      notification_attempt_status:
        | "queued"
        | "sent"
        | "delivered"
        | "undeliverable"
        | "provider_failed"
        | "rate_limited"
        | "skipped"
      notification_channel: "email" | "whatsapp" | "sms"
      notification_provider: "resend" | "infobip"
      notification_status:
        | "queued"
        | "processing"
        | "sent"
        | "delivered"
        | "failed"
        | "exhausted"
      outbox_status:
        | "pending"
        | "processing"
        | "processed"
        | "failed"
        | "dead_letter"
      payment_purpose: "lead_unlock" | "vip_subscription"
      payment_status:
        | "created"
        | "pending"
        | "requires_action"
        | "succeeded"
        | "failed"
        | "refunded"
        | "canceled"
      request_confirmation_status: "pending" | "confirmed" | "expired"
      request_status:
        | "draft"
        | "awaiting_confirmation"
        | "active"
        | "expired"
        | "closed"
        | "archived"
      review_status: "pending" | "approved" | "rejected" | "hidden"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "unpaid"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
      token_purpose: "confirm_request" | "claim_request"
      unlock_status:
        | "pending_payment"
        | "active"
        | "refunded"
        | "revoked"
        | "expired"
      urgency_level: "normal" | "fast" | "urgent"
      user_role: "customer" | "company_member" | "admin"
      webhook_provider: "stripe" | "resend" | "infobip" | "fakturownia"
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
  billing: {
    Enums: {},
  },
  graphql_public: {
    Enums: {},
  },
  ops: {
    Enums: {},
  },
  public: {
    Enums: {
      billing_owner_type: ["profile", "company"],
      blog_post_status: ["draft", "scheduled", "published", "archived"],
      company_status: [
        "draft",
        "pending_verification",
        "pending_review",
        "active",
        "suspended",
        "rejected",
        "archived",
      ],
      dynamic_field_scope: ["request", "company"],
      dynamic_field_type: [
        "text",
        "textarea",
        "number",
        "select",
        "multi_select",
        "boolean",
        "date",
        "file",
      ],
      invoice_status: [
        "draft",
        "issued",
        "paid",
        "overdue",
        "void",
        "failed_sync",
      ],
      match_status: [
        "pending_notification",
        "available",
        "viewed",
        "dismissed",
        "expired",
        "unlocked",
        "won",
      ],
      moderation_status: [
        "unreviewed",
        "approved",
        "rejected",
        "needs_changes",
      ],
      notification_attempt_status: [
        "queued",
        "sent",
        "delivered",
        "undeliverable",
        "provider_failed",
        "rate_limited",
        "skipped",
      ],
      notification_channel: ["email", "whatsapp", "sms"],
      notification_provider: ["resend", "infobip"],
      notification_status: [
        "queued",
        "processing",
        "sent",
        "delivered",
        "failed",
        "exhausted",
      ],
      outbox_status: [
        "pending",
        "processing",
        "processed",
        "failed",
        "dead_letter",
      ],
      payment_purpose: ["lead_unlock", "vip_subscription"],
      payment_status: [
        "created",
        "pending",
        "requires_action",
        "succeeded",
        "failed",
        "refunded",
        "canceled",
      ],
      request_confirmation_status: ["pending", "confirmed", "expired"],
      request_status: [
        "draft",
        "awaiting_confirmation",
        "active",
        "expired",
        "closed",
        "archived",
      ],
      review_status: ["pending", "approved", "rejected", "hidden"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "unpaid",
        "canceled",
        "incomplete",
        "incomplete_expired",
      ],
      token_purpose: ["confirm_request", "claim_request"],
      unlock_status: [
        "pending_payment",
        "active",
        "refunded",
        "revoked",
        "expired",
      ],
      urgency_level: ["normal", "fast", "urgent"],
      user_role: ["customer", "company_member", "admin"],
      webhook_provider: ["stripe", "resend", "infobip", "fakturownia"],
    },
  },
} as const

