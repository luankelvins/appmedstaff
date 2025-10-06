import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY')
}

// Cliente Supabase para uso geral
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Cliente Supabase com service role para operações administrativas
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Tipos de tabelas do banco de dados
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          position?: string
          department?: string
          employee_id?: string
          phone?: string
          hire_date?: string
          avatar_url?: string
          role?: string
          permissions?: string[]
          full_name?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          position?: string
          department?: string
          employee_id?: string
          phone?: string
          hire_date?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          position?: string
          department?: string
          employee_id?: string
          phone?: string
          hire_date?: string
          avatar_url?: string
          updated_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          email: string
          dados_pessoais: any
          dados_profissionais: any
          dados_financeiros?: any
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          dados_pessoais: any
          dados_profissionais: any
          dados_financeiros?: any
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          dados_pessoais?: any
          dados_profissionais?: any
          dados_financeiros?: any
          status?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description?: string
          status: string
          priority: string
          assigned_to?: string
          created_by: string
          due_date?: string
          completed_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          status?: string
          priority?: string
          assigned_to?: string
          created_by: string
          due_date?: string
          completed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: string
          priority?: string
          assigned_to?: string
          due_date?: string
          completed_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          name: string
          email?: string
          phone?: string
          company?: string
          status: string
          stage: string
          assigned_to?: string
          source?: string
          value?: number
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string
          phone?: string
          company?: string
          status?: string
          stage?: string
          assigned_to?: string
          source?: string
          value?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          company?: string
          status?: string
          stage?: string
          assigned_to?: string
          source?: string
          value?: number
          notes?: string
          updated_at?: string
        }
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
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']