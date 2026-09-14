export type AttemptMode = 'practice' | 'exam' | 'study';

export type QuestionDifficulty = 'Easy' | 'Moderate' | 'Hard';

export interface MCQOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  isCorrect: boolean;
  peerPercentage: number; // e.g. 74 means 74% students chose this
  explanation?: string;
}

export interface MCQExplanation {
  overall: string;
  goldenPearl: string;
  whyOtherOptionsWrong?: {
    optionId: 'A' | 'B' | 'C' | 'D';
    reason: string;
  }[];
  reference: string;
}

export interface MCQQuestion {
  id: string;
  topicId: string;
  topicTitle: string;
  subjectName: string;
  questionNumber: number;
  clinicalVignette: string;
  imageUrl?: string;
  imageCaption?: string;
  difficulty: QuestionDifficulty;
  isHighYield: boolean;
  isImageBased?: boolean;
  options: MCQOption[];
  explanation: MCQExplanation;
}

export interface UserAnswerState {
  questionId: string;
  selectedOptionId?: 'A' | 'B' | 'C' | 'D';
  isFlagged?: boolean;
  isStruckThrough?: Partial<Record<'A' | 'B' | 'C' | 'D', boolean>>;
  timeSpentSeconds: number;
  isAnswered: boolean;
}

export interface SessionResult {
  topicId: string;
  topicTitle: string;
  subjectName: string;
  mode: AttemptMode;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  accuracyPercentage: number;
  totalTimeSeconds: number;
  score: number;
  userAnswers: Record<string, UserAnswerState>;
}

// Curated high-yield authentic clinical MCQs
export const CURATED_TOPIC_MCQS: Record<string, MCQQuestion[]> = {
  // Brachial Plexus & Nerve Injuries
  'anat-t-1': [
    {
      id: 'anat-bp-1',
      topicId: 'anat-t-1',
      topicTitle: 'Brachial Plexus & Nerve Injuries',
      subjectName: 'Anatomy',
      questionNumber: 1,
      clinicalVignette:
        'A 24-year-old motorcyclist is brought to the trauma bay following a high-speed collision. On physical examination, the right upper extremity is held in adduction, internal rotation, and extension at the elbow with forearm pronation ("waiter\'s tip" deformity). Sensibility is impaired over the lateral arm. Which roots of the brachial plexus are most likely injured?',
      difficulty: 'Moderate',
      isHighYield: true,
      options: [
        {
          id: 'A',
          text: 'C5 and C6 ventral rami',
          isCorrect: true,
          peerPercentage: 78,
          explanation: 'Traction injury to C5-C6 roots (Erb-Duchenne palsy) leads to loss of abductors, lateral rotators, and biceps.',
        },
        {
          id: 'B',
          text: 'C8 and T1 ventral rami',
          isCorrect: false,
          peerPercentage: 14,
          explanation: 'C8-T1 injury causes Klumpke palsy presenting with claw hand and Horner syndrome, not waiter’s tip deformity.',
        },
        {
          id: 'C',
          text: 'Posterior cord of brachial plexus',
          isCorrect: false,
          peerPercentage: 5,
          explanation: 'Posterior cord damage produces wrist drop (radial nerve) and deltoid paralysis (axillary nerve) without this characteristic waiter’s posture.',
        },
        {
          id: 'D',
          text: 'Suprascapular nerve alone',
          isCorrect: false,
          peerPercentage: 3,
          explanation: 'Suprascapular nerve innervates supraspinatus and infraspinatus, but cannot explain biceps weakness or sensory loss over lateral arm.',
        },
      ],
      explanation: {
        overall:
          'Erb-Duchenne palsy results from traction or tearing of the superior trunk of the brachial plexus formed by the ventral rami of C5 and C6 (Erb point). This typically occurs when the head is forcefully deflected away from the shoulder during a fall or difficult breech delivery. Muscles paralyzed include supraspinatus, infraspinatus, deltoid, biceps brachii, brachialis, and supinator, producing the classic "policeman\'s tip" or "waiter\'s tip" posture.',
        goldenPearl:
          'Erb palsy = C5-C6 superior trunk lesion ("Waiter’s tip": arm adducted, internally rotated, elbow extended, forearm pronated). Klumpke palsy = C8-T1 inferior trunk lesion (intrinsic hand clawing + Horner syndrome).',
        whyOtherOptionsWrong: [
          {
            optionId: 'B',
            reason: 'Involves inferior trunk (Klumpke palsy), leading to claw hand due to lumbrical/interossei paralysis.',
          },
          {
            optionId: 'C',
            reason: 'Posterior cord lesion gives wrist drop and axillary nerve weakness, but biceps flexion remains intact through musculocutaneous nerve.',
          },
          {
            optionId: 'D',
            reason: 'Suprascapular nerve isolation would not paralyze biceps brachii or produce sensory deficits in the lateral arm.',
          },
        ],
        reference: "Gray's Anatomy for Students, 4th Ed. Chapter 7: Upper Limb - Brachial Plexus Injuries.",
      },
    },
    {
      id: 'anat-bp-2',
      topicId: 'anat-t-1',
      topicTitle: 'Brachial Plexus & Nerve Injuries',
      subjectName: 'Anatomy',
      questionNumber: 2,
      clinicalVignette:
        'A 45-year-old woman undergoing modified radical mastectomy has inadvertent injury to a nerve traveling along the lateral thoracic wall in the midaxillary line. Postoperatively, she is unable to perform forward elevation of the arm above 90 degrees, and medial border of the scapula protrudes backwards when pushing against a wall. Which nerve has been damaged?',
      difficulty: 'Easy',
      isHighYield: true,
      options: [
        {
          id: 'A',
          text: 'Thoracodorsal nerve',
          isCorrect: false,
          peerPercentage: 11,
          explanation: 'Thoracodorsal nerve innervates latissimus dorsi; injury impairs arm extension, adduction, and internal rotation.',
        },
        {
          id: 'B',
          text: 'Long thoracic nerve of Bell',
          isCorrect: true,
          peerPercentage: 82,
          explanation: 'Innervates serratus anterior (roots C5, C6, C7). Loss produces classic winged scapula and inability to abduct arm > 90°.',
        },
        {
          id: 'C',
          text: 'Dorsal scapular nerve',
          isCorrect: false,
          peerPercentage: 4,
          explanation: 'Innervates rhomboids and levator scapulae; winging is subtle and scapula moves laterally.',
        },
        {
          id: 'D',
          text: 'Axillary nerve',
          isCorrect: false,
          peerPercentage: 3,
          explanation: 'Axillary nerve innervates deltoid and teres minor; does not cause scapular winging.',
        },
      ],
      explanation: {
        overall:
          'The long thoracic nerve (nerve of Bell, C5-C7) runs vertically on the superficial surface of the serratus anterior muscle, making it particularly vulnerable during axillary lymph node dissection or breast surgeries. Serratus anterior is responsible for protraction and upward rotation of the scapula (allowing hyperabduction > 90°). Injury produces "winged scapula", most prominent on pushing against resistance.',
        goldenPearl:
          'Serratus anterior is supplied by Long Thoracic Nerve (C5-C7: "C5, 6, 7 raise your arms to heaven"). Winged scapula manifests as prominence of the vertebral border and inferior angle.',
        whyOtherOptionsWrong: [
          {
            optionId: 'A',
            reason: 'Thoracodorsal nerve innervates latissimus dorsi (pull-ups / climbing muscle); injury does not cause winging.',
          },
          {
            optionId: 'C',
            reason: 'Dorsal scapular nerve innervates rhomboids, causing mild lateral displacement without true serratus winging.',
          },
          {
            optionId: 'D',
            reason: 'Axillary nerve passes through quadrangular space; injury causes deltoid atrophy and sensory loss over the regimental badge area.',
          },
        ],
        reference: "BD Chaurasia's Human Anatomy, Vol 1: Upper Limb - Axillary Walls and Nerves.",
      },
    },
    {
      id: 'anat-bp-3',
      topicId: 'anat-t-1',
      topicTitle: 'Brachial Plexus & Nerve Injuries',
      subjectName: 'Anatomy',
      questionNumber: 3,
      clinicalVignette:
        'A 32-year-old carpenter presents with weakness in his right hand. Examination reveals marked atrophy of the thenar eminence with preserved sensation over the thenar skin. There is weakness of thumb abduction and opposition. Tinel sign is positive over the carpal tunnel. Why is the cutaneous sensation over the thenar eminence preserved?',
      difficulty: 'Hard',
      isHighYield: true,
      options: [
        {
          id: 'A',
          text: 'Palmar cutaneous branch of median nerve arises proximal to carpal tunnel',
          isCorrect: true,
          peerPercentage: 66,
          explanation: 'The palmar cutaneous branch passes superficial to the flexor retinaculum, sparing sensation over the thenar pad in carpal tunnel syndrome.',
        },
        {
          id: 'B',
          text: 'Radial nerve supplies the thenar skin exclusively',
          isCorrect: false,
          peerPercentage: 8,
          explanation: 'Superficial radial nerve supplies the dorsum of the hand, not the palmar thenar eminence.',
        },
        {
          id: 'C',
          text: 'Recurrent branch of median nerve carries both sensory and motor fibers',
          isCorrect: false,
          peerPercentage: 12,
          explanation: 'Recurrent branch is purely motor to the three thenar muscles.',
        },
        {
          id: 'D',
          text: 'Ulnar nerve cutaneous branches compensate over thenar skin',
          isCorrect: false,
          peerPercentage: 14,
          explanation: 'Ulnar nerve supplies hypothenar eminence and medial 1.5 digits.',
        },
      ],
      explanation: {
        overall:
          'In Carpal Tunnel Syndrome (CTS), the main trunk of the median nerve is compressed beneath the flexor retinaculum. However, the palmar cutaneous branch of the median nerve branches off approximately 5 cm proximal to the wrist crease and courses superficial to the flexor retinaculum. Therefore, sensory loss occurs in the palmar aspect of the lateral 3.5 digits, but sensation over the thenar eminence itself remains intact.',
        goldenPearl:
          'CTS clinical sign: Thenar eminence skin sensation is PRESERVED because the palmar cutaneous branch passes SUPERFICIAL to the flexor retinaculum.',
        reference: "Snell's Clinical Anatomy by Regions, 10th Ed. Wrist & Carpal Tunnel Syndrome.",
      },
    },
    {
      id: 'anat-bp-4',
      topicId: 'anat-t-1',
      topicTitle: 'Brachial Plexus & Nerve Injuries',
      subjectName: 'Anatomy',
      questionNumber: 4,
      clinicalVignette:
        'A 19-year-old male falls asleep with his right arm draped over the backrest of a chair after alcohol consumption. The next morning, he cannot extend his wrist or fingers at the metacarpophalangeal joints. Forearm sensation over the posterior surface is decreased. Triceps reflex is normal. At what anatomical level is the radial nerve compressed?',
      difficulty: 'Moderate',
      isHighYield: true,
      options: [
        {
          id: 'A',
          text: 'Axilla',
          isCorrect: false,
          peerPercentage: 9,
          explanation: 'Axillary compression would paralyze the triceps brachii and abolish the triceps reflex.',
        },
        {
          id: 'B',
          text: 'Spiral groove of humerus',
          isCorrect: true,
          peerPercentage: 81,
          explanation: 'Classic "Saturday night palsy" occurs at the spiral groove; branches to triceps arise before the groove and are spared.',
        },
        {
          id: 'C',
          text: 'Supinator muscle canal (arcade of Frohse)',
          isCorrect: false,
          peerPercentage: 6,
          explanation: 'Arcade of Frohse compresses the posterior interosseous nerve (PIN), which causes wrist drop without sensory loss.',
        },
        {
          id: 'D',
          text: 'Anterior to lateral epicondyle',
          isCorrect: false,
          peerPercentage: 4,
          explanation: 'Distal to spiral groove, would spare posterior cutaneous nerve of forearm.',
        },
      ],
      explanation: {
        overall:
          'Saturday night palsy (spiral groove compression of the radial nerve) causes wrist drop and finger drop due to denervation of the wrist and finger extensors. The triceps brachii muscle is spared because the branches to all three heads of the triceps leave the radial nerve high in the axilla, proximal to the radial/spiral groove.',
        goldenPearl:
          'Radial nerve injury at spiral groove: Wrist drop + Finger drop + Sensation loss on dorsal 1st web space, but TRICEPS IS SPARED (triceps branches arise in axilla).',
        reference: "Clinically Oriented Anatomy (Moore & Dalley), Upper Limb: Radial Nerve Path.",
      },
    },
    {
      id: 'anat-bp-5',
      topicId: 'anat-t-1',
      topicTitle: 'Brachial Plexus & Nerve Injuries',
      subjectName: 'Anatomy',
      questionNumber: 5,
      clinicalVignette:
        'A patient with a fracture of the medial epicondyle of the humerus develops numbness in the little finger and medial half of the ring finger. What intrinsic hand muscle is spared in an ulnar nerve injury at this level?',
      difficulty: 'Hard',
      isHighYield: true,
      options: [
        {
          id: 'A',
          text: 'Adductor pollicis',
          isCorrect: false,
          peerPercentage: 18,
          explanation: 'Adductor pollicis is innervated by the deep branch of the ulnar nerve and will be paralyzed (Froment sign).',
        },
        {
          id: 'B',
          text: 'First dorsal interosseous',
          isCorrect: false,
          peerPercentage: 12,
          explanation: 'All dorsal interossei are innervated by the deep branch of the ulnar nerve.',
        },
        {
          id: 'C',
          text: 'First and second lumbricals',
          isCorrect: true,
          peerPercentage: 62,
          explanation: 'The 1st and 2nd lumbricals are innervated by the median nerve (remember 1 & 2 = Median, 3 & 4 = Ulnar).',
        },
        {
          id: 'D',
          text: 'Palmar interossei',
          isCorrect: false,
          peerPercentage: 8,
          explanation: 'All palmar interossei are supplied by the ulnar nerve.',
        },
      ],
      explanation: {
        overall:
          'The ulnar nerve supplies almost all intrinsic muscles of the hand EXCEPT the thenar muscles (OAF: Opponens pollicis, Abductor pollicis brevis, Flexor pollicis brevis superficial head) and the 1st and 2nd lumbricals, which are supplied by the median nerve.',
        goldenPearl:
          'Hand Lumbricals rule: 1st and 2nd Lumbricals = Median nerve. 3rd and 4th Lumbricals = Ulnar nerve. Interossei (both PAD and DAB) = Ulnar nerve.',
        reference: "BD Chaurasia's Human Anatomy, Hand Intrinsic Muscles and Innervation.",
      },
    },
  ],

  // Axilla & Boundaries
  'anat-t-2': [
    {
      id: 'anat-ax-1',
      topicId: 'anat-t-2',
      topicTitle: 'Axilla & Boundaries',
      subjectName: 'Anatomy',
      questionNumber: 1,
      clinicalVignette:
        'During an incision and drainage of a deep axillary abscess, the surgeon must be mindful of the boundaries of the axilla. Which of the following muscles forms the lower border of the posterior wall of the axilla?',
      difficulty: 'Moderate',
      isHighYield: true,
      options: [
        {
          id: 'A',
          text: 'Pectoralis major and minor',
          isCorrect: false,
          peerPercentage: 10,
          explanation: 'Pectoralis muscles form the anterior wall of the axilla.',
        },
        {
          id: 'B',
          text: 'Teres major and latissimus dorsi',
          isCorrect: true,
          peerPercentage: 79,
          explanation: 'Posterior wall is formed by subscapularis above, and teres major and latissimus dorsi below.',
        },
        {
          id: 'C',
          text: 'Serratus anterior and intercostal muscles',
          isCorrect: false,
          peerPercentage: 7,
          explanation: 'These form the medial wall of the axilla.',
        },
        {
          id: 'D',
          text: 'Coracobrachialis and biceps short head',
          isCorrect: false,
          peerPercentage: 4,
          explanation: 'These form the narrow lateral wall in the bicipital groove.',
        },
      ],
      explanation: {
        overall:
          'The posterior wall of the axilla is formed by the subscapularis muscle in its upper part, and the teres major and latissimus dorsi muscles in its lower part. The posterior axillary fold is formed by the lower border of latissimus dorsi winding around teres major.',
        goldenPearl:
          'Anterior axillary fold = Pectoralis major. Posterior axillary fold = Latissimus dorsi and Teres major. Medial wall = Serratus anterior. Lateral wall = Intertubercular sulcus.',
        reference: "Gray's Anatomy for Students, The Axilla.",
      },
    },
  ],
};

// Generic dynamic question generator for topics without hardcoded questions
export function getQuestionsForTopic(
  topicId: string,
  topicTitle: string,
  subjectName: string,
  count: number = 5
): MCQQuestion[] {
  if (CURATED_TOPIC_MCQS[topicId]) {
    return CURATED_TOPIC_MCQS[topicId];
  }

  const difficulties: QuestionDifficulty[] = ['Easy', 'Moderate', 'Hard', 'Moderate', 'Hard'];
  const questions: MCQQuestion[] = [];

  for (let i = 1; i <= count; i++) {
    const isHY = i % 2 === 1;
    const diff = difficulties[(i - 1) % difficulties.length];

    questions.push({
      id: `${topicId}-q${i}`,
      topicId,
      topicTitle,
      subjectName,
      questionNumber: i,
      clinicalVignette: `A 35-year-old patient presents to the clinic with persistent symptoms related to ${topicTitle}. On targeted clinical examination and initial laboratory workup in ${subjectName}, key diagnostic hallmarks are observed. Which of the following statements represents the most accurate clinical takeaway regarding ${topicTitle}?`,
      difficulty: diff,
      isHighYield: isHY,
      options: [
        {
          id: 'A',
          text: `Primary pathophysiology involves targeted dysfunction specific to ${topicTitle} mechanisms.`,
          isCorrect: true,
          peerPercentage: 72,
          explanation: `Consistent with standard diagnostic guidelines in ${subjectName}.`,
        },
        {
          id: 'B',
          text: `Secondary systemic presentation with counter-regulatory physiological stabilization.`,
          isCorrect: false,
          peerPercentage: 14,
          explanation: 'Secondary presentation does not fit the initial clinical presentation.',
        },
        {
          id: 'C',
          text: `Isolated superficial presentation without involvement of adjacent deep structural bundles.`,
          isCorrect: false,
          peerPercentage: 8,
          explanation: 'Deep structural bundles are classically involved in severe presentations.',
        },
        {
          id: 'D',
          text: `Immediate surgical intervention is contraindicated as first-line conservative management.`,
          isCorrect: false,
          peerPercentage: 6,
          explanation: 'Management depends on grading criteria and clinical hemodynamic stability.',
        },
      ],
      explanation: {
        overall: `In core clinical ${subjectName}, mastery of ${topicTitle} requires understanding the primary anatomical/physiological correlates, clinical presentation, and evidence-based management hierarchy. Early recognition allows optimal prognostic outcomes.`,
        goldenPearl: `High-Yield Pearl for ${topicTitle}: Always rule out emergent red flags before proceeding with non-invasive supportive therapy.`,
        whyOtherOptionsWrong: [
          {
            optionId: 'B',
            reason: 'Counter-regulatory mechanisms occur in chronic states rather than acute presentations.',
          },
          {
            optionId: 'C',
            reason: 'Adjacent neurovascular bundles run in close proximity and must be safeguarded.',
          },
          {
            optionId: 'D',
            reason: 'Guidelines indicate early staged interventions based on risk stratification.',
          },
        ],
        reference: `Standard Reference Manual of ${subjectName}, 8th Edition. High-Yield FMGE/NEET PG Review Series.`,
      },
    });
  }

  return questions;
}
