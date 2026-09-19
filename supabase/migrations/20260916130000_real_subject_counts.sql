-- ============================================================================
-- DocLock: Real-Based Counts & Automated Synchronization Triggers
-- Updates subjects & topics with actual database counts and sets up live sync
-- ============================================================================

-- 1. Sync Existing Counts Right Now
-- ----------------------------------------------------------------------------

-- A. Update topics.mcq_count with real question count
update public.topics t
set mcq_count = (
  select count(*)
  from public.mcq_questions q
  where q.topic_id = t.id
);

-- B. Update subjects.chapters_count with real chapter count
update public.subjects s
set chapters_count = (
  select count(*)
  from public.chapters c
  where c.subject_id = s.id
);

-- C. Update subjects.mcq_count with real MCQ count across all chapters & topics
update public.subjects s
set mcq_count = (
  select count(q.id)
  from public.chapters c
  join public.topics t on t.chapter_id = c.id
  join public.mcq_questions q on q.topic_id = t.id
  where c.subject_id = s.id
);

-- D. Update subjects.video_count with real video classes count
update public.subjects s
set video_count = (
  select count(*)
  from public.video_classes v
  where v.subject_id = s.id
);

-- E. Update subjects.duration_hours with real duration from videos or topics
update public.subjects s
set duration_hours = coalesce(
  (
    select round(coalesce(sum(v.duration_seconds), 0) / 3600.0)
    from public.video_classes v
    where v.subject_id = s.id
  ),
  0
);


-- 2. Trigger Function: Sync Topic MCQ Counts on Question Changes
-- ----------------------------------------------------------------------------
create or replace function public.sync_topic_mcq_count()
returns trigger as $$
declare
  target_topic_id uuid;
  target_subject_id text;
begin
  if (tg_op = 'DELETE') then
    target_topic_id := old.topic_id;
  else
    target_topic_id := new.topic_id;
  end if;

  if target_topic_id is not null then
    -- Update topic count
    update public.topics
    set mcq_count = (select count(*) from public.mcq_questions where topic_id = target_topic_id)
    where id = target_topic_id;

    -- Update subject count
    select c.subject_id into target_subject_id
    from public.topics t
    join public.chapters c on t.chapter_id = c.id
    where t.id = target_topic_id;

    if target_subject_id is not null then
      update public.subjects s
      set mcq_count = (
        select count(q.id)
        from public.chapters c
        join public.topics t on t.chapter_id = c.id
        join public.mcq_questions q on q.topic_id = t.id
        where c.subject_id = target_subject_id
      )
      where id = target_subject_id;
    end if;
  end if;

  return null;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_sync_mcq_count on public.mcq_questions;
create trigger trg_sync_mcq_count
after insert or update or delete on public.mcq_questions
for each row execute function public.sync_topic_mcq_count();


-- 3. Trigger Function: Sync Subject Chapters Count
-- ----------------------------------------------------------------------------
create or replace function public.sync_subject_chapters_count()
returns trigger as $$
declare
  target_subject_id text;
begin
  if (tg_op = 'DELETE') then
    target_subject_id := old.subject_id;
  else
    target_subject_id := new.subject_id;
  end if;

  if target_subject_id is not null then
    update public.subjects
    set chapters_count = (select count(*) from public.chapters where subject_id = target_subject_id)
    where id = target_subject_id;
  end if;

  return null;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_sync_chapters_count on public.chapters;
create trigger trg_sync_chapters_count
after insert or update or delete on public.chapters
for each row execute function public.sync_subject_chapters_count();


-- 4. Trigger Function: Sync Subject Video Count & Duration
-- ----------------------------------------------------------------------------
create or replace function public.sync_subject_video_count()
returns trigger as $$
declare
  target_subject_id text;
begin
  if (tg_op = 'DELETE') then
    target_subject_id := old.subject_id;
  else
    target_subject_id := new.subject_id;
  end if;

  if target_subject_id is not null then
    update public.subjects
    set
      video_count = (select count(*) from public.video_classes where subject_id = target_subject_id),
      duration_hours = (select coalesce(round(sum(duration_seconds) / 3600.0), 0) from public.video_classes where subject_id = target_subject_id)
    where id = target_subject_id;
  end if;

  return null;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_sync_video_count on public.video_classes;
create trigger trg_sync_video_count
after insert or update or delete on public.video_classes
for each row execute function public.sync_subject_video_count();
