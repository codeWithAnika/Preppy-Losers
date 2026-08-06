/**
 * Supabase Database types.
 *
 * Generated from supabase/migrations (profiles has NO email column).
 * Regenerate after schema changes:
 *   npm run gen:types
 *
 * Requires: supabase login (or SUPABASE_ACCESS_TOKEN)
 * Project ref: hcylhedomtjdkwfryasx
 */

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
      addresses: {
        Row: {
          id: string;
          user_id: string;
          line1: string;
          line2: string | null;
          city: string;
          state: string;
          pincode: string;
          phone: string | null;
          is_default: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          line1: string;
          line2?: string | null;
          city: string;
          state: string;
          pincode: string;
          phone?: string | null;
          is_default?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          line1?: string;
          line2?: string | null;
          city?: string;
          state?: string;
          pincode?: string;
          phone?: string | null;
          is_default?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_allowlist: {
        Row: {
          user_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_allowlist_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      customer_addresses: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          state: string;
          pincode: string;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          phone: string;
          address_line_1: string;
          address_line_2?: string | null;
          city: string;
          state: string;
          pincode: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          phone?: string;
          address_line_1?: string;
          address_line_2?: string | null;
          city?: string;
          state?: string;
          pincode?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customer_addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          size: string;
          quantity: number;
          amount: number;
          status: string;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          shipping_address: Json | null;
          tracking_id: string | null;
          courier_name: string | null;
          tracking_url: string | null;
          delivery_status: string | null;
          promo_code: string | null;
          discount_amount: number;
          original_subtotal: number | null;
          final_total: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          size: string;
          quantity: number;
          amount: number;
          status?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          shipping_address?: Json | null;
          tracking_id?: string | null;
          courier_name?: string | null;
          tracking_url?: string | null;
          delivery_status?: string | null;
          promo_code?: string | null;
          discount_amount?: number;
          original_subtotal?: number | null;
          final_total?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          size?: string;
          quantity?: number;
          amount?: number;
          status?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          shipping_address?: Json | null;
          tracking_id?: string | null;
          courier_name?: string | null;
          tracking_url?: string | null;
          delivery_status?: string | null;
          promo_code?: string | null;
          discount_amount?: number;
          original_subtotal?: number | null;
          final_total?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          details: string | null;
          price: number;
          drop_number: number | null;
          size_stock: Json;
          images: Json;
          is_active: boolean;
          drop_date: string;
          accent_color: string | null;
          slug: string | null;
          featured: boolean;
          primary_image: string | null;
          category: string | null;
          weight_grams: number | null;
          seo_title: string | null;
          seo_description: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description: string;
          details?: string | null;
          price: number;
          drop_number?: number | null;
          size_stock?: Json;
          images?: Json;
          is_active?: boolean;
          drop_date: string;
          accent_color?: string | null;
          slug?: string | null;
          featured?: boolean;
          primary_image?: string | null;
          category?: string | null;
          weight_grams?: number | null;
          seo_title?: string | null;
          seo_description?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          details?: string | null;
          price?: number;
          drop_number?: number | null;
          size_stock?: Json;
          images?: Json;
          is_active?: boolean;
          drop_date?: string;
          accent_color?: string | null;
          slug?: string | null;
          featured?: boolean;
          primary_image?: string | null;
          category?: string | null;
          weight_grams?: number | null;
          seo_title?: string | null;
          seo_description?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      promo_codes: {
        Row: {
          id: string;
          code: string;
          type: "percentage" | "fixed";
          value: number;
          minimum_order: number;
          maximum_discount: number | null;
          max_uses: number | null;
          used_count: number;
          active: boolean;
          starts_at: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          type: "percentage" | "fixed";
          value: number;
          minimum_order?: number;
          maximum_discount?: number | null;
          max_uses?: number | null;
          used_count?: number;
          active?: boolean;
          starts_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          type?: "percentage" | "fixed";
          value?: number;
          minimum_order?: number;
          maximum_discount?: number | null;
          max_uses?: number | null;
          used_count?: number;
          active?: boolean;
          starts_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      store_settings: {
        Row: {
          id: number;
          settings: Json;
          updated_at: string;
        };
        Insert: {
          id?: number;
          settings?: Json;
          updated_at?: string;
        };
        Update: {
          id?: number;
          settings?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      whatsapp_conversations: {
        Row: {
          id: string;
          customer_phone: string;
          customer_name: string | null;
          last_message: string | null;
          last_message_at: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_phone: string;
          customer_name?: string | null;
          last_message?: string | null;
          last_message_at?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_phone?: string;
          customer_name?: string | null;
          last_message?: string | null;
          last_message_at?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      whatsapp_messages: {
        Row: {
          id: string;
          conversation_id: string | null;
          customer_phone: string;
          message_id: string | null;
          message_text: string | null;
          direction: string;
          status: string;
          template_name: string | null;
          raw_payload: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conversation_id?: string | null;
          customer_phone: string;
          message_id?: string | null;
          message_text?: string | null;
          direction: string;
          status?: string;
          template_name?: string | null;
          raw_payload?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string | null;
          customer_phone?: string;
          message_id?: string | null;
          message_text?: string | null;
          direction?: string;
          status?: string;
          template_name?: string | null;
          raw_payload?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "whatsapp_conversations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      admin_customer_profiles: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          role: string;
          created_at: string;
        }[];
      };
      decrement_product_stock: {
        Args: {
          p_product_id: string;
          p_quantity: number;
          p_size: string;
        };
        Returns: boolean;
      };
      fulfill_paid_order: {
        Args: {
          p_user_id: string;
          p_razorpay_order_id: string;
          p_razorpay_payment_id: string;
          p_shipping_address: Json;
          p_items: Json;
          p_promo_code?: string | null;
          p_discount_amount?: number;
          p_original_subtotal?: number | null;
          p_final_total?: number | null;
        };
        Returns: Json;
      };
      grant_admin: {
        Args: {
          p_user_id: string;
        };
        Returns: undefined;
      };
      increment_promo_used_count: {
        Args: {
          p_code: string;
        };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_allowlisted_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      revoke_admin: {
        Args: {
          p_user_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database;
}
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database;
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database;
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof Database;
}
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof Database;
}
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
