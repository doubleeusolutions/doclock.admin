-- ============================================================================
-- DocLock: Public Catalog Read Policies (for both anon and authenticated)
-- Allows both unauthenticated browsing & authenticated candidate studying
-- ============================================================================

-- Drop restrictive policies if they exist
drop policy if exists "Authenticated candidates can view curriculum" on public.subjects;
drop policy if exists "Authenticated candidates can view chapters" on public.chapters;
drop policy if exists "Authenticated candidates can view topics" on public.topics;
drop policy if exists "Authenticated candidates can view assessments" on public.assessments;
drop policy if exists "Authenticated candidates can view questions" on public.mcq_questions;
drop policy if exists "Authenticated candidates can view options" on public.mcq_options;
drop policy if exists "Authenticated candidates can view videos" on public.video_classes;
drop policy if exists "Authenticated candidates can view timestamps" on public.video_timestamps;
drop policy if exists "Authenticated candidates can view pearls" on public.video_pearls;
drop policy if exists "Authenticated candidates can view live sessions" on public.live_sessions;
drop policy if exists "Authenticated candidates can view decks" on public.flashcard_decks;
drop policy if exists "Authenticated candidates can view flashcards" on public.flashcards;

-- Public Academic Content: Read-only for all clients (anon & authenticated)
create policy "Allow all users to view subjects" on public.subjects for select using (true);
create policy "Allow all users to view chapters" on public.chapters for select using (true);
create policy "Allow all users to view topics" on public.topics for select using (true);
create policy "Allow all users to view assessments" on public.assessments for select using (true);
create policy "Allow all users to view questions" on public.mcq_questions for select using (true);
create policy "Allow all users to view options" on public.mcq_options for select using (true);
create policy "Allow all users to view videos" on public.video_classes for select using (true);
create policy "Allow all users to view timestamps" on public.video_timestamps for select using (true);
create policy "Allow all users to view pearls" on public.video_pearls for select using (true);
create policy "Allow all users to view live sessions" on public.live_sessions for select using (true);
create policy "Allow all users to view decks" on public.flashcard_decks for select using (true);
create policy "Allow all users to view flashcards" on public.flashcards for select using (true);
create policy "Allow all users to view faculty profiles" on public.faculty_profiles for select using (true);
