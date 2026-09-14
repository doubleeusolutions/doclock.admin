import { MaterialIcons } from '@expo/vector-icons';
import { VIDEO_SUBJECTS, VideoSubject } from './videosData';

export interface ClassFaculty {
  name: string;
  title: string;
  avatar: string;
  institution: string;
}

export interface ClassTimestamp {
  time: string;
  seconds: number;
  title: string;
  isHighYield: boolean;
}

export interface RecordedClass {
  id: string;
  subjectId: string;
  classNumber: number;
  title: string;
  chapterTitle: string;
  faculty: ClassFaculty;
  duration: string;
  durationSeconds: number;
  thumbnailUrl: string;
  isHighYield: boolean;
  progressPercent: number;
  status: 'unwatched' | 'in-progress' | 'completed';
  viewsCount: string;
  rating: number;
  description: string;
  timestamps: ClassTimestamp[];
  highYieldPearls: string[];
  notesPdfSize: string;
  associatedMcqCount: number;
  associatedMcqTopicId?: string;
}

export interface SubjectVideoDetail {
  id: string;
  name: string;
  chaptersCount: number;
  totalHours: number;
  videoCount: number;
  completedClasses: number;
  progressPercent: number;
  iconName: keyof typeof MaterialIcons.glyphMap;
  iconBgColor: string;
  iconColor: string;
  leadFaculty: ClassFaculty;
  classes: RecordedClass[];
}

const DEFAULT_FACULTIES: Record<string, ClassFaculty> = {
  anatomy: {
    name: 'Dr. Sarah Jenkins, MD',
    title: 'Professor & Head of Clinical Anatomy',
    avatar:
      'https://images.unsplash.com/photo-1594824813629-652391b1a030?w=400&auto=format&fit=crop&q=80',
    institution: 'DocLock Medical Faculty • AIIMS Alumnus',
  },
  physiology: {
    name: 'Dr. Rajesh Sharma, MD',
    title: 'Consultant Clinical Physiologist',
    avatar:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    institution: 'Department of Physiology • CMC Vellore',
  },
  pathology: {
    name: 'Dr. Elena Rostova, MD, FRCPath',
    title: 'Chief Histopathologist & Educator',
    avatar:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    institution: 'Clinical Pathology Chair • DocLock Academic Council',
  },
  pharmacology: {
    name: 'Dr. Marcus Vance, MD, PhD',
    title: 'Associate Professor of Pharmacology',
    avatar:
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
    institution: 'Institute of Medical Pharmacotherapy',
  },
  surgery: {
    name: 'Dr. Vikramaditya Rao, MS, MCh',
    title: 'Consultant Surgical Oncologist',
    avatar:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
    institution: 'Department of General Surgery • PGIMER',
  },
};

const GENERIC_FACULTY: ClassFaculty = {
  name: 'Dr. Angela Mehta, MD',
  title: 'Senior Medical Faculty & Specialist',
  avatar:
    'https://images.unsplash.com/photo-1594824813629-652391b1a030?w=400&auto=format&fit=crop&q=80',
  institution: 'DocLock Academic Medical Board',
};

// Anatomy Recorded Classes
const ANATOMY_CLASSES: RecordedClass[] = [
  {
    id: 'anat-cls-01',
    subjectId: 'anatomy',
    classNumber: 1,
    title: 'Brachial Plexus: Roots, Trunks, Divisions & Clinical Neuropathies',
    chapterTitle: 'Upper Limb Anatomy',
    faculty: DEFAULT_FACULTIES.anatomy,
    duration: '45:10',
    durationSeconds: 2710,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=80',
    isHighYield: true,
    progressPercent: 100,
    status: 'completed',
    viewsCount: '18.4k views',
    rating: 4.9,
    description:
      'Comprehensive high-yield breakdown of the Brachial Plexus (C5-T1). Master Erb-Duchenne paralysis, Klumpke paralysis, thoracic outlet syndrome, and dermatomal deficits frequently tested in FMGE & NEET PG exams.',
    timestamps: [
      { time: '00:00', seconds: 0, title: 'Introduction & Structural Plan (C5–T1)', isHighYield: false },
      { time: '06:15', seconds: 375, title: 'Roots, Trunks & Prefixed/Postfixed Variants', isHighYield: true },
      { time: '14:40', seconds: 880, title: 'Cords & Axillary Artery Spatial Relations', isHighYield: true },
      { time: '22:10', seconds: 1330, title: "Erb's Palsy (Waiter's Tip Deformity & Upper Trunk Lesion)", isHighYield: true },
      { time: '32:25', seconds: 1945, title: "Klumpke's Palsy (True Claw Hand & Horner's Syndrome)", isHighYield: true },
      { time: '39:50', seconds: 2390, title: 'Exam MCQs Breakdown & Summary Pearls', isHighYield: true },
    ],
    highYieldPearls: [
      "Erb's point injury involves C5-C6 anterior rami. Characteristic presentation: Arm adducted, medially rotated, forearm extended and pronated ('Policeman's tip' or 'Waiter's tip').",
      "Klumpke's palsy damages the lower trunk (C8-T1). Leads to complete claw hand due to paralysis of all intrinsic muscles of the hand (interossei and lumbricals).",
      "Horner's syndrome (ptosis, miosis, anhidrosis, enophthalmos) occurs in Klumpke's palsy due to interruption of sympathetic T1 fibres.",
      'Long thoracic nerve of Bell originates directly from the roots (C5, C6, C7) and supplies Serratus Anterior; damage causes Winging of the Scapula.',
    ],
    notesPdfSize: '5.2 MB PDF',
    associatedMcqCount: 15,
    associatedMcqTopicId: 'brachial-plexus',
  },
  {
    id: 'anat-cls-02',
    subjectId: 'anatomy',
    classNumber: 2,
    title: 'Axilla, Axillary Artery Branches & Breast Lymphatic Drainage',
    chapterTitle: 'Upper Limb Anatomy',
    faculty: DEFAULT_FACULTIES.anatomy,
    duration: '38:25',
    durationSeconds: 2305,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
    isHighYield: true,
    progressPercent: 65,
    status: 'in-progress',
    viewsCount: '15.1k views',
    rating: 4.8,
    description:
      'Detailed surgical anatomy of the axillary triangle, 3 parts of the axillary artery, lymphatic drainage groups of the mammary gland, and sentinel lymph node biopsy landmarks.',
    timestamps: [
      { time: '00:00', seconds: 0, title: 'Boundaries of Axilla & Clavipectoral Fascia', isHighYield: false },
      { time: '08:10', seconds: 490, title: 'Axillary Artery: 3 Parts & 6 Branches', isHighYield: true },
      { time: '17:30', seconds: 1050, title: 'Scapular Anastomosis Collateral Circulation', isHighYield: true },
      { time: '26:00', seconds: 1560, title: 'Lymph Nodes of Breast (Pectoral, Subscapular, Lateral, Central, Apical)', isHighYield: true },
      { time: '34:15', seconds: 2055, title: "Peau d'orange & Cooper's Ligaments Involvement", isHighYield: true },
    ],
    highYieldPearls: [
      "The Pectoralis minor muscle divides the axillary artery into three parts: 1st part has 1 branch (Superior Thoracic), 2nd part has 2 branches (Thoracoacromial, Lateral Thoracic), 3rd part has 3 branches (Subscapular, ACHA, PCHA).",
      '75% of breast lymph drains into the axillary group (mainly Anterior/Pectoral group), 20% into parasternal (internal mammary) nodes.',
      "Involvement of suspensory ligaments of Cooper causes skin dimpling; obstruction of superficial cutaneous lymphatics causes 'peau d'orange' appearance.",
    ],
    notesPdfSize: '4.6 MB PDF',
    associatedMcqCount: 12,
  },
  {
    id: 'anat-cls-03',
    subjectId: 'anatomy',
    classNumber: 3,
    title: 'Cubital Fossa, Carpal Tunnel Syndrome & Median/Ulnar Nerve Injuries',
    chapterTitle: 'Upper Limb Anatomy',
    faculty: DEFAULT_FACULTIES.anatomy,
    duration: '42:50',
    durationSeconds: 2570,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    isHighYield: true,
    progressPercent: 0,
    status: 'unwatched',
    viewsCount: '19.8k views',
    rating: 4.9,
    description:
      'Clinical anatomy of the cubital fossa contents (Medial to Lateral: MBBR), carpal tunnel contents, Phalen & Tinel tests, and the Ulnar Paradox explained with 3D biomechanics.',
    timestamps: [
      { time: '00:00', seconds: 0, title: 'Cubital Fossa Boundaries & Floor', isHighYield: false },
      { time: '09:15', seconds: 555, title: 'Contents from Medial to Lateral (MBBR rule)', isHighYield: true },
      { time: '18:40', seconds: 1120, title: 'Carpal Tunnel Anatomy & Median Nerve Entrapment', isHighYield: true },
      { time: '28:30', seconds: 1710, title: 'Ulnar Nerve Claw Hand vs. Median Nerve Ape Hand', isHighYield: true },
      { time: '37:10', seconds: 2230, title: 'The Ulnar Paradox Explained', isHighYield: true },
    ],
    highYieldPearls: [
      'Contents of Cubital fossa from medial to lateral: Median nerve, Brachial artery, Biceps tendon, Radial nerve (Mnemonic: MBBR).',
      'The carpal tunnel contains 9 flexor tendons (4 FDS, 4 FDP, 1 FPL) and 1 nerve: the Median Nerve.',
      "Ulnar Paradox: Lesion at the elbow causes less clawing than a lesion at the wrist because paralysis of the ulnar half of Flexor Digitorum Profundus (FDP) prevents hyperflexion of DIP joints.",
    ],
    notesPdfSize: '6.1 MB PDF',
    associatedMcqCount: 18,
  },
  {
    id: 'anat-cls-04',
    subjectId: 'anatomy',
    classNumber: 4,
    title: 'Circle of Willis, Cerebral Arterial Territories & Stroke Syndromes',
    chapterTitle: 'Neuroanatomy',
    faculty: DEFAULT_FACULTIES.anatomy,
    duration: '50:30',
    durationSeconds: 3030,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&auto=format&fit=crop&q=80',
    isHighYield: true,
    progressPercent: 0,
    status: 'unwatched',
    viewsCount: '24.1k views',
    rating: 5.0,
    description:
      'Complete cerebral vascular supply: Anterior, Middle, and Posterior Cerebral Arteries, Charcot artery of cerebral hemorrhage, and clinical localizing stroke syndromes (Wallenberg, Weber, Claude).',
    timestamps: [
      { time: '00:00', seconds: 0, title: 'Anatomy of Circle of Willis & Aneurysm Sites', isHighYield: true },
      { time: '11:20', seconds: 680, title: 'Anterior Cerebral Artery (Leg > Arm weakness)', isHighYield: true },
      { time: '21:15', seconds: 1275, title: 'Middle Cerebral Artery (Face & Arm > Leg, Aphasia)', isHighYield: true },
      { time: '32:40', seconds: 1960, title: 'Posterior Cerebral Artery & Macular Sparing Hemianopia', isHighYield: true },
      { time: '41:10', seconds: 2470, title: 'Brainstem Vascular Syndromes (Wallenberg PICA)', isHighYield: true },
    ],
    highYieldPearls: [
      'Most common site of berry saccular aneurysm in Circle of Willis: Junction of Anterior Communicating Artery with Anterior Cerebral Artery (ACom).',
      'MCA stroke affects the lateral surface of cerebral hemispheres: contralateral hemiparesis and hemisensory loss predominantly affecting the FACE and UPPER LIMB.',
      'ACA stroke affects medial surface: contralateral weakness and sensory loss predominantly affecting the LOWER LIMB (perianal area and leg on motor homunculus).',
      'Lateral Medullary Syndrome (Wallenberg) is caused by occlusion of Posterior Inferior Cerebellar Artery (PICA). Manifests as ipsilateral facial numbness, contralateral body pain/temp loss, ataxia, Horner syndrome, and dysphagia.',
    ],
    notesPdfSize: '5.8 MB PDF',
    associatedMcqCount: 20,
  },
  {
    id: 'anat-cls-05',
    subjectId: 'anatomy',
    classNumber: 5,
    title: 'Cranial Nerves: III, IV, VI, VII & Cavernous Sinus Thrombosis',
    chapterTitle: 'Neuroanatomy',
    faculty: DEFAULT_FACULTIES.anatomy,
    duration: '46:15',
    durationSeconds: 2775,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    isHighYield: true,
    progressPercent: 0,
    status: 'unwatched',
    viewsCount: '16.7k views',
    rating: 4.9,
    description:
      'Pathways of ocular motor nerves, facial nerve branches in temporal bone, Bell palsy vs. UMN facial palsy, and cavernous sinus relations with danger area of the face.',
    timestamps: [
      { time: '00:00', seconds: 0, title: 'Cavernous Sinus Anatomy & Danger Area of Face', isHighYield: true },
      { time: '12:10', seconds: 730, title: 'Structures in Lateral Wall vs. Center of Sinus', isHighYield: true },
      { time: '22:30', seconds: 1350, title: 'Oculomotor Nerve (III) Palsy & Pupil Sparing Rule', isHighYield: true },
      { time: '31:40', seconds: 1900, title: 'Trochlear (IV) & Abducens (VI) Nerve Lesions', isHighYield: true },
      { time: '39:20', seconds: 2360, title: 'Facial Nerve (VII) Pathway & Bell Palsy vs. UMN', isHighYield: true },
    ],
    highYieldPearls: [
      'Structures running through the center of Cavernous Sinus: Internal Carotid Artery and Abducens Nerve (CN VI). CN VI is most prone to injury in sinus thrombosis.',
      'Structures in lateral wall of Cavernous Sinus (top to bottom): Oculomotor (III), Trochlear (IV), Ophthalmic (V1), Maxillary (V2).',
      "In UMN facial palsy, forehead wrinkling is spared due to bilateral corticobulbar innervation of upper face. In LMN (Bell's palsy), the entire ipsilateral half of face is paralyzed.",
    ],
    notesPdfSize: '5.5 MB PDF',
    associatedMcqCount: 16,
  },
  {
    id: 'anat-cls-06',
    subjectId: 'anatomy',
    classNumber: 6,
    title: 'Inguinal Canal, Hernias (Direct vs. Indirect) & Spermatic Cord',
    chapterTitle: 'Abdomen & Pelvis',
    faculty: DEFAULT_FACULTIES.anatomy,
    duration: '41:40',
    durationSeconds: 2500,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
    isHighYield: true,
    progressPercent: 0,
    status: 'unwatched',
    viewsCount: '17.2k views',
    rating: 4.8,
    description:
      "Surgical anatomy of Hesselbach's triangle, deep and superficial inguinal rings, spermatic cord layers, and differential diagnosis between direct and indirect inguinal hernias.",
    timestamps: [
      { time: '00:00', seconds: 0, title: 'Inguinal Canal Boundaries: Floor, Roof, Walls', isHighYield: true },
      { time: '10:15', seconds: 615, title: 'Contents of Spermatic Cord: 3 Arteries, 3 Nerves, 3 Others', isHighYield: true },
      { time: '20:30', seconds: 1230, title: "Hesselbach's Triangle Boundaries", isHighYield: true },
      { time: '29:45', seconds: 1785, title: 'Direct vs. Indirect Hernia: Relation to Inferior Epigastric Artery', isHighYield: true },
      { time: '36:10', seconds: 2170, title: 'Ring Occlusion Test & Clinical Correlation', isHighYield: true },
    ],
    highYieldPearls: [
      'Indirect inguinal hernia passes lateral to the inferior epigastric vessels through the deep inguinal ring into the scrotum.',
      "Direct inguinal hernia occurs medial to the inferior epigastric vessels through Hesselbach's triangle (defect in transversalis fascia).",
      'Contents of spermatic cord: 3 Arteries (Testicular, Artery to ductus deferens, Cremasteric), 3 Nerves (Genital branch of genitofemoral, Ilioinguinal outside cord, Sympathetics), 3 Others (Vas deferens, Pampiniform venous plexus, Lymphatics).',
    ],
    notesPdfSize: '4.9 MB PDF',
    associatedMcqCount: 14,
  },
];

// Fallback generator to ensure every one of the 19 subjects has rich recorded classes
export function getSubjectVideoDetail(subjectId: string): SubjectVideoDetail {
  const matchingSubject = VIDEO_SUBJECTS.find((s) => s.id === subjectId) || VIDEO_SUBJECTS[0];

  if (subjectId === 'anatomy') {
    return {
      id: 'anatomy',
      name: 'Anatomy',
      chaptersCount: 18,
      totalHours: 24,
      videoCount: ANATOMY_CLASSES.length,
      completedClasses: 1,
      progressPercent: 28,
      iconName: 'accessibility-new',
      iconBgColor: '#eef6ff',
      iconColor: '#1d70f5',
      leadFaculty: DEFAULT_FACULTIES.anatomy,
      classes: ANATOMY_CLASSES,
    };
  }

  const faculty = DEFAULT_FACULTIES[subjectId] || GENERIC_FACULTY;

  // Generate 6 high-yield classes for the requested subject
  const generatedClasses: RecordedClass[] = [
    {
      id: `${subjectId}-cls-01`,
      subjectId,
      classNumber: 1,
      title: `${matchingSubject.name} Fundamentals & High-Yield Core Principles`,
      chapterTitle: `General ${matchingSubject.name}`,
      faculty,
      duration: '44:20',
      durationSeconds: 2660,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
      isHighYield: true,
      progressPercent: 100,
      status: 'completed',
      viewsCount: '12.4k views',
      rating: 4.9,
      description: `Comprehensive review of fundamental mechanisms, diagnostic hallmarks, and high-frequency exam questions in ${matchingSubject.name}.`,
      timestamps: [
        { time: '00:00', seconds: 0, title: 'Orientation & Learning Objectives', isHighYield: false },
        { time: '07:30', seconds: 450, title: 'Core Physiological & Pathological Pathways', isHighYield: true },
        { time: '19:45', seconds: 1185, title: 'Diagnostic Workup & Landmark Criteria', isHighYield: true },
        { time: '32:10', seconds: 1930, title: 'High-Yield Clinical Case Review', isHighYield: true },
      ],
      highYieldPearls: [
        `Key discriminator in ${matchingSubject.name}: always evaluate primary etiology before selecting pharmacotherapy or intervention.`,
        `Gold standard diagnostic test remains central in FMGE clinical scenarios for ${matchingSubject.name}.`,
        'Correlate clinical presentation with lab values for swift elimination on multiple-choice questions.',
      ],
      notesPdfSize: '5.0 MB PDF',
      associatedMcqCount: 15,
    },
    {
      id: `${subjectId}-cls-02`,
      subjectId,
      classNumber: 2,
      title: `Systemic ${matchingSubject.name}: Clinical Vignettes & Diagnostic Criteria`,
      chapterTitle: `Systemic Module`,
      faculty,
      duration: '48:15',
      durationSeconds: 2895,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
      isHighYield: true,
      progressPercent: 40,
      status: 'in-progress',
      viewsCount: '14.8k views',
      rating: 4.8,
      description: `In-depth analysis of systemic pathologies, drug classifications, and standard of care algorithms for ${matchingSubject.name}.`,
      timestamps: [
        { time: '00:00', seconds: 0, title: 'System Overview & Classification', isHighYield: false },
        { time: '11:20', seconds: 680, title: 'Mechanism of Action & Targeted Pathways', isHighYield: true },
        { time: '24:50', seconds: 1490, title: 'Classic Presentation & Triad Symptoms', isHighYield: true },
        { time: '38:15', seconds: 2295, title: 'Recent Exam Questions & Trap Options', isHighYield: true },
      ],
      highYieldPearls: [
        'Recognize classic triads and pathognomonic findings to answer questions in under 45 seconds.',
        'Beware of distractor options that mimic common clinical misconceptions.',
      ],
      notesPdfSize: '4.8 MB PDF',
      associatedMcqCount: 14,
    },
    {
      id: `${subjectId}-cls-03`,
      subjectId,
      classNumber: 3,
      title: `Emergency Scenarios & Critical Care in ${matchingSubject.name}`,
      chapterTitle: `Acute & Critical Care`,
      faculty,
      duration: '39:40',
      durationSeconds: 2380,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
      isHighYield: true,
      progressPercent: 0,
      status: 'unwatched',
      viewsCount: '9.8k views',
      rating: 4.9,
      description: `Acute management protocols, emergency resuscitation, and first-line treatment choices frequently tested in clinical exams.`,
      timestamps: [
        { time: '00:00', seconds: 0, title: 'Acute Presentation Assessment', isHighYield: false },
        { time: '08:45', seconds: 525, title: 'First-Line Stabilization Measures', isHighYield: true },
        { time: '21:10', seconds: 1270, title: 'Definitive Management Protocols', isHighYield: true },
        { time: '32:30', seconds: 1950, title: 'Exam Pearls & Summary', isHighYield: true },
      ],
      highYieldPearls: [
        'ABCDE approach must always be stabilized prior to definitive imaging.',
        'Know the exact drug of choice and contraindications in acute emergency protocols.',
      ],
      notesPdfSize: '4.2 MB PDF',
      associatedMcqCount: 12,
    },
    {
      id: `${subjectId}-cls-04`,
      subjectId,
      classNumber: 4,
      title: `Pharmacotherapeutics & Treatment Regimens in ${matchingSubject.name}`,
      chapterTitle: `Therapeutics`,
      faculty,
      duration: '42:10',
      durationSeconds: 2530,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=80',
      isHighYield: false,
      progressPercent: 0,
      status: 'unwatched',
      viewsCount: '8.1k views',
      rating: 4.7,
      description: `Comprehensive drug regimens, mechanism of action, side effect profiles, and drug interactions.`,
      timestamps: [
        { time: '00:00', seconds: 0, title: 'Drug Classification', isHighYield: false },
        { time: '14:20', seconds: 860, title: 'Pharmacokinetics & Elimination', isHighYield: true },
        { time: '28:10', seconds: 1690, title: 'Adverse Effects & Toxicity Management', isHighYield: true },
      ],
      highYieldPearls: [
        'Monitor specific lab parameters before initiating high-risk therapies.',
        'Drug-induced organ toxicities are high-yield questions on national board exams.',
      ],
      notesPdfSize: '3.9 MB PDF',
      associatedMcqCount: 10,
    },
    {
      id: `${subjectId}-cls-05`,
      subjectId,
      classNumber: 5,
      title: `Image-Based Questions & Radiological Findings in ${matchingSubject.name}`,
      chapterTitle: `Imaging & Diagnostics`,
      faculty,
      duration: '52:00',
      durationSeconds: 3120,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
      isHighYield: true,
      progressPercent: 0,
      status: 'unwatched',
      viewsCount: '21.3k views',
      rating: 5.0,
      description: `Extensive review of X-rays, CT, MRI, ultrasound, and histopathology spotters for ${matchingSubject.name}.`,
      timestamps: [
        { time: '00:00', seconds: 0, title: 'Systematic Image Interpretation Approach', isHighYield: false },
        { time: '12:00', seconds: 720, title: 'High-Yield Classical Radiographic Signs', isHighYield: true },
        { time: '27:40', seconds: 1660, title: 'Histopathology Spotters & Biopsy Artifacts', isHighYield: true },
        { time: '41:15', seconds: 2475, title: 'Rapid-Fire Quiz & Image Challenge', isHighYield: true },
      ],
      highYieldPearls: [
        'Identify characteristic named signs (e.g. thumbprint sign, apple core sign, bird beak appearance).',
        'Always read patient demographics and clinical history before analyzing spotter images.',
      ],
      notesPdfSize: '6.4 MB PDF',
      associatedMcqCount: 22,
    },
    {
      id: `${subjectId}-cls-06`,
      subjectId,
      classNumber: 6,
      title: `High-Yield Rapid Revision & Previous Year Exam Questions`,
      chapterTitle: `Rapid Revision`,
      faculty,
      duration: '46:30',
      durationSeconds: 2790,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
      isHighYield: true,
      progressPercent: 0,
      status: 'unwatched',
      viewsCount: '26.8k views',
      rating: 4.9,
      description: `Fast-paced revision covering previous 5 years FMGE/NEET PG questions and recurring themes in ${matchingSubject.name}.`,
      timestamps: [
        { time: '00:00', seconds: 0, title: 'Exam Trend Analysis & Weightage', isHighYield: false },
        { time: '09:10', seconds: 550, title: 'Most Repeated High-Yield Topics', isHighYield: true },
        { time: '24:00', seconds: 1440, title: 'Controversial Questions & Evidence Consensus', isHighYield: true },
        { time: '37:50', seconds: 2270, title: 'Final 5-Minute Pearl Recap', isHighYield: true },
      ],
      highYieldPearls: [
        'Over 60% of exam questions in this subject come from the top 5 recurring subtopics.',
        'Keep revision flashcards focused on high-yield numerical cutoffs and staging criteria.',
      ],
      notesPdfSize: '5.7 MB PDF',
      associatedMcqCount: 25,
    },
  ];

  return {
    id: subjectId,
    name: matchingSubject.name,
    chaptersCount: matchingSubject.chaptersCount,
    totalHours: matchingSubject.durationHours,
    videoCount: generatedClasses.length,
    completedClasses: 1,
    progressPercent: 20,
    iconName: matchingSubject.iconName,
    iconBgColor: matchingSubject.iconBgColor,
    iconColor: matchingSubject.iconColor,
    leadFaculty: faculty,
    classes: generatedClasses,
  };
}

export function getRecordedClassById(classId: string): RecordedClass | undefined {
  // Check anatomy first
  const inAnatomy = ANATOMY_CLASSES.find((c) => c.id === classId);
  if (inAnatomy) return inAnatomy;

  // Extract subject id from prefix e.g. "pathology-cls-01" -> "pathology"
  const parts = classId.split('-');
  const subjectId = parts[0] || 'anatomy';
  const detail = getSubjectVideoDetail(subjectId);
  return detail.classes.find((c) => c.id === classId) || detail.classes[0];
}
