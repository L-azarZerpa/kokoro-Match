import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import type { CharacterMatch } from '../constants/psychometrics';
import type { calculateTestResults } from '../utils/scoring';
import type { Feedback } from '../types';

type OceanMbtiResults = ReturnType<typeof calculateTestResults>;

interface MbtiOceanResultsViewProps {
  results: OceanMbtiResults;
  characterMatches: CharacterMatch[];
  answeredCount: number;
  totalQuestions: number;
  isSavingResult: boolean;
  saveFeedback: Feedback | null;
  isAuthenticated: boolean;
  onSaveResults: () => void;
  onStartDevilmanTest: () => void;
}

export default function MbtiOceanResultsView({
  results,
  characterMatches,
  answeredCount,
  totalQuestions,
  isSavingResult,
  saveFeedback,
  isAuthenticated,
  onSaveResults,
  onStartDevilmanTest,
}: MbtiOceanResultsViewProps) {
  const [selectedInfoKey, setSelectedInfoKey] = useState<string | null>(null);

  const toggleInfo = (key: string) => {
    setSelectedInfoKey((prev) => (prev === key ? null : key));
  };

  const best = characterMatches[0];
  const runners = best
    ? characterMatches.filter((m) => m !== best && m.matchedLetters >= 3)
    : [];

  return (
    <View className="mt-2 w-full rounded-3xl border border-violet-400/40 bg-[#17181f] p-6">
      <Text className="text-center text-lg font-black text-lime-300">
        Resultados del test 🚀
      </Text>
      <Text className="mt-1 text-center text-xs text-[#b0b1c2]">
        Respuestas registradas: {answeredCount} de {totalQuestions} · Toca cualquier resultado para ver su explicación
      </Text>

      <View className="mt-5 rounded-2xl border border-[#2d2e3d] bg-[#111218] p-4">
        <Text className="text-sm font-black text-lime-300">
          OCEAN = {results.oceanSummary}
        </Text>
        <Text className="mt-1 text-sm font-black text-violet-300">
          MBTI (tendencia relativa) = {results.mbtiSummary}
        </Text>
      </View>

      {best && (
        <View className="mt-6">
          <Text className="mb-3 text-sm font-extrabold text-white">
            Tu personaje más afín 🎭
          </Text>

          <View className="rounded-2xl border border-violet-400/40 bg-[#111218] p-4">
            <View className="flex-row items-center">
              {best.character.imageUrl ? (
                <Image
                  accessibilityLabel={`Imagen de ${best.character.name}`}
                  className="mr-4 rounded-xl"
                  resizeMode="cover"
                  source={{ uri: best.character.imageUrl }}
                  style={{ height: 72, width: 72 }}
                />
              ) : (
                <View className="mr-4 h-[72px] w-[72px] items-center justify-center rounded-xl bg-violet-500/20">
                  <Text className="text-2xl">🎭</Text>
                </View>
              )}
              <View className="flex-1">
                <Text className="text-base font-black text-white">
                  {best.character.name}
                </Text>
                <View className="mt-1 flex-row items-center">
                  <View className="rounded-full bg-violet-500/25 px-2.5 py-0.5">
                    <Text className="text-xs font-extrabold text-violet-300">
                      {best.character.mbti}
                    </Text>
                  </View>
                  {best.isExact ? (
                    <Text className="ml-2 text-xs font-bold text-lime-300">
                      ¡Match exacto! ✦
                    </Text>
                  ) : (
                    <Text className="ml-2 text-xs font-semibold text-[#9ea0b3]">
                      {best.matchedLetters}/4 letras
                    </Text>
                  )}
                </View>
                {best.character.archetype ? (
                  <Text className="mt-1 text-xs text-[#9ea0b3]" numberOfLines={1}>
                    {best.character.archetype}
                  </Text>
                ) : null}
              </View>
            </View>

            {best.character.about ? (
              <Text className="mt-3 text-xs leading-4 text-[#d7d7e2]" numberOfLines={3}>
                {best.character.about}
              </Text>
            ) : null}

            {(best.character.fear || best.character.desire) && (
              <View className="mt-3 flex-row">
                {best.character.desire ? (
                  <View className="mr-3 flex-1 rounded-xl bg-lime-300/10 p-2.5">
                    <Text className="text-[10px] font-bold text-lime-300">DESEA</Text>
                    <Text className="mt-0.5 text-xs text-[#d7d7e2]" numberOfLines={2}>
                      {best.character.desire}
                    </Text>
                  </View>
                ) : null}
                {best.character.fear ? (
                  <View className="flex-1 rounded-xl bg-rose-400/10 p-2.5">
                    <Text className="text-[10px] font-bold text-rose-400">TEME</Text>
                    <Text className="mt-0.5 text-xs text-[#d7d7e2]" numberOfLines={2}>
                      {best.character.fear}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>

          {runners.length > 0 && (
            <View className="mt-3">
              <Text className="mb-2 text-xs font-semibold text-[#9ea0b3]">
                También te pareces a:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2"
              >
                {runners.map((m) => (
                  <View
                    key={m.character.id}
                    className="w-28 items-center rounded-xl border border-[#262730] bg-[#111218] p-3"
                  >
                    {m.character.imageUrl ? (
                      <Image
                        accessibilityLabel={`Imagen de ${m.character.name}`}
                        className="rounded-lg"
                        resizeMode="cover"
                        source={{ uri: m.character.imageUrl }}
                        style={{ height: 48, width: 48 }}
                      />
                    ) : (
                      <View className="h-12 w-12 items-center justify-center rounded-lg bg-violet-500/15">
                        <Text className="text-lg">🎭</Text>
                      </View>
                    )}
                    <Text className="mt-2 text-center text-xs font-bold text-white" numberOfLines={1}>
                      {m.character.name}
                    </Text>
                    <Text className="mt-0.5 text-[10px] font-semibold text-violet-300">
                      {m.character.mbti} · {m.matchedLetters}/4
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      <View className="mt-6">
        <Text className="mb-3 text-sm font-extrabold text-white">
          Big Five
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
                    {item.info.highHint}
                  </Text>
                  <Text className="mt-1 text-xs leading-4 text-[#9ea0b3]">
                    {item.info.lowHint}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <View className="mt-6">
        <Text className="mb-3 text-sm font-extrabold text-white">
          Preferencias MBTI
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
                <View className="h-full bg-violet-400" style={{ width: `${dim.percentA}%` }} />
                <View className="h-full bg-teal-300" style={{ width: `${dim.percentB}%` }} />
              </View>
              {isExpanded && (
                <Text className="mt-3 border-t border-[#262730] pt-3 text-xs leading-4 text-[#d7d7e2]">
                  {dim.summary}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      <View className="mt-6 rounded-2xl border border-violet-400/30 bg-[#111218] p-4">
        <Text className="text-base font-black text-white">
          ¿Crees que podrás conservar tu humanidad?
        </Text>
        <Text className="mt-2 text-xs leading-5 text-[#b0b1c2]">
          Cuando despierte tu instinto demoníaco, ¿seguirás siendo tú?
        </Text>

        <Pressable
          onPress={onStartDevilmanTest}
          accessibilityRole="button"
          accessibilityLabel="Volver a las preguntas"
          className="mt-4 items-center rounded-full bg-violet-400 px-4 py-3"
        >
          <Text className="text-sm font-black text-[#11120f]">
            Hacer otro test
          </Text>
        </Pressable>
      </View>

      <View className="mt-6 border-t border-[#262730] pt-5">
        <Pressable
          disabled={isSavingResult || saveFeedback?.type === 'success'}
          onPress={onSaveResults}
          accessibilityRole="button"
          className={`items-center rounded-full py-3.5 ${
            saveFeedback?.type === 'success' ? 'bg-[#262730]' : 'bg-lime-300'
          }`}
        >
          <Text
            className={`text-sm font-black ${
              saveFeedback?.type === 'success' ? 'text-lime-300' : 'text-[#11120f]'
            }`}
          >
            {isSavingResult
              ? 'Guardando...'
              : saveFeedback?.type === 'success'
                ? '✓ Guardado en tu perfil'
                : isAuthenticated
                  ? 'Guardar resultados en mi perfil'
                  : 'Inicia sesión para guardar resultados'}
          </Text>
        </Pressable>
        {saveFeedback && (
          <Text
            className={`mt-3 text-center text-xs font-semibold ${
              saveFeedback.type === 'success' ? 'text-lime-300' : 'text-rose-400'
            }`}
          >
            {saveFeedback.text}
          </Text>
        )}
      </View>
    </View>
  );
}