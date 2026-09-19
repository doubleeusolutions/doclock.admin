-- ============================================================================
-- DocLock: Admin Management RLS Policies & Permissions
-- Allows users with role = 'admin' full CRUD over curriculum, QBank, and users
-- ============================================================================

-- 1. Helper function to check if the current authenticated user is an admin
-- Uses SECURITY DEFINER to bypass RLS recursion on public.user_profiles
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer set search_path = public;

-- 2. Drop existing admin policies if they exist (for idempotent execution)
drop policy if exists "Admins have full access to subjects" on public.subjects;
drop policy if exists "Admins have full access to chapters" on public.chapters;
drop policy if exists "Admins have full access to topics" on public.topics;
drop policy if exists "Admins have full access to questions" on public.mcq_questions;
drop policy if exists "Admins have full access to options" on public.mcq_options;
drop policy if exists "Admins have full access to assessments" on public.assessments;
drop policy if exists "Admins have full access to video classes" on public.video_classes;
drop policy if exists "Admins have full access to video timestamps" on public.video_timestamps;
drop policy if exists "Admins have full access to video pearls" on public.video_pearls;
drop policy if exists "Admins have full access to live sessions" on public.live_sessions;
drop policy if exists "Admins have full access to live polls" on public.live_polls;
drop policy if exists "Admins have full access to live poll options" on public.live_poll_options;
drop policy if exists "Admins have full access to flashcard decks" on public.flashcard_decks;
drop policy if exists "Admins have full access to flashcards" on public.flashcards;
drop policy if exists "Admins have full access to faculty profiles" on public.faculty_profiles;

drop policy if exists "Admins can view all profiles" on public.user_profiles;
drop policy if exists "Admins can update all profiles" on public.user_profiles;
drop policy if exists "Admins can delete profiles" on public.user_profiles;

drop policy if exists "Admins can view all settings" on public.user_settings;
drop policy if exists "Admins can update all settings" on public.user_settings;

-- 3. Academic Curriculum Management (Subjects, Chapters, Topics, Faculty)
create policy "Admins have full access to subjects"
  on public.subjects
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins have full access to chapters"
  on public.chapters
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins have full access to topics"
  on public.topics
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins have full access to faculty profiles"
  on public.faculty_profiles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4. Question Bank (QBank) & Assessments Management
create policy "Admins have full access to questions"
  on public.mcq_questions
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins have full access to options"
  on public.mcq_options
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins have full access to assessments"
  on public.assessments
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 5. Video Lectures & High-Yield Pearls Management
create policy "Admins have full access to video classes"
  on public.video_classes
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins have full access to video timestamps"
  on public.video_timestamps
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins have full access to video pearls"
  on public.video_pearls
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 6. Live Sessions & Interactive Classrooms Management
create policy "Admins have full access to live sessions"
  on public.live_sessions
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins have full access to live polls"
  on public.live_polls
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins have full access to live poll options"
  on public.live_poll_options
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 7. Flashcards & Decks Management
create policy "Admins have full access to flashcard decks"
  on public.flashcard_decks
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins have full access to flashcards"
  on public.flashcards
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 8. User Profiles & Settings Management
-- Allows admins to view candidate roster, update roles (e.g. promote to admin/faculty), and manage Pro Pass
create policy "Admins can view all profiles"
  on public.user_profiles
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update all profiles"
  on public.user_profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete profiles"
  on public.user_profiles
  for delete
  to authenticated
  using (public.is_admin());

create policy "Admins can view all settings"
  on public.user_settings
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update all settings"
  on public.user_settings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
