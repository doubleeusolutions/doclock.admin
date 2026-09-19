-- ============================================================================
-- DocLock Medical Exam Prep - Seed Data
-- ============================================================================

-- 1. Faculty Members
insert into public.faculty_profiles (id, name, title, institution, avatar_url) values
  ('f1111111-1111-1111-1111-111111111111', 'Dr. Marcus Vance, MD, PhD', 'Associate Professor of Pharmacology', 'DocLock Medical Academy', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'),
  ('f2222222-2222-2222-2222-222222222222', 'Dr. Sarah Jenkins, MD', 'Professor of Clinical Anatomy', 'DocLock Medical Faculty • AIIMS Alumnus', 'https://images.unsplash.com/photo-1594824813629-652391b1a030?w=400&auto=format&fit=crop&q=80'),
  ('f3333333-3333-3333-3333-333333333333', 'Dr. Elena Rostova, MD, FRCPath', 'Chief Histopathologist & Educator', 'Clinical Pathology Chair • DocLock Academic Council', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'),
  ('f4444444-4444-4444-4444-444444444444', 'Dr. Rajesh Sharma, MD', 'Consultant Clinical Physiologist', 'Department of Physiology • CMC Vellore', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'),
  ('f5555555-5555-5555-5555-555555555555', 'Dr. Vikramaditya Rao, MS, MCh', 'Consultant Surgical Oncologist', 'Department of General Surgery • PGIMER', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80')
on conflict (id) do nothing;

-- 2. 19 Medical Subjects
insert into public.subjects (id, name, chapters_count, mcq_count, duration_hours, video_count, icon_name, icon_bg_color, icon_color, categories) values
  ('anatomy', 'Anatomy', 18, 420, 24, 48, 'accessibility-new', '#d7e2ff', '#0059b9', array['pre-clinical']),
  ('physiology', 'Physiology', 22, 380, 30, 56, 'monitor-heart', '#b9eaff', '#006780', array['pre-clinical']),
  ('biochemistry', 'Biochemistry', 16, 310, 19, 38, 'biotech', '#e5deff', '#5b4aba', array['pre-clinical']),
  ('pathology', 'Pathology', 32, 650, 44, 75, 'coronavirus', '#ffdad6', '#ba1a1a', array['para-clinical', 'high-yield']),
  ('pharmacology', 'Pharmacology', 26, 540, 35, 62, 'medication', '#b9eaff', '#006780', array['para-clinical', 'high-yield']),
  ('microbiology', 'Microbiology', 20, 460, 26, 46, 'science', '#e5deff', '#5b4aba', array['para-clinical']),
  ('forensic', 'Forensic Medicine & Toxicology', 14, 280, 16, 32, 'gavel', '#dfe8fe', '#424753', array['para-clinical', 'short-subjects']),
  ('psm', 'Community Medicine (PSM)', 24, 520, 32, 58, 'groups', '#d7e2ff', '#0059b9', array['para-clinical', 'high-yield']),
  ('medicine', 'General Medicine', 36, 890, 62, 98, 'medical-services', '#e7eeff', '#0059b9', array['clinical', 'high-yield']),
  ('surgery', 'General Surgery', 30, 740, 48, 84, 'health-and-safety', '#b9eaff', '#006780', array['clinical', 'high-yield']),
  ('obgyn', 'Obstetrics & Gynaecology', 28, 680, 38, 72, 'pregnant-woman', '#e5deff', '#5b4aba', array['clinical', 'high-yield']),
  ('pediatrics', 'Pediatrics', 22, 490, 28, 52, 'child-care', '#d7e2ff', '#0059b9', array['clinical', 'high-yield']),
  ('ophthalmology', 'Ophthalmology', 16, 340, 20, 39, 'visibility', '#b9eaff', '#006780', array['clinical', 'short-subjects']),
  ('ent', 'ENT (Otorhinolaryngology)', 15, 310, 18, 34, 'hearing', '#dfe8fe', '#424753', array['clinical', 'short-subjects']),
  ('orthopedics', 'Orthopedics', 14, 290, 17, 31, 'airline-seat-flat', '#e5deff', '#5b4aba', array['clinical', 'short-subjects']),
  ('dermatology', 'Dermatology & Venereology', 12, 260, 14, 28, 'spa', '#d7e2ff', '#0059b9', array['clinical', 'short-subjects']),
  ('psychiatry', 'Psychiatry', 10, 210, 12, 22, 'psychology', '#b9eaff', '#006780', array['clinical', 'short-subjects']),
  ('radiology', 'Radiology', 12, 250, 15, 27, 'scanner', '#dfe8fe', '#424753', array['clinical', 'short-subjects']),
  ('anesthesia', 'Anesthesia', 9, 190, 11, 20, 'vaccines', '#e5deff', '#5b4aba', array['clinical', 'short-subjects'])
on conflict (id) do nothing;

-- 3. Anatomy Chapters & Topics
insert into public.chapters (id, subject_id, chapter_number, title) values
  ('c1111111-1111-1111-1111-111111111111', 'anatomy', 1, 'Upper Limb & Neurovasculature'),
  ('c2222222-2222-2222-2222-222222222222', 'anatomy', 2, 'Thorax, Mediastinum & Coronary Circulation'),
  ('c3333333-3333-3333-3333-333333333333', 'anatomy', 3, 'Head & Neck Neuroanatomy')
on conflict (id) do nothing;

insert into public.topics (id, chapter_id, title, mcq_count, duration_minutes, is_high_yield, is_image_based) values
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Brachial Plexus & Erb''s / Klumpke''s Palsy', 30, 25, true, true),
  ('b2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Axillary Artery Branches & Anastomoses', 25, 20, true, false),
  ('b3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Carpal Tunnel Syndrome & Median Nerve Course', 35, 30, true, true),
  ('b4444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222', 'Coronary Arteries & Cardiac Venous Drainage', 28, 20, true, true)
on conflict (id) do nothing;

-- 4. High-Yield MCQs & Options
insert into public.mcq_questions (id, topic_id, question_number, clinical_vignette, difficulty, is_high_yield, is_image_based, explanation, golden_pearl, reference) values
  ('d1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 1, 'A 24-year-old motorcyclist is brought to the trauma bay following a high-speed collision. On physical examination, the right upper extremity is held in adduction, internal rotation, and extension at the elbow with forearm pronation ("waiter''s tip" deformity). Sensibility is impaired over the lateral arm. Which roots of the brachial plexus are most likely injured?', 'Moderate', true, true, 'Traction injury to C5-C6 roots (Erb-Duchenne palsy) leads to loss of abductors, lateral rotators, and biceps.', 'Erb palsy = Upper trunk (C5-C6), Waiter''s tip deformity; Klumpke palsy = Lower trunk (C8-T1), Total claw hand & Horner syndrome.', 'Snell''s Clinical Anatomy by Regions, 10th Ed., p. 412'),
  ('d2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 2, 'A 62-year-old male with chronic stable angina is initiated on sublingual nitroglycerin for acute symptom relief. Which cellular mechanism predominantly accounts for the therapeutic reduction in myocardial oxygen demand?', 'High-Yield', true, false, 'Nitroglycerin exerts its primary anti-anginal effect via venous capacitance vessel dilation (venodilation). This causes pooling of blood in peripheral veins, reducing venous return and left ventricular preload (LVEDV), which significantly diminishes ventricular wall stress and myocardial oxygen demand.', 'Nitrates predominantly cause venodilation (preload reduction) at standard clinical doses; arteriolar dilation occurs only at higher doses.', 'Goodman & Gilman''s The Pharmacological Basis of Therapeutics, 14th Ed.')
on conflict (id) do nothing;

insert into public.mcq_options (id, question_id, option_label, option_text, is_correct, peer_percentage, option_explanation) values
  ('e1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'A', 'C5 and C6 ventral rami', true, 78, 'Correct. Traction on neck during delivery or motorcycle crash tears upper trunk.'),
  ('e1111111-1111-1111-1111-111111111112', 'd1111111-1111-1111-1111-111111111111', 'B', 'C8 and T1 ventral rami', false, 14, 'Incorrect. Causes Klumpke palsy presenting with claw hand and Horner syndrome.'),
  ('e1111111-1111-1111-1111-111111111113', 'd1111111-1111-1111-1111-111111111111', 'C', 'Posterior cord of brachial plexus', false, 5, 'Incorrect. Produces wrist drop without waiter''s posture.'),
  ('e1111111-1111-1111-1111-111111111114', 'd1111111-1111-1111-1111-111111111111', 'D', 'Long thoracic nerve of Bell', false, 3, 'Incorrect. Results in winged scapula due to serratus anterior denervation.'),

  ('e2222222-2222-2222-2222-222222222221', 'd2222222-2222-2222-2222-222222222222', 'A', 'Systemic venodilation leading to reduced left ventricular end-diastolic pressure (preload)', true, 82, 'Correct. Venodilation is the primary anti-anginal mechanism.'),
  ('e2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'B', 'Direct coronary arteriolar dilation redistributing blood flow to ischemic subendocardium', false, 11, 'Incorrect. Coronary arterioles are less sensitive to low-dose nitrates.'),
  ('e2222222-2222-2222-2222-222222222223', 'd2222222-2222-2222-2222-222222222222', 'C', 'Negative inotropic effect secondary to calcium channel blockade in cardiomyocytes', false, 4, 'Incorrect. Nitrates do not block L-type calcium channels directly.'),
  ('e2222222-2222-2222-2222-222222222224', 'd2222222-2222-2222-2222-222222222222', 'D', 'Inhibition of phosphodiesterase-5 resulting in elevated platelet cyclic GMP levels', false, 3, 'Incorrect. This describes sildenafil, which is contraindicated with nitrates.')
on conflict (id) do nothing;

-- 5. Standardized Assessments
insert into public.assessments (id, title, category, tag, tag_bg_color, tag_text_color, tests_count, mcqs_count, duration_hours, icon_name, icon_bg_color, icon_color) values
  ('a1111111-1111-1111-1111-111111111111', 'All-India Grand Mock: FMGE GT-13', 'grand-tests', 'Ranked', '#d1fae5', '#065f46', 1, 300, 5.0, 'stars', '#d7e2ff', '#0059b9'),
  ('a2222222-2222-2222-2222-222222222222', 'Anatomy High-Yield Test', 'subject-tests', 'High Yield', '#e5deff', '#5b4aba', 6, 300, 3.0, 'accessibility-new', '#d7e2ff', '#004591'),
  ('a3333333-3333-3333-3333-333333333333', 'Rapid Cardio Emergency Drill', 'mini-mocks', 'High Yield', '#e5deff', '#5b4aba', 3, 75, 1.0, 'bolt', '#ffdad6', '#ba1a1a'),
  ('a4444444-4444-4444-4444-444444444444', 'FMGE December 2023 Recall Paper', 'pyqs', 'Real Exam', '#dfe8fe', '#0059b9', 1, 300, 5.0, 'history-edu', '#b9eaff', '#006780')
on conflict (id) do nothing;

-- 6. Video Classes & Timestamps
insert into public.video_classes (id, subject_id, faculty_id, class_number, title, chapter_title, duration, duration_seconds, video_url, thumbnail_url, is_high_yield, views_count, rating, description, notes_pdf_size, associated_topic_id) values
  ('01111111-1111-1111-1111-111111111111', 'anatomy', 'f2222222-2222-2222-2222-222222222222', 1, 'Brachial Plexus: Roots, Trunks & Clinical Neuropathies', 'Upper Limb Anatomy', '45:10', 2710, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=80', true, '18.4k views', 4.9, 'Comprehensive high-yield breakdown of the Brachial Plexus, nerve root origins (C5-T1), trunks, divisions, cords, and terminal branches. Detailed clinical analysis of Erb-Duchenne palsy, Klumpke paralysis, thoracic outlet syndrome, and surgical anatomy.', '5.2 MB PDF', 'b1111111-1111-1111-1111-111111111111')
on conflict (id) do nothing;

insert into public.video_timestamps (video_id, time_string, seconds, title, is_high_yield) values
  ('01111111-1111-1111-1111-111111111111', '00:00', 0, 'Introduction & Clinical Vignette Preview', false),
  ('01111111-1111-1111-1111-111111111111', '04:15', 255, 'Roots & Trunks: The "Rule of 5-3-6-3-5"', true),
  ('01111111-1111-1111-1111-111111111111', '14:30', 870, 'Erb-Duchenne Palsy (Waiter''s Tip Deformity)', true),
  ('01111111-1111-1111-1111-111111111111', '28:45', 1725, 'Klumpke Paralysis & Horner Syndrome Triad', true),
  ('01111111-1111-1111-1111-111111111111', '39:20', 2360, 'Thoracic Outlet Syndrome: Cervical Rib vs Scalenus', false)
on conflict (id) do nothing;

insert into public.video_pearls (video_id, pearl_text) values
  ('01111111-1111-1111-1111-111111111111', 'Erb-Duchenne Palsy involves upper trunk roots C5-C6. Suprascapular, Musculocutaneous, and Axillary nerves are disabled.'),
  ('01111111-1111-1111-1111-111111111111', 'Waiter''s Tip Deformity features arm adducted, internally rotated, elbow extended, forearm pronated.'),
  ('01111111-1111-1111-1111-111111111111', 'Klumpke Palsy damages lower trunk C8-T1. Intrinsic hand muscles are paralyzed, leading to a claw hand.')
on conflict (id) do nothing;

-- 7. Live Sessions
insert into public.live_sessions (id, title, subject_id, chapter, faculty_id, status, start_time, duration_minutes, attendees_count, stream_url, thumbnail_url, key_topics) values
  ('02222222-2222-2222-2222-222222222222', 'Rapid Recall: Antiarrhythmics & ICU Emergency Pharmacology', 'pharmacology', 'Cardiovascular Therapeutics', 'f1111111-1111-1111-1111-111111111111', 'live', now() - interval '15 minutes', 60, 1420, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80', array['Vaughan-Williams Class I-IV classification highlights', 'Digoxin toxicity & ECG manifestations', 'Adenosine dosing protocols in SVT', 'Amiodarone side-effect monitoring table'])
on conflict (id) do nothing;

-- 8. Flashcard Decks & Flashcards
insert into public.flashcard_decks (id, subject_name, icon_name, accent_color) values
  ('deck-pharm', 'Pharmacology', 'medication', '#0059b9'),
  ('deck-anat', 'Anatomy', 'accessibility', '#006780'),
  ('deck-path', 'Pathology', 'biotech', '#4f46e5'),
  ('deck-micro', 'Microbiology', 'coronavirus', '#059669')
on conflict (id) do nothing;

insert into public.flashcards (id, deck_id, subject_name, chapter_name, category, question, answer, high_yield_pearl) values
  ('fc111111-1111-1111-1111-111111111111', 'deck-pharm', 'Pharmacology', 'Cardiovascular', 'Drug Toxicities', 'Which antiarrhythmic drug causes Pulmonary Fibrosis, Slate-grey corneal microdeposits, and both hyper- and hypothyroidism?', 'Amiodarone (Class III K+ channel blocker)', 'Contains 37% iodine by weight. Extremely long half-life (~40-58 days). Accumulates in adipose tissue and organs.'),
  ('fc222222-2222-2222-2222-222222222222', 'deck-anat', 'Anatomy', 'Upper Limb', 'Clinical Anatomy', 'Fracture of the mid-shaft of the humerus typically damages which nerve and artery in the spiral groove?', 'Radial Nerve and Profunda Brachii Artery', 'Presents clinically with Wrist Drop (loss of extensor digitorum & extensor carpi radialis). Sensation lost over first dorsal web space.'),
  ('fc333333-3333-3333-3333-333333333333', 'deck-path', 'Pathology', 'Hematology', 'Oncopathology', 'What genetic translocation is pathognomonic for Burkitt Lymphoma, and what classic histology is seen on low power?', 't(8;14) involving c-MYC and Ig heavy chain; "Starry Sky" appearance', 'High mitotic rate (Ki-67 ≈ 100%). Tingible body macrophages consuming apoptotic tumor cell debris give the starry appearance.')
on conflict (id) do nothing;
