export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
}

export interface FeaturedCardItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  modulesCount: number;
  durationMinutes: number;
  gradientColors: [string, string, string];
}

export interface MCQOption {
  id: string;
  label: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface MCQQuestion {
  id: string;
  topic: string;
  difficulty: 'High-Yield' | 'Moderate' | 'Advanced';
  question: string;
  options: MCQOption[];
  correctOptionId: string;
  explanation: string;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'all', name: 'All Topics', icon: 'auto-awesome' },
  { id: 'cardio', name: 'Cardiology', icon: 'favorite' },
  { id: 'neuro', name: 'Neurology', icon: 'psychology' },
  { id: 'pharm', name: 'Pharmacology', icon: 'medication' },
  { id: 'path', name: 'Pathology', icon: 'biotech' },
  { id: 'anatomy', name: 'Anatomy', icon: 'accessibility' },
  { id: 'peds', name: 'Pediatrics', icon: 'child-care' },
];

export const FEATURED_CARDS: FeaturedCardItem[] = [
  {
    id: 'feat-1',
    tag: 'USMLE STEP 1 CORE',
    title: 'High-Yield Cardiovascular Pathology',
    subtitle: 'Valvular disorders, acute coronary syndromes, and ECG arrhythmia drills.',
    modulesCount: 14,
    durationMinutes: 45,
    gradientColors: ['#4F8FF7', '#67D5F5', '#8B7CF6'],
  },
  {
    id: 'feat-2',
    tag: 'RAPID RECALL SPRINT',
    title: 'Autonomic Pharmacology & Receptors',
    subtitle: 'Sympathetic vs parasympathetic pathways, blockers, and toxidrome antidotes.',
    modulesCount: 10,
    durationMinutes: 30,
    gradientColors: ['#3B82F6', '#93C5FD', '#7C3AED'],
  },
  {
    id: 'feat-3',
    tag: 'CLINICAL CASE DRILL',
    title: 'Cranial Nerve Palsies & Brainstem Syndromes',
    subtitle: 'Localization rules of 4, Weber syndrome, and Wallenberg lateral medullary signs.',
    modulesCount: 8,
    durationMinutes: 35,
    gradientColors: ['#6366F1', '#38BDF8', '#818CF8'],
  },
];

export const DAILY_MCQ: MCQQuestion = {
  id: 'mcq-cardio-01',
  topic: 'Pharmacology · Cardiology',
  difficulty: 'High-Yield',
  question:
    'A 62-year-old male with chronic stable angina is initiated on sublingual nitroglycerin for acute symptom relief. Which cellular mechanism predominantly accounts for the therapeutic reduction in myocardial oxygen demand?',
  options: [
    {
      id: 'opt-a',
      label: 'A',
      text: 'Systemic venodilation leading to reduced left ventricular end-diastolic pressure (preload)',
    },
    {
      id: 'opt-b',
      label: 'B',
      text: 'Direct coronary arteriolar dilation redistributing blood flow to ischemic subendocardium',
    },
    {
      id: 'opt-c',
      label: 'C',
      text: 'Negative inotropic effect secondary to calcium channel blockade in cardiomyocytes',
    },
    {
      id: 'opt-d',
      label: 'D',
      text: 'Inhibition of phosphodiesterase-5 resulting in elevated platelet cyclic GMP levels',
    },
  ],
  correctOptionId: 'opt-a',
  explanation:
    'Nitroglycerin exerts its primary anti-anginal effect via venous capacitance vessel dilation (venodilation). This causes pooling of blood in peripheral veins, reducing venous return and left ventricular preload (LVEDV), which significantly diminishes ventricular wall stress and myocardial oxygen demand.',
};
