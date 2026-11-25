import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState, type ElementRef } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { auth } from '../services/firebase';
import {
  loadDevilmanTestQuestions,
  loadGameSession,
  saveTestAttempt,
} from '../services/gameTestsService';
import AccountActions from '../components/AccountActions';
import DevilmanResultsView from '../components/DevilmanResultsView';
import MbtiOceanResultsView from '../components/MbtiOceanResultsView';
import {
  DEVILMAN_SCALE_OPTIONS,
  QUESTIONS_PER_PAGE,
  SCALE_OPTIONS,
} from '../constants/psychometrics';
import {
  calculateHumanityVerdict,
  calculateDevilmanTestResults,
  calculateTestResults,
  findCharacterMatches,
} from '../utils/scoring';
import type {
  Character,
  Feedback,
  GameDetailScreenProps,
  Question,
} from '../types';

export default function GameDetailScreen({
  authActionError = null,
  game,
  isAuthenticated = false,
  isSigningOut = false,
  onBack,
  onRegister,
  onSignIn,
  onSignOut,
  userEmail,
}: GameDetailScreenProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDevilmanTest, setIsDevilmanTest] = useState(false);
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<Feedback | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [oceanBaseline, setOceanBaseline] = useState<ReturnType<typeof calculateTestResults> | null>(null);
  const scrollViewRef = useRef<ElementRef<typeof ScrollView>>(null);

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      setQuestions([]);
      setAnswers({});
      setCurrentPage(0);
      setIsSubmitted(false);
      setIsDevilmanTest(false);
      setSaveFeedback(null);
      setCharacters([]);
      setOceanBaseline(null);
      setIsLoadingQuestions(true);
      setQuestionsError(null);

      if (!game?.id) {
        setQuestionsError('No se pudo identificar el juego.');
        setIsLoadingQuestions(false);
        return;
      }

      try {
        const { questions: loadedQuestions, characters: loadedCharacters } =
          await loadGameSession(game.id);

        if (isMounted) {
          setQuestions(loadedQuestions);
          if (loadedCharacters.length) {
            setCharacters(loadedCharacters);
          }
        }
      } catch (loadError) {
        if (loadError instanceof Error && loadError.message === 'NO_TESTS_ASSIGNED') {
          if (isMounted) setQuestionsError('Este juego no tiene tests asignados.');
        } else {
          console.error('No se pudieron cargar las preguntas del juego.', loadError);
          if (isMounted) {
            setQuestionsError('No se pudieron cargar las preguntas. Intenta de nuevo más tarde.');
          }
        }
      } finally {
        if (isMounted) setIsLoadingQuestions(false);
      }
    }

    initSession();
    return () => {
      isMounted = false;
    };
  }, [game?.id]);

  const totalQuestions = questions.length;
  const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalQuestions ? (answeredCount / totalQuestions) * 100 : 0;

  const startIndex = currentPage * QUESTIONS_PER_PAGE;
  const currentQuestions = questions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);
  const activeScaleOptions = isDevilmanTest ? DEVILMAN_SCALE_OPTIONS : SCALE_OPTIONS;

  const isCurrentPageComplete = currentQuestions.length > 0
    && currentQuestions.every((question) => answers[question.id] !== undefined);

  const results = useMemo(() => {
    if (!isSubmitted || isDevilmanTest) return null;
    return calculateTestResults(questions, answers);
  }, [isSubmitted, isDevilmanTest, questions, answers]);

  const devilmanResults = useMemo(() => {
    if (!isSubmitted || !isDevilmanTest) return null;
    return calculateDevilmanTestResults(questions, answers);
  }, [isSubmitted, isDevilmanTest, questions, answers]);

  const humanityVerdict = useMemo(() => {
    if (!devilmanResults || !oceanBaseline) return null;
    return calculateHumanityVerdict(devilmanResults, oceanBaseline);
  }, [devilmanResults, oceanBaseline]);

  const characterMatches = useMemo(() => {
    if (!results) return [];
    return findCharacterMatches(results.mbtiSummary, characters);
  }, [results, characters]);

  const scrollToTop = () => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
  };

  const handleSelectOption = (questionId: string, value: number) => {
    setSaveFeedback(null);
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const showResults = () => {
    setIsSubmitted(true);
    scrollToTop();
  };

  const handleQuickFillAndSubmit = () => {
    if (!questions.length) return;
    setSaveFeedback(null);
    const generatedAnswers: Record<string, number> = {};
    const minimumValue = isDevilmanTest ? 0 : 1;
    questions.forEach((question) => {
      generatedAnswers[question.id] = Math.floor(Math.random() * 5) + minimumValue;
    });
    setAnswers(generatedAnswers);
    setCurrentPage(Math.max(0, totalPages - 1));
    showResults();
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    } else {
      showResults();
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  const handleSaveResults = async () => {
    if (isDevilmanTest ? !devilmanResults || !humanityVerdict : !results) return;

    const currentUser = auth.currentUser;
    if (!currentUser || !isAuthenticated) {
      if (onSignIn) {
        onSignIn();
      } else {
        setSaveFeedback({
          type: 'error',
          text: 'Debes iniciar sesión primero para guardar tus resultados.',
        });
      }
      return;
    }

    setIsSavingResult(true);
    setSaveFeedback(null);

    try {
      await saveTestAttempt({
        uid: currentUser.uid,
        gameId: game.id,
        gameTitle: game.title,
        questions,
        answers,
        devilmanResults: isDevilmanTest ? devilmanResults : null,
        humanityVerdict: isDevilmanTest ? humanityVerdict : null,
        oceanResults: !isDevilmanTest ? results : null,
      });
      setSaveFeedback({
        type: 'success',
        text: '¡Resultados y respuestas guardados en tu perfil!',
      });
    } catch (error) {
      console.error('Error al guardar resultados en Firestore:', error);
      setSaveFeedback({
        type: 'error',
        text: 'No se pudieron guardar los resultados. Intenta de nuevo.',
      });
    } finally {
      setIsSavingResult(false);
    }
  };

  const handleStartDevilmanTest = async () => {
    if (!results) {
      setQuestionsError('No se pudo conservar el resultado OCEAN. Vuelve a completar el primer test.');
      return;
    }
    const hasHumanityAnchor = results.bigFive.some(
      (trait) => trait.trait === 'A' && trait.count > 0,
    );
    const hasStressReference = results.bigFive.some(
      (trait) => trait.trait === 'N' && trait.count > 0,
    );
    if (!hasHumanityAnchor || !hasStressReference) {
      setQuestionsError('Faltan rasgos OCEAN necesarios para calcular el veredicto.');
      return;
    }

    setOceanBaseline(results);
    setIsLoadingQuestions(true);
    setQuestionsError(null);
    setQuestions([]);
    setAnswers({});
    setIsSubmitted(false);
    setIsDevilmanTest(true);
    setCurrentPage(0);
    setSaveFeedback(null);

    try {
      const combinedQuestions = await loadDevilmanTestQuestions();
      setQuestions(combinedQuestions);
      scrollToTop();
    } catch (loadError) {
      if (loadError instanceof Error && loadError.message.startsWith('MISSING_TESTS:')) {
        const missing = loadError.message.replace('MISSING_TESTS:', '');
        setQuestionsError(`No encontramos preguntas para: ${missing}.`);
      } else {
        console.error('No se pudieron cargar las preguntas de Devilman/demonio.', loadError);
        setQuestionsError('No se pudieron cargar las preguntas. Intenta de nuevo más tarde.');
      }
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleReviewDevilmanTest = () => {
    setIsSubmitted(false);
    setCurrentPage(0);
    scrollToTop();
  };

  return (
    <View className="flex-1 bg-[#0c0d13]">
      <StatusBar style="light" />

      <View className="z-10 border-b border-[#262730] bg-[#17181f] px-3 py-2">
        <View className="h-10 flex-row items-center">
          <Pressable
            onPress={onBack}
            accessibilityLabel="Volver al inicio"
            accessibilityRole="button"
            className="h-10 w-9 items-center justify-center rounded-full bg-[#22232d]"
          >
            <Text className="text-xl font-bold text-white">←</Text>
          </Pressable>

          <View className="ml-2 flex-row items-center">
            <Image
              accessibilityLabel="Icono de Kokoro Match"
              className="mr-1"
              resizeMode="contain"
              source={require('../../assets/icon.png')}
              style={{ height: 16, width: 16 }}
            />
            <View>
              <Text className="text-xs font-black leading-3 text-white">kokoro</Text>
              <Text className="text-xs font-black leading-3 text-white">Match</Text>
            </View>
          </View>

          <View className="ml-auto">
            <AccountActions
              isAuthenticated={isAuthenticated}
              isSigningOut={isSigningOut}
              onRegister={onRegister}
              onSignIn={onSignIn}
              onSignOut={onSignOut}
              userEmail={userEmail}
            />
          </View>
        </View>

        <View className="mt-1 items-center">
          <Text className="text-base font-black text-white" numberOfLines={1}>
            {isDevilmanTest ? 'Prueba de humanidad' : game?.title || 'Test Psicológico'}
          </Text>
          <Text className="text-xs font-semibold text-violet-400">
            {isLoadingQuestions
              ? 'Cargando preguntas...'
              : isSubmitted
                ? 'Resultados obtenidos'
                : totalQuestions
                  ? `Tanda ${currentPage + 1} de ${totalPages}`
                  : 'Sin preguntas'}
          </Text>
        </View>
      </View>

      {authActionError ? (
        <Text accessibilityRole="alert" className="bg-[#17181f] px-3 py-2 text-center text-xs font-semibold text-rose-400">
          {authActionError}
        </Text>
      ) : null}

      {!isSubmitted && (
        <View className="h-1.5 w-full bg-[#20212a]">
          <View className="h-full bg-lime-300" style={{ width: `${progressPercent}%` }} />
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerClassName="items-center px-4 py-8 pb-16"
      >
        <View className="w-full max-w-[680px]">
          {isLoadingQuestions ? (
            <Text className="py-8 text-center text-sm font-semibold text-[#b0b1c2]">
              Cargando preguntas...
            </Text>
          ) : questionsError ? (
            <Text className="py-8 text-center text-sm font-semibold text-[#ff9b9b]">
              {questionsError}
            </Text>
          ) : totalQuestions === 0 ? (
            <Text className="py-8 text-center text-sm font-semibold text-[#b0b1c2]">
              Este juego todavía no tiene preguntas.
            </Text>
          ) : (
            <>
              {!isSubmitted && (
                <>
                  <Pressable
                    onPress={handleQuickFillAndSubmit}
                    accessibilityRole="button"
                    className="mb-6 self-center rounded-full border border-violet-400/50 bg-violet-500/15 px-4 py-2"
                  >
                    <Text className="text-xs font-extrabold text-violet-300">
                      ⚡ Autollenar y ver resultados (Prueba)
                    </Text>
                  </Pressable>

                  <Text className="mb-6 text-center text-2xl font-black text-white md:text-3xl">
                    {isDevilmanTest
                      ? '¿Crees que podrás conservar tu humanidad?'
                      : 'Elige qué tan bien te describe cada afirmación.'}
                  </Text>
                  {isDevilmanTest ? (
                    <Text className="mb-6 text-center text-sm text-[#b0b1c2]">
                      Cuando despierte tu instinto demoníaco, ¿seguirás siendo tú?
                    </Text>
                  ) : null}

                  <View className="mb-8 flex-row justify-between px-2 sm:px-8">
                    {activeScaleOptions.map((opt) => (
                      <View key={opt.value} className="w-16 items-center">
                        <View
                          className={`mb-2 h-10 w-10 rounded-full border-2 ${opt.border} ${opt.bgIdle}`}
                        />
                        <Text className="text-center text-[11px] font-semibold leading-3 text-[#b0b1c2]">
                          {opt.label}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {currentQuestions.map((question) => {
                    const selectedValue = answers[question.id];

                    return (
                      <View
                        key={question.id}
                        className="mb-5 rounded-3xl border border-[#262730] bg-[#17181f] p-6"
                      >
                        <Text className="mb-6 text-center text-base font-bold text-white md:text-lg">
                          {question.text}
                        </Text>

                        <View className="flex-row items-center justify-between px-1 sm:px-6">
                          {activeScaleOptions.map((opt) => {
                            const isSelected = selectedValue === opt.value;

                            return (
                              <Pressable
                                key={opt.value}
                                onPress={() => handleSelectOption(question.id, opt.value)}
                                accessibilityRole="radio"
                                accessibilityState={{ selected: isSelected }}
                                accessibilityLabel={opt.label.replace('\n', ' ')}
                                className={`h-11 w-11 items-center justify-center rounded-full border-2 transition-all ${
                                  opt.border
                                } ${isSelected ? opt.bgActive : opt.bgIdle}`}
                              >
                                {isSelected && (
                                  <View className="h-3.5 w-3.5 rounded-full bg-[#0c0d13]" />
                                )}
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}

                  <View className="mt-6 flex-row items-center justify-between">
                    {currentPage > 0 ? (
                      <Pressable
                        onPress={handlePrev}
                        className="rounded-full border border-[#37384f] bg-[#17181f] px-6 py-3.5"
                      >
                        <Text className="text-sm font-extrabold text-white">← Anterior</Text>
                      </Pressable>
                    ) : (
                      <View />
                    )}

                    <Pressable
                      disabled={!isCurrentPageComplete}
                      onPress={handleNext}
                      className={`rounded-full px-8 py-3.5 ${
                        isCurrentPageComplete ? 'bg-lime-300' : 'bg-[#262730]'
                      }`}
                    >
                      <Text
                        className={`text-sm font-extrabold ${
                          isCurrentPageComplete ? 'text-[#11120f]' : 'text-[#7a7b8c]'
                        }`}
                      >
                        {currentPage === totalPages - 1 ? 'Ver resultados' : 'Siguiente →'}
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}

              {isSubmitted && isDevilmanTest && devilmanResults && humanityVerdict && (
                <DevilmanResultsView
                  devilmanResults={devilmanResults}
                  humanityVerdict={humanityVerdict}
                  answeredCount={answeredCount}
                  totalQuestions={totalQuestions}
                  isSavingResult={isSavingResult}
                  saveFeedback={saveFeedback}
                  isAuthenticated={isAuthenticated}
                  onSaveResults={handleSaveResults}
                  onReviewTest={handleReviewDevilmanTest}
                />
              )}

              {isSubmitted && results && (
                <MbtiOceanResultsView
                  results={results}
                  characterMatches={characterMatches}
                  answeredCount={answeredCount}
                  totalQuestions={totalQuestions}
                  isSavingResult={isSavingResult}
                  saveFeedback={saveFeedback}
                  isAuthenticated={isAuthenticated}
                  onSaveResults={handleSaveResults}
                  onStartDevilmanTest={handleStartDevilmanTest}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}