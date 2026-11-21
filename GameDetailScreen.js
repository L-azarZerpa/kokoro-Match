import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const SCALE_OPTIONS = [
  { value: 1, label: 'Muy en\ndesacuerdo', border: 'border-rose-400', bgActive: 'bg-rose-400', bgIdle: 'bg-rose-400/10' },
  { value: 2, label: 'En\ndesacuerdo', border: 'border-amber-300', bgActive: 'bg-amber-300', bgIdle: 'bg-amber-300/10' },
  { value: 3, label: 'Depende', border: 'border-slate-400', bgActive: 'bg-slate-400', bgIdle: 'bg-slate-400/10' },
  { value: 4, label: 'De\nacuerdo', border: 'border-teal-300', bgActive: 'bg-teal-300', bgIdle: 'bg-teal-300/10' },
  { value: 5, label: 'Muy de\nacuerdo', border: 'border-lime-300', bgActive: 'bg-lime-300', bgIdle: 'bg-lime-300/10' },
];

const QUESTIONS_PER_PAGE = 5;

const BIG_FIVE_TRAITS = ['O', 'C', 'E', 'A', 'N'];
const BIG_FIVE_LABELS = {
  O: 'Apertura a la experiencia',
  C: 'Responsabilidad',
  E: 'Extraversión',
  A: 'Amabilidad',
  N: 'Neuroticismo',
};

const BIG_FIVE_INFO = {
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

const MBTI_PAIRS = [
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

function getOceanLevelCode(average) {
  if (average >= 3.5) return 'A'; // Alto
  if (average >= 2.5) return 'M'; // Medio
  return 'B'; // Bajo
}

function calculateTestResults(questions, answers) {
  const bigFiveTotals = {
    O: { sum: 0, count: 0 },
    C: { sum: 0, count: 0 },
    E: { sum: 0, count: 0 },
    A: { sum: 0, count: 0 },
    N: { sum: 0, count: 0 },
  };

  const mbtiPoles = {
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

    if (question.system === 'big_five' && bigFiveTotals[question.trait]) {
      const score = question.direction === 'inverse' ? 6 - rawValue : rawValue;
      bigFiveTotals[question.trait].sum += score;
      bigFiveTotals[question.trait].count += 1;
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

export default function GameDetailScreen({ game, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedInfoKey, setSelectedInfoKey] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadQuestions() {
      setQuestions([]);
      setAnswers({});
      setCurrentPage(0);
      setIsSubmitted(false);
      setSelectedInfoKey(null);
      setIsLoadingQuestions(true);
      setQuestionsError(null);

      if (!game?.id) {
        setQuestionsError('No se pudo identificar el juego.');
        setIsLoadingQuestions(false);
        return;
      }

      try {
        const snapshot = await getDocs(collection(db, 'games', game.id, 'questions'));
        const loadedQuestions = snapshot.docs
          .map((questionDocument) => ({
            ...questionDocument.data(),
            id: questionDocument.id,
          }))
          .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

        if (isMounted) {
          setQuestions(loadedQuestions);
        }
      } catch (loadError) {
        console.error('No se pudieron cargar las preguntas del juego.', loadError);
        if (isMounted) {
          setQuestionsError('No se pudieron cargar las preguntas. Intenta de nuevo más tarde.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingQuestions(false);
        }
      }
    }

    loadQuestions();

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

  const isCurrentPageComplete = currentQuestions.length > 0
    && currentQuestions.every((question) => answers[question.id] !== undefined);

  const results = useMemo(() => {
    if (!isSubmitted) return null;
    return calculateTestResults(questions, answers);
  }, [isSubmitted, questions, answers]);

  const toggleInfo = (key) => {
    setSelectedInfoKey((prev) => (prev === key ? null : key));
  };

  const handleSelectOption = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleQuickFillAndSubmit = () => {
    if (!questions.length) return;
    const generatedAnswers = {};
    questions.forEach((question) => {
      generatedAnswers[question.id] = Math.floor(Math.random() * 5) + 1;
    });
    setAnswers(generatedAnswers);
    setCurrentPage(Math.max(0, totalPages - 1));
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    } else {
      setIsSubmitted(true);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <View className="flex-1 bg-[#0c0d13]">
      <StatusBar style="light" />

      <View className="z-10 h-16 flex-row items-center justify-between border-b border-[#262730] bg-[#17181f] px-4">
        <Pressable
          onPress={onBack}
          accessibilityLabel="Volver al inicio"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full bg-[#22232d]"
        >
          <Text className="text-xl font-bold text-white">←</Text>
        </Pressable>

        <View className="items-center">
          <Text className="text-base font-black text-white" numberOfLines={1}>
            {game?.title || 'Test Psicológico'}
          </Text>
          <Text className="text-xs font-semibold text-violet-400">
            {isLoadingQuestions
              ? 'Cargando preguntas...'
              : totalQuestions
                ? `Tanda ${currentPage + 1} de ${totalPages}`
                : 'Sin preguntas'}
          </Text>
        </View>

        <View className="w-10" />
      </View>

      <View className="h-1.5 w-full bg-[#20212a]">
        <View
          className="h-full bg-lime-300"
          style={{ width: `${progressPercent}%` }}
        />
      </View>

      <ScrollView
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
                Elige qué tan bien te describe cada afirmación.
              </Text>

              <View className="mb-8 flex-row justify-between px-2 sm:px-8">
                {SCALE_OPTIONS.map((opt) => (
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
                      {SCALE_OPTIONS.map((opt) => {
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

              {isSubmitted && results && (
                <View className="mt-8 w-full rounded-3xl border border-violet-400/40 bg-[#17181f] p-6">
                  <Text className="text-center text-lg font-black text-lime-300">
                    Resultados del test 🚀
                  </Text>
                  <Text className="mt-1 text-center text-xs text-[#b0b1c2]">
                    Respuestas registradas: {answeredCount} de {totalQuestions} · Toca cualquier resultado para ver su explicación
                  </Text>

                  {/* Resumen compacto OCEAN y MBTI */}
                  <View className="mt-5 rounded-2xl border border-[#2d2e3d] bg-[#111218] p-4">
                    <Text className="text-sm font-black text-lime-300">
                      OCEAN = {results.oceanSummary}
                    </Text>
                    <Text className="mt-1 text-sm font-black text-violet-300">
                      MBTI (tendencia relativa) = {results.mbtiSummary}
                    </Text>
                    <Text className="mt-2 text-[11px] leading-4 text-[#9ea0b3]">
                      OCEAN resume O·C·E·A·N con B (bajo &lt;2.5), M (medio 2.5–3.49) y A (alto ≥3.5) de forma provisional. MBTI muestra la letra con mayor porcentaje relativo por eje (no es una etiqueta rígida).
                    </Text>
                  </View>

                  {/* Big Five */}
                  <View className="mt-6">
                    <Text className="mb-1 text-sm font-extrabold text-white">
                      Big Five (puntuación provisional)
                    </Text>
                    <Text className="mb-3 text-xs text-[#9ea0b3]">
                      Sin baremos poblacionales: se reporta media (escala 1–5) y suma total.
                    </Text>

                    {results.bigFive.map((item) => {
                      const infoKey = `bf-${item.trait}`;
                      const isExpanded = selectedInfoKey === infoKey;

                      return (
                        <Pressable
                          key={item.trait}
                          onPress={() => toggleInfo(infoKey)}
                          accessibilityRole="button"
                          className="mb-2 rounded-2xl border border-[#262730] bg-[#111218] px-4 py-3"
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-1 pr-3">
                              <Text className="text-sm font-bold text-white">
                                {item.label} ({item.trait}) · {item.levelCode} {isExpanded ? '▴' : '▾'}
                              </Text>
                              <Text className="text-xs text-[#9ea0b3]">
                                Suma: {item.sum} · Ítems: {item.count}
                              </Text>
                            </View>
                            <Text className="text-base font-black text-lime-300">
                              {item.average}
                            </Text>
                          </View>

                          {isExpanded && item.info && (
                            <View className="mt-3 border-t border-[#262730] pt-3">
                              <Text className="text-xs leading-4 text-[#d7d7e2]">
                                {item.info.summary}
                              </Text>
                              <Text className="mt-2 text-xs leading-4 text-[#9ea0b3]">
                                • {item.info.highHint}
                              </Text>
                              <Text className="mt-1 text-xs leading-4 text-[#9ea0b3]">
                                • {item.info.lowHint}
                              </Text>
                              <Text className="mt-2 text-[11px] leading-4 text-violet-300">
                                ¿Qué significan los números? &ldquo;Suma&rdquo; es el total acumulado en esos {item.count} ítems (tras invertir los ítems inversos) y el número grande ({item.average}) es la media provisional en escala 1–5 ({item.sum} ÷ {item.count}), resumida como &ldquo;{item.levelCode}&rdquo;.
                              </Text>
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* MBTI continuo */}
                  <View className="mt-6">
                    <Text className="mb-1 text-sm font-extrabold text-white">
                      Preferencias relativas MBTI (puntuación continua)
                    </Text>
                    <Text className="mb-3 text-xs text-[#9ea0b3]">
                      Porcentaje relativo entre polos (rango por polo: 5–25). No es una etiqueta rígida.
                    </Text>

                    {results.mbti.map((dim) => {
                      const infoKey = `mbti-${dim.key}`;
                      const isExpanded = selectedInfoKey === infoKey;

                      return (
                        <Pressable
                          key={dim.key}
                          onPress={() => toggleInfo(infoKey)}
                          accessibilityRole="button"
                          className="mb-3 rounded-2xl border border-[#262730] bg-[#111218] p-4"
                        >
                          <View className="mb-1 flex-row items-center justify-between">
                            <Text className="text-xs font-bold text-violet-300">
                              {dim.firstLabel}: {dim.percentA}% ({dim.scoreA})
                            </Text>
                            <Text className="text-xs font-bold text-teal-300">
                              {dim.secondLabel}: {dim.percentB}% ({dim.scoreB}) {isExpanded ? '▴' : '▾'}
                            </Text>
                          </View>
                          <View className="mt-2 h-2.5 w-full flex-row overflow-hidden rounded-full bg-[#262730]">
                            <View
                              className="h-full bg-violet-400"
                              style={{ width: `${dim.percentA}%` }}
                            />
                            <View
                              className="h-full bg-teal-300"
                              style={{ width: `${dim.percentB}%` }}
                            />
                          </View>

                          {isExpanded && (
                            <View className="mt-3 border-t border-[#262730] pt-3">
                              <Text className="text-xs leading-4 text-[#d7d7e2]">
                                {dim.summary}
                              </Text>
                              <Text className="mt-2 text-[11px] leading-4 text-violet-300">
                                ¿Qué significan los números? Cada polo suma 5 ítems sin inversión (rango 5–25): aquí {dim.first} sumó {dim.scoreA} y {dim.second} sumó {dim.scoreB}. El porcentaje muestra su peso relativo ({dim.scoreA} ÷ {dim.scoreA + dim.scoreB} = {dim.percentA}%), no una etiqueta cerrada.
                              </Text>
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}