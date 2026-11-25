import {
  BIG_FIVE_INFO,
  BIG_FIVE_LABELS,
  BIG_FIVE_TRAITS,
  DARK_TRIAD_TRAITS,
  MBTI_PAIRS,
  SCL_DIMENSIONS,
  isBigFiveTrait,
  isDarkTriadTrait,
  isSclDimension,
  type CharacterMatch,
  type DarkTriadTrait,
  type DarkTriadTraitResult,
  type DevilmanTestResults,
  type HumanityVerdict,
  type ScoreTotal,
  type SclDimension,
  type SclDimensionResult,
} from '../constants/psychometrics';
import type { BigFiveTrait, Character, MbtiPole, Question } from '../types';

const SUSCEPTIBILITY_LOW_LIMIT = 0.35;
const SUSCEPTIBILITY_HIGH_LIMIT = 0.60;
const HIGH_DARK_TRIAD_LIMIT = 0.60;
const DEMON_OUTCOME_LIMIT = 0.60;

export function getOceanLevelCode(average: number) {
  if (average >= 3.5) return 'A';
  if (average >= 2.5) return 'M';
  return 'B';
}

export function calculateTestResults(questions: Question[], answers: Record<string, number>) {
  const bigFiveTotals: Record<BigFiveTrait, { sum: number; count: number }> = {
    O: { sum: 0, count: 0 },
    C: { sum: 0, count: 0 },
    E: { sum: 0, count: 0 },
    A: { sum: 0, count: 0 },
    N: { sum: 0, count: 0 },
  };

  const mbtiPoles: Record<MbtiPole, number> = {
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0,
  };

  questions.forEach((question) => {
    const rawValue = answers[question.id];
    if (typeof rawValue !== 'number') return;

    if (question.system === 'big_five' && question.trait && isBigFiveTrait(question.trait)) {
      const trait = question.trait;
      const score = question.direction === 'inverse' ? 6 - rawValue : rawValue;
      bigFiveTotals[trait].sum += score;
      bigFiveTotals[trait].count += 1;
    }

    if (question.system === 'mbti' && question.pole && mbtiPoles[question.pole] !== undefined) {
      mbtiPoles[question.pole] += rawValue;
    }
  });

  const bigFive = BIG_FIVE_TRAITS.map((trait) => {
    const { sum, count } = bigFiveTotals[trait];
    const average = count > 0 ? Number((sum / count).toFixed(2)) : 0;
    const levelCode = getOceanLevelCode(average);
    return {
      trait,
      label: BIG_FIVE_LABELS[trait],
      sum,
      count,
      average,
      levelCode,
      info: BIG_FIVE_INFO[trait],
    };
  });

  const mbti = MBTI_PAIRS.map((pair) => {
    const scoreA = mbtiPoles[pair.first] ?? 0;
    const scoreB = mbtiPoles[pair.second] ?? 0;
    const total = scoreA + scoreB;

    const percentA = total > 0 ? Math.round((scoreA / total) * 100) : 50;
    const percentB = total > 0 ? 100 - percentA : 50;
    const dominantPole = percentA >= percentB ? pair.first : pair.second;

    return {
      ...pair,
      scoreA,
      scoreB,
      percentA,
      percentB,
      dominantPole,
    };
  });

  const oceanSummary = bigFive.map((item) => item.levelCode).join('');
  const mbtiSummary = mbti.map((dim) => dim.dominantPole).join('');

  return { bigFive, mbti, oceanSummary, mbtiSummary };
}

export function calculateDevilmanTestResults(
  questions: Question[],
  answers: Record<string, number>,
): DevilmanTestResults {
  const dimensionTotals = Object.fromEntries(
    SCL_DIMENSIONS.map((dimension) => [dimension, { sum: 0, count: 0 }]),
  ) as Record<SclDimension, ScoreTotal>;
  const traitTotals = Object.fromEntries(
    DARK_TRIAD_TRAITS.map((trait) => [trait, { sum: 0, count: 0 }]),
  ) as Record<DarkTriadTrait, ScoreTotal>;
  let totalSum = 0;
  let totalAnswered = 0;
  let stp = 0;

  questions.forEach((question) => {
    const value = answers[question.id];
    if (typeof value !== 'number' || value < 0 || value > 4) return;

    if (question.system === 'scl_90_r') {
      totalSum += value;
      totalAnswered += 1;
      if (value > 0) stp += 1;

      if (question.dimension && isSclDimension(question.dimension)) {
        const totals = dimensionTotals[question.dimension];
        totals.sum += value;
        totals.count += 1;
      }
    }

    if (
      question.system === 'dark_triad'
      && question.trait
      && isDarkTriadTrait(question.trait)
    ) {
      const trait = question.trait;
      const adjustedValue = question.direction === 'inverse' ? 4 - value : value;
      traitTotals[trait].sum += adjustedValue;
      traitTotals[trait].count += 1;
    }
  });

  const dimensions = Object.fromEntries(
    SCL_DIMENSIONS.map((dimension) => {
      const { sum, count } = dimensionTotals[dimension];
      const rawScore = count > 0 ? sum / count : 0;
      return [dimension, { sum, count, rawScore, normalized: rawScore / 4 }];
    }),
  ) as Record<SclDimension, SclDimensionResult>;
  const traits = Object.fromEntries(
    DARK_TRIAD_TRAITS.map((trait) => {
      const { sum, count } = traitTotals[trait];
      const average = count > 0 ? sum / count : 0;
      return [trait, { sum, count, average, normalized: average / 4 }];
    }),
  ) as Record<DarkTriadTrait, DarkTriadTraitResult>;
  const igs = totalAnswered > 0 ? totalSum / totalAnswered : 0;

  return {
    scl90: {
      dimensions,
      globalIndices: {
        igs,
        igsNormalized: igs / 4,
        stp,
        psdi: stp > 0 ? totalSum / stp : 0,
      },
    },
    darkTriad: {
      traits,
      profileMatch: {
        psychopathy: traits.psicopatia.normalized,
        narcissism: traits.narcisismo.normalized,
        machiavellianism: traits.maquiavelismo.normalized,
      },
    },
  };
}

export function calculateHumanityVerdict(
  devilmanResults: DevilmanTestResults,
  oceanResults: ReturnType<typeof calculateTestResults>,
): HumanityVerdict {
  const darkTriadIndex = (
    devilmanResults.darkTriad.traits.psicopatia.normalized
    + devilmanResults.darkTriad.traits.narcisismo.normalized
    + devilmanResults.darkTriad.traits.maquiavelismo.normalized
  ) / 3;
  const agreeableness = oceanResults.bigFive.find((result) => result.trait === 'A');
  const neuroticism = oceanResults.bigFive.find((result) => result.trait === 'N');
  if (!agreeableness?.count || !neuroticism?.count) {
    throw new Error('OCEAN_RESULTS_MISSING_AN');
  }

  const humanityAnchor = Math.max(0, Math.min(1, (agreeableness.average - 1) / 4));
  const neuroticismIndex = Math.max(0, Math.min(1, (neuroticism.average - 1) / 4));
  const stressIndex = devilmanResults.scl90.globalIndices.igsNormalized;
  // These narrative weights and cutoffs are for beta feedback, not validated probabilities.
  const infectionIndex = (
    darkTriadIndex * 0.45
    + stressIndex * 0.35
    + neuroticismIndex * 0.20
  );
  const demonIndex = (
    darkTriadIndex * 0.65
    + (1 - humanityAnchor) * 0.20
    + stressIndex * 0.15
  );

  return {
    infectionIndex,
    demonIndex,
    darkTriadIndex,
    stressIndex,
    humanityAnchor,
    neuroticismIndex,
    susceptibilityLevel: infectionIndex < SUSCEPTIBILITY_LOW_LIMIT
      ? 'low'
      : infectionIndex < SUSCEPTIBILITY_HIGH_LIMIT
        ? 'moderate'
        : 'high',
    outcome: darkTriadIndex >= HIGH_DARK_TRIAD_LIMIT || demonIndex >= DEMON_OUTCOME_LIMIT
      ? 'demon'
      : 'devilman',
  };
}

/** Count how many MBTI letters match between two 4-letter codes. */
export function countMbtiLetterMatches(a: string, b: string): number {
  if (a.length !== 4 || b.length !== 4) return 0;
  let matches = 0;
  for (let i = 0; i < 4; i++) {
    if (a[i] === b[i]) matches++;
  }
  return matches;
}

export function findCharacterMatches(
  mbtiSummary: string,
  characters: Character[],
): CharacterMatch[] {
  if (!mbtiSummary || !characters.length) return [];

  return characters
    .filter((c) => c.mbti && c.mbti.length === 4)
    .map((character) => {
      const matchedLetters = countMbtiLetterMatches(mbtiSummary, character.mbti!);
      return {
        character,
        matchedLetters,
        isExact: matchedLetters === 4,
      };
    })
    .sort((a, b) => b.matchedLetters - a.matchedLetters);
}