import type { BigFiveTrait, Character, MbtiPole } from '../types';

export const SCALE_OPTIONS = [
  { value: 1, label: 'Muy en\ndesacuerdo', border: 'border-rose-400', bgActive: 'bg-rose-400', bgIdle: 'bg-rose-400/10' },
  { value: 2, label: 'En\ndesacuerdo', border: 'border-amber-300', bgActive: 'bg-amber-300', bgIdle: 'bg-amber-300/10' },
  { value: 3, label: 'Depende', border: 'border-slate-400', bgActive: 'bg-slate-400', bgIdle: 'bg-slate-400/10' },
  { value: 4, label: 'De\nacuerdo', border: 'border-teal-300', bgActive: 'bg-teal-300', bgIdle: 'bg-teal-300/10' },
  { value: 5, label: 'Muy de\nacuerdo', border: 'border-lime-300', bgActive: 'bg-lime-300', bgIdle: 'bg-lime-300/10' },
];

export const DEVILMAN_SCALE_OPTIONS = [
  { value: 0, label: 'Nada', border: 'border-rose-400', bgActive: 'bg-rose-400', bgIdle: 'bg-rose-400/10' },
  { value: 1, label: 'Muy poco', border: 'border-amber-300', bgActive: 'bg-amber-300', bgIdle: 'bg-amber-300/10' },
  { value: 2, label: 'Poco', border: 'border-slate-400', bgActive: 'bg-slate-400', bgIdle: 'bg-slate-400/10' },
  { value: 3, label: 'Bastante', border: 'border-teal-300', bgActive: 'bg-teal-300', bgIdle: 'bg-teal-300/10' },
  { value: 4, label: 'Mucho', border: 'border-lime-300', bgActive: 'bg-lime-300', bgIdle: 'bg-lime-300/10' },
];

export const QUESTIONS_PER_PAGE = 5;
export const DEVILMAN_TEST_IDS = ['dark_triad', 'scl_90_r'] as const;
export const SCL_DIMENSIONS = ['SOM', 'OBS', 'SI', 'DEP', 'ANS', 'HOS', 'FOB', 'PAR', 'PSIC'] as const;
export const DARK_TRIAD_TRAITS = ['psicopatia', 'narcisismo', 'maquiavelismo'] as const;

export type SclDimension = typeof SCL_DIMENSIONS[number];
export type DarkTriadTrait = typeof DARK_TRIAD_TRAITS[number];

export interface ScoreTotal {
  sum: number;
  count: number;
}

export interface SclDimensionResult extends ScoreTotal {
  rawScore: number;
  normalized: number;
}

export interface DarkTriadTraitResult extends ScoreTotal {
  average: number;
  normalized: number;
}

export interface DevilmanTestResults {
  scl90: {
    dimensions: Record<SclDimension, SclDimensionResult>;
    globalIndices: {
      igs: number;
      igsNormalized: number;
      stp: number;
      psdi: number;
    };
  };
  darkTriad: {
    traits: Record<DarkTriadTrait, DarkTriadTraitResult>;
    profileMatch: {
      psychopathy: number;
      narcissism: number;
      machiavellianism: number;
    };
  };
}

export interface HumanityVerdict {
  infectionIndex: number;
  demonIndex: number;
  darkTriadIndex: number;
  stressIndex: number;
  humanityAnchor: number;
  neuroticismIndex: number;
  susceptibilityLevel: 'low' | 'moderate' | 'high';
  outcome: 'devilman' | 'demon';
}

export interface CharacterMatch {
  character: Character;
  matchedLetters: number;
  isExact: boolean;
}

export const SCL_DIMENSION_LABELS: Record<SclDimension, string> = {
  SOM: 'Somatización',
  OBS: 'Obsesión-compulsión',
  SI: 'Sensibilidad interpersonal',
  DEP: 'Depresión',
  ANS: 'Ansiedad',
  HOS: 'Hostilidad',
  FOB: 'Ansiedad fóbica',
  PAR: 'Ideación paranoide',
  PSIC: 'Psicoticismo',
};

export const DARK_TRIAD_TRAIT_LABELS: Record<DarkTriadTrait, string> = {
  psicopatia: 'Psicopatía',
  narcisismo: 'Narcisismo',
  maquiavelismo: 'Maquiavelismo',
};

export function isSclDimension(dimension: string): dimension is SclDimension {
  return SCL_DIMENSIONS.some((knownDimension) => knownDimension === dimension);
}

export function isDarkTriadTrait(trait: string): trait is DarkTriadTrait {
  return DARK_TRIAD_TRAITS.some((knownTrait) => knownTrait === trait);
}

export const BIG_FIVE_TRAITS: readonly BigFiveTrait[] = ['O', 'C', 'E', 'A', 'N'];
export const BIG_FIVE_LABELS: Record<BigFiveTrait, string> = {
  O: 'Apertura a la experiencia',
  C: 'Responsabilidad',
  E: 'Extraversión',
  A: 'Amabilidad',
  N: 'Neuroticismo',
};

export function isBigFiveTrait(trait: string): trait is BigFiveTrait {
  return BIG_FIVE_TRAITS.some((knownTrait) => knownTrait === trait);
}

export const BIG_FIVE_INFO: Record<BigFiveTrait, { summary: string; highHint: string; lowHint: string }> = {
  O: {
    summary: 'Mide la curiosidad intelectual, la imaginación y el gusto por las ideas nuevas o poco convencionales.',
    highHint: 'Valores altos (cerca de 4–5): mayor gusto por explorar ideas, creatividad o novedades.',
    lowHint: 'Valores bajos (cerca de 1–2): mayor preferencia por lo conocido, práctico o tradicional.',
  },
  C: {
    summary: 'Mide el orden, la constancia, la planificación y el cumplimiento de metas o compromisos.',
    highHint: 'Valores altos (cerca de 4–5): tendencia a organizarte, planificar y sostener rutinas.',
    lowHint: 'Valores bajos (cerca de 1–2): mayor espontaneidad o flexibilidad frente a planes y rutinas.',
  },
  E: {
    summary: 'Mide qué tanto buscas interacción social, energía en grupo y expresividad hacia afuera.',
    highHint: 'Valores altos (cerca de 4–5): mayor facilidad o gusto por socializar e iniciar contacto.',
    lowHint: 'Valores bajos (cerca de 1–2): mayor preferencia por espacios tranquilos o a solas.',
  },
  A: {
    summary: 'Mide la empatía, la cooperación, la confianza y la disposición a cuidar la armonía con otros.',
    highHint: 'Valores altos (cerca de 4–5): mayor tendencia a colaborar, empatizar o evitar roces.',
    lowHint: 'Valores bajos (cerca de 1–2): postura más directa, escéptica o firme en tus criterios.',
  },
  N: {
    summary: 'Mide la sensibilidad emocional y la reactividad ante el estrés, la preocupación o los cambios de ánimo.',
    highHint: 'Valores altos (cerca de 4–5): mayor sensibilidad o preocupación ante situaciones tensas.',
    lowHint: 'Valores bajos (cerca de 1–2): mayor calma o estabilidad emocional frente a la presión.',
  },
};

export interface MbtiPair {
  key: string;
  first: MbtiPole;
  second: MbtiPole;
  firstLabel: string;
  secondLabel: string;
  summary: string;
}

export const MBTI_PAIRS: readonly MbtiPair[] = [
  {
    key: 'EI',
    first: 'E',
    second: 'I',
    firstLabel: 'Extraversión (E)',
    secondLabel: 'Introversión (I)',
    summary: 'Compara cuánto tiendes a recargar energía e interactuar hacia afuera (E) frente a procesar hacia adentro o a solas (I).',
  },
  {
    key: 'SN',
    first: 'S',
    second: 'N',
    firstLabel: 'Sensación (S)',
    secondLabel: 'Intuición (N)',
    summary: 'Compara el enfoque en hechos concretos, detalles y experiencia práctica (S) frente a patrones, hipótesis y posibilidades futuras (N).',
  },
  {
    key: 'TF',
    first: 'T',
    second: 'F',
    firstLabel: 'Pensamiento (T)',
    secondLabel: 'Sentimiento (F)',
    summary: 'Compara priorizar lógica, criterios objetivos y análisis (T) frente a valores personales, empatía e impacto emocional (F).',
  },
  {
    key: 'JP',
    first: 'J',
    second: 'P',
    firstLabel: 'Juicio (J)',
    secondLabel: 'Percepción (P)',
    summary: 'Compara preferir estructura, planes cerrados y orden previo (J) frente a flexibilidad, adaptación y mantener opciones abiertas (P).',
  },
];