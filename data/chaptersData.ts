import { QBANK_SUBJECTS, QbankSubject } from './qbankData';

export type TopicStatus = 'completed' | 'in-progress' | 'unattempted';

export interface SubheadingTopic {
  id: string;
  title: string;
  mcqCount: number;
  completedMcqs: number;
  durationMinutes: number;
  status: TopicStatus;
  isHighYield?: boolean;
  isImageBased?: boolean;
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  topics: SubheadingTopic[];
}

export interface SubjectDetail {
  subjectId: string;
  subjectName: string;
  totalChapters: number;
  totalMcqs: number;
  completedMcqs: number;
  accuracyRate: number;
  chapters: Chapter[];
}

export type ChapterFilterId =
  | 'all'
  | 'high-yield'
  | 'unattempted'
  | 'in-progress'
  | 'completed'
  | 'image-based';

export interface ChapterFilterTab {
  id: ChapterFilterId;
  label: string;
}

export const CHAPTER_FILTER_TABS: ChapterFilterTab[] = [
  { id: 'all', label: 'All Topics' },
  { id: 'high-yield', label: 'High-Yield' },
  { id: 'unattempted', label: 'Unattempted' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'image-based', label: 'Image-Based' },
];

export const SUBJECT_CHAPTERS_MAP: Record<string, Chapter[]> = {
  anatomy: [
    {
      id: 'anat-ch1',
      chapterNumber: 1,
      title: 'Upper Limb & Neurovasculature',
      topics: [
        {
          id: 'anat-1-1',
          title: "Brachial Plexus & Erb's / Klumpke's Palsy",
          mcqCount: 30,
          completedMcqs: 30,
          durationMinutes: 25,
          status: 'completed',
          isHighYield: true,
          isImageBased: true,
        },
        {
          id: 'anat-1-2',
          title: 'Axillary Artery Branches & Anastomoses',
          mcqCount: 25,
          completedMcqs: 15,
          durationMinutes: 20,
          status: 'in-progress',
          isHighYield: true,
          isImageBased: false,
        },
        {
          id: 'anat-1-3',
          title: 'Carpal Tunnel Syndrome & Median Nerve Course',
          mcqCount: 35,
          completedMcqs: 0,
          durationMinutes: 30,
          status: 'unattempted',
          isHighYield: true,
          isImageBased: true,
        },
        {
          id: 'anat-1-4',
          title: 'Rotator Cuff Muscles & Shoulder Stability',
          mcqCount: 20,
          completedMcqs: 0,
          durationMinutes: 15,
          status: 'unattempted',
          isHighYield: false,
          isImageBased: true,
        },
      ],
    },
    {
      id: 'anat-ch2',
      chapterNumber: 2,
      title: 'Neuroanatomy & Cranial Nerves',
      topics: [
        {
          id: 'anat-2-1',
          title: 'Cavernous Sinus Anatomy & Thrombosis',
          mcqCount: 40,
          completedMcqs: 40,
          durationMinutes: 35,
          status: 'completed',
          isHighYield: true,
          isImageBased: true,
        },
        {
          id: 'anat-2-2',
          title: 'Brainstem Syndromes (Wallenberg & Weber)',
          mcqCount: 35,
          completedMcqs: 20,
          durationMinutes: 30,
          status: 'in-progress',
          isHighYield: true,
          isImageBased: true,
        },
        {
          id: 'anat-2-3',
          title: 'Circle of Willis & Berry Aneurysm Sites',
          mcqCount: 25,
          completedMcqs: 0,
          durationMinutes: 20,
          status: 'unattempted',
          isHighYield: true,
          isImageBased: true,
        },
        {
          id: 'anat-2-4',
          title: 'Ventricular System & Hydrocephalus Dynamics',
          mcqCount: 20,
          completedMcqs: 0,
          durationMinutes: 18,
          status: 'unattempted',
          isHighYield: false,
          isImageBased: false,
        },
      ],
    },
    {
      id: 'anat-ch3',
      chapterNumber: 3,
      title: 'Thorax & Cardiovascular Anatomy',
      topics: [
        {
          id: 'anat-3-1',
          title: 'Coronary Circulation & Dominance Patterns',
          mcqCount: 30,
          completedMcqs: 10,
          durationMinutes: 25,
          status: 'in-progress',
          isHighYield: true,
          isImageBased: true,
        },
        {
          id: 'anat-3-2',
          title: 'Bronchopulmonary Segments & Hilum Relations',
          mcqCount: 25,
          completedMcqs: 0,
          durationMinutes: 20,
          status: 'unattempted',
          isHighYield: true,
          isImageBased: true,
        },
        {
          id: 'anat-3-3',
          title: 'Mediastinal Compartments & Tumor Masses',
          mcqCount: 20,
          completedMcqs: 0,
          durationMinutes: 18,
          status: 'unattempted',
          isHighYield: false,
          isImageBased: false,
        },
      ],
    },
    {
      id: 'anat-ch4',
      chapterNumber: 4,
      title: 'Abdomen, Pelvis & Perineum',
      topics: [
        {
          id: 'anat-4-1',
          title: 'Inguinal Canal Anatomy & Hernia Trajectories',
          mcqCount: 35,
          completedMcqs: 35,
          durationMinutes: 30,
          status: 'completed',
          isHighYield: true,
          isImageBased: true,
        },
        {
          id: 'anat-4-2',
          title: 'Portal-Systemic Anastomoses & Caput Medusae',
          mcqCount: 25,
          completedMcqs: 0,
          durationMinutes: 20,
          status: 'unattempted',
          isHighYield: true,
          isImageBased: false,
        },
        {
          id: 'anat-4-3',
          title: 'Peritoneal Pouches & Abscess Localization',
          mcqCount: 20,
          completedMcqs: 0,
          durationMinutes: 15,
          status: 'unattempted',
          isHighYield: false,
          isImageBased: true,
        },
      ],
    },
    {
      id: 'anat-ch5',
      chapterNumber: 5,
      title: 'Embryology & Congenital Anomalies',
      topics: [
        {
          id: 'anat-5-1',
          title: 'Pharyngeal Arches, Pouches & Cleft Derivatives',
          mcqCount: 30,
          completedMcqs: 15,
          durationMinutes: 25,
          status: 'in-progress',
          isHighYield: true,
          isImageBased: true,
        },
        {
          id: 'anat-5-2',
          title: 'Aortic Arch Anomalies & Tetralogy of Fallot',
          mcqCount: 25,
          completedMcqs: 0,
          durationMinutes: 20,
          status: 'unattempted',
          isHighYield: true,
          isImageBased: true,
        },
      ],
    },
  ],
  pathology: [
    {
      id: 'path-ch1',
      chapterNumber: 1,
      title: 'General Pathology & Cell Injury',
      topics: [
        {
          id: 'path-1-1',
          title: 'Necrosis vs Apoptosis Pathways & Morphology',
          mcqCount: 45,
          completedMcqs: 45,
          durationMinutes: 40,
          status: 'completed',
          isHighYield: true,
          isImageBased: true,
        },
        {
          id: 'path-1-2',
          title: 'Intracellular Accumulations & Amyloidosis Stains',
          mcqCount: 35,
          completedMcqs: 20,
          durationMinutes: 30,
          status: 'in-progress',
          isHighYield: true,
          isImageBased: true,
        },
        {
          id: 'path-1-3',
          title: 'Cellular Adaptations (Hypertrophy & Metaplasia)',
          mcqCount: 30,
          completedMcqs: 0,
          durationMinutes: 25,
          status: 'unattempted',
          isHighYield: false,
          isImageBased: false,
        },
      ],
    },
    {
      id: 'path-ch2',
      chapterNumber: 2,
      title: 'Hematology & Bone Marrow Disorders',
      topics: [
        {
          id: 'path-2-1',
          title: 'Acute Leukemias (AML vs ALL Markers & Translocations)',
          mcqCount: 50,
          completedMcqs: 50,
          durationMinutes: 45,
          status: 'completed',
          isHighYield: true,
          isImageBased: true,
        },
        {
          id: 'path-2-2',
          title: 'Hemolytic Anemias (G6PD, Spherocytosis & Sickle Cell)',
          mcqCount: 40,
          completedMcqs: 25,
          durationMinutes: 35,
          status: 'in-progress',
          isHighYield: true,
          isImageBased: true,
        },
        {
          id: 'path-2-3',
          title: 'Multiple Myeloma & Plasma Cell Dyscrasias',
          mcqCount: 35,
          completedMcqs: 0,
          durationMinutes: 30,
          status: 'unattempted',
          isHighYield: true,
          isImageBased: true,
        },
      ],
    },
    {
      id: 'path-ch3',
      chapterNumber: 3,
      title: 'Neoplasia & Tumor Biology',
      topics: [
        {
          id: 'path-3-1',
          title: 'Oncogenes & Tumor Suppressor Genes (p53, RB1)',
          mcqCount: 40,
          completedMcqs: 10,
          durationMinutes: 35,
          status: 'in-progress',
          isHighYield: true,
          isImageBased: false,
        },
        {
          id: 'path-3-2',
          title: 'Paraneoplastic Syndromes & Diagnostic Markers',
          mcqCount: 35,
          completedMcqs: 0,
          durationMinutes: 30,
          status: 'unattempted',
          isHighYield: true,
          isImageBased: false,
        },
      ],
    },
  ],
  pharmacology: [
    {
      id: 'pharm-ch1',
      chapterNumber: 1,
      title: 'Autonomic Nervous System',
      topics: [
        {
          id: 'pharm-1-1',
          title: 'Cholinergic Agonists & Organophosphate Poisoning',
          mcqCount: 35,
          completedMcqs: 35,
          durationMinutes: 30,
          status: 'completed',
          isHighYield: true,
          isImageBased: false,
        },
        {
          id: 'pharm-1-2',
          title: 'Beta Blockers & Glaucoma Regimens',
          mcqCount: 30,
          completedMcqs: 15,
          durationMinutes: 25,
          status: 'in-progress',
          isHighYield: true,
          isImageBased: false,
        },
      ],
    },
    {
      id: 'pharm-ch2',
      chapterNumber: 2,
      title: 'Cardiovascular Pharmacology',
      topics: [
        {
          id: 'pharm-2-1',
          title: 'Antihypertensive Classes & Pregnancy Safety',
          mcqCount: 45,
          completedMcqs: 25,
          durationMinutes: 40,
          status: 'in-progress',
          isHighYield: true,
          isImageBased: false,
        },
        {
          id: 'pharm-2-2',
          title: 'Heart Failure Regimens (ARNi & SGLT2i)',
          mcqCount: 35,
          completedMcqs: 0,
          durationMinutes: 30,
          status: 'unattempted',
          isHighYield: true,
          isImageBased: false,
        },
        {
          id: 'pharm-2-3',
          title: 'Antiarrhythmic Vaughan-Williams Classification',
          mcqCount: 30,
          completedMcqs: 0,
          durationMinutes: 25,
          status: 'unattempted',
          isHighYield: true,
          isImageBased: true,
        },
      ],
    },
  ],
};

// Helper function to generate realistic fallback chapters for any other subject
export function getSubjectChapters(subjectId: string, subjectName: string): Chapter[] {
  if (SUBJECT_CHAPTERS_MAP[subjectId]) {
    return SUBJECT_CHAPTERS_MAP[subjectId];
  }

  return [
    {
      id: `${subjectId}-ch1`,
      chapterNumber: 1,
      title: `High-Yield Concepts in ${subjectName}`,
      topics: [
        {
          id: `${subjectId}-1-1`,
          title: `${subjectName} Clinical Vignettes & Diagnostics`,
          mcqCount: 35,
          completedMcqs: 35,
          durationMinutes: 30,
          status: 'completed',
          isHighYield: true,
          isImageBased: true,
        },
        {
          id: `${subjectId}-1-2`,
          title: `First-Line Protocols & Guidelines`,
          mcqCount: 30,
          completedMcqs: 15,
          durationMinutes: 25,
          status: 'in-progress',
          isHighYield: true,
          isImageBased: false,
        },
        {
          id: `${subjectId}-1-3`,
          title: `Classic Signs & Named Criteria`,
          mcqCount: 25,
          completedMcqs: 0,
          durationMinutes: 20,
          status: 'unattempted',
          isHighYield: true,
          isImageBased: true,
        },
      ],
    },
    {
      id: `${subjectId}-ch2`,
      chapterNumber: 2,
      title: `Core Syndromes & System Review`,
      topics: [
        {
          id: `${subjectId}-2-1`,
          title: `Emergency Presentations & Rapid Triaging`,
          mcqCount: 30,
          completedMcqs: 10,
          durationMinutes: 25,
          status: 'in-progress',
          isHighYield: true,
          isImageBased: false,
        },
        {
          id: `${subjectId}-2-2`,
          title: `Differential Diagnosis & Investigation of Choice`,
          mcqCount: 28,
          completedMcqs: 0,
          durationMinutes: 22,
          status: 'unattempted',
          isHighYield: true,
          isImageBased: true,
        },
        {
          id: `${subjectId}-2-3`,
          title: `Therapeutic Management & Drug Toxicity`,
          mcqCount: 22,
          completedMcqs: 0,
          durationMinutes: 18,
          status: 'unattempted',
          isHighYield: false,
          isImageBased: false,
        },
      ],
    },
    {
      id: `${subjectId}-ch3`,
      chapterNumber: 3,
      title: `Recent Advances & Image Bank`,
      topics: [
        {
          id: `${subjectId}-3-1`,
          title: `Radiology & Histopathology Spotters`,
          mcqCount: 25,
          completedMcqs: 0,
          durationMinutes: 20,
          status: 'unattempted',
          isHighYield: true,
          isImageBased: true,
        },
        {
          id: `${subjectId}-3-2`,
          title: `Previous Year Recall MCQs (2020-2024)`,
          mcqCount: 35,
          completedMcqs: 0,
          durationMinutes: 30,
          status: 'unattempted',
          isHighYield: true,
          isImageBased: false,
        },
      ],
    },
  ];
}

export function getSubjectDetail(subjectId: string): SubjectDetail {
  const subject = QBANK_SUBJECTS.find((s) => s.id === subjectId) || {
    id: subjectId,
    name: subjectId.charAt(0).toUpperCase() + subjectId.slice(1),
    chaptersCount: 12,
    mcqCount: 350,
    iconName: 'menu-book',
    iconBgColor: '#d7e2ff',
    iconColor: '#0059b9',
    categories: ['pre-clinical'],
  };

  const chapters = getSubjectChapters(subjectId, subject.name);

  let totalMcqs = 0;
  let completedMcqs = 0;

  chapters.forEach((ch) => {
    ch.topics.forEach((top) => {
      totalMcqs += top.mcqCount;
      completedMcqs += top.completedMcqs;
    });
  });

  const accuracyRate = 76; // Sample calculated accuracy

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    totalChapters: chapters.length,
    totalMcqs: totalMcqs || subject.mcqCount,
    completedMcqs,
    accuracyRate,
    chapters,
  };
}
