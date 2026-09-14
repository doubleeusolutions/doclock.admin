import { MaterialIcons } from '@expo/vector-icons';
import { LiveClassSession, LIVE_CLASSES_DATA } from './liveClassesData';

export type CarouselActivityType =
  | 'live'
  | 'resume_video'
  | 'resume_test'
  | 'resume_qbank';

export interface CarouselActivityItem {
  id: string;
  type: CarouselActivityType;
  title: string;
  subject: string;
  category: string;
  badgeText: string;
  badgeType: 'live' | 'video' | 'test' | 'qbank';
  metaText: string;
  progressPercent?: number; // 0 - 100 for resume cards
  actionLabel: string;
  actionIcon: keyof typeof MaterialIcons.glyphMap;
  thumbnailUrl: string;
  gradientOverlay: [string, string, string];
  accentColor: string;
  targetRoute?: string;
  faculty?: {
    name: string;
    title: string;
    avatar: string;
  };
  liveSessionData?: LiveClassSession;
}

export const HOME_CAROUSEL_ACTIVITIES: CarouselActivityItem[] = [
  // 1. Live Class (Active Streaming)
  {
    id: 'activity-live-01',
    type: 'live',
    title: 'Rapid Recall: Antiarrhythmics & ICU Emergency Pharmacology',
    subject: 'Pharmacology',
    category: 'Cardiovascular Therapeutics',
    badgeText: 'LIVE NOW',
    badgeType: 'live',
    metaText: 'Started 15m ago • 1.4k Attending',
    actionLabel: 'Join Stream',
    actionIcon: 'play-arrow',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
    gradientOverlay: [
      'rgba(18, 28, 43, 0.92)',
      'rgba(0, 47, 108, 0.86)',
      'rgba(24, 15, 45, 0.92)',
    ],
    accentColor: '#ef4444',
    faculty: {
      name: 'Dr. Marcus Vance, MD, PhD',
      title: 'Associate Professor of Pharmacology',
      avatar:
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    },
    liveSessionData: LIVE_CLASSES_DATA[0],
  },

  // 2. Resume Video
  {
    id: 'activity-video-01',
    type: 'resume_video',
    title: 'Brachial Plexus: Roots, Trunks & Clinical Neuropathies',
    subject: 'Anatomy',
    category: 'Upper Limb Anatomy',
    badgeText: 'RESUME LECTURE',
    badgeType: 'video',
    metaText: '18:40 / 45:10 • 42% Watched',
    progressPercent: 42,
    actionLabel: 'Resume Video',
    actionIcon: 'play-circle-outline',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=80',
    gradientOverlay: [
      'rgba(0, 47, 108, 0.92)',
      'rgba(0, 89, 185, 0.85)',
      'rgba(0, 103, 128, 0.90)',
    ],
    accentColor: '#68d7fd',
    targetRoute: '/videos/class/anat-cls-01',
    faculty: {
      name: 'Dr. Sarah Jenkins, MD',
      title: 'Professor of Clinical Anatomy',
      avatar:
        'https://images.unsplash.com/photo-1594824813629-652391b1a030?w=400&auto=format&fit=crop&q=80',
    },
  },

  // 3. Resume Test
  {
    id: 'activity-test-01',
    type: 'resume_test',
    title: 'All-India FMGE Grand Mock Exam #04',
    subject: 'Full Mock Exam',
    category: 'High-Yield Clinical Vignettes',
    badgeText: 'TEST IN PROGRESS',
    badgeType: 'test',
    metaText: '28/50 Solved • 14 mins remaining',
    progressPercent: 56,
    actionLabel: 'Resume Test',
    actionIcon: 'timer',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
    gradientOverlay: [
      'rgba(186, 26, 26, 0.88)',
      'rgba(112, 12, 12, 0.92)',
      'rgba(26, 10, 10, 0.94)',
    ],
    accentColor: '#f87171',
    targetRoute: '/tests',
  },

  // 4. Resume QBank
  {
    id: 'activity-qbank-01',
    type: 'resume_qbank',
    title: 'Autonomic Pharmacology & Adrenergic Receptor Antagonists',
    subject: 'Pharmacology Qbank',
    category: 'General Principles',
    badgeText: 'RESUME DRILL',
    badgeType: 'qbank',
    metaText: '8/15 MCQs Solved • 85% Accuracy',
    progressPercent: 53,
    actionLabel: 'Resume Drill',
    actionIcon: 'quiz',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
    gradientOverlay: [
      'rgba(0, 89, 185, 0.92)',
      'rgba(43, 114, 217, 0.86)',
      'rgba(91, 74, 186, 0.90)',
    ],
    accentColor: '#60a5fa',
    targetRoute: '/qbank/pharmacology',
  },
];
