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
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_path: string | null;
          avatar_id: string;
          timezone: string;
          preferred_theme: "system" | "light" | "dark";
          week_starts_on: "sunday" | "monday";
          time_format: "12h" | "24h";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_path?: string | null;
          avatar_id?: string;
          timezone?: string;
          preferred_theme?: "system" | "light" | "dark";
          week_starts_on?: "sunday" | "monday";
          time_format?: "12h" | "24h";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_path?: string | null;
          avatar_id?: string;
          timezone?: string;
          preferred_theme?: "system" | "light" | "dark";
          week_starts_on?: "sunday" | "monday";
          time_format?: "12h" | "24h";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      daily_goals: {
        Row: {
          id: string;
          user_id: string;
          effective_date: string;
          calories_target: number;
          protein_target: number;
          carbohydrates_target: number;
          fat_target: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          effective_date: string;
          calories_target?: number;
          protein_target?: number;
          carbohydrates_target?: number;
          fat_target?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          effective_date?: string;
          calories_target?: number;
          protein_target?: number;
          carbohydrates_target?: number;
          fat_target?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_goals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      foods: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          image_path: string | null;
          calories_per_100g: number;
          protein_per_100g: number;
          carbohydrates_per_100g: number;
          fat_per_100g: number;
          notes: string | null;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          image_path?: string | null;
          calories_per_100g: number;
          protein_per_100g: number;
          carbohydrates_per_100g: number;
          fat_per_100g?: number;
          notes?: string | null;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          image_path?: string | null;
          calories_per_100g?: number;
          protein_per_100g?: number;
          carbohydrates_per_100g?: number;
          fat_per_100g?: number;
          notes?: string | null;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "foods_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      food_logs: {
        Row: {
          id: string;
          user_id: string;
          food_id: string | null;
          consumed_grams: number;
          logged_at: string;
          local_log_date: string;
          food_name_snapshot: string;
          image_path_snapshot: string | null;
          calories_per_100g_snapshot: number;
          protein_per_100g_snapshot: number;
          carbohydrates_per_100g_snapshot: number;
          fat_per_100g_snapshot: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          food_id?: string | null;
          consumed_grams: number;
          logged_at?: string;
          local_log_date: string;
          food_name_snapshot: string;
          image_path_snapshot?: string | null;
          calories_per_100g_snapshot: number;
          protein_per_100g_snapshot: number;
          carbohydrates_per_100g_snapshot: number;
          fat_per_100g_snapshot?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          food_id?: string | null;
          consumed_grams?: number;
          logged_at?: string;
          local_log_date?: string;
          food_name_snapshot?: string;
          image_path_snapshot?: string | null;
          calories_per_100g_snapshot?: number;
          protein_per_100g_snapshot?: number;
          carbohydrates_per_100g_snapshot?: number;
          fat_per_100g_snapshot?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "food_logs_food_id_fkey";
            columns: ["food_id"];
            isOneToOne: false;
            referencedRelation: "foods";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "food_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
