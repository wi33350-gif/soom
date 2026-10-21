import React, { useState } from 'react';
import { X, Sliders, Check } from 'lucide-react';
import { BreathingPattern, BreathPhase } from '../types/breathing';

interface CustomPatternModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomPattern: (pattern: BreathingPattern) => void;
}

export const CustomPatternModal: React.FC<CustomPatternModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomPattern,
}) => {
  const [name, setName] = useState('나만의 맞춤 호흡 루틴');
  const [inhale, setInhale] = useState(4);
  const [hold1, setHold1] = useState(4);
  const [exhale, setExhale] = useState(6);
  const [hold2, setHold2] = useState(0);
  const [cycles, setCycles] = useState(5);

  if (!isOpen) return null;

  const handleSave = () => {
    const phases: BreathPhase[] = [
      {
        id: 'inhale',
        name: '숨 들이마시기',
        duration: inhale,
        instruction: '코로 부드럽고 깊게 들이마십니다',
        tip: '복부를 편안하게 확장하세요',
        color: '#38bdf8',
      },
    ];

    if (hold1 > 0) {
      phases.push({
        id: 'hold',
        name: '가득 채워 멈추기',
        duration: hold1,
        instruction: '숨을 멈추고 고요함을 유지합니다',
        tip: '어깨와 턱의 긴장을 푸세요',
        color: '#818cf8',
      });
    }

    phases.push({
      id: 'exhale',
      name: '숨 내쉬기',
      duration: exhale,
      instruction: '입 또는 코로 균일하게 내쉽니다',
      tip: '긴장이 몸 밖으로 빠져나갑니다',
      color: '#34d399',
    });

    if (hold2 > 0) {
      phases.push({
        id: 'hold2',
        name: '비워낸 채 멈추기',
        duration: hold2,
        instruction: '폐를 비운 채 잠시 머뭅니다',
        tip: '비어 있는 평온을 바라봅니다',
        color: '#a78bfa',
      });
    }

    const newPattern: BreathingPattern = {
      id: `custom-${Date.now()}`,
      koreanName: name.trim() || '나만의 맞춤 호흡',
      englishName: 'Custom Breathing Routine',
      category: 'custom',
      tag: `커스텀 · ${inhale}-${hold1}-${exhale}-${hold2}`,
      summary: `들숨 ${inhale}초, 유지 ${hold1}초, 날숨 ${exhale}초, 비움 ${hold2}초 맞춤 설정`,
      description: '사용자가 직접 호흡 길이와 단계를 구성한 맞춤형 호흡 훈련 루틴입니다.',
      scientificBasis: '개인 맞춤형 호흡 주기 설정을 통해 호흡기 재활 및 최적의 생체 리듬 훈련을 제공합니다.',
      postureGuide: '척추를 곧게 세우고 편안한 자세로 호흡합니다.',
      benefits: ['개인 폐활량 및 컨디션에 맞춘 자율 훈련', '호흡기 재활 및 심폐 적응'],
      defaultCycles: cycles,
      phases,
    };

    onSaveCustomPattern(newPattern);
    onClose();
  };

  const totalCycleSeconds = inhale + hold1 + exhale + hold2;
  const totalSessionMinutes = ((totalCycleSeconds * cycles) / 60).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">커스텀 호흡 루틴 만들기</h3>
            <p className="text-xs text-slate-400">초 단위로 나만의 호흡 리듬을 디자인하세요.</p>
          </div>
        </div>

        {/* Form Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              루틴 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 나만의 저녁 숙면 호흡"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Inhale */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-sky-400">1. 숨 들이마시기 (들숨)</span>
              <span className="text-xs font-bold text-white font-mono tabular-nums">{inhale}초</span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="0.5"
              value={inhale}
              onChange={(e) => setInhale(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Hold 1 */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-indigo-400">2. 가득 채워 멈추기 (참기)</span>
              <span className="text-xs font-bold text-white font-mono tabular-nums">
                {hold1 === 0 ? '없음 (0초)' : `${hold1}초`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              step="0.5"
              value={hold1}
              onChange={(e) => setHold1(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Exhale */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-emerald-400">3. 천천히 내쉬기 (날숨)</span>
              <span className="text-xs font-bold text-white font-mono tabular-nums">{exhale}초</span>
            </div>
            <input
              type="range"
              min="2"
              max="16"
              step="0.5"
              value={exhale}
              onChange={(e) => setExhale(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Hold 2 */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-purple-400">4. 비워낸 채 멈추기 (비움)</span>
              <span className="text-xs font-bold text-white font-mono tabular-nums">
                {hold2 === 0 ? '없음 (0초)' : `${hold2}초`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={hold2}
              onChange={(e) => setHold2(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Cycles */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-slate-300">반복 횟수 (세트)</span>
              <span className="text-xs font-bold text-teal-400 font-mono tabular-nums">{cycles}회</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={cycles}
              onChange={(e) => setCycles(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Summary Info */}
        <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 flex justify-between items-center">
          <span>1회 주기: <strong className="text-white">{totalCycleSeconds}초</strong></span>
          <span>총 세션 예상: <strong className="text-teal-300">약 {totalSessionMinutes}분</strong></span>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>루틴 저장 및 적용</span>
          </button>
        </div>
      </div>
    </div>
  );
};
