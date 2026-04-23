import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Web uses localStorage; native uses expo-secure-store
const storage = Platform.OS === 'web'
  ? {
      getItem: (key: string) => {
        if (typeof localStorage === 'undefined') return null;
        return Promise.resolve(localStorage.getItem(key));
      },
      setItem: (key: string, value: string) => {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
        return Promise.resolve();
      },
    }
  : (() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const SecureStore = require('expo-secure-store');
      return {
        getItem: (key: string) => SecureStore.getItemAsync(key),
        setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
        removeItem: (key: string) => SecureStore.deleteItemAsync(key),
      };
    })();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          role: 'rep' | 'manager' | 'admin';
          avatar_color: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      sales_sessions: {
        Row: {
          id: string;
          rep_id: string;
          session_date: string;
          doors_knocked: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sales_sessions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sales_sessions']['Insert']>;
      };
      sales: {
        Row: {
          id: string;
          rep_id: string;
          session_id: string | null;
          sale_date: string;
          amount: number;
          service_type: string;
          customer_name: string | null;
          address: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sales']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sales']['Insert']>;
      };
    };
  };
};
