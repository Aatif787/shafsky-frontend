export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          entity: string;
          entity_id: string | null;
          id: string;
          metadata: Json | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          entity: string;
          entity_id?: string | null;
          id?: string;
          metadata?: Json | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          entity?: string;
          entity_id?: string | null;
          id?: string;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      booking_documents: {
        Row: {
          amount: number | null;
          booking_id: string;
          created_at: string;
          currency: string | null;
          generated_by: string | null;
          id: string;
          kind: string;
          storage_path: string;
        };
        Insert: {
          amount?: number | null;
          booking_id: string;
          created_at?: string;
          currency?: string | null;
          generated_by?: string | null;
          id?: string;
          kind: string;
          storage_path: string;
        };
        Update: {
          amount?: number | null;
          booking_id?: string;
          created_at?: string;
          currency?: string | null;
          generated_by?: string | null;
          id?: string;
          kind?: string;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_documents_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_status_history: {
        Row: {
          actor_id: string | null;
          booking_id: string;
          created_at: string;
          from_status: Database["public"]["Enums"]["booking_status"] | null;
          id: string;
          note: string | null;
          to_status: Database["public"]["Enums"]["booking_status"];
        };
        Insert: {
          actor_id?: string | null;
          booking_id: string;
          created_at?: string;
          from_status?: Database["public"]["Enums"]["booking_status"] | null;
          id?: string;
          note?: string | null;
          to_status: Database["public"]["Enums"]["booking_status"];
        };
        Update: {
          actor_id?: string | null;
          booking_id?: string;
          created_at?: string;
          from_status?: Database["public"]["Enums"]["booking_status"] | null;
          id?: string;
          note?: string | null;
          to_status?: Database["public"]["Enums"]["booking_status"];
        };
        Relationships: [
          {
            foreignKeyName: "booking_status_history_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_services: {
        Row: {
          id: string;
          booking_id: string;
          service_code: string;
          service_name: string;
          category: string;
          quantity: number;
          unit_price: number | null;
          currency: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          service_code: string;
          service_name: string;
          category: string;
          quantity?: number;
          unit_price?: number | null;
          currency?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          service_code?: string;
          service_name?: string;
          category?: string;
          quantity?: number;
          unit_price?: number | null;
          currency?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_services_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_logs: {
        Row: {
          id: string;
          booking_id: string | null;
          booking_ref: string | null;
          recipient: string;
          channel: string;
          template: string;
          subject: string | null;
          body: string;
          status: string;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          booking_ref?: string | null;
          recipient: string;
          channel: string;
          template: string;
          subject?: string | null;
          body: string;
          status?: string;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          booking_ref?: string | null;
          recipient?: string;
          channel?: string;
          template?: string;
          subject?: string | null;
          body?: string;
          status?: string;
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_logs_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      services_config: {
        Row: {
          category: string;
          created_at: string;
          description: string;
          id: string;
          is_active: boolean;
          price: number;
          sort_order: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          description: string;
          id: string;
          is_active?: boolean;
          price: number;
          sort_order?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string;
          id?: string;
          is_active?: boolean;
          price?: number;
          sort_order?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          aircraft_preference: string | null;
          assigned_to: string | null;
          booking_ref: string;
          company: string | null;
          contact_email: string;
          contact_name: string;
          contact_phone: string;
          created_at: string;
          deleted_at: string | null;
          depart_date: string;
          destination: string;
          id: string;
          notes: string | null;
          origin: string;
          pax_adults: number;
          pax_children: number;
          pax_infants: number;
          quote_amount: number | null;
          quote_currency: string | null;
          return_date: string | null;
          service_type: string | null;
          status: Database["public"]["Enums"]["booking_status"];
          trip_type: Database["public"]["Enums"]["trip_type"];
          updated_at: string;
          user_id: string;
          verification_type: string;
        };
        Insert: {
          aircraft_preference?: string | null;
          assigned_to?: string | null;
          booking_ref: string;
          company?: string | null;
          contact_email: string;
          contact_name: string;
          contact_phone: string;
          created_at?: string;
          deleted_at?: string | null;
          depart_date: string;
          destination: string;
          id?: string;
          notes?: string | null;
          origin: string;
          pax_adults?: number;
          pax_children?: number;
          pax_infants?: number;
          quote_amount?: number | null;
          quote_currency?: string | null;
          return_date?: string | null;
          service_type?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          trip_type?: Database["public"]["Enums"]["trip_type"];
          updated_at?: string;
          user_id: string;
          verification_type?: string;
        };
        Update: {
          aircraft_preference?: string | null;
          assigned_to?: string | null;
          booking_ref?: string;
          company?: string | null;
          contact_email?: string;
          contact_name?: string;
          contact_phone?: string;
          created_at?: string;
          deleted_at?: string | null;
          depart_date?: string;
          destination?: string;
          id?: string;
          notes?: string | null;
          origin?: string;
          pax_adults?: number;
          pax_children?: number;
          pax_infants?: number;
          quote_amount?: number | null;
          quote_currency?: string | null;
          return_date?: string | null;
          service_type?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          trip_type?: Database["public"]["Enums"]["trip_type"];
          updated_at?: string;
          user_id?: string;
          verification_type?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          phone: string | null;
          source: string | null;
          status: Database["public"]["Enums"]["contact_status"];
          subject: string | null;
          updated_at: string;
          user_agent: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          message: string;
          name: string;
          phone?: string | null;
          source?: string | null;
          status?: Database["public"]["Enums"]["contact_status"];
          subject?: string | null;
          updated_at?: string;
          user_agent?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          phone?: string | null;
          source?: string | null;
          status?: Database["public"]["Enums"]["contact_status"];
          subject?: string | null;
          updated_at?: string;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          entity: string | null;
          entity_id: string | null;
          id: string;
          kind: string;
          link: string | null;
          read_at: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          entity?: string | null;
          entity_id?: string | null;
          id?: string;
          kind: string;
          link?: string | null;
          read_at?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          entity?: string | null;
          entity_id?: string | null;
          id?: string;
          kind?: string;
          link?: string | null;
          read_at?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          company: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          notes: string | null;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          company?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          company?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      system_settings: {
        Row: {
          key: string;
          value: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      airports: {
        Row: {
          id: string;
          code: string;
          name: string;
          city: string;
          country: string;
          terminals: Json | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          city: string;
          country?: string;
          terminals?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          city?: string;
          country?: string;
          terminals?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      lounges: {
        Row: {
          id: string;
          airport_id: string | null;
          name: string;
          terminal: string | null;
          capacity: number;
          current_occupancy: number;
          pricing: Json | null;
          timing: Json | null;
          amenities: string[] | null;
          status: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          airport_id?: string | null;
          name: string;
          terminal?: string | null;
          capacity?: number;
          current_occupancy?: number;
          pricing?: Json | null;
          timing?: Json | null;
          amenities?: string[] | null;
          status?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          airport_id?: string | null;
          name?: string;
          terminal?: string | null;
          capacity?: number;
          current_occupancy?: number;
          pricing?: Json | null;
          timing?: Json | null;
          amenities?: string[] | null;
          status?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lounges_airport_id_fkey";
            columns: ["airport_id"];
            isOneToOne: false;
            referencedRelation: "airports";
            referencedColumns: ["id"];
          },
        ];
      };

      coupons: {
        Row: {
          id: string;
          code: string;
          discount_percent: number;
          max_uses: number | null;
          uses_count: number;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_percent: number;
          max_uses?: number | null;
          uses_count?: number;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          discount_percent?: number;
          max_uses?: number | null;
          uses_count?: number;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      lounge_queue: {
        Row: {
          id: string;
          lounge_id: string;
          guest_name: string;
          guest_count: number;
          status: string;
          booking_id: string | null;
          check_in_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lounge_id: string;
          guest_name: string;
          guest_count?: number;
          status?: string;
          booking_id?: string | null;
          check_in_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lounge_id?: string;
          guest_name?: string;
          guest_count?: number;
          status?: string;
          booking_id?: string | null;
          check_in_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lounge_queue_lounge_id_fkey";
            columns: ["lounge_id"];
            isOneToOne: false;
            referencedRelation: "lounges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lounge_queue_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };

      staff_shifts: {
        Row: {
          id: string;
          staff_id: string;
          airport_code: string | null;
          shift_date: string;
          shift_start: string;
          shift_end: string;
          role: string;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          staff_id: string;
          airport_code?: string | null;
          shift_date: string;
          shift_start: string;
          shift_end: string;
          role?: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          staff_id?: string;
          airport_code?: string | null;
          shift_date?: string;
          shift_start?: string;
          shift_end?: string;
          role?: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_shifts_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      feature_flags: {
        Row: {
          id: string;
          description: string | null;
          is_enabled: boolean;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          description?: string | null;
          is_enabled?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          description?: string | null;
          is_enabled?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      ip_restrictions: {
        Row: {
          id: string;
          ip_address: string;
          type: string;
          reason: string | null;
          created_by: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          ip_address: string;
          type?: string;
          reason?: string | null;
          created_by?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          ip_address?: string;
          type?: string;
          reason?: string | null;
          created_by?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ip_restrictions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: { _user_id: string }; Returns: boolean };
      is_staff: { Args: { _user_id: string }; Returns: boolean };
      create_booking_with_services: {
        Args: {
          p_booking: Json;
          p_services: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      app_role: "super_admin" | "admin" | "customer";
      booking_status:
        | "pending"
        | "reviewing"
        | "quoted"
        | "approved"
        | "rejected"
        | "confirmed"
        | "completed"
        | "cancelled";
      contact_status: "new" | "in_progress" | "resolved" | "spam";
      trip_type: "one_way" | "round_trip" | "multi_city";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "customer"],
      booking_status: [
        "pending",
        "reviewing",
        "quoted",
        "approved",
        "rejected",
        "confirmed",
        "completed",
        "cancelled",
      ],
      contact_status: ["new", "in_progress", "resolved", "spam"],
      trip_type: ["one_way", "round_trip", "multi_city"],
    },
  },
} as const;
