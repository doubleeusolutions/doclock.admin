import { MaterialIcons } from '@expo/vector-icons';

// ==========================================
// 1. BOOKMARKS DATA
// ==========================================
export type BookmarkType = 'mcq' | 'video' | 'pearl' | 'flashcard';

export interface BookmarkItem {
  id: string;
  type: BookmarkType;
  title: string;
  subject: string;
  chapter: string;
  snippet: string;
  dateSaved: string;
  badgeText: string;
  targetRoute?: string;
  facultyName?: string;
  difficulty?: 'High-Yield' | 'Moderate' | 'Advanced';
}

export const BOOKMARKS_DATA: BookmarkItem[] = [
  {
    id: 'bm-01',
    type: 'mcq',
    title: 'Antiarrhythmics Contraindicated in Pre-Excited AF (WPW Syndrome)',
    subject: 'Pharmacology',
    chapter: 'Cardiovascular Therapeutics',
    snippet:
      'A 26-year-old male with WPW presents with irregular wide-complex tachycardia. Why are Verapamil & Diltiazem strictly contraindicated?',
    dateSaved: 'Saved 2 days ago',
    badgeText: 'CLINICAL MCQ',
    targetRoute: '/qbank/pharmacology',
    difficulty: 'High-Yield',
  },
  {
    id: 'bm-02',
    type: 'video',
    title: 'Brachial Plexus: Roots, Trunks & Erb-Duchenne Palsy',
    subject: 'Anatomy',
    chapter: 'Upper Limb Anatomy',
    snippet:
      'Detailed clinical breakdown of waiter tip deformity, C5-C6 root avulsion, and suprascapular nerve deficit.',
    dateSaved: 'Saved 3 days ago',
    badgeText: 'VIDEO LECTURE',
    targetRoute: '/videos/class/anat-cls-01',
    facultyName: 'Dr. Sarah Jenkins, MD',
    difficulty: 'High-Yield',
  },
  {
    id: 'bm-03',
    type: 'pearl',
    title: 'Amiodarone Organ Toxicity Surveillance & Baseline Tests',
    subject: 'Pharmacology',
    chapter: 'Cardiovascular Pharmacology',
    snippet:
      'Baseline PFTs (DLCO), Thyroid function tests (T3/T4/TSH every 6m), LFTs, and ophthalmology slit-lamp exam.',
    dateSaved: 'Saved 4 days ago',
    badgeText: 'HIGH-YIELD PEARL',
    difficulty: 'High-Yield',
  },
  {
    id: 'bm-04',
    type: 'flashcard',
    title: 'Reed-Sternberg Cells Variants & CD Markers in Hodgkin Lymphoma',
    subject: 'Pathology',
    chapter: 'Hematopathology',
    snippet:
      'Classic RS cells: CD15+, CD30+, CD45-, PAX-5 weak. Nodular lymphocyte predominant: CD20+, CD45+, BCL6+ (Popcorn cells).',
    dateSaved: 'Saved 5 days ago',
    badgeText: 'FLASHCARD SPOTTER',
    difficulty: 'Advanced',
  },
  {
    id: 'bm-05',
    type: 'mcq',
    title: 'Gram-Positive Bacilli with Medusa-Head Colonies & Boxcar Morphology',
    subject: 'Microbiology',
    chapter: 'Bacteriology',
    snippet:
      'Bacillus anthracis non-motile, non-hemolytic colonies with inverted fir-tree gelatin liquefaction and poly-D-glutamic acid capsule.',
    dateSaved: 'Saved 1 week ago',
    badgeText: 'CLINICAL MCQ',
    targetRoute: '/qbank/microbiology',
    difficulty: 'High-Yield',
  },
  {
    id: 'bm-06',
    type: 'video',
    title: 'Femoral Triangle & Femoral Hernia Surgical Anatomy',
    subject: 'Surgery',
    chapter: 'Abdominal Wall & Inguinal Region',
    snippet:
      'Boundaries: Inguinal ligament superior, Sartorius lateral, Adductor longus medial. Femoral canal relations to Lacunar ligament.',
    dateSaved: 'Saved 1 week ago',
    badgeText: 'SURGICAL CLASS',
    facultyName: 'Dr. Marcus Vance, MD',
    difficulty: 'Moderate',
  },
];

// ==========================================
// 2. DOWNLOADS DATA
// ==========================================
export type DownloadType = 'video' | 'slides' | 'audio';

export interface DownloadedItem {
  id: string;
  title: string;
  subject: string;
  type: DownloadType;
  durationOrPages: string;
  fileSizeMb: number;
  downloadDate: string;
  thumbnailUrl: string;
  targetRoute?: string;
  qualityBadge: string;
}

export const DOWNLOADS_DATA: DownloadedItem[] = [
  {
    id: 'dl-01',
    title: 'Brachial Plexus: Roots, Trunks & Clinical Neuropathies',
    subject: 'Anatomy',
    type: 'video',
    durationOrPages: '45 mins',
    fileSizeMb: 420,
    downloadDate: 'Downloaded yesterday',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80',
    targetRoute: '/videos/class/anat-cls-01',
    qualityBadge: '1080p HD',
  },
  {
    id: 'dl-02',
    title: 'Rapid Recall: Antiarrhythmics & ICU Emergency Pharmacology',
    subject: 'Pharmacology',
    type: 'video',
    durationOrPages: '60 mins',
    fileSizeMb: 560,
    downloadDate: 'Downloaded 3 days ago',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80',
    qualityBadge: '720p HD',
  },
  {
    id: 'dl-03',
    title: 'Peripheral Blood Smear & Bone Marrow Spotters Masterclass',
    subject: 'Pathology',
    type: 'video',
    durationOrPages: '75 mins',
    fileSizeMb: 680,
    downloadDate: 'Downloaded 5 days ago',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
    qualityBadge: '1080p HD',
  },
  {
    id: 'dl-04',
    title: 'Autonomic Pharmacology Annotated Master Slide Deck',
    subject: 'Pharmacology',
    type: 'slides',
    durationOrPages: '48 Slides PDF',
    fileSizeMb: 18.5,
    downloadDate: 'Downloaded 1 week ago',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=80',
    qualityBadge: 'PDF Document',
  },
  {
    id: 'dl-05',
    title: 'Rapid Audio Revision: Cardiac Auscultation & Murmurs',
    subject: 'Medicine',
    type: 'audio',
    durationOrPages: '32 mins audio',
    fileSizeMb: 38,
    downloadDate: 'Downloaded 1 week ago',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
    qualityBadge: 'High-Res Audio',
  },
];

// ==========================================
// 3. FLASHCARDS DATA
// ==========================================
export interface FlashcardItem {
  id: string;
  subject: string;
  chapter: string;
  question: string;
  answer: string;
  highYieldPearl: string;
  category: string;
}

export interface FlashcardDeck {
  id: string;
  subject: string;
  totalCards: number;
  dueToday: number;
  masteredPercent: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  accentColor: string;
}

export const FLASHCARD_DECKS: FlashcardDeck[] = [
  {
    id: 'deck-pharm',
    subject: 'Pharmacology',
    totalCards: 180,
    dueToday: 18,
    masteredPercent: 82,
    icon: 'medication',
    accentColor: '#0059b9',
  },
  {
    id: 'deck-anat',
    subject: 'Anatomy',
    totalCards: 145,
    dueToday: 12,
    masteredPercent: 76,
    icon: 'accessibility',
    accentColor: '#006780',
  },
  {
    id: 'deck-path',
    subject: 'Pathology',
    totalCards: 160,
    dueToday: 8,
    masteredPercent: 91,
    icon: 'biotech',
    accentColor: '#4f46e5',
  },
  {
    id: 'deck-micro',
    subject: 'Microbiology',
    totalCards: 95,
    dueToday: 4,
    masteredPercent: 88,
    icon: 'coronavirus',
    accentColor: '#059669',
  },
];

export const ACTIVE_FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc-01',
    subject: 'Pharmacology',
    chapter: 'Cardiovascular',
    question:
      'Which antiarrhythmic drug causes Pulmonary Fibrosis, Slate-grey corneal microdeposits, and both hyper- and hypothyroidism?',
    answer: 'Amiodarone (Class III K+ channel blocker)',
    highYieldPearl:
      'Contains 37% iodine by weight. Extremely long half-life (~40-58 days). Accumulates in adipose tissue and organs.',
    category: 'Drug Toxicities',
  },
  {
    id: 'fc-02',
    subject: 'Anatomy',
    chapter: 'Upper Limb',
    question:
      'Fracture of the mid-shaft of the humerus typically damages which nerve and artery in the spiral groove?',
    answer: 'Radial Nerve and Profunda Brachii Artery',
    highYieldPearl:
      'Presents clinically with Wrist Drop (loss of extensor digitorum & extensor carpi radialis). Sensation lost over first dorsal web space.',
    category: 'Clinical Anatomy',
  },
  {
    id: 'fc-03',
    subject: 'Pathology',
    chapter: 'Hematology',
    question:
      'What genetic translocation is pathognomonic for Burkitt Lymphoma, and what classic histology is seen on low power?',
    answer: 't(8;14) involving c-MYC and Ig heavy chain; "Starry Sky" appearance',
    highYieldPearl:
      'High mitotic rate (Ki-67 ≈ 100%). Tingible body macrophages consuming apoptotic tumor cell debris give the starry appearance.',
    category: 'Oncopathology',
  },
  {
    id: 'fc-04',
    subject: 'Pharmacology',
    chapter: 'Antimicrobial',
    question:
      'Which class of antibiotics is associated with cartilage damage, Achilles tendon rupture, and contraindicated in pregnancy?',
    answer: 'Fluoroquinolones (e.g. Ciprofloxacin, Levofloxacin)',
    highYieldPearl:
      'Inhibits Bacterial DNA Gyrase (Topoisomerase II) in Gram-negatives and Topoisomerase IV in Gram-positives.',
    category: 'Mechanism of Action',
  },
];

// ==========================================
// 4. DAILY GOALS DATA
// ==========================================
export interface DailyGoalTask {
  id: string;
  title: string;
  category: 'mcq' | 'video' | 'flashcard' | 'live' | 'test';
  targetCount: number;
  completedCount: number;
  unit: string;
  isCompleted: boolean;
  timeEstimateMins: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

export interface DayActivity {
  dayName: string;
  dateNumber: number;
  percent: number;
  isToday: boolean;
  hoursSpent: string;
}

export const DAILY_GOAL_TASKS: DailyGoalTask[] = [
  {
    id: 'goal-01',
    title: 'Pharmacology QBank Drill: Autonomic Drugs',
    category: 'mcq',
    targetCount: 30,
    completedCount: 30,
    unit: 'MCQs',
    isCompleted: true,
    timeEstimateMins: 45,
    icon: 'quiz',
    color: '#0059b9',
  },
  {
    id: 'goal-02',
    title: 'Watch Anatomy Lecture: Brachial Plexus',
    category: 'video',
    targetCount: 1,
    completedCount: 1,
    unit: 'Lecture',
    isCompleted: true,
    timeEstimateMins: 45,
    icon: 'play-circle',
    color: '#006780',
  },
  {
    id: 'goal-03',
    title: 'Review Due Flashcards (Pharmacology & Anatomy)',
    category: 'flashcard',
    targetCount: 25,
    completedCount: 25,
    unit: 'Cards',
    isCompleted: true,
    timeEstimateMins: 20,
    icon: 'style',
    color: '#4f46e5',
  },
  {
    id: 'goal-04',
    title: 'Attend Live Emergency Pharmacology Class',
    category: 'live',
    targetCount: 1,
    completedCount: 1,
    unit: 'Live Class',
    isCompleted: true,
    timeEstimateMins: 60,
    icon: 'meeting-room',
    color: '#ef4444',
  },
  {
    id: 'goal-05',
    title: 'Mini Grand Mock Practice Test #02',
    category: 'test',
    targetCount: 20,
    completedCount: 12,
    unit: 'Questions',
    isCompleted: false,
    timeEstimateMins: 30,
    icon: 'timer',
    color: '#d97706',
  },
  {
    id: 'goal-06',
    title: 'High-Yield Pathology Summary Pearls',
    category: 'mcq',
    targetCount: 10,
    completedCount: 0,
    unit: 'Pearls',
    isCompleted: false,
    timeEstimateMins: 15,
    icon: 'lightbulb',
    color: '#10b981',
  },
];

export const WEEKLY_ACTIVITY: DayActivity[] = [
  { dayName: 'Mon', dateNumber: 8, percent: 100, isToday: false, hoursSpent: '4.5h' },
  { dayName: 'Tue', dateNumber: 9, percent: 85, isToday: false, hoursSpent: '3.8h' },
  { dayName: 'Wed', dateNumber: 10, percent: 100, isToday: false, hoursSpent: '5.2h' },
  { dayName: 'Thu', dateNumber: 11, percent: 90, isToday: false, hoursSpent: '4.1h' },
  { dayName: 'Fri', dateNumber: 12, percent: 100, isToday: false, hoursSpent: '4.8h' },
  { dayName: 'Sat', dateNumber: 13, percent: 75, isToday: false, hoursSpent: '3.2h' },
  { dayName: 'Sun', dateNumber: 14, percent: 68, isToday: true, hoursSpent: '3.5h' },
];
