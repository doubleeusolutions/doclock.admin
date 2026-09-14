import { MaterialIcons } from '@expo/vector-icons';

export type TestCategory =
  | 'grand-tests'
  | 'subject-tests'
  | 'mini-mocks'
  | 'pyqs';

export interface TestFilterTab {
  id: 'all' | TestCategory;
  label: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
}

export interface AssessmentItem {
  id: string;
  title: string;
  category: TestCategory;
  tag: string;
  tagBgColor: string;
  tagTextColor: string;
  testsCount: number;
  mcqsCount: number;
  durationHours: number;
  iconName: keyof typeof MaterialIcons.glyphMap;
  iconBgColor: string;
  iconColor: string;
}

export const TEST_FILTER_TABS: TestFilterTab[] = [
  { id: 'all', label: 'All Tests (42)', iconName: 'all-inclusive' },
  { id: 'grand-tests', label: 'Grand Tests (GT)', iconName: 'stars' },
  { id: 'subject-tests', label: 'Subject Tests', iconName: 'menu-book' },
  { id: 'mini-mocks', label: 'Mini Mocks', iconName: 'bolt' },
  { id: 'pyqs', label: 'Previous Years (PYQs)', iconName: 'history-edu' },
];

export const ASSESSMENTS: AssessmentItem[] = [
  {
    id: 'anatomy-mock',
    title: 'Anatomy High-Yield Test',
    category: 'subject-tests',
    tag: 'High Yield',
    tagBgColor: '#e5deff',
    tagTextColor: '#5b4aba',
    testsCount: 6,
    mcqsCount: 300,
    durationHours: 3,
    iconName: 'accessibility-new',
    iconBgColor: '#d7e2ff',
    iconColor: '#004591',
  },
  {
    id: 'pathology-mock',
    title: 'Pathology Clinical Vignettes',
    category: 'subject-tests',
    tag: 'Completed 82%',
    tagBgColor: '#d9e3f8',
    tagTextColor: '#006780',
    testsCount: 8,
    mcqsCount: 400,
    durationHours: 4,
    iconName: 'biotech',
    iconBgColor: '#b9eaff',
    iconColor: '#004d61',
  },
  {
    id: 'pharm-mock',
    title: 'Pharmacology Drug Regimens',
    category: 'subject-tests',
    tag: 'In Progress',
    tagBgColor: '#d7e2ff',
    tagTextColor: '#004591',
    testsCount: 10,
    mcqsCount: 500,
    durationHours: 5,
    iconName: 'medication',
    iconBgColor: '#acc7ff',
    iconColor: '#0059b9',
  },
  {
    id: 'surgery-mock',
    title: 'General Surgery & Trauma',
    category: 'subject-tests',
    tag: 'Available',
    tagBgColor: '#e7eeff',
    tagTextColor: '#424753',
    testsCount: 12,
    mcqsCount: 600,
    durationHours: 6,
    iconName: 'health-and-safety',
    iconBgColor: '#e5deff',
    iconColor: '#4532a4',
  },
  {
    id: 'obgyn-mock',
    title: 'Obstetrics & Gynaecology Mocks',
    category: 'subject-tests',
    tag: 'High Yield',
    tagBgColor: '#e5deff',
    tagTextColor: '#5b4aba',
    testsCount: 8,
    mcqsCount: 400,
    durationHours: 4,
    iconName: 'pregnant-woman',
    iconBgColor: '#65d4fa',
    iconColor: '#001f29',
  },
  {
    id: 'pediatrics-mock',
    title: 'Pediatrics Milestone & Neonatal',
    category: 'subject-tests',
    tag: 'Available',
    tagBgColor: '#e7eeff',
    tagTextColor: '#424753',
    testsCount: 4,
    mcqsCount: 200,
    durationHours: 2,
    iconName: 'child-care',
    iconBgColor: '#d9e3f8',
    iconColor: '#0059b9',
  },
  {
    id: 'micro-mock',
    title: 'Microbiology Culture & Serology',
    category: 'subject-tests',
    tag: 'Available',
    tagBgColor: '#e7eeff',
    tagTextColor: '#424753',
    testsCount: 5,
    mcqsCount: 250,
    durationHours: 2.5,
    iconName: 'coronavirus',
    iconBgColor: '#d7e2ff',
    iconColor: '#0059b9',
  },
  {
    id: 'gt-13',
    title: 'All-India Grand Mock: FMGE GT-13',
    category: 'grand-tests',
    tag: 'Ranked',
    tagBgColor: '#d1fae5',
    tagTextColor: '#065f46',
    testsCount: 1,
    mcqsCount: 300,
    durationHours: 5,
    iconName: 'stars',
    iconBgColor: '#d7e2ff',
    iconColor: '#0059b9',
  },
  {
    id: 'gt-12',
    title: 'All-India Grand Mock: FMGE GT-12',
    category: 'grand-tests',
    tag: 'Ranked',
    tagBgColor: '#d1fae5',
    tagTextColor: '#065f46',
    testsCount: 1,
    mcqsCount: 300,
    durationHours: 5,
    iconName: 'stars',
    iconBgColor: '#dfe8fe',
    iconColor: '#004591',
  },
  {
    id: 'mini-cardio',
    title: 'Rapid Cardio Emergency Drill',
    category: 'mini-mocks',
    tag: 'High Yield',
    tagBgColor: '#e5deff',
    tagTextColor: '#5b4aba',
    testsCount: 3,
    mcqsCount: 75,
    durationHours: 1,
    iconName: 'bolt',
    iconBgColor: '#ffdad6',
    iconColor: '#ba1a1a',
  },
  {
    id: 'pyq-2023',
    title: 'FMGE December 2023 Recall Paper',
    category: 'pyqs',
    tag: 'Real Exam',
    tagBgColor: '#dfe8fe',
    tagTextColor: '#0059b9',
    testsCount: 1,
    mcqsCount: 300,
    durationHours: 5,
    iconName: 'history-edu',
    iconBgColor: '#b9eaff',
    iconColor: '#006780',
  },
];
