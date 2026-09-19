export interface FacultyMember {
  name: string;
  title: string;
  institution: string;
  avatar: string;
}

export interface LivePoll {
  question: string;
  options: {
    id: string;
    text: string;
    votesPercent: number;
  }[];
  totalVotes: number;
}

export interface LiveClassSession {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  status: 'live' | 'upcoming' | 'scheduled';
  badgeText: string;
  viewerCount: string;
  attendeesCount: number;
  faculty: FacultyMember;
  timeString: string;
  durationMinutes: number;
  thumbnailUrl: string;
  gradientOverlay: [string, string, string];
  accentColor: string;
  keyTopics: string[];
  poll?: LivePoll;
  stream_url?: string;
}

export const LIVE_CLASSES_DATA: LiveClassSession[] = [
  {
    id: 'live-01',
    title: 'Rapid Recall: Antiarrhythmics & ICU Emergency Pharmacology',
    subject: 'Pharmacology',
    chapter: 'Cardiovascular Therapeutics',
    status: 'live',
    badgeText: 'LIVE NOW',
    viewerCount: '1.4k Attending',
    attendeesCount: 1420,
    faculty: {
      name: 'Dr. Marcus Vance, MD, PhD',
      title: 'Associate Professor of Pharmacology',
      institution: 'DocLock Medical Academy',
      avatar:
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    },
    timeString: 'Started 15m ago · Interactive Q&A',
    durationMinutes: 60,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
    gradientOverlay: [
      'rgba(18, 28, 43, 0.92)',
      'rgba(0, 47, 108, 0.86)',
      'rgba(24, 15, 45, 0.90)',
    ],
    accentColor: '#ef4444',
    keyTopics: [
      'Vaughan-Williams Class I-IV classification highlights',
      'Digoxin toxicity & ECG manifestations',
      'Adenosine dosing protocols in SVT',
      'Amiodarone side-effect monitoring table',
    ],
    poll: {
      question:
        'Which antiarrhythmic is strictly contraindicated in WPW syndrome presenting with Atrial Fibrillation?',
      options: [
        { id: 'p1', text: 'Verapamil & Diltiazem', votesPercent: 62 },
        { id: 'p2', text: 'Procainamide', votesPercent: 12 },
        { id: 'p3', text: 'Ibutilide', votesPercent: 8 },
        { id: 'p4', text: 'Amiodarone', votesPercent: 18 },
      ],
      totalVotes: 984,
    },
  },
  {
    id: 'live-02',
    title: 'Brachial Plexus & Upper Limb Nerve Injuries Demystified',
    subject: 'Anatomy',
    chapter: 'Clinical Surgery & Locomotor',
    status: 'upcoming',
    badgeText: 'STARTS 5:00 PM',
    viewerCount: '890 Registered',
    attendeesCount: 890,
    faculty: {
      name: 'Dr. Sarah Jenkins, MD',
      title: 'Professor of Clinical Anatomy',
      institution: 'DocLock Medical Faculty',
      avatar:
        'https://images.unsplash.com/photo-1594824813629-652391b1a030?w=400&auto=format&fit=crop&q=80',
    },
    timeString: 'Today, 5:00 PM - 6:15 PM',
    durationMinutes: 75,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=80',
    gradientOverlay: [
      'rgba(0, 69, 145, 0.92)',
      'rgba(0, 89, 185, 0.85)',
      'rgba(0, 103, 128, 0.90)',
    ],
    accentColor: '#f59e0b',
    keyTopics: [
      'Erb-Duchenne vs Klumpke palsy motor deficits',
      'Radial nerve injury at spiral groove vs axilla',
      'Carpal tunnel syndrome provocative tests',
      'Scapular winging & Long Thoracic nerve',
    ],
  },
  {
    id: 'live-03',
    title: 'Peripheral Blood Smear & Bone Marrow Spotters Marathon',
    subject: 'Pathology',
    chapter: 'Hematopathology',
    status: 'scheduled',
    badgeText: 'TONIGHT 7:30 PM',
    viewerCount: '1.2k Registered',
    attendeesCount: 1210,
    faculty: {
      name: 'Dr. Elena Rostova, MD, PhD',
      title: 'Chief Hematopathologist',
      institution: 'DocLock Institute',
      avatar:
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    },
    timeString: 'Tonight, 7:30 PM (90 Mins)',
    durationMinutes: 90,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
    gradientOverlay: [
      'rgba(91, 74, 186, 0.92)',
      'rgba(43, 114, 217, 0.85)',
      'rgba(24, 18, 55, 0.92)',
    ],
    accentColor: '#8b5cf6',
    keyTopics: [
      'Auer rods in AML vs PAS-positive ALL lymphoblasts',
      'Reed-Sternberg variants in Hodgkin lymphoma',
      'Rouleaux formation vs RBC agglutination',
      'Target cells, Heinz bodies & Howell-Jolly bodies',
    ],
  },
];

export function getLiveClasses(): LiveClassSession[] {
  return LIVE_CLASSES_DATA;
}

export function getLiveClassById(id: string): LiveClassSession | undefined {
  return LIVE_CLASSES_DATA.find((c) => c.id === id);
}
