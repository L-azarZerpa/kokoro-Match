export interface Game {
  id: string;
  title: string;
  imageUrl?: string;
  isFeatured?: boolean;
  testIds?: string[];
  [key: string]: unknown;
}

export type AuthMode = 'login' | 'register';

export interface AccountActionsProps {
  isAuthenticated?: boolean;
  isSigningOut?: boolean;
  onRegister?: () => void;
  onSignIn?: () => void;
  onSignOut?: () => void;
  userEmail?: string | null;
}

export interface Question {
  id: string;
  order?: number;
  text?: string;
  system?: 'big_five' | 'mbti' | 'dark_triad' | string;
  trait?: BigFiveTrait | string;
  dimension?: string;
  pole?: MbtiPole;
  direction?: 'inverse' | 'direct' | string;
}

export interface TestItem {
  id: string;
  title: string;
  subtitle?: string;
  scaleType?: string;
  isActive?: boolean;
  pairGroup?: string;
  [key: string]: unknown;
}

export type BigFiveTrait = 'O' | 'C' | 'E' | 'A' | 'N';
export type MbtiPole = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

export interface HomeScreenProps {
  games?: Game[];
  featuredGames?: Game[];
  isLoading?: boolean;
  error?: string | null;
  authActionError?: string | null;
  isAuthenticated?: boolean;
  isSigningOut?: boolean;
  onSelectGame?: (game: Game) => void;
  onRegister?: () => void;
  onSignIn?: () => void;
  onSignOut?: () => void;
  userEmail?: string | null;
}

export interface GameDetailScreenProps extends AccountActionsProps {
  authActionError?: string | null;
  game: Game;
  onBack?: () => void;
}

export interface Feedback {
  type: 'success' | 'error';
  text: string;
}

export interface CharacterProfile {
  ocean?: {
    extraversion?: number;
    neuroticism?: number;
    agreeableness?: number;
    conscientiousness?: number;
    openness?: number;
  } | null;
  darkTriad?: {
    machiavellianism?: number;
    narcissism?: number;
    psychopathy?: number;
  };
  scl90?: {
    globalSeverity?: number;
  };
}

export interface Character {
  id: string;
  name: string;
  mbti?: string;
  enneagram?: string;
  archetype?: string;
  fear?: string;
  desire?: string;
  about?: string | null;
  imageUrl?: string;
  profile?: CharacterProfile;
}
