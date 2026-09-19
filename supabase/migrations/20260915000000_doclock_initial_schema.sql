-- ============================================================================
-- DocLock Medical Exam Prep - Complete Supabase Initial Schema
-- ============================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. USER PROFILES & SETTINGS
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  candidate_id text unique not null,
  full_name text not null,
  email text not null,
  avatar_url text,
  role text not null default 'candidate' check (role in ('candidate', 'faculty', 'admin')),
  is_pro_pass_active boolean not null default false,
  pro_pass_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.user_profiles(id) on delete cascade,
  target_exam_name text not null default 'FMGE (Dec 2026)',
  target_exam_date date not null default '2026-12-15',
  daily_reminder_times text[] not null default array['07:30', '21:00'],
  wifi_only_downloads boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_active_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  device_name text not null,
  device_type text not null,
  last_synced_at timestamptz not null default now(),
  is_current_device boolean not null default false
);

create table if not exists public.faculty_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  institution text not null,
  avatar_url text not null,
  created_at timestamptz not null default now()
);

-- 2. ACADEMIC CURRICULUM: SUBJECTS, CHAPTERS, TOPICS
create table if not exists public.subjects (
  id text primary key, -- e.g. 'anatomy', 'pharmacology', etc.
  name text not null,
  chapters_count int not null default 0,
  mcq_count int not null default 0,
  duration_hours int not null default 0,
  video_count int not null default 0,
  icon_name text not null,
  icon_bg_color text not null,
  icon_color text not null,
  categories text[] not null default array[]::text[],
  created_at timestamptz not null default now()
);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id text not null references public.subjects(id) on delete cascade,
  chapter_number int not null default 1,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  title text not null,
  mcq_count int not null default 0,
  duration_minutes int not null default 20,
  is_high_yield boolean not null default false,
  is_image_based boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. ASSESSMENTS & STANDARDIZED TESTS
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('grand-tests', 'subject-tests', 'mini-mocks', 'pyqs')),
  tag text not null default 'Available',
  tag_bg_color text not null,
  tag_text_color text not null,
  tests_count int not null default 1,
  mcqs_count int not null default 300,
  duration_hours numeric not null default 3.0,
  icon_name text not null,
  icon_bg_color text not null,
  icon_color text not null,
  created_at timestamptz not null default now()
);

-- 4. QBANK QUESTIONS & OPTIONS
create table if not exists public.mcq_questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.topics(id) on delete cascade,
  assessment_id uuid references public.assessments(id) on delete cascade,
  question_number int not null default 1,
  clinical_vignette text not null,
  image_url text,
  image_caption text,
  difficulty text not null default 'Moderate' check (difficulty in ('Easy', 'Moderate', 'Hard')),
  is_high_yield boolean not null default false,
  is_image_based boolean not null default false,
  explanation text not null,
  golden_pearl text not null,
  reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.mcq_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.mcq_questions(id) on delete cascade,
  option_label text not null check (option_label in ('A', 'B', 'C', 'D')),
  option_text text not null,
  is_correct boolean not null default false,
  peer_percentage int not null default 0,
  option_explanation text
);

-- 5. CANDIDATE DRILL ATTEMPTS & PROGRESS
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete set null,
  assessment_id uuid references public.assessments(id) on delete set null,
  mode text not null default 'practice' check (mode in ('practice', 'exam', 'study')),
  total_questions int not null default 0,
  answered_count int not null default 0,
  correct_count int not null default 0,
  incorrect_count int not null default 0,
  skipped_count int not null default 0,
  accuracy_percentage numeric not null default 0.0,
  score numeric not null default 0.0,
  total_time_seconds int not null default 0,
  status text not null default 'completed' check (status in ('in_progress', 'completed', 'abandoned')),
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.mcq_questions(id) on delete cascade,
  selected_option_label text check (selected_option_label in ('A', 'B', 'C', 'D')),
  is_correct boolean not null default false,
  is_flagged boolean not null default false,
  time_spent_seconds int not null default 0,
  struck_through_labels text[] not null default array[]::text[]
);

-- 6. VIDEO LECTURES & PROGRESS
create table if not exists public.video_classes (
  id uuid primary key default gen_random_uuid(),
  subject_id text not null references public.subjects(id) on delete cascade,
  faculty_id uuid not null references public.faculty_profiles(id) on delete cascade,
  class_number int not null default 1,
  title text not null,
  chapter_title text not null,
  duration text not null,
  duration_seconds int not null default 0,
  video_url text not null,
  thumbnail_url text not null,
  is_high_yield boolean not null default false,
  views_count text not null default '0 views',
  rating numeric not null default 5.0,
  description text not null,
  notes_pdf_url text,
  notes_pdf_size text,
  associated_topic_id uuid references public.topics(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.video_timestamps (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.video_classes(id) on delete cascade,
  time_string text not null,
  seconds int not null default 0,
  title text not null,
  is_high_yield boolean not null default false
);

create table if not exists public.video_pearls (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.video_classes(id) on delete cascade,
  pearl_text text not null
);

create table if not exists public.user_video_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  video_id uuid not null references public.video_classes(id) on delete cascade,
  last_position_seconds int not null default 0,
  progress_percent int not null default 0,
  status text not null default 'unwatched' check (status in ('unwatched', 'in-progress', 'completed')),
  updated_at timestamptz not null default now(),
  unique(user_id, video_id)
);

-- 7. LIVE CLASSROOM & REALTIME INTERACTIONS
create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject_id text not null references public.subjects(id) on delete cascade,
  chapter text not null,
  faculty_id uuid not null references public.faculty_profiles(id) on delete cascade,
  status text not null default 'scheduled' check (status in ('live', 'upcoming', 'scheduled', 'ended')),
  start_time timestamptz not null,
  duration_minutes int not null default 60,
  attendees_count int not null default 0,
  stream_url text,
  thumbnail_url text not null,
  key_topics text[] not null default array[]::text[],
  created_at timestamptz not null default now()
);

create table if not exists public.live_chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  message_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.live_polls (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  question text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.live_poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.live_polls(id) on delete cascade,
  option_text text not null,
  option_order int not null default 1
);

create table if not exists public.live_poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.live_polls(id) on delete cascade,
  option_id uuid not null references public.live_poll_options(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(poll_id, user_id)
);

create table if not exists public.live_hand_raises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  queue_position int not null default 1,
  status text not null default 'waiting' check (status in ('waiting', 'active', 'dismissed')),
  created_at timestamptz not null default now(),
  unique(session_id, user_id)
);

-- 8. FLASHCARDS, DAILY GOALS, BOOKMARKS & DOWNLOADS
create table if not exists public.flashcard_decks (
  id text primary key, -- e.g. 'deck-pharm'
  subject_name text not null,
  icon_name text not null,
  accent_color text not null
);

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id text not null references public.flashcard_decks(id) on delete cascade,
  subject_name text not null,
  chapter_name text not null,
  category text not null,
  question text not null,
  answer text not null,
  high_yield_pearl text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_flashcard_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  flashcard_id uuid not null references public.flashcards(id) on delete cascade,
  rating text not null check (rating in ('again', 'hard', 'good', 'easy')),
  repetitions int not null default 0,
  interval_days int not null default 1,
  ease_factor numeric not null default 2.5,
  next_review_date date not null default current_date,
  reviewed_at timestamptz not null default now(),
  unique(user_id, flashcard_id)
);

create table if not exists public.user_daily_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  goal_date date not null default current_date,
  title text not null,
  category text not null check (category in ('mcq', 'video', 'flashcard', 'live', 'test')),
  target_count int not null default 1,
  completed_count int not null default 0,
  unit text not null,
  is_completed boolean not null default false,
  time_estimate_mins int not null default 30,
  icon_name text not null,
  color text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_study_activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  log_date date not null default current_date,
  hours_spent numeric not null default 0.0,
  completion_percentage int not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, log_date)
);

create table if not exists public.user_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  resource_type text not null check (resource_type in ('mcq', 'video', 'pearl', 'flashcard')),
  resource_id text not null, -- flexible text/uuid identifier
  title text not null,
  subject_name text not null,
  chapter_name text not null,
  snippet text not null,
  target_route text,
  faculty_name text,
  difficulty text,
  created_at timestamptz not null default now(),
  unique(user_id, resource_type, resource_id)
);

create table if not exists public.user_downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  resource_type text not null check (resource_type in ('video', 'slides', 'audio')),
  resource_id text not null,
  title text not null,
  subject_name text not null,
  file_size_mb numeric not null,
  duration_or_pages text not null,
  quality_badge text not null,
  remote_file_url text not null,
  created_at timestamptz not null default now(),
  unique(user_id, resource_type, resource_id)
);

-- 9. PERFORMANCE INDEXES
create index if not exists idx_topics_chapter on public.topics(chapter_id);
create index if not exists idx_mcq_questions_topic on public.mcq_questions(topic_id);
create index if not exists idx_mcq_questions_assessment on public.mcq_questions(assessment_id);
create index if not exists idx_mcq_options_question on public.mcq_options(question_id);
create index if not exists idx_quiz_attempts_user on public.quiz_attempts(user_id, created_at desc);
create index if not exists idx_quiz_answers_attempt on public.quiz_attempt_answers(attempt_id);
create index if not exists idx_video_classes_subject on public.video_classes(subject_id);
create index if not exists idx_user_video_progress on public.user_video_progress(user_id, status);
create index if not exists idx_live_chat_session on public.live_chat_messages(session_id, created_at);
create index if not exists idx_user_bookmarks_user on public.user_bookmarks(user_id, resource_type);
create index if not exists idx_user_daily_goals_user on public.user_daily_goals(user_id, goal_date);
create index if not exists idx_user_flashcard_reviews on public.user_flashcard_reviews(user_id, next_review_date);

-- 10. AUTH TRIGGER TO CREATE USER PROFILE
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, candidate_id, full_name, email, role, is_pro_pass_active)
  values (
    new.id,
    'DL-' || floor(10000 + random() * 90000)::text,
    coalesce(new.raw_user_meta_data->>'full_name', 'Doctor Candidate'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'candidate'),
    false
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id, target_exam_name, target_exam_date)
  values (new.id, 'FMGE (Dec 2026)', '2026-12-15')
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.user_profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.user_active_devices enable row level security;
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
alter table public.topics enable row level security;
alter table public.assessments enable row level security;
alter table public.mcq_questions enable row level security;
alter table public.mcq_options enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempt_answers enable row level security;
alter table public.video_classes enable row level security;
alter table public.video_timestamps enable row level security;
alter table public.video_pearls enable row level security;
alter table public.user_video_progress enable row level security;
alter table public.live_sessions enable row level security;
alter table public.live_chat_messages enable row level security;
alter table public.live_polls enable row level security;
alter table public.live_poll_options enable row level security;
alter table public.live_poll_votes enable row level security;
alter table public.live_hand_raises enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.user_flashcard_reviews enable row level security;
alter table public.user_daily_goals enable row level security;
alter table public.user_study_activity_logs enable row level security;
alter table public.user_bookmarks enable row level security;
alter table public.user_downloads enable row level security;

-- Public Academic Content: Read-only for authenticated users
create policy "Authenticated candidates can view curriculum" on public.subjects for select to authenticated using (true);
create policy "Authenticated candidates can view chapters" on public.chapters for select to authenticated using (true);
create policy "Authenticated candidates can view topics" on public.topics for select to authenticated using (true);
create policy "Authenticated candidates can view assessments" on public.assessments for select to authenticated using (true);
create policy "Authenticated candidates can view questions" on public.mcq_questions for select to authenticated using (true);
create policy "Authenticated candidates can view options" on public.mcq_options for select to authenticated using (true);
create policy "Authenticated candidates can view videos" on public.video_classes for select to authenticated using (true);
create policy "Authenticated candidates can view timestamps" on public.video_timestamps for select to authenticated using (true);
create policy "Authenticated candidates can view pearls" on public.video_pearls for select to authenticated using (true);
create policy "Authenticated candidates can view live sessions" on public.live_sessions for select to authenticated using (true);
create policy "Authenticated candidates can view decks" on public.flashcard_decks for select to authenticated using (true);
create policy "Authenticated candidates can view flashcards" on public.flashcards for select to authenticated using (true);

-- User-Owned Study State: Read & Write restricted to auth.uid()
create policy "Users can view own profile" on public.user_profiles for select to authenticated using (auth.uid() = id);
create policy "Users can update own profile" on public.user_profiles for update to authenticated using (auth.uid() = id);

create policy "Users can manage own settings" on public.user_settings for all to authenticated using (auth.uid() = user_id);
create policy "Users can manage active devices" on public.user_active_devices for all to authenticated using (auth.uid() = user_id);
create policy "Users can manage quiz attempts" on public.quiz_attempts for all to authenticated using (auth.uid() = user_id);
create policy "Users can manage attempt answers" on public.quiz_attempt_answers for all to authenticated using (
  exists (select 1 from public.quiz_attempts where quiz_attempts.id = quiz_attempt_answers.attempt_id and quiz_attempts.user_id = auth.uid())
);
create policy "Users can manage video progress" on public.user_video_progress for all to authenticated using (auth.uid() = user_id);
create policy "Users can manage flashcard reviews" on public.user_flashcard_reviews for all to authenticated using (auth.uid() = user_id);
create policy "Users can manage daily goals" on public.user_daily_goals for all to authenticated using (auth.uid() = user_id);
create policy "Users can view activity logs" on public.user_study_activity_logs for all to authenticated using (auth.uid() = user_id);
create policy "Users can manage bookmarks" on public.user_bookmarks for all to authenticated using (auth.uid() = user_id);
create policy "Users can manage downloads" on public.user_downloads for all to authenticated using (auth.uid() = user_id);

-- Live Classroom Interactions
create policy "Anyone can read live chat" on public.live_chat_messages for select to authenticated using (true);
create policy "Candidates can post live chat" on public.live_chat_messages for insert to authenticated with check (auth.uid() = user_id);
create policy "Anyone can read active polls" on public.live_polls for select to authenticated using (true);
create policy "Anyone can read poll options" on public.live_poll_options for select to authenticated using (true);
create policy "Users can vote in poll" on public.live_poll_votes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can view poll votes" on public.live_poll_votes for select to authenticated using (true);
create policy "Users can manage hand raise" on public.live_hand_raises for all to authenticated using (auth.uid() = user_id);
