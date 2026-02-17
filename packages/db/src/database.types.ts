export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          plan: 'free' | 'pro' | 'team' | 'business';
          analysis_count: number;
          storage_used: number;
          current_workspace_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          plan?: 'free' | 'pro' | 'team' | 'business';
          analysis_count?: number;
          storage_used?: number;
          current_workspace_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          plan?: 'free' | 'pro' | 'team' | 'business';
          analysis_count?: number;
          storage_used?: number;
          current_workspace_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      workspace_members: {
        Row: {
          workspace_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member' | 'viewer';
          created_at: string;
        };
        Insert: {
          workspace_id: string;
          user_id: string;
          role?: 'owner' | 'admin' | 'member' | 'viewer';
          created_at?: string;
        };
        Update: {
          workspace_id?: string;
          user_id?: string;
          role?: 'owner' | 'admin' | 'member' | 'viewer';
          created_at?: string;
        };
      };
      analyses: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          name: string;
          description: string | null;
          file_name: string;
          file_url: string;
          file_size: number;
          file_type: 'csv' | 'xls' | 'xlsx';
          status: 'pending' | 'processing' | 'completed' | 'failed';
          row_count: number | null;
          column_count: number | null;
          columns: Json | null;
          summary: Json | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          name: string;
          description?: string | null;
          file_name: string;
          file_url: string;
          file_size: number;
          file_type: 'csv' | 'xls' | 'xlsx';
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          row_count?: number | null;
          column_count?: number | null;
          columns?: Json | null;
          summary?: Json | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          file_name?: string;
          file_url?: string;
          file_size?: number;
          file_type?: 'csv' | 'xls' | 'xlsx';
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          row_count?: number | null;
          column_count?: number | null;
          columns?: Json | null;
          summary?: Json | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      insights: {
        Row: {
          id: string;
          analysis_id: string;
          type: 'trend' | 'anomaly' | 'pattern' | 'comparison' | 'summary';
          title: string;
          description: string;
          importance: 'low' | 'medium' | 'high' | 'critical';
          data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          type: 'trend' | 'anomaly' | 'pattern' | 'comparison' | 'summary';
          title: string;
          description: string;
          importance?: 'low' | 'medium' | 'high' | 'critical';
          data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          analysis_id?: string;
          type?: 'trend' | 'anomaly' | 'pattern' | 'comparison' | 'summary';
          title?: string;
          description?: string;
          importance?: 'low' | 'medium' | 'high' | 'critical';
          data?: Json | null;
          created_at?: string;
        };
      };
      actions: {
        Row: {
          id: string;
          analysis_id: string;
          insight_id: string | null;
          title: string;
          description: string;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
          due_date: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          insight_id?: string | null;
          title: string;
          description: string;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'pending' | 'in_progress' | 'completed' | 'dismissed';
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          analysis_id?: string;
          insight_id?: string | null;
          title?: string;
          description?: string;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'pending' | 'in_progress' | 'completed' | 'dismissed';
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      charts: {
        Row: {
          id: string;
          analysis_id: string;
          type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'kpi';
          title: string;
          config: Json;
          data: Json;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'kpi';
          title: string;
          config: Json;
          data: Json;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          analysis_id?: string;
          type?: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'kpi';
          title?: string;
          config?: Json;
          data?: Json;
          position?: number;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          analysis_id: string;
          user_id: string;
          name: string;
          template: 'summary' | 'detailed' | 'comparison' | 'custom';
          content: Json | null;
          pdf_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          user_id: string;
          name: string;
          template?: 'summary' | 'detailed' | 'comparison' | 'custom';
          content?: Json | null;
          pdf_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          analysis_id?: string;
          user_id?: string;
          name?: string;
          template?: 'summary' | 'detailed' | 'comparison' | 'custom';
          content?: Json | null;
          pdf_url?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      plan_type: 'free' | 'pro' | 'team' | 'business';
      workspace_role: 'owner' | 'admin' | 'member' | 'viewer';
      analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
      file_type: 'csv' | 'xls' | 'xlsx';
      insight_type: 'trend' | 'anomaly' | 'pattern' | 'comparison' | 'summary';
      insight_importance: 'low' | 'medium' | 'high' | 'critical';
      action_priority: 'low' | 'medium' | 'high' | 'urgent';
      action_status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
      chart_type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'kpi';
      report_template: 'summary' | 'detailed' | 'comparison' | 'custom';
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
