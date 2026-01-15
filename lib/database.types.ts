export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_user_id: string | null
          email: string | null
          client_identifier: string | null
          role: "coach" | "client"
          name: string
          has_auth_access: boolean
          created_at: string
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          email?: string | null
          client_identifier?: string | null
          role: "coach" | "client"
          name: string
          has_auth_access?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          email?: string | null
          client_identifier?: string | null
          role?: "coach" | "client"
          name?: string
          has_auth_access?: boolean
          created_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          coach_id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          coach_id: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          coach_id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          coach_id: string
          title: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          coach_id: string
          title: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          coach_id?: string
          title?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      client_tasks: {
        Row: {
          id: string
          client_id: string
          task_id: string
          status: "pending" | "completed"
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          task_id: string
          status?: "pending" | "completed"
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          task_id?: string
          status?: "pending" | "completed"
          completed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          client_id: string
          sender_type: "coach" | "client"
          content: string
          is_read: boolean
          read_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          sender_type: "coach" | "client"
          content: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          sender_type?: "coach" | "client"
          content?: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      planning_groups: {
        Row: {
          id: string
          coach_id: string
          name: string
          access_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          coach_id: string
          name: string
          access_token: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          coach_id?: string
          name?: string
          access_token?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planning_groups_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      planning_participants: {
        Row: {
          id: string
          group_id: string
          name: string
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          name: string
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          name?: string
          color?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planning_participants_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "planning_groups"
            referencedColumns: ["id"]
          }
        ]
      }
      planning_ideas: {
        Row: {
          id: string
          group_id: string
          participant_id: string
          title: string
          description: string | null
          suggested_dates: string[] | null
          location: string | null
          created_at: string
          updated_at: string
          promoted_to_event_id: string | null
        }
        Insert: {
          id?: string
          group_id: string
          participant_id: string
          title: string
          description?: string | null
          suggested_dates?: string[] | null
          location?: string | null
          created_at?: string
          updated_at?: string
          promoted_to_event_id?: string | null
        }
        Update: {
          id?: string
          group_id?: string
          participant_id?: string
          title?: string
          description?: string | null
          suggested_dates?: string[] | null
          location?: string | null
          created_at?: string
          updated_at?: string
          promoted_to_event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planning_ideas_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "planning_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planning_ideas_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "planning_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planning_ideas_promoted_to_event_id_fkey"
            columns: ["promoted_to_event_id"]
            isOneToOne: false
            referencedRelation: "planning_events"
            referencedColumns: ["id"]
          }
        ]
      }
      planning_idea_votes: {
        Row: {
          id: string
          idea_id: string
          participant_id: string
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          participant_id: string
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          participant_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planning_idea_votes_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "planning_ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planning_idea_votes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "planning_participants"
            referencedColumns: ["id"]
          }
        ]
      }
      planning_events: {
        Row: {
          id: string
          group_id: string
          created_by: string | null
          title: string
          description: string | null
          start_date: string
          end_date: string | null
          location: string | null
          city: string | null
          country: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          created_by?: string | null
          title: string
          description?: string | null
          start_date: string
          end_date?: string | null
          location?: string | null
          city?: string | null
          country?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          created_by?: string | null
          title?: string
          description?: string | null
          start_date?: string
          end_date?: string | null
          location?: string | null
          city?: string | null
          country?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planning_events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "planning_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planning_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "planning_participants"
            referencedColumns: ["id"]
          }
        ]
      }
      planning_event_participants: {
        Row: {
          id: string
          event_id: string
          participant_id: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          participant_id: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          participant_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planning_event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "planning_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planning_event_participants_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "planning_participants"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
