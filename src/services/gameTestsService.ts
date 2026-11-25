import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  DEVILMAN_TEST_IDS,
  type DevilmanTestResults,
  type HumanityVerdict,
} from '../constants/psychometrics';
import type { Character, Question } from '../types';

export interface LoadedGameSession {
  questions: Question[];
  characters: Character[];
}

export interface SaveTestAttemptParams {
  uid: string;
  gameId: string;
  gameTitle?: string;
  questions: Question[];
  answers: Record<string, number>;
  devilmanResults: DevilmanTestResults | null;
  humanityVerdict: HumanityVerdict | null;
  oceanResults: ReturnType<typeof import('../utils/scoring').calculateTestResults> | null;
}

export async function loadGameSession(gameId: string): Promise<LoadedGameSession> {
  const gameDoc = await getDoc(doc(db, 'games', gameId));
  const gameData = gameDoc.data();
  const testIds = Array.isArray(gameData?.testIds)
    ? gameData.testIds.filter((testId): testId is string => typeof testId === 'string')
    : [];

  if (!testIds.length) {
    throw new Error('NO_TESTS_ASSIGNED');
  }

  const targetTestId = testIds.includes('mbti_ocean') ? 'mbti_ocean' : testIds[0];
  const snapshot = await getDocs(collection(db, 'tests', targetTestId, 'questions'));
  const questions = snapshot.docs
    .map((questionDocument) => ({
      ...questionDocument.data(),
      id: questionDocument.id,
    } as Question))
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

  const charsSnapshot = await getDocs(collection(db, 'games', gameId, 'characters'));
  const characters = charsSnapshot.empty
    ? []
    : charsSnapshot.docs.map((charDoc) => ({
        ...charDoc.data(),
        id: charDoc.id,
      } as Character));

  return { questions, characters };
}

export async function loadDevilmanTestQuestions(): Promise<Question[]> {
  const questionSets = await Promise.all(
    DEVILMAN_TEST_IDS.map(async (testId) => ({
      testId,
      snapshot: await getDocs(collection(db, 'tests', testId, 'questions')),
    })),
  );

  const missingTestIds = questionSets
    .filter(({ snapshot }) => snapshot.empty)
    .map(({ testId }) => testId);

  if (missingTestIds.length) {
    throw new Error(`MISSING_TESTS:${missingTestIds.join(', ')}`);
  }

  return questionSets.flatMap(({ testId, snapshot }) =>
    snapshot.docs
      .map((questionDocument) => ({
        ...questionDocument.data(),
        id: `${testId}_${questionDocument.id}`,
      } as Question))
      .sort((left, right) => (left.order ?? 0) - (right.order ?? 0)),
  );
}

export async function saveTestAttempt({
  uid,
  gameId,
  gameTitle,
  questions,
  answers,
  devilmanResults,
  humanityVerdict,
  oceanResults,
}: SaveTestAttemptParams): Promise<void> {
  if (devilmanResults) {
    if (!humanityVerdict) {
      throw new Error('HUMANITY_VERDICT_MISSING');
    }

    const detailedResponses = questions.map((question) => ({
      questionId: question.id,
      testId: question.system ?? '',
      order: question.order ?? null,
      text: question.text ?? '',
      trait: question.trait ?? null,
      dimension: question.dimension ?? null,
      direction: question.direction ?? null,
      answer: answers[question.id] ?? null,
    }));

    await setDoc(doc(db, 'users', uid, 'test_attempts', 'devilman_humanity'), {
      testId: 'devilman_humanity',
      gameId,
      gameTitle: gameTitle || 'Prueba de humanidad',
      scl90: devilmanResults.scl90,
      darkTriad: devilmanResults.darkTriad,
      humanityVerdict,
      detailedResponses,
      updatedAt: serverTimestamp(),
    });

    await setDoc(
      doc(db, 'users', uid),
      {
        latestResult: {
          gameId,
          devilmanTest: {
            testId: 'devilman_humanity',
            outcome: humanityVerdict.outcome,
            infectionIndex: humanityVerdict.infectionIndex,
            demonIndex: humanityVerdict.demonIndex,
            humanityAnchor: humanityVerdict.humanityAnchor,
            susceptibilityLevel: humanityVerdict.susceptibilityLevel,
            scl90: {
              igs: devilmanResults.scl90.globalIndices.igs,
              igsNormalized: devilmanResults.scl90.globalIndices.igsNormalized,
              stp: devilmanResults.scl90.globalIndices.stp,
              psdi: devilmanResults.scl90.globalIndices.psdi,
            },
            darkTriad: devilmanResults.darkTriad.profileMatch,
            updatedAt: serverTimestamp(),
          },
        },
      },
      { merge: true },
    );
    return;
  }

  if (!oceanResults) return;

  const detailedResponses = questions.map((q) => ({
    questionId: q.id,
    order: q.order ?? null,
    text: q.text ?? '',
    system: q.system ?? '',
    trait: q.trait ?? null,
    pole: q.pole ?? null,
    direction: q.direction ?? null,
    answer: answers[q.id] ?? null,
  }));

  await setDoc(doc(db, 'users', uid, 'test_attempts', 'mbti_ocean'), {
    testId: 'mbti_ocean',
    gameId,
    gameTitle: gameTitle || 'Test Psicológico',
    oceanSummary: oceanResults.oceanSummary,
    mbtiSummary: oceanResults.mbtiSummary,
    bigFive: oceanResults.bigFive,
    mbti: oceanResults.mbti,
    detailedResponses,
    updatedAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, 'users', uid),
    {
      latestResult: {
        gameId,
        oceanSummary: oceanResults.oceanSummary,
        mbtiSummary: oceanResults.mbtiSummary,
        updatedAt: serverTimestamp(),
      },
    },
    { merge: true },
  );
}