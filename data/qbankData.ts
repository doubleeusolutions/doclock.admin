import { MaterialIcons } from '@expo/vector-icons';

export type SubjectCategory =
  | 'pre-clinical'
  | 'para-clinical'
  | 'clinical'
  | 'high-yield'
  | 'short-subjects';

export interface QbankSubject {
  id: string;
  name: string;
  chaptersCount: number;
  mcqCount: number;
  iconName: keyof typeof MaterialIcons.glyphMap;
  iconBgColor: string;
  iconColor: string;
  categories: SubjectCategory[];
}

export interface FilterChipItem {
  id: 'all' | SubjectCategory;
  label: string;
}

export const FILTER_CHIPS: FilterChipItem[] = [
  { id: 'all', label: 'All (19)' },
  { id: 'pre-clinical', label: 'Pre-Clinical' },
  { id: 'para-clinical', label: 'Para-Clinical' },
  { id: 'clinical', label: 'Clinical' },
  { id: 'high-yield', label: 'High-Yield' },
  { id: 'short-subjects', label: 'Short Subjects' },
];

export const QBANK_SUBJECTS: QbankSubject[] = [
  {
    id: 'anatomy',
    name: 'Anatomy',
    chaptersCount: 18,
    mcqCount: 420,
    iconName: 'accessibility-new',
    iconBgColor: '#d7e2ff',
    iconColor: '#0059b9',
    categories: ['pre-clinical'],
  },
  {
    id: 'physiology',
    name: 'Physiology',
    chaptersCount: 22,
    mcqCount: 380,
    iconName: 'monitor-heart',
    iconBgColor: '#b9eaff',
    iconColor: '#006780',
    categories: ['pre-clinical'],
  },
  {
    id: 'biochemistry',
    name: 'Biochemistry',
    chaptersCount: 16,
    mcqCount: 310,
    iconName: 'biotech',
    iconBgColor: '#e5deff',
    iconColor: '#5b4aba',
    categories: ['pre-clinical'],
  },
  {
    id: 'pathology',
    name: 'Pathology',
    chaptersCount: 32,
    mcqCount: 650,
    iconName: 'coronavirus',
    iconBgColor: '#ffdad6',
    iconColor: '#ba1a1a',
    categories: ['para-clinical', 'high-yield'],
  },
  {
    id: 'pharmacology',
    name: 'Pharmacology',
    chaptersCount: 26,
    mcqCount: 540,
    iconName: 'medication',
    iconBgColor: '#b9eaff',
    iconColor: '#006780',
    categories: ['para-clinical', 'high-yield'],
  },
  {
    id: 'microbiology',
    name: 'Microbiology',
    chaptersCount: 20,
    mcqCount: 460,
    iconName: 'science',
    iconBgColor: '#e5deff',
    iconColor: '#5b4aba',
    categories: ['para-clinical'],
  },
  {
    id: 'forensic',
    name: 'Forensic Medicine & Toxicology',
    chaptersCount: 14,
    mcqCount: 280,
    iconName: 'gavel',
    iconBgColor: '#dfe8fe',
    iconColor: '#424753',
    categories: ['para-clinical', 'short-subjects'],
  },
  {
    id: 'psm',
    name: 'Community Medicine (PSM)',
    chaptersCount: 24,
    mcqCount: 520,
    iconName: 'groups',
    iconBgColor: '#d7e2ff',
    iconColor: '#0059b9',
    categories: ['para-clinical', 'high-yield'],
  },
  {
    id: 'medicine',
    name: 'General Medicine',
    chaptersCount: 36,
    mcqCount: 890,
    iconName: 'medical-services',
    iconBgColor: '#e7eeff',
    iconColor: '#0059b9',
    categories: ['clinical', 'high-yield'],
  },
  {
    id: 'surgery',
    name: 'General Surgery',
    chaptersCount: 30,
    mcqCount: 740,
    iconName: 'health-and-safety',
    iconBgColor: '#b9eaff',
    iconColor: '#006780',
    categories: ['clinical', 'high-yield'],
  },
  {
    id: 'obgyn',
    name: 'Obstetrics & Gynaecology',
    chaptersCount: 28,
    mcqCount: 680,
    iconName: 'pregnant-woman',
    iconBgColor: '#e5deff',
    iconColor: '#5b4aba',
    categories: ['clinical', 'high-yield'],
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    chaptersCount: 22,
    mcqCount: 490,
    iconName: 'child-care',
    iconBgColor: '#d7e2ff',
    iconColor: '#0059b9',
    categories: ['clinical', 'high-yield'],
  },
  {
    id: 'ophthalmology',
    name: 'Ophthalmology',
    chaptersCount: 16,
    mcqCount: 340,
    iconName: 'visibility',
    iconBgColor: '#b9eaff',
    iconColor: '#006780',
    categories: ['clinical', 'short-subjects'],
  },
  {
    id: 'ent',
    name: 'ENT (Otorhinolaryngology)',
    chaptersCount: 15,
    mcqCount: 310,
    iconName: 'hearing',
    iconBgColor: '#dfe8fe',
    iconColor: '#424753',
    categories: ['clinical', 'short-subjects'],
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    chaptersCount: 14,
    mcqCount: 290,
    iconName: 'airline-seat-flat',
    iconBgColor: '#e5deff',
    iconColor: '#5b4aba',
    categories: ['clinical', 'short-subjects'],
  },
  {
    id: 'dermatology',
    name: 'Dermatology & Venereology',
    chaptersCount: 12,
    mcqCount: 260,
    iconName: 'spa',
    iconBgColor: '#d7e2ff',
    iconColor: '#0059b9',
    categories: ['clinical', 'short-subjects'],
  },
  {
    id: 'psychiatry',
    name: 'Psychiatry',
    chaptersCount: 10,
    mcqCount: 210,
    iconName: 'psychology',
    iconBgColor: '#b9eaff',
    iconColor: '#006780',
    categories: ['clinical', 'short-subjects'],
  },
  {
    id: 'radiology',
    name: 'Radiology',
    chaptersCount: 12,
    mcqCount: 250,
    iconName: 'scanner',
    iconBgColor: '#dfe8fe',
    iconColor: '#424753',
    categories: ['clinical', 'short-subjects'],
  },
  {
    id: 'anesthesia',
    name: 'Anesthesia',
    chaptersCount: 9,
    mcqCount: 190,
    iconName: 'vaccines',
    iconBgColor: '#e5deff',
    iconColor: '#5b4aba',
    categories: ['clinical', 'short-subjects'],
  },
];
