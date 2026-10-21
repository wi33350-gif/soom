import React, { useState, useEffect, useRef } from 'react';
import { Timer, Activity, CheckSquare, Square, AlertCircle, ArrowRight, Play, Square as StopIcon, RefreshCw, Sparkles } from 'lucide-react';
import { BreathingPattern } from '../types/breathing';
import { BREATHING_PATTERNS } from '../data/patterns';

interface BreathAssessmentProps {
  onSelectPattern: (pattern: BreathingPattern) => void;
  onSaveBoltScore: (score: number) => void;
  savedBoltScore?: number;
}

export const BreathAssessment: React.FC<BreathAssessmentProps> = ({
  onSelectPattern,
  onSaveBoltScore,
  savedBoltScore,
}) => {
  const [activeTab, setActiveTab] = useState<'bolt' | 'habits'>('bolt');

  // BOLT Test State
  const [boltState, setBoltState] = useState<'idle' | 'running' | 'done'>('idle');
  const [boltSeconds, setBoltSeconds] = useState(0);
  const boltTimerRef = useRef<number | null>(null);

  // Habits Checklist State
  const habitsQuestions = [
    { id: 1, text: '거울을 볼 때 숨을 들이마시면 어깨나 쇄골이 위로 들썩거린다.' },
    { id: 2, text: '일상 중 무의식적으로 한숨을 자주 쉬거나 깊은 하품을 자주 한다.' },
    { id: 3, text: '목 뒤나 어깨 승모근이 항상 뻐근하고 자주 결린다.' },
    { id: 4, text: '자는 동안 입을 벌리고 자거나 평소에도 입으로 숨 쉬는 경향이 있다.' },
    { id: 5, text: '스마트폰을 보거나 일에 집중할 때 무의식적으로 숨을 멈추거나 헐떡인다.' },
  ];
  const [checkedHabits, setCheckedHabits] = useState<number[]>([]);

  // Timer loop for BOLT
  useEffect(() => {
    if (boltState === 'running') {
      const startTime = performance.now();
      boltTimerRef.current = window.setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        setBoltSeconds(elapsed);
      }, 50);
    } else {
      if (boltTimerRef.current) clearInterval(boltTimerRef.current);
    }

    return () => {
      if (boltTimerRef.current) clearInterval(boltTimerRef.current);
    };
  }, [boltState]);

  const startBoltTest = () => {
    setBoltSeconds(0);
    setBoltState('running');
  };

  const stopBoltTest = () => {
    setBoltState('done');
    onSaveBoltScore(Math.round(boltSeconds));
  };

  const resetBoltTest = () => {
    setBoltState('idle');
    setBoltSeconds(0);
  };

  const toggleHabit = (id: number) => {
    setCheckedHabits((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Determine BOLT score tier
  const getBoltFeedback = (sec: number) => {
    if (sec < 10) {
      return {
        tier: '경고: 만성 과호흡 및 호흡근 기능 저하',
        color: 'text-rose-400',
        bgColor: 'bg-rose-950/40 border-rose-800/60',
        desc: '혈중 이산화탄소 내성이 매우 낮고 얕은 흉식 호흡에 고착되어 있습니다. 일상에서 불안과 피로를 쉽게 느끼며 수면의 질이 저하될 수 있습니다.',
        prescription: 'diaphragm-correction',
        recName: '복식 호흡 교정 훈련',
      };
    } else if (sec < 20) {
      return {
        tier: '주의: 보통 이하 (호흡 개선 필요)',
        color: 'text-amber-400',
        bgColor: 'bg-amber-950/40 border-amber-800/60',
        desc: '신경계가 가벼운 긴장 상태를 지속하고 있습니다. 계단을 오를 때 쉽게 숨이 차거나 어깨 결림이 자주 나타납니다.',
        prescription: '4-7-8-sleep',
        recName: '4-7-8 신경계 이완 호흡',
      };
    } else if (sec < 30) {
      return {
        tier: '양호: 건강한 정상 호흡 상태',
        color: 'text-teal-400',
        bgColor: 'bg-teal-950/40 border-teal-800/60',
        desc: '자율신경계 균형과 폐포의 산소 교환 능력이 원활합니다. 스트레스 조절력이 우수합니다.',
        prescription: 'box-breathing',
        recName: '네모 박스 호흡 (Box Breathing)',
      };
    } else {
      return {
        tier: '최적: 최상위 심폐 및 멘탈 지구력',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-950/40 border-emerald-800/60',
        desc: '운동선수 및 베테랑 명상가 수준의 뛰어난 CO2 내성과 미주신경 톤을 보유하고 있습니다.',
        prescription: 'coherence-55',
        recName: '공명 주파수 코히어런스 호흡',
      };
    }
  };

  const handleLaunchPrescription = (patternId: string) => {
    const found = BREATHING_PATTERNS.find((p) => p.id === patternId);
    if (found) {
      onSelectPattern(found);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
      {/* Header and segmented tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" />
            <span>호흡 상태 자가 진단 및 교정 처방</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            내 폐와 횡격막의 건강도, 이산화탄소 내성(BOLT)을 과학적으로 평가합니다.
          </p>
        </div>

        {/* Segmented Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('bolt')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'bolt'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            BOLT 산소 내성 검사
          </button>
          <button
            onClick={() => setActiveTab('habits')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'habits'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            흉식 호흡 습관 체크
          </button>
        </div>
      </div>

      {/* Tab 1: BOLT Test */}
      {activeTab === 'bolt' && (
        <div className="space-y-6">
          {/* Instructions Box */}
          <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-2">
            <div className="font-semibold text-teal-300 flex items-center gap-2">
              <Timer className="w-4 h-4" />
              <span>BOLT(Body Oxygen Level Test) 측정 방법</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>편안히 앉아 코로 2~3회 조용하고 자연스럽게 숨을 쉰 뒤 평소처럼 내쉽니다.</li>
              <li>숨을 다 뱉은 상태에서 코를 손가락으로 쥐고 <strong className="text-teal-300">[타이머 시작]</strong>을 누릅니다.</li>
              <li>숨을 참다가 <strong className="text-amber-300">"첫 번째로 숨을 쉬고 싶다는 충동(목이나 횡격막의 꿀렁임)"</strong>이 느껴지면 즉시 멈춥니다.</li>
              <li>*주의: 고통스럽게 억지로 오래 참는 시험이 아닙니다! 손을 놓았을 때 헐떡이지 않고 평온하게 숨이 쉬어져야 정확합니다.</li>
            </ol>
          </div>

          {/* Test Arena */}
          <div className="flex flex-col items-center justify-center p-8 bg-slate-950/70 rounded-2xl border border-slate-800">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
              {boltState === 'running' ? '편안하게 숨을 참고 있습니다...' : 'BOLT SCORE'}
            </div>

            <div className="text-5xl sm:text-6xl font-mono font-extrabold text-white my-3 tabular-nums">
              {boltSeconds.toFixed(1)}
              <span className="text-xl text-teal-400 font-sans ml-1">초</span>
            </div>

            {savedBoltScore && boltState === 'idle' && (
              <div className="text-xs text-slate-400 mt-1">
                이전 최고 기록: <strong className="text-teal-300">{savedBoltScore}초</strong>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-3 mt-6">
              {boltState === 'idle' && (
                <button
                  onClick={startBoltTest}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>측정 시작하기</span>
                </button>
              )}

              {boltState === 'running' && (
                <button
                  onClick={stopBoltTest}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm transition-all shadow-lg shadow-rose-500/20 animate-pulse active:scale-95"
                >
                  <StopIcon className="w-4 h-4 fill-current" />
                  <span>첫 호흡 충동 느껴짐 (스톱)</span>
                </button>
              )}

              {boltState === 'done' && (
                <button
                  onClick={resetBoltTest}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>다시 측정하기</span>
                </button>
              )}
            </div>
          </div>

          {/* Result Card when Done */}
          {boltState === 'done' && (
            <div className={`p-5 rounded-2xl border transition-all ${getBoltFeedback(boltSeconds).bgColor}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className={`text-sm font-bold ${getBoltFeedback(boltSeconds).color} mb-1 flex items-center gap-1.5`}>
                    <Sparkles className="w-4 h-4" />
                    <span>{getBoltFeedback(boltSeconds).tier}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed mb-3">
                    {getBoltFeedback(boltSeconds).desc}
                  </p>
                  <div className="text-xs text-teal-300 font-semibold">
                    💡 맞춤 권장 솔루션: {getBoltFeedback(boltSeconds).recName}
                  </div>
                </div>

                <button
                  onClick={() => handleLaunchPrescription(getBoltFeedback(boltSeconds).prescription)}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all whitespace-nowrap self-center"
                >
                  <span>추천 훈련 시작</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Habits Checklist */}
      {activeTab === 'habits' && (
        <div className="space-y-6">
          <p className="text-xs text-slate-400">
            해당하는 항목을 모두 체크해 보세요. 2개 이상 해당 시 만성 흉식(가슴) 호흡 패턴일 가능성이 큽니다.
          </p>

          <div className="space-y-2.5">
            {habitsQuestions.map((q) => {
              const isChecked = checkedHabits.includes(q.id);
              return (
                <button
                  key={q.id}
                  onClick={() => toggleHabit(q.id)}
                  className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-colors ${
                    isChecked
                      ? 'bg-teal-950/40 border-teal-700/60 text-slate-100'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-teal-400 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-600 shrink-0" />
                  )}
                  <span className="text-xs font-medium leading-relaxed">{q.text}</span>
                </button>
              );
            })}
          </div>

          {/* Diagnostic Result */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">
                체크 결과: {checkedHabits.length} / {habitsQuestions.length}개 일치
              </span>
              <span className="text-xs font-bold text-teal-400">
                {checkedHabits.length >= 3
                  ? '흉식 호흡 경향 높음'
                  : checkedHabits.length >= 1
                  ? '경미한 호흡 불균형'
                  : '안정적인 호흡 습관'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              {checkedHabits.length >= 3
                ? '가슴과 목 근육을 과도하게 사용하는 흉식 호흡이 습관화되어 있습니다. [복식 호흡 교정 훈련]으로 배꼽을 부풀리고 횡격막을 하강시키는 신경근 훈련이 시급합니다.'
                : '가끔 업무 스트레스나 자세로 인해 호흡이 얕아질 수 있으니 수시로 어깨를 내리고 깊은 복식 호흡을 실천하세요.'}
            </p>

            <button
              onClick={() => handleLaunchPrescription('diaphragm-correction')}
              className="w-full py-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span>복식 호흡 교정 훈련 바로가기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
