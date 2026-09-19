import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key);
        }
      } catch {
        return null;
      }
      return null;
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
      } catch {}
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
      } catch {}
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder-doclock.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (__DEV__) {
  console.log('[DocLock Supabase] Configured URL:', supabaseUrl);
}

if (!process.env.EXPO_PUBLIC_SUPABASE_URL || supabaseUrl.includes('placeholder')) {
  console.warn(
    '[DocLock Supabase] EXPO_PUBLIC_SUPABASE_URL is not loaded or has placeholder value. If you recently updated your .env file, restart Metro with cache cleared: npx expo start -c'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============================================================================
// TYPESCRIPT DATABASE ENTITY TYPES
// ============================================================================

export interface UserProfile {
  id: string;
  candidate_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: 'candidate' | 'faculty' | 'admin';
  is_pro_pass_active: boolean;
  pro_pass_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  target_exam_name: string;
  target_exam_date: string;
  daily_reminder_times: string[];
  wifi_only_downloads: boolean;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  chapters_count: number;
  mcq_count: number;
  duration_hours: number;
  video_count: number;
  icon_name: string;
  icon_bg_color: string;
  icon_color: string;
  categories: string[];
  created_at: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  chapter_number: number;
  title: string;
  created_at: string;
}

export interface Topic {
  id: string;
  chapter_id: string;
  title: string;
  mcq_count: number;
  duration_minutes: number;
  is_high_yield: boolean;
  is_image_based: boolean;
  created_at: string;
}

export interface MCQOption {
  id: string;
  question_id: string;
  option_label: 'A' | 'B' | 'C' | 'D';
  option_text: string;
  is_correct: boolean;
  peer_percentage: number;
  option_explanation?: string | null;
}

export interface MCQQuestion {
  id: string;
  topic_id?: string | null;
  assessment_id?: string | null;
  question_number: number;
  clinical_vignette: string;
  image_url?: string | null;
  image_caption?: string | null;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  is_high_yield: boolean;
  is_image_based: boolean;
  explanation: string;
  golden_pearl: string;
  reference?: string | null;
  created_at: string;
  options?: MCQOption[];
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  topic_id?: string | null;
  assessment_id?: string | null;
  mode: 'practice' | 'exam' | 'study';
  total_questions: number;
  answered_count: number;
  correct_count: number;
  incorrect_count: number;
  skipped_count: number;
  accuracy_percentage: number;
  score: number;
  total_time_seconds: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
}

export interface VideoClass {
  id: string;
  subject_id: string;
  faculty_id: string;
  class_number: number;
  title: string;
  chapter_title: string;
  duration: string;
  duration_seconds: number;
  video_url: string;
  thumbnail_url: string;
  is_high_yield: boolean;
  views_count: string;
  rating: number;
  description: string;
  notes_pdf_url?: string | null;
  notes_pdf_size?: string | null;
  associated_topic_id?: string | null;
  created_at: string;
}

export interface LiveSession {
  id: string;
  title: string;
  subject_id: string;
  chapter: string;
  faculty_id: string;
  status: 'live' | 'upcoming' | 'scheduled' | 'ended';
  start_time: string;
  duration_minutes: number;
  attendees_count: number;
  stream_url?: string | null;
  thumbnail_url: string;
  key_topics: string[];
  created_at: string;
}

export interface UserBookmark {
  id: string;
  user_id: string;
  resource_type: 'mcq' | 'video' | 'pearl' | 'flashcard';
  resource_id: string;
  title: string;
  subject_name: string;
  chapter_name: string;
  snippet: string;
  target_route?: string | null;
  faculty_name?: string | null;
  difficulty?: string | null;
  created_at: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  subject_name: string;
  chapter_name: string;
  category: string;
  question: string;
  answer: string;
  high_yield_pearl: string;
  image_url?: string | null;
  created_at: string;
}

export interface CustomTest {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface CustomTestQuestion {
  id: string;
  custom_test_id: string;
  question_id: string;
  added_at: string;
}

export interface UserDailyGoal {
  id: string;
  user_id: string;
  goal_date: string;
  title: string;
  category: 'mcq' | 'video' | 'flashcard' | 'live' | 'test';
  target_count: number;
  completed_count: number;
  unit: string;
  is_completed: boolean;
  time_estimate_mins: number;
  icon_name: string;
  color: string;
  created_at: string;
}
