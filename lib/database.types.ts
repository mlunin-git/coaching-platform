export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: "coach" | "client";
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: "coach" | "client";
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "coach" | "client";
          name?: string;
          created_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          coach_id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          coach_id: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          coach_id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          coach_id: string;
          title: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          coach_id: string;
          title: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          coach_id?: string;
          title?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      client_tasks: {
        Row: {
          id: string;
          client_id: string;
          task_id: string;
          status: "pending" | "completed";
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          task_id: string;
          status?: "pending" | "completed";
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          task_id?: string;
          status?: "pending" | "completed";
          completed_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
