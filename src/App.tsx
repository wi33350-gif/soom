import React, { useState, useEffect } from 'react';
import {
  Wind,
  Activity,
  User,
  Award,
  Sparkles,
  Sliders,
  CheckCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { BreathingPattern, SoundscapeState, UserProgress, BreathSessionLog } from './types/breathing';
import { BREATHING_PATTERNS } from './data/patterns';
import { BreathingVisualizer } from './components/BreathingVisualizer';
import { SoundscapeMixer } from './components/SoundscapeMixer';
import { BreathAssessment } from './components/BreathAssessment';
import { BodyRelaxationGuide } from './components/BodyRelaxationGuide';
import { SessionStats } from './components/SessionStats';
import { CustomPatternModal } from './components/CustomPatternModal';

const DEFAULT_SOUND_STATE: SoundscapeState = {
  isPlaying: false,
  masterVolume: 0.6,
  oceanVolume: 0.5,
  rainVolume: 0.3,
  bowlVolume: 0.4,
  binauralVolume: 0.35,
  bellVolume: 0.5,
  chimesEnabled: true,
  voiceGuide: true,
};

const DEFAULT_USER_PROGRESS: UserProgress = {
  totalMinutes: 0,
  totalSessions: 0,
  streakDays: 1,
  lastSessionDate: '',
  boltScore: undefined,
  logs: [],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'assessment' | 'relax' | 'stats'>('studio');
  const [allPatterns, setAllPatterns] = useState<BreathingPattern[]>(BREATHING_PATTERNS);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(BREATHING_PATTERNS[0]);
  const [soundState, setSoundState] = useState<SoundscapeState>(DEFAULT_SOUND_STATE);
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem('soom_progress_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_USER_PROGRESS;
  });

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [showScientificModal, setShowScientificModal] = useState(false);

  // Save progress to local storage
  useEffect(() => {
    try {
      localStorage.setItem('soom_progress_v2', JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  const handleSessionComplete = (
    durationSeconds: number,
    cyclesCompleted: number,
    preStress: number,
    postStress: number
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const addedMinutes = Math.max(1, Math.round(durationSeconds / 60));

    setProgress((prev) => {
      let newStreak = prev.streakDays;
      if (prev.lastSessionDate !== todayStr) {
        newStreak = prev.streakDays + 1;
      }

      const newLog: BreathSessionLog = {
        id: `log-${Date.now()}`,
        timestamp: Date.now(),
        patternId: selectedPattern.id,
        patternName: selectedPattern.koreanName,
        durationSeconds,
        completedCycles: cyclesCompleted,
        preStressLevel: preStress,
        postStressLevel: postStress,
      };

      return {
        ...prev,
        totalMinutes: prev.totalMinutes + addedMinutes,
        totalSessions: prev.totalSessions + 1,
        streakDays: newStreak,
        lastSessionDate: todayStr,
        logs: [newLog, ...prev.logs],
      };
    });
  };

  const handleSaveBoltScore = (score: number) => {
    setProgress((prev) => ({
      ...prev,
      boltScore: score,
      boltScoreDate: new Date().toISOString().split('T')[0],
    }));
  };

  const handleClearHistory = () => {
    if (window.confirm('모든 호흡 기록을 초기화하시겠습니까?')) {
      setProgress(DEFAULT_USER_PROGRESS);
      try {
        localStorage.removeItem('soom_progress_v2');
      } catch {
        // ignore
      }
    }
  };

  const handleSaveCustomPattern = (pattern: BreathingPattern) => {
    setAllPatterns((prev) => [pattern, ...prev]);
    setSelectedPattern(pattern);
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-teal-500/20 selection:text-teal-200">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 px-6 sm:px-10 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('studio')}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-teal-500/20">
            <Wind className="w-4 h-4 text-slate-950" />
          </div>
          <span>숨결 SOOM</span>
        </button>

        {/* Zone 2: 4 clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setActiveTab('studio')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'studio' ? 'text-teal-400' : 'hover:text-slate-200'
            }`}
          >
            호흡 스튜디오
          </button>
          <button
            onClick={() => setActiveTab('assessment')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'assessment' ? 'text-teal-400' : 'hover:text-slate-200'
            }`}
          >
            호흡 상태 진단
          </button>
          <button
            onClick={() => setActiveTab('relax')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'relax' ? 'text-teal-400' : 'hover:text-slate-200'
            }`}
          >
            신체 바디스캔
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'stats' ? 'text-teal-400' : 'hover:text-slate-200'
            }`}
          >
            나의 릴렉스 여정
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-xl transition-all whitespace-nowrap shrink-0"
          >
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            <span>커스텀 루틴</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('studio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl shadow-lg shadow-teal-500/20 transition-all whitespace-nowrap shrink-0"
          >
            지금 호흡하기
          </button>
        </div>
      </header>

      {/* Mobile Sub Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-b border-slate-800 bg-[#0c121e] px-2 py-2">
        <button
          onClick={() => setActiveTab('studio')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
            activeTab === 'studio' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400'
          }`}
        >
          호흡 스튜디오
        </button>
        <button
          onClick={() => setActiveTab('assessment')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
            activeTab === 'assessment' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400'
          }`}
        >
          호흡 진단
        </button>
        <button
          onClick={() => setActiveTab('relax')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
            activeTab === 'relax' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400'
          }`}
        >
          바디스캔
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
            activeTab === 'stats' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400'
          }`}
        >
          나의 여정
        </button>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Floating Soundscape Bar (Always available) */}
        <SoundscapeMixer
          soundState={soundState}
          onUpdateSoundState={setSoundState}
        />

        {/* Tab 1: Studio (Breathing Visualizer + Pattern Switcher + Scientific Card) */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* Visualizer Hero Area */}
            <BreathingVisualizer
              pattern={selectedPattern}
              soundState={soundState}
              onSessionComplete={handleSessionComplete}
              onSelectPattern={setSelectedPattern}
            />

            {/* Pattern Shelf Section */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Wind className="w-4 h-4 text-teal-400" />
                    <span>과학적 호흡 훈련 & 교정 프로그램</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    목적(수면, 집중, 횡격막 교정, 즉각 이완)에 맞는 최적의 주기를 선택하세요.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowScientificModal(true)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>호흡 과학 원리 안내</span>
                  </button>

                  <button
                    onClick={() => setIsCustomModalOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-teal-300 hover:bg-slate-700 text-xs font-medium border border-slate-700 transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>+ 커스텀 추가</span>
                  </button>
                </div>
              </div>

              {/* Grid of Breathing Programs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allPatterns.map((p) => {
                  const isSelected = p.id === selectedPattern.id;
                  const phaseSummary = p.phases
                    .map((phase) => `${phase.name.split(' ')[0]} ${phase.duration}s`)
                    .join(' · ');

                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPattern(p);
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }}
                      className={`p-5 rounded-2xl text-left border transition-all relative overflow-hidden group ${
                        isSelected
                          ? 'bg-teal-950/30 border-teal-500/80 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/40'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50'
                      }`}
                    >
                      {/* Active Indicator check */}
                      {isSelected && (
                        <div className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-bold text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded-md border border-teal-700/50">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>선택됨</span>
                        </div>
                      )}

                      <div className="text-[11px] font-semibold text-teal-400 mb-1">
                        {p.tag}
                      </div>

                      <h4 className="text-base font-bold text-white mb-1 group-hover:text-teal-200 transition-colors">
                        {p.koreanName}
                      </h4>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
                        {p.summary}
                      </p>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-mono text-slate-400">{phaseSummary}</span>
                        <span>기본 {p.defaultCycles}세트</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Pattern Detailed Scientific Deep Dive */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
                <Sparkles className="w-4 h-4" />
                <span>선택된 프로그램 상세 가이드 & 생리학적 원리</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">
                    {selectedPattern.koreanName} ({selectedPattern.englishName})
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {selectedPattern.description}
                  </p>

                  <div className="text-xs font-semibold text-slate-200 mb-2">기대 효과 및 이점:</div>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {selectedPattern.benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                    <span className="font-semibold text-teal-300">생리학적 기전 (Why it works):</span>
                    <p className="text-slate-400 leading-relaxed">
                      {selectedPattern.scientificBasis}
                    </p>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                    <span className="font-semibold text-indigo-300">자세 및 호흡법 체크포인트:</span>
                    <p className="text-slate-400 leading-relaxed">
                      {selectedPattern.postureGuide}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Breath Assessment (BOLT & Habit diagnostic) */}
        {activeTab === 'assessment' && (
          <BreathAssessment
            onSelectPattern={(p) => {
              setSelectedPattern(p);
              setActiveTab('studio');
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }}
            onSaveBoltScore={handleSaveBoltScore}
            savedBoltScore={progress.boltScore}
          />
        )}

        {/* Tab 3: Body Relaxation & Scan */}
        {activeTab === 'relax' && (
          <BodyRelaxationGuide
            onFinishSession={() => {
              handleSessionComplete(120, 1, 4, 1);
            }}
          />
        )}

        {/* Tab 4: User Journey & Stats */}
        {activeTab === 'stats' && (
          <SessionStats
            progress={progress}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800/80 bg-[#090d16] py-6 px-6 sm:px-10 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">숨결 (SOOM)</span>
            <span>·</span>
            <span>자율신경계 릴렉스 & 과학적 호흡교정 스튜디오</span>
          </div>
          <div className="text-slate-500 text-[11px]">
            기반 연구: Andrew Weil M.D. · Huberman Lab · Oxygen Advantage · HRV Biofeedback
          </div>
        </div>
      </footer>

      {/* Custom Routine Modal */}
      <CustomPatternModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSaveCustomPattern={handleSaveCustomPattern}
      />

      {/* Scientific Principles Modal */}
      {showScientificModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-400" />
                <span>호흡이 자율신경계에 미치는 과학</span>
              </h3>
              <button
                onClick={() => setShowScientificModal(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800"
              >
                닫기
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed max-h-96 overflow-y-auto pr-1">
              <div>
                <strong className="text-teal-300 block mb-1">1. 횡격막 호흡(복식 호흡)과 미주신경 자극</strong>
                <p className="text-slate-400">
                  횡격막은 인체에서 심장 다음으로 중요한 근육입니다. 들이마실 때 횡격막이 아래로 하강하면서 복부 장기를 부드럽게 마사지하고, 폐 하부의 부교감신경 수용체를 자극하여 코르티솔 분비를 억제합니다.
                </p>
              </div>

              <div>
                <strong className="text-teal-300 block mb-1">2. 날숨(Exhale)이 길어지면 심박수가 떨어지는 이유</strong>
                <p className="text-slate-400">
                  숨을 내쉴 때 횡격막이 올라가면서 흉강 내 압력이 증가하고, 심장에 들어오는 혈액량이 늘어납니다. 심장은 혈압 상승을 방지하기 위해 미주신경을 통해 신호를 보내 심박수를 즉각 낮춥니다(호흡성 동성 부정맥, RSA).
                </p>
              </div>

              <div>
                <strong className="text-teal-300 block mb-1">3. CO2 내성(BOLT 스코어)의 결정적 중요성</strong>
                <p className="text-slate-400">
                  흔히 산소가 부족해서 숨이 차다고 생각하지만, 뇌가 호흡을 유발하는 트리거는 &apos;체내 이산화탄소 축적&apos;입니다. 만성 과호흡자는 CO2를 너무 많이 배출하여 헤모글로빈이 산소를 조직에 넘겨주지 못하는 &apos;보어 효과(Bohr Effect)&apos;로 인해 만성 피로에 시달립니다.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowScientificModal(false)}
              className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors"
            >
              확인 및 이해 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
