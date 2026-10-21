import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Play, Pause, RotateCcw, ChevronRight, ChevronLeft, CheckCircle2, User } from 'lucide-react';
import { BODY_SCAN_STEPS } from '../data/patterns';
import { soundEngine } from '../utils/audio';

interface BodyRelaxationGuideProps {
  onFinishSession?: () => void;
}

export const BodyRelaxationGuide: React.FC<BodyRelaxationGuideProps> = ({ onFinishSession }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(BODY_SCAN_STEPS[0].duration);
  const timerRef = useRef<number | null>(null);

  const step = BODY_SCAN_STEPS[currentStepIndex];

  useEffect(() => {
    setSecondsRemaining(step.duration);
  }, [currentStepIndex, step.duration]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Next step
            if (currentStepIndex < BODY_SCAN_STEPS.length - 1) {
              setCurrentStepIndex((idx) => idx + 1);
              soundEngine.playPhaseChime('hold', 0.4);
              return BODY_SCAN_STEPS[currentStepIndex + 1].duration;
            } else {
              // Completed
              setIsPlaying(false);
              soundEngine.playSingingBowlStrike(0.6);
              if (onFinishSession) onFinishSession();
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, onFinishSession]);

  const togglePlay = () => {
    soundEngine.ensureContext();
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentStepIndex < BODY_SCAN_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setSecondsRemaining(BODY_SCAN_STEPS[0].duration);
  };

  const progressPercent = ((step.duration - secondsRemaining) / step.duration) * 100;

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <span>신체 스캔 & 점진적 근육 이완(PMR)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            머리끝부터 발끝까지 무의식적인 긴장을 자각하고 완전히 녹여내는 휴식 명상
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <span>단계</span>
          <span className="font-bold text-teal-300 tabular-nums">
            {currentStepIndex + 1} / {BODY_SCAN_STEPS.length}
          </span>
        </div>
      </div>

      {/* Main Focus Box */}
      <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-6 sm:p-8 relative overflow-hidden text-center space-y-4">
        {/* Step Progress Bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          이완 부위: {step.part}
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {step.part}의 힘을 완전히 빼세요
        </h3>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          {step.instruction}
        </p>

        {/* Big Remaining Timer */}
        <div className="pt-2">
          <span className="text-4xl font-mono font-bold text-teal-400 tabular-nums">
            {secondsRemaining}
          </span>
          <span className="text-xs text-slate-400 ml-1">초 유지</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 transition-colors"
            title="이전 부위"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
            title="처음부터"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-teal-500 text-slate-950 hover:bg-teal-400'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>일시정지</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>이완 가이드 시작</span>
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={currentStepIndex === BODY_SCAN_STEPS.length - 1}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 transition-colors"
            title="다음 부위"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Step navigation dots / list */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6">
        {BODY_SCAN_STEPS.map((s, idx) => {
          const isCurrent = idx === currentStepIndex;
          const isDone = idx < currentStepIndex;
          return (
            <button
              key={s.part}
              onClick={() => setCurrentStepIndex(idx)}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                isCurrent
                  ? 'bg-teal-950/40 border-teal-500/50 text-teal-300'
                  : isDone
                  ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                  : 'bg-slate-950/20 border-slate-800/40 text-slate-500'
              }`}
            >
              <div className="text-[10px] text-slate-500 font-medium">STEP 0{idx + 1}</div>
              <div className="text-xs font-semibold truncate mt-0.5">{s.part}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
