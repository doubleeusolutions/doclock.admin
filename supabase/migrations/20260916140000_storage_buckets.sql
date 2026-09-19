-- ============================================================================
-- Migration: Supabase Storage Buckets & Real Medical Video Seed
-- Purpose:
--   1. Create storage buckets for 'videos', 'thumbnails', and 'course-materials'
--   2. Configure RLS policies for public reading and authorized uploading
--   3. Seed initial medical video lectures with working streaming URLs and faculty
-- ============================================================================

-- 1. Create Storage Buckets
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'videos',
    'videos',
    true,
    524288000, -- 500 MB
    array[
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-matroska',
      'video/ogg',
      'application/x-mpegURL',
      'application/vnd.apple.mpegurl'
    ]
  ),
  (
    'thumbnails',
    'thumbnails',
    true,
    10485760, -- 10 MB
    array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/gif'
    ]
  ),
  (
    'course-materials',
    'course-materials',
    true,
    52428800, -- 50 MB
    array[
      'application/pdf',
      'application/zip',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- 2. Storage Objects RLS Policies
-- ----------------------------------------------------------------------------
-- Public Read Access
drop policy if exists "Public Read Access for videos" on storage.objects;
create policy "Public Read Access for videos" on storage.objects
  for select using (bucket_id = 'videos');

drop policy if exists "Public Read Access for thumbnails" on storage.objects;
create policy "Public Read Access for thumbnails" on storage.objects
  for select using (bucket_id = 'thumbnails');

drop policy if exists "Public Read Access for course-materials" on storage.objects;
create policy "Public Read Access for course-materials" on storage.objects
  for select using (bucket_id = 'course-materials');

-- Upload & Modification Access (Allowed for both anon & authenticated in dev/admin)
drop policy if exists "Public Upload Access for videos" on storage.objects;
create policy "Public Upload Access for videos" on storage.objects
  for insert with check (bucket_id in ('videos', 'thumbnails', 'course-materials'));

drop policy if exists "Public Update Access for videos" on storage.objects;
create policy "Public Update Access for videos" on storage.objects
  for update using (bucket_id in ('videos', 'thumbnails', 'course-materials'));

drop policy if exists "Public Delete Access for videos" on storage.objects;
create policy "Public Delete Access for videos" on storage.objects
  for delete using (bucket_id in ('videos', 'thumbnails', 'course-materials'));


-- 3. Seed Faculty Profiles (Schema: id, name, title, institution, avatar_url)
-- ----------------------------------------------------------------------------
insert into public.faculty_profiles (id, name, title, institution, avatar_url)
values
  (
    'f1000000-0000-0000-0000-000000000001',
    'Dr. Sarah Jenkins, MD',
    'Professor & Head of Clinical Anatomy',
    'Royal College of Surgeons • Academic Division',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'
  ),
  (
    'f2000000-0000-0000-0000-000000000002',
    'Dr. Vikramaditya Rao, MS, MCh',
    'Consultant Surgical Oncologist',
    'Department of General Surgery • PGIMER',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80'
  ),
  (
    'f3000000-0000-0000-0000-000000000003',
    'Dr. Angela Mehta, MD',
    'Senior Faculty & Consultant Pathologist',
    'Institute of Medical Sciences',
    'https://images.unsplash.com/photo-1594824813629-652391b1a030?w=400&auto=format&fit=crop&q=80'
  )
on conflict (id) do update set
  name = excluded.name,
  title = excluded.title,
  institution = excluded.institution,
  avatar_url = excluded.avatar_url;


-- 4. Seed Initial Video Classes (Working MP4 Streams)
-- ----------------------------------------------------------------------------
insert into public.video_classes (
  id,
  subject_id,
  faculty_id,
  class_number,
  title,
  chapter_title,
  duration,
  duration_seconds,
  video_url,
  thumbnail_url,
  is_high_yield,
  views_count,
  rating,
  description,
  notes_pdf_url,
  notes_pdf_size
)
values
  (
    'anat-cls-01',
    'anatomy',
    'f1000000-0000-0000-0000-000000000001',
    1,
    'Brachial Plexus: Roots, Trunks, Divisions & Clinical Neuropathies',
    'Upper Limb Anatomy',
    '45:10',
    2710,
    'https://vjs.zencdn.net/v/oceans.mp4',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    true,
    '18.4k views',
    4.95,
    'Comprehensive high-yield breakdown of the Brachial Plexus (C5-T1). Master Erb-Duchenne paralysis, Klumpke paralysis, thoracic outlet syndrome, and dermatomal deficits frequently tested in medical board exams.',
    'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf',
    '5.2 MB PDF'
  ),
  (
    'anat-cls-02',
    'anatomy',
    'f1000000-0000-0000-0000-000000000001',
    2,
    'Coronary Circulation, Heart Wall Architecture & Infarct Localisation',
    'Cardiovascular & Thorax',
    '38:40',
    2320,
    'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4',
    'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&auto=format&fit=crop&q=80',
    true,
    '14.2k views',
    4.90,
    'High-yield cardiac anatomy covering dominant coronary circulation (RCA vs LCx), myocardial arterial territories, conduction system blood supply, and ECG reciprocal changes.',
    'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf',
    '4.6 MB PDF'
  ),
  (
    'surg-cls-01',
    'surgery',
    'f2000000-0000-0000-0000-000000000002',
    1,
    'Acute Abdomen: Surgical Evaluation, Peritonitis & SBO Management',
    'Gastrointestinal Surgery',
    '52:15',
    3135,
    'https://vjs.zencdn.net/v/oceans.mp4',
    'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&auto=format&fit=crop&q=80',
    true,
    '22.1k views',
    4.98,
    'Systematic surgical approach to acute abdominal pain: differentiation of visceral vs parietal peritonitis, small bowel obstruction grading, and emergency laparotomy guidelines.',
    'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf',
    '6.1 MB PDF'
  )
on conflict (id) do update set
  subject_id = excluded.subject_id,
  faculty_id = excluded.faculty_id,
  class_number = excluded.class_number,
  title = excluded.title,
  chapter_title = excluded.chapter_title,
  duration = excluded.duration,
  duration_seconds = excluded.duration_seconds,
  video_url = excluded.video_url,
  thumbnail_url = excluded.thumbnail_url,
  is_high_yield = excluded.is_high_yield,
  views_count = excluded.views_count,
  rating = excluded.rating,
  description = excluded.description,
  notes_pdf_url = excluded.notes_pdf_url,
  notes_pdf_size = excluded.notes_pdf_size;


-- 5. Seed Video Timestamps
-- ----------------------------------------------------------------------------
delete from public.video_timestamps where video_id in ('anat-cls-01', 'anat-cls-02', 'surg-cls-01');

insert into public.video_timestamps (video_id, time_string, seconds, title, is_high_yield)
values
  -- anat-cls-01
  ('anat-cls-01', '00:00', 0, 'Introduction & Structural Plan (C5–T1)', false),
  ('anat-cls-01', '06:15', 375, 'Roots, Trunks & Prefixed/Postfixed Variants', true),
  ('anat-cls-01', '14:40', 880, 'Cords & Axillary Artery Spatial Relations', true),
  ('anat-cls-01', '22:10', 1330, 'Erb''s Palsy (Waiter''s Tip Deformity & Upper Trunk Lesion)', true),
  ('anat-cls-01', '32:25', 1945, 'Klumpke''s Palsy (True Claw Hand & Horner''s Syndrome)', true),
  ('anat-cls-01', '39:50', 2390, 'Exam MCQs Breakdown & Summary Pearls', true),

  -- anat-cls-02
  ('anat-cls-02', '00:00', 0, 'Anatomy of Coronary Sulci & Ostia', false),
  ('anat-cls-02', '08:30', 510, 'Left Anterior Descending (LAD) & Diagonal Branches', true),
  ('anat-cls-02', '17:45', 1065, 'Right Coronary Artery & AV Node Perfusion', true),
  ('anat-cls-02', '28:10', 1690, 'Cardiac Veins & Coronary Sinus Drainage', true),

  -- surg-cls-01
  ('surg-cls-01', '00:00', 0, 'Triage & Clinical Signs of Peritoneal Irritation', false),
  ('surg-cls-01', '11:20', 680, 'Mechanical SBO vs Paralytic Ileus Radiology', true),
  ('surg-cls-01', '25:40', 1540, 'Strangulation Signs & Indications for Urgent Exploration', true),
  ('surg-cls-01', '41:15', 2475, 'Postoperative Care & ERAS Protocol Pearls', true);


-- 6. Seed Video Pearls
-- ----------------------------------------------------------------------------
delete from public.video_pearls where video_id in ('anat-cls-01', 'anat-cls-02', 'surg-cls-01');

insert into public.video_pearls (video_id, pearl_text)
values
  ('anat-cls-01', 'Erb''s point injury involves C5-C6 anterior rami. Characteristic presentation: Arm adducted, medially rotated, forearm extended and pronated (Policeman''s tip or Waiter''s tip).'),
  ('anat-cls-01', 'Klumpke''s palsy damages the lower trunk (C8-T1). Leads to complete claw hand due to paralysis of all intrinsic muscles of the hand (interossei and lumbricals).'),
  ('anat-cls-01', 'Horner''s syndrome (ptosis, miosis, anhidrosis, enophthalmos) occurs in Klumpke''s palsy due to interruption of sympathetic T1 fibres.'),
  ('anat-cls-01', 'Long thoracic nerve of Bell originates directly from the roots (C5, C6, C7) and supplies Serratus Anterior; damage causes Winging of the Scapula.'),

  ('anat-cls-02', 'The AV node is supplied by the Right Coronary Artery (RCA) in approximately 90% of individuals (Right Dominant Circulation).'),
  ('anat-cls-02', 'LAD occlusion leads to anterior wall myocardial infarction and carries the highest risk of bundle branch block due to septal perforation.'),

  ('surg-cls-01', 'The most common cause of small bowel obstruction in patients with prior abdominal surgery is intra-abdominal adhesions.'),
  ('surg-cls-01', 'Signs of closed-loop strangulation: localized continuous severe pain, tachycardia out of proportion, fever, leukocytosis, and localized peritonism.');


-- 7. Trigger Subject Counts Synchronization
-- ----------------------------------------------------------------------------
update public.subjects
set
  video_count = (select count(*) from public.video_classes where subject_id = subjects.id),
  duration_hours = (select coalesce(round(sum(duration_seconds) / 3600.0), 0) from public.video_classes where subject_id = subjects.id)
where id in ('anatomy', 'surgery');
