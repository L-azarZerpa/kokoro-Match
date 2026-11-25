import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  DARK_TRIAD_TRAITS,
  DARK_TRIAD_TRAIT_DESCRIPTIONS,
  DARK_TRIAD_TRAIT_LABELS,
  SCL_DIMENSIONS,
  SCL_DIMENSION_DESCRIPTIONS,
  SCL_DIMENSION_LABELS,
  type DevilmanTestResults,
  type HumanityVerdict,
} from '../constants/psychometrics';
import type { Feedback } from '../types';

interface DevilmanResultsViewProps {
  devilmanResults: DevilmanTestResults;
  humanityVerdict: HumanityVerdict;
  answeredCount: number;
  totalQuestions: number;
  isSavingResult: boolean;
  saveFeedback: Feedback | null;
  isAuthenticated: boolean;
  onSaveResults: () => void;
  onReviewTest: () => void;
}

export default function DevilmanResultsView({
  devilmanResults,
  humanityVerdict,
  answeredCount,
  totalQuestions,
  isSavingResult,
  saveFeedback,
  isAuthenticated,
  onSaveResults,
  onReviewTest,
}: DevilmanResultsViewProps) {
  const [selectedInfoKey, setSelectedInfoKey] = useState<string | null>(null);
  const susceptibilityLabels = {
    low: 'Baja',
    moderate: 'Moderada',
    high: 'Alta',
  } as const;

  const toggleInfo = (key: string) => {
    setSelectedInfoKey((previous) => (previous === key ? null : key));
  };

  return (
    <View className="mt-2 w-full rounded-3xl border border-violet-400/40 bg-[#17181f] p-6">
      <Text className="text-center text-lg font-black text-lime-300">
        Veredicto de la historia
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-[#b0b1c2]">
        No es un diagnóstico: es una interpretación ficticia de cómo podrías reaccionar en el universo Devilman.
      </Text>
      <Text className="mt-3 text-center text-xs text-[#9ea0b3]">
        Respuestas registradas: {answeredCount} de {totalQuestions}
      </Text>

      <View className="mt-6 rounded-2xl border border-violet-400/40 bg-[#111218] p-4">
        <Text className="text-center text-xs font-bold uppercase tracking-wide text-violet-300">
          Si te expusieras a un demonio y fueras poseído...
        </Text>
        <Text className="mt-2 text-center text-2xl font-black text-lime-300">
          {humanityVerdict.outcome === 'demon' ? 'Demonio' : 'Devilman'}
        </Text>
        <Text className="mt-2 text-center text-xs leading-5 text-[#b0b1c2]">
          {humanityVerdict.outcome === 'demon'
            ? 'Tus respuestas se inclinan hacia que el impulso demoníaco domine.'
            : 'Tus respuestas se inclinan hacia conservar un ancla humana.'}
        </Text>

        <View className="mt-4 border-t border-[#262730] pt-3">
          <Text className="text-xs leading-5 text-[#d7d7e2]">
            Susceptibilidad narrativa ante una exposición: {Math.round(humanityVerdict.infectionIndex * 100)}% · {susceptibilityLabels[humanityVerdict.susceptibilityLevel]}
          </Text>
          <Text className="mt-1 text-xs leading-5 text-[#d7d7e2]">
            Tendencia a perder la humanidad si hubiera posesión: {Math.round(humanityVerdict.demonIndex * 100)}%
          </Text>
          <Text className="mt-1 text-xs leading-5 text-[#d7d7e2]">
            Ancla humana (Amabilidad OCEAN): {Math.round(humanityVerdict.humanityAnchor * 100)}%
          </Text>
          <Text className="mt-2 text-[10px] leading-4 text-[#9ea0b3]">
            Estos porcentajes son índices narrativos del juego, no probabilidades reales.
          </Text>
        </View>
      </View>

      <View className="mt-6">
        <Text className="mb-3 text-sm font-extrabold text-white">SCL-90-R · Dimensiones</Text>
        {SCL_DIMENSIONS.map((dimension) => {
          const score = devilmanResults.scl90.dimensions[dimension];
          const infoKey = `scl-${dimension}`;
          const isExpanded = selectedInfoKey === infoKey;

          return (
            <View
              key={dimension}
              className="mb-2 rounded-xl border border-[#262730] bg-[#111218] px-4 py-3"
            >
              <Pressable
                onPress={() => toggleInfo(infoKey)}
                accessibilityRole="button"
                accessibilityState={{ expanded: isExpanded }}
                className="flex-row items-center justify-between"
              >
                <View className="flex-1 pr-3">
                  <Text className="text-xs font-bold text-white">
                    {SCL_DIMENSION_LABELS[dimension]} ({dimension}) {isExpanded ? '▴' : '▾'}
                  </Text>
                  <Text className="mt-1 text-[11px] text-[#9ea0b3]">
                    Suma: {score.sum} · Ítems: {score.count} · Normalizado: {score.normalized.toFixed(2)}
                  </Text>
                </View>
                <Text className="text-sm font-black text-lime-300">
                  {score.rawScore.toFixed(2)} / 4
                </Text>
              </Pressable>
              {isExpanded ? (
                <Text className="mt-3 border-t border-[#262730] pt-3 text-xs leading-4 text-[#d7d7e2]">
                  {SCL_DIMENSION_DESCRIPTIONS[dimension]}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>

      <View className="mt-5 rounded-2xl border border-[#262730] bg-[#111218] p-4">
        <Text className="mb-2 text-sm font-extrabold text-white">Índices globales SCL-90-R</Text>
        <Text className="text-xs leading-5 text-[#d7d7e2]">
          IGS: {devilmanResults.scl90.globalIndices.igs.toFixed(2)} · Normalizado: {devilmanResults.scl90.globalIndices.igsNormalized.toFixed(2)}
        </Text>
        <Text className="text-xs leading-5 text-[#d7d7e2]">
          STP: {devilmanResults.scl90.globalIndices.stp} · PSDI: {devilmanResults.scl90.globalIndices.psdi.toFixed(2)}
        </Text>
      </View>

      <View className="mt-6">
        <Text className="mb-3 text-sm font-extrabold text-white">Tríada Oscura · Rasgos</Text>
        {DARK_TRIAD_TRAITS.map((trait) => {
          const score = devilmanResults.darkTriad.traits[trait];
          const infoKey = `dark-triad-${trait}`;
          const isExpanded = selectedInfoKey === infoKey;

          return (
            <View
              key={trait}
              className="mb-2 rounded-xl border border-[#262730] bg-[#111218] px-4 py-3"
            >
              <Pressable
                onPress={() => toggleInfo(infoKey)}
                accessibilityRole="button"
                accessibilityState={{ expanded: isExpanded }}
                className="flex-row items-center justify-between"
              >
                <View className="flex-1 pr-3">
                  <Text className="text-sm font-bold text-white">
                    {DARK_TRIAD_TRAIT_LABELS[trait]} {isExpanded ? '▴' : '▾'}
                  </Text>
                  <Text className="mt-1 text-[11px] text-[#9ea0b3]">
                    Suma: {score.sum} · Ítems: {score.count} · Normalizado: {score.normalized.toFixed(2)}
                  </Text>
                </View>
                <Text className="text-sm font-black text-violet-300">
                  {score.average.toFixed(2)} / 4
                </Text>
              </Pressable>
              {isExpanded ? (
                <Text className="mt-3 border-t border-[#262730] pt-3 text-xs leading-4 text-[#d7d7e2]">
                  {DARK_TRIAD_TRAIT_DESCRIPTIONS[trait]}
                </Text>
              ) : null}
            </View>
          );
        })}
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
                  ? 'Guardar resultados y respuestas'
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

      <Pressable
        onPress={onReviewTest}
        accessibilityRole="button"
        className="mt-6 items-center rounded-full bg-violet-400 px-4 py-3"
      >
        <Text className="text-sm font-black text-[#11120f]">Revisar respuestas</Text>
      </Pressable>
    </View>
  );
}