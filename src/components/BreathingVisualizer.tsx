import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Award,
  Eye,
  EyeOff,
  Image as ImageIcon,
  UserCheck,
  Droplets,
} from 'lucide-react';
import { BreathingPattern, SoundscapeState } from '../types/breathing';
import { soundEngine } from '../utils/audio';
import { AnatomyVisualizer } from './AnatomyVisualizer';

const BG_IMAGES = {
  pond: '/src/assets/images/zen_water_pond_1792548271576.jpg',
  aurora: '/src/assets/images/ambient_aurora_calm_1792548271807.jpg',
  none: '',
};

type MainVisualMode = 'posture' | 'droplet';
type VisualTheme = 'droplet' | 'lotus' | 'jellyfish' | 'aurora';
type BgTheme = 'pond' | 'aurora' | 'minimal';

interface BreathingVisualizerProps {
  pattern: BreathingPattern;
  soundState: SoundscapeState;
  onSessionComplete: (durationSeconds: number, cyclesCompleted: number, preStress: number, postStress: number) => void;
  onSelectPattern: (p: BreathingPattern) => void;
}

export const BreathingVisualizer: React.FC<BreathingVisualizerProps> = ({
  pattern,
  soundState,
  onSessionComplete,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0); // 0 to 1
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(pattern.phases[0]?.duration || 4);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [targetCycles, setTargetCycles] = useState(pattern.defaultCycles);
  const [isZenMode, setIsZenMode] = useState(false);

  // Visual modes: Detailed Posture / Diaphragm mechanics VS Zen Water Droplet
  const [mainVisualMode, setMainVisualMode] = useState<MainVisualMode>('posture');
  const [visualTheme, setVisualTheme] = useState<VisualTheme>('droplet');
  const [bgTheme, setBgTheme] = useState<BgTheme>('pond');
  const [isMinimalTextMode, setIsMinimalTextMode] = useState(false);

  // Completion modal state
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [preStress, setPreStress] = useState(4);
  const [postStress, setPostStress] = useState(1);
  const [sessionDurationSec, setSessionDurationSec] = useState(0);

  const requestRef = useRef<number | null>(null);
  const phaseStartTimeRef = useRef<number>(0);
  const totalSessionStartRef = useRef<number>(0);
  const prevPhaseIndexRef = useRef<number>(-1);
  const [wobbleOffset, setWobbleOffset] = useState(0);

  const currentPhase = pattern.phases[currentPhaseIndex] || pattern.phases[0];

  // Reset when pattern changes
  useEffect(() => {
    setIsActive(false);
    setCurrentPhaseIndex(0);
    setPhaseProgress(0);
    setPhaseSecondsLeft(pattern.phases[0]?.duration || 4);
    setCurrentCycle(1);
    setTargetCycles(pattern.defaultCycles);
    prevPhaseIndexRef.current = -1;
  }, [pattern]);

  // Audio chimes & voice cues
  useEffect(() => {
    if (!isActive) return;

    if (prevPhaseIndexRef.current !== currentPhaseIndex) {
      prevPhaseIndexRef.current = currentPhaseIndex;

      if (soundState.chimesEnabled) {
        soundEngine.playPhaseChime(currentPhase.id, soundState.masterVolume);
      }

      if (soundState.voiceGuide) {
        const spokenWord =
          currentPhase.id === 'inhale'
            ? '들이마시세요'
            : currentPhase.id === 'hold' || currentPhase.id === 'hold2'
            ? '숨을 멈추세요'
            : '천천히 내쉬세요';
        soundEngine.speakGuidance(spokenWord);
      }
    }
  }, [currentPhaseIndex, isActive, currentPhase.id, soundState.chimesEnabled, soundState.voiceGuide, soundState.masterVolume]);

  // 60fps animation loop
  useEffect(() => {
    if (!isActive) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    phaseStartTimeRef.current = performance.now();
    if (totalSessionStartRef.current === 0) {
      totalSessionStartRef.current = performance.now();
    }

    const loop = (now: number) => {
      setWobbleOffset(Math.sin(now / 500) * 3);

      const elapsed = (now - phaseStartTimeRef.current) / 1000;
      const duration = currentPhase.duration;
      const progress = Math.min(elapsed / duration, 1);
      const remaining = Math.max(duration - elapsed, 0);

      setPhaseProgress(progress);
      setPhaseSecondsLeft(remaining);

      if (elapsed >= duration) {
        if (currentPhaseIndex < pattern.phases.length - 1) {
          setCurrentPhaseIndex((prev) => prev + 1);
          phaseStartTimeRef.current = now;
        } else {
          if (currentCycle < targetCycles) {
            setCurrentCycle((prev) => prev + 1);
            setCurrentPhaseIndex(0);
            phaseStartTimeRef.current = now;
          } else {
            const totalElapsedSec = Math.round((now - totalSessionStartRef.current) / 1000);
            setSessionDurationSec(totalElapsedSec);
            setIsActive(false);
            if (soundState.chimesEnabled) {
              soundEngine.playPhaseChime('complete', soundState.masterVolume);
            }
            if (soundState.voiceGuide) {
              soundEngine.speakGuidance('호흡 세션이 성공적으로 완료되었습니다. 편안한 이완을 느껴보세요.');
            }
            setIsCompletedModalOpen(true);
            return;
          }
        }
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, currentPhaseIndex, currentCycle, targetCycles, currentPhase.duration, pattern.phases.length, soundState.chimesEnabled, soundState.voiceGuide, soundState.masterVolume]);

  const handleTogglePlay = () => {
    soundEngine.ensureContext();
    if (!isActive) {
      setIsActive(true);
      if (currentCycle === 1 && currentPhaseIndex === 0) {
        totalSessionStartRef.current = performance.now();
      }
    } else {
      setIsActive(false);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentPhaseIndex(0);
    setPhaseProgress(0);
    setPhaseSecondsLeft(pattern.phases[0]?.duration || 4);
    setCurrentCycle(1);
    totalSessionStartRef.current = 0;
    prevPhaseIndexRef.current = -1;
  };

  const handleFinishModal = () => {
    setIsCompletedModalOpen(false);
    onSessionComplete(sessionDurationSec, targetCycles, preStress, postStress);
    handleReset();
  };

  // Physical posture & fluid calculations
  let baseScale = 1;
  let dropletBulge = 1;

  if (currentPhase.id === 'inhale') {
    baseScale = 0.72 + phaseProgress * 0.58;
    dropletBulge = 1 + phaseProgress * 0.15;
  } else if (currentPhase.id === 'hold') {
    baseScale = 1.3 + Math.sin(phaseProgress * Math.PI * 3) * 0.025;
    dropletBulge = 1.15;
  } else if (currentPhase.id === 'exhale') {
    baseScale = 1.3 - phaseProgress * 0.58;
    dropletBulge = 1.15 - phaseProgress * 0.15;
  } else if (currentPhase.id === 'hold2') {
    baseScale = 0.72;
    dropletBulge = 1.0;
  }

  // Dynamic ambient background color scheme matching breath pace
  const getAmbientStyles = () => {
    switch (currentPhase.id) {
      case 'inhale':
        return {
          glowColor: 'rgba(6, 182, 212, 0.35)',
          bgGradient: 'from-cyan-950/75 via-[#091524] to-[#070b13]',
          accentColor: '#38bdf8',
          name: '들숨 (산소 유입)',
          mechanicsTip: '횡격막 하강 ⬇️ · 복부 팽창 ↔️ · 어깨 고정',
        };
      case 'hold':
        return {
          glowColor: 'rgba(99, 102, 241, 0.35)',
          bgGradient: 'from-indigo-950/75 via-[#0c1229] to-[#070b13]',
          accentColor: '#818cf8',
          name: '숨 멈춤 (충만함)',
          mechanicsTip: '가스 교환 촉진 · 척추 정렬 · 어깨 이완',
        };
      case 'exhale':
        return {
          glowColor: 'rgba(16, 185, 129, 0.35)',
          bgGradient: 'from-emerald-950/75 via-[#081b16] to-[#070b13]',
          accentColor: '#34d399',
          name: '날숨 (긴장 이완)',
          mechanicsTip: '횡격막 상승 ⬆️ · 복부 수축 🔄 · 심박수 진정',
        };
      case 'hold2':
        return {
          glowColor: 'rgba(168, 85, 247, 0.28)',
          bgGradient: 'from-purple-950/65 via-[#0f0e20] to-[#070b13]',
          accentColor: '#c084fc',
          name: '비움 멈춤 (고요)',
          mechanicsTip: '완전한 비움 · 부교감신경 활성',
        };
      default:
        return {
          glowColor: 'rgba(45, 212, 191, 0.25)',
          bgGradient: 'from-slate-900 via-[#0a111e] to-[#070b13]',
          accentColor: '#2dd4bf',
          name: '준비',
          mechanicsTip: '척추를 곧게 펴고 이완합니다',
        };
    }
  };

  const ambient = getAmbientStyles();
  const currentBgImage = bgTheme === 'pond' ? BG_IMAGES.pond : bgTheme === 'aurora' ? BG_IMAGES.aurora : '';

  return (
    <div
      className={`relative w-full overflow-hidden transition-all duration-1000 ${
        isZenMode
          ? 'fixed inset-0 z-50 bg-[#070b13] flex flex-col items-center justify-center p-4 sm:p-8'
          : 'bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl'
      }`}
    >
      {/* 1. Dynamic Background Image Layer */}
      {currentBgImage && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-out z-0"
          style={{
            backgroundImage: `url(${currentBgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: isZenMode ? 0.35 : 0.2,
            transform: `scale(${1.03 + (baseScale - 0.7) * 0.05})`,
            filter: 'blur(2px)',
          }}
        />
      )}

      {/* 2. Dynamic Ambient Color Lighting Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${ambient.bgGradient} pointer-events-none transition-all duration-1000 ease-in-out z-0 ${
          currentBgImage ? 'opacity-85 mix-blend-multiply' : 'opacity-100'
        }`}
      />

      {/* 3. Radial Atmosphere Aura Pulse */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] pointer-events-none transition-all duration-1000 z-0"
        style={{
          width: '520px',
          height: '520px',
          backgroundColor: ambient.glowColor,
          transform: `translate(-50%, -50%) scale(${baseScale * 1.1})`,
          opacity: isActive ? 0.75 : 0.35,
        }}
      />

      {/* Foreground Content */}
      <div className="relative z-10 w-full flex flex-col">
        {/* Top Control Bar */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-teal-300">
              {pattern.tag}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-300 tabular-nums">
              세트 {currentCycle} / {targetCycles} 회
            </span>
          </div>

          {/* Controls: Posture Mechanics View vs Zen Water Droplet View */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Switcher: Posture Mechanics VS Zen Droplet */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setMainVisualMode('posture')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  mainVisualMode === 'posture'
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="인체 자세와 횡격막·복부 움직임 실시간 시각화"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>정밀 생체 메커니즘 뷰</span>
              </button>

              <button
                onClick={() => setMainVisualMode('droplet')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  mainVisualMode === 'droplet'
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="물방울 힐링 멍때리기 비주얼"
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>물방울 힐링 뷰</span>
              </button>
            </div>

            {/* Droplet Sub-Theme Selector (when Droplet view is active) */}
            {mainVisualMode === 'droplet' && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
                <button
                  onClick={() => setVisualTheme('droplet')}
                  className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                    visualTheme === 'droplet' ? 'bg-slate-800 text-teal-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  💧 물방울
                </button>
                <button
                  onClick={() => setVisualTheme('lotus')}
                  className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                    visualTheme === 'lotus' ? 'bg-slate-800 text-teal-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🪷 연꽃
                </button>
                <button
                  onClick={() => setVisualTheme('jellyfish')}
                  className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                    visualTheme === 'jellyfish' ? 'bg-slate-800 text-teal-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🌊 해파리
                </button>
                <button
                  onClick={() => setVisualTheme('aurora')}
                  className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                    visualTheme === 'aurora' ? 'bg-slate-800 text-teal-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🌌 오로라
                </button>
              </div>
            )}

            {/* Background Backdrop Selector */}
            <div className="hidden md:flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
              <button
                onClick={() => setBgTheme('pond')}
                className={`px-2 py-1 text-[11px] rounded-lg transition-colors flex items-center gap-1 ${
                  bgTheme === 'pond' ? 'bg-slate-800 text-teal-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                <span>연못</span>
              </button>
              <button
                onClick={() => setBgTheme('aurora')}
                className={`px-2 py-1 text-[11px] rounded-lg transition-colors flex items-center gap-1 ${
                  bgTheme === 'aurora' ? 'bg-slate-800 text-indigo-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                <span>오로라</span>
              </button>
              <button
                onClick={() => setBgTheme('minimal')}
                className={`px-2 py-1 text-[11px] rounded-lg transition-colors ${
                  bgTheme === 'minimal' ? 'bg-slate-800 text-slate-200 font-semibold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                미니멀
              </button>
            </div>

            {/* 멍때리기 텍스트 최소화 토글 */}
            <button
              onClick={() => setIsMinimalTextMode(!isMinimalTextMode)}
              className={`p-2 rounded-xl border transition-colors ${
                isMinimalTextMode
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700/60'
              }`}
              title={isMinimalTextMode ? '안내 텍스트 표시' : '멍때리기 모드 (텍스트 최소화)'}
            >
              {isMinimalTextMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Zen Mode Toggle */}
            <button
              onClick={() => setIsZenMode(!isZenMode)}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
              title={isZenMode ? '전체화면 종료' : '전체화면 젠 모드'}
            >
              {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Stage (NOTE: Circular progress ring completely removed as requested) */}
        <div className="relative flex flex-col items-center justify-center py-4 sm:py-6">
          {/* VIEW 1: Advanced Medical-Grade Anatomy & Biomechanical Visualizer */}
          {mainVisualMode === 'posture' && (
            <div className="w-full flex flex-col items-center">
              <AnatomyVisualizer
                phaseId={currentPhase.id}
                phaseProgress={phaseProgress}
                phaseDuration={currentPhase.duration}
                accentColor={ambient.accentColor}
              />

              {/* Central Time & Instruction Overlay */}
              <div className="text-center mt-3">
                <div className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-0.5">
                  {currentPhase.name}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums drop-shadow">
                  {phaseSecondsLeft.toFixed(1)}
                  <span className="text-xs font-sans text-slate-300 ml-1">초</span>
                </div>
                <div className="text-xs text-amber-300/90 font-medium mt-1">
                  {ambient.mechanicsTip}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: Healing Living Water Droplet & Zen Mode (Circular Ring completely removed) */}
          {mainVisualMode === 'droplet' && (
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center select-none">
              {/* THEME 1: 💧 Living Water Droplet with Fluid Ripples */}
              {visualTheme === 'droplet' && (
                <div
                  className="relative flex items-center justify-center transition-transform duration-100 ease-linear"
                  style={{ transform: `scale(${baseScale})` }}
                >
                  {/* Concentric Water Waves radiating outward */}
                  <div
                    className="absolute -inset-14 rounded-full border border-teal-400/25 pointer-events-none transition-all duration-1000"
                    style={{
                      transform: `scale(${1 + phaseProgress * 0.4})`,
                      opacity: (1 - phaseProgress) * 0.6,
                    }}
                  />
                  <div
                    className="absolute -inset-24 rounded-full border border-cyan-400/15 pointer-events-none transition-all duration-1000 delay-150"
                    style={{
                      transform: `scale(${1 + phaseProgress * 0.5})`,
                      opacity: (1 - phaseProgress) * 0.35,
                    }}
                  />

                  {/* Main Glass Water Droplet SVG Shape */}
                  <svg
                    className="w-48 h-56 sm:w-56 sm:h-64 filter drop-shadow-[0_12px_28px_rgba(6,182,212,0.35)]"
                    viewBox="0 0 200 240"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <radialGradient id="dropletGrad" cx="35%" cy="30%" r="75%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
                        <stop offset="25%" stopColor={ambient.accentColor} stopOpacity="0.6" />
                        <stop offset="70%" stopColor="#0891b2" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#0f172a" stopOpacity="0.85" />
                      </radialGradient>
                      <linearGradient id="specularGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Morphing Water Droplet Path */}
                    <path
                      d={`M 100 ${18 + wobbleOffset} 
                         C ${145 + wobbleOffset * 0.5} 70, ${185 * dropletBulge} 145, 100 ${225 * dropletBulge} 
                         C ${15 / dropletBulge} 145, ${55 - wobbleOffset * 0.5} 70, 100 ${18 + wobbleOffset} Z`}
                      fill="url(#dropletGrad)"
                      stroke="rgba(255, 255, 255, 0.45)"
                      strokeWidth="1.8"
                    />

                    {/* Top-left Glossy Specular Highlight Curve */}
                    <ellipse cx="72" cy="85" rx="14" ry="28" transform="rotate(-28 72 85)" fill="url(#specularGrad)" />
                    <circle cx="60" cy="120" r="4.5" fill="#ffffff" fillOpacity="0.65" />

                    {/* Bottom internal reflection rim */}
                    <path d="M 50 195 C 75 215, 125 215, 150 195" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
              )}

              {/* THEME 2: 🪷 Zen Blooming Lotus */}
              {visualTheme === 'lotus' && (
                <div
                  className="relative flex items-center justify-center transition-transform duration-100 ease-linear"
                  style={{ transform: `scale(${baseScale})` }}
                >
                  <svg className="w-56 h-56 sm:w-64 sm:h-64 filter drop-shadow-[0_0_35px_rgba(236,72,153,0.3)]" viewBox="0 0 240 240" fill="none">
                    <defs>
                      <radialGradient id="lotusCenter" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
                        <stop offset="60%" stopColor="#f472b6" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#4338ca" stopOpacity="0.2" />
                      </radialGradient>
                      <linearGradient id="petalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fbcfe8" stopOpacity="0.8" />
                        <stop offset="70%" stopColor="#ec4899" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#312e81" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>

                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                      const petalSpread = 25 + (baseScale - 0.7) * 20;
                      return (
                        <g key={i} transform={`rotate(${angle} 120 120)`}>
                          <path
                            d={`M 120 120 C ${120 - petalSpread} 70, ${120 - petalSpread / 2} 30, 120 20 C ${120 + petalSpread / 2} 30, ${120 + petalSpread} 70, 120 120 Z`}
                            fill="url(#petalGrad)"
                            stroke="rgba(255, 255, 255, 0.4)"
                            strokeWidth="1.2"
                          />
                        </g>
                      );
                    })}
                    <circle cx="120" cy="120" r="32" fill="url(#lotusCenter)" />
                  </svg>
                </div>
              )}

              {/* THEME 3: 🌊 Deep Sea Luminous Jellyfish */}
              {visualTheme === 'jellyfish' && (
                <div
                  className="relative flex items-center justify-center transition-transform duration-100 ease-linear"
                  style={{ transform: `scale(${baseScale})` }}
                >
                  <svg className="w-56 h-64 sm:w-64 sm:h-72 filter drop-shadow-[0_10px_35px_rgba(56,189,248,0.35)]" viewBox="0 0 240 280" fill="none">
                    <defs>
                      <radialGradient id="jellyDome" cx="50%" cy="35%" r="60%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                        <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.6" />
                        <stop offset="85%" stopColor="#0369a1" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#0c1222" stopOpacity="0.1" />
                      </radialGradient>
                    </defs>

                    <path
                      d="M 40 120 C 40 45, 200 45, 200 120 C 180 135, 140 125, 120 130 C 100 125, 60 135, 40 120 Z"
                      fill="url(#jellyDome)"
                      stroke="rgba(255, 255, 255, 0.5)"
                      strokeWidth="1.5"
                    />

                    {[
                      { x: 70, dx: wobbleOffset },
                      { x: 95, dx: -wobbleOffset },
                      { x: 120, dx: wobbleOffset * 1.2 },
                      { x: 145, dx: -wobbleOffset },
                      { x: 170, dx: wobbleOffset },
                    ].map((t, i) => (
                      <path
                        key={i}
                        d={`M ${t.x} 125 Q ${t.x + t.dx} 185, ${t.x - t.dx} 240 T ${t.x + t.dx * 0.5} 270`}
                        stroke="rgba(56, 189, 248, 0.55)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                    ))}
                  </svg>
                </div>
              )}

              {/* THEME 4: 🌌 Cosmic Aurora Plasma Waves */}
              {visualTheme === 'aurora' && (
                <div
                  className="relative flex items-center justify-center transition-transform duration-100 ease-linear"
                  style={{ transform: `scale(${baseScale})` }}
                >
                  <div
                    className="w-48 h-48 sm:w-56 sm:h-56 rounded-full relative overflow-hidden"
                    style={{
                      background: `radial-gradient(circle, ${ambient.accentColor}50 0%, ${ambient.accentColor}20 60%, transparent 80%)`,
                      boxShadow: `0 0 60px ${ambient.accentColor}50`,
                    }}
                  >
                    <div className="absolute inset-2 rounded-full border border-white/40 animate-spin" style={{ animationDuration: '24s' }} />
                    <div className="absolute inset-6 rounded-full border border-teal-300/30 animate-spin" style={{ animationDuration: '16s', animationDirection: 'reverse' }} />
                  </div>
                </div>
              )}

              {/* Center Guidance & Countdown inside Droplet/Shape */}
              <div className="absolute z-30 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                {!isMinimalTextMode ? (
                  <>
                    <span className="text-xs font-bold tracking-wider uppercase text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      {currentPhase.name}
                    </span>
                    <span className="text-4xl sm:text-5xl font-extrabold text-white tabular-nums font-mono my-0.5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                      {phaseSecondsLeft.toFixed(1)}
                      <span className="text-sm font-sans text-teal-200 ml-1">초</span>
                    </span>
                    <span className="text-[11px] text-teal-200 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                      {ambient.name}
                    </span>
                  </>
                ) : (
                  <span className="text-base sm:text-lg font-bold text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {currentPhase.id === 'inhale' ? '들이마심' : currentPhase.id === 'exhale' ? '내쉼' : '멈춤'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Subtitle Instructions */}
          {!isMinimalTextMode && (
            <div className="text-center max-w-lg mx-auto mt-4 px-4 min-h-[3.8rem]">
              <p className="text-base sm:text-lg font-semibold text-slate-100 mb-1 transition-all drop-shadow">
                {currentPhase.instruction}
              </p>
              <p className="text-xs text-teal-300/90 transition-all">
                💡 {currentPhase.tip}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-5">
            <button
              onClick={handleReset}
              className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-all active:scale-95"
              title="처음부터 다시 시작"
              aria-label="Reset session"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handleTogglePlay}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-xl active:scale-95 ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 shadow-amber-500/10'
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/25'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>잠시 멈춤</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                  <span>{currentCycle > 1 || currentPhaseIndex > 0 ? '이어서 호흡' : '호흡 시작하기'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 mx-auto flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                호흡 세션을 훌륭하게 마쳤습니다!
              </h3>
              <p className="text-xs text-slate-400">
                총 {sessionDurationSec}초 동안 {targetCycles}회의 온전한 숨을 비워냈습니다.
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-left space-y-3">
              <div className="text-xs font-semibold text-slate-300">
                마음 상태 체크 (1: 완전 평온 ~ 5: 극심한 긴장)
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>호흡 전 스트레스 지수</span>
                  <span className="text-amber-400 font-bold">{preStress}점</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setPreStress(val)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                        preStress === val
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>호흡 후 현재 평온도</span>
                  <span className="text-teal-400 font-bold">{postStress}점</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setPostStress(val)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                        postStress === val
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleFinishModal}
              className="w-full py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>기록 저장 및 휴식 완료</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
