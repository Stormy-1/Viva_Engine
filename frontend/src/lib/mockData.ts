export interface Document {
  id: string;
  filename: string;
  status: 'ready' | 'processing';
  totalPages: number;
  cardCount: number;
  dueCount: number;
  accuracy: number | null;
  syllabusMatch: number | null;
  lastReviewed: string | null;
}

export interface Card {
  id: string;
  questionText: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isLeech: boolean;
  sourceRef: string;
  documentId: string;
  rubric: {
    requiredConcepts: string[];
    acceptableVariations: string[];
  };
  nextReviewDate: string;
  intervalDays: number;
}

export interface GradingResult {
  grade: number;
  passed: boolean;
  conceptsMentioned: string[];
  conceptsMissed: string[];
  feedback: string;
}

export interface Stats {
  streak: number;
  totalReviewed: number;
  averageAccuracy: number;
  cardsToday: number;
  cardsMastered: number;
  longestStreak: number;
}

export interface SessionData {
  id: string;
  cards: Card[];
  totalCards: number;
  currentIndex: number;
  mode: 'voice' | 'silent';
}

export const mockDocuments: Document[] = [
  {
    id: 'doc_1',
    filename: 'Fluid_Mechanics_Ch3.pdf',
    status: 'ready',
    totalPages: 24,
    cardCount: 24,
    dueCount: 3,
    accuracy: 82,
    syllabusMatch: 92,
    lastReviewed: '2026-03-18',
  },
  {
    id: 'doc_2',
    filename: 'Thermodynamics_Ch1.pdf',
    status: 'processing',
    totalPages: 31,
    cardCount: 0,
    dueCount: 0,
    accuracy: null,
    syllabusMatch: null,
    lastReviewed: null,
  },
  {
    id: 'doc_3',
    filename: 'Mechanics_of_Materials.pdf',
    status: 'ready',
    totalPages: 42,
    cardCount: 38,
    dueCount: 2,
    accuracy: 91,
    syllabusMatch: 88,
    lastReviewed: '2026-03-17',
  },
];

export const mockCards: Card[] = [
  {
    id: 'card_1',
    questionText: 'Explain why cavitation occurs in centrifugal pumps and how it can be prevented.',
    difficulty: 'medium',
    isLeech: false,
    sourceRef: 'Fluid Mechanics Ch.3 · Pages 127–129',
    documentId: 'doc_1',
    rubric: {
      requiredConcepts: [
        'Vapor pressure below saturation threshold',
        'Formation and collapse of vapor bubbles',
        'NPSH (Net Positive Suction Head)',
        'Impeller damage mechanism',
      ],
      acceptableVariations: ['net positive suction head', 'bubble collapse', 'pump cavitation'],
    },
    nextReviewDate: '2026-03-23',
    intervalDays: 3,
  },
  {
    id: 'card_2',
    questionText: 'Derive the Bernoulli equation from first principles and state its assumptions.',
    difficulty: 'hard',
    isLeech: false,
    sourceRef: 'Fluid Mechanics Ch.3 · Pages 98–102',
    documentId: 'doc_1',
    rubric: {
      requiredConcepts: [
        'Conservation of energy along a streamline',
        'Incompressible flow assumption',
        'Steady-state flow',
        'Inviscid fluid assumption',
      ],
      acceptableVariations: ['energy conservation', 'streamline equation'],
    },
    nextReviewDate: '2026-03-22',
    intervalDays: 2,
  },
  {
    id: 'card_3',
    questionText: 'What is the significance of the Reynolds number in fluid flow classification?',
    difficulty: 'easy',
    isLeech: false,
    sourceRef: 'Fluid Mechanics Ch.3 · Pages 85–87',
    documentId: 'doc_1',
    rubric: {
      requiredConcepts: [
        'Ratio of inertial to viscous forces',
        'Laminar vs turbulent transition',
        'Critical Reynolds number ~2300',
      ],
      acceptableVariations: ['Re number', 'flow regime'],
    },
    nextReviewDate: '2026-03-21',
    intervalDays: 1,
  },
  {
    id: 'card_4',
    questionText: 'Explain the first law of thermodynamics and its application to closed systems.',
    difficulty: 'medium',
    isLeech: true,
    sourceRef: 'Thermodynamics Ch.1 · Pages 15–18',
    documentId: 'doc_2',
    rubric: {
      requiredConcepts: [
        'Energy conservation principle',
        'Internal energy change',
        'Heat and work transfer',
        'Sign convention',
      ],
      acceptableVariations: ['conservation of energy', 'dU = Q - W'],
    },
    nextReviewDate: '2026-03-20',
    intervalDays: 1,
  },
  {
    id: 'card_5',
    questionText: 'Describe the Mohr\'s circle construction and its use in stress analysis.',
    difficulty: 'hard',
    isLeech: false,
    sourceRef: 'Mechanics of Materials · Pages 201–206',
    documentId: 'doc_3',
    rubric: {
      requiredConcepts: [
        'Principal stresses',
        'Maximum shear stress',
        'Graphical stress transformation',
        'Center and radius calculation',
      ],
      acceptableVariations: ['stress circle', 'principal planes'],
    },
    nextReviewDate: '2026-03-24',
    intervalDays: 4,
  },
];

export const mockSession: SessionData = {
  id: 'session_1',
  cards: mockCards,
  totalCards: 5,
  currentIndex: 2,
  mode: 'voice',
};

export const mockStats: Stats = {
  streak: 12,
  totalReviewed: 247,
  averageAccuracy: 78,
  cardsToday: 5,
  cardsMastered: 89,
  longestStreak: 19,
};

export const mockGradingResultPass: GradingResult = {
  grade: 4,
  passed: true,
  conceptsMentioned: ['Vapor pressure below saturation threshold', 'Formation and collapse of vapor bubbles', 'NPSH (Net Positive Suction Head)'],
  conceptsMissed: ['Impeller damage mechanism'],
  feedback: 'Excellent understanding of cavitation mechanics. Consider also mentioning the physical damage to impeller surfaces.',
};

export const mockGradingResultFail: GradingResult = {
  grade: 2,
  passed: false,
  conceptsMentioned: ['Vapor pressure below saturation threshold'],
  conceptsMissed: ['Formation and collapse of vapor bubbles', 'NPSH (Net Positive Suction Head)', 'Impeller damage mechanism'],
  feedback: 'Good start on vapor pressure, but you missed the specific role of NPSH — see page 127 for the margin calculation.',
};

export const mockHeatmapData = Array.from({ length: 84 }, (_, i) => ({
  date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
  count: Math.random() > 0.3 ? Math.floor(Math.random() * 6) : 0,
}));

export const mockAccuracyData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  accuracy: Math.round(60 + Math.random() * 30 + i * 0.5),
}));
