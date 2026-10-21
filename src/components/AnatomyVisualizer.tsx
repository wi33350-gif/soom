import React, { useState } from 'react';
import {
  Activity,
  Zap,
  ShieldCheck,
  Info,
  Scan,
} from 'lucide-react';

interface AnatomyVisualizerProps {
  phaseId: 'inhale' | 'hold' | 'exhale' | 'hold2';
  phaseProgress: number; // 0 to 1
  phaseDuration: number;
  accentColor: string;
}

type LayerMode = 'all' | 'diaphragm' | 'lungs' | 'vagus';

const XRAY_BG_IMAGE = '/src/assets/images/xray_torso_anatomy_1792549142301.jpg';

export const AnatomyVisualizer: React.FC<AnatomyVisualizerProps> = ({
  phaseId,
  phaseProgress,
  accentColor,
}) => {
  const [activeLayer, setActiveLayer] = useState<LayerMode>('all');
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);

  // Dynamic biomechanical calculations based on breath phase
  let diaphragmExcursion = 0; // 0 to 35 mm
  let lungExpansion = 0; // 0 to 1
  let bellyBulge = 0; // 0 to 1
  let vagusActivity = 0; // 0 to 1 (parasympathetic tone)

  if (phaseId === 'inhale') {
    diaphragmExcursion = phaseProgress * 35;
    lungExpansion = phaseProgress;
    bellyBulge = phaseProgress;
    vagusActivity = 0.35 + (1 - phaseProgress) * 0.15;
  } else if (phaseId === 'hold') {
    diaphragmExcursion = 35;
    lungExpansion = 1.0;
    bellyBulge = 1.0;
    vagusActivity = 0.6;
  } else if (phaseId === 'exhale') {
    diaphragmExcursion = (1 - phaseProgress) * 35;
    lungExpansion = 1 - phaseProgress;
    bellyBulge = 1 - phaseProgress;
    vagusActivity = 0.6 + phaseProgress * 0.35; // Rises to 95% on prolonged exhale
  } else if (phaseId === 'hold2') {
    diaphragmExcursion = 0;
    lungExpansion = 0.1;
    bellyBulge = 0.05;
    vagusActivity = 0.9;
  }

  // Smooth SVG transformations
  const diaphragmShiftY = (diaphragmExcursion / 35) * 36; // 0 (dome up) to 36px (flat down)
  const diaphragmCurve = 230 + (diaphragmExcursion / 35) * 26; // Flattens curve
  const lungScale = 0.88 + lungExpansion * 0.28;

  // Organ details
  const organDetails: Record<string, { title: string; subtitle: string; desc: string; role: string }> = {
    diaphragm: {
      title: '횡격막 (가로막, Diaphragm)',
      subtitle: '인체 호흡의 75%를 견인하는 돔형 핵심 골격근',
      desc: '숨을 들이마실 때 횡격막이 수축하여 아래로 3~5cm 하강하면서 흉강 압력을 낮추고, 폐포를 음압으로 팽창시킵니다. 동시에 복부 장기를 부드럽게 압박하여 내장기 혈류 순환을 촉진합니다.',
      role: '현재 상태: ' + (phaseId === 'inhale' ? '하강 수축 중 (복강 압력 증가)' : '이완 상승 중 (공기 배출)'),
    },
    lungs: {
      title: '폐 & 기관지 수지 (Lungs & Bronchial Tree)',
      subtitle: '수억 개의 폐포(Alveoli)를 통한 가스 교환 센터',
      desc: '기관지 말단의 수억 개 폐포는 0.2마이크로미터의 얇은 모세혈관 벽을 통해 혈액 속 적혈구 헤모글로빈에 산소를 공급하고 이산화탄소를 배출합니다.',
      role: '현재 용적: ' + Math.round(40 + lungExpansion * 60) + '% 팽창 상태',
    },
    vagus: {
      title: '미주신경 (Vagus Nerve, CN X)',
      subtitle: '뇌간에서 심장, 횡격막, 위장으로 이어지는 부교감신경 고속도로',
      desc: '날숨을 길게 쉬면 횡격막이 상승하면서 심장의 우심방에 가해지는 압력이 변화하고, 미주신경이 아세틸콜린을 분비하여 심박수를 즉각 낮추고 온몸의 근육을 이완시킵니다.',
      role: '현재 활성도: ' + Math.round(vagusActivity * 100) + '% (부교감 신경 ' + (phaseId === 'exhale' ? '극대화' : '조절 중') + ')',
    },
    spine: {
      title: '경추-흉추 척추축 (Spine Vertebrae)',
      subtitle: '바른 중립 축과 횡격막 지지대',
      desc: '구부정한 자세는 횡격막의 가동성을 40% 이상 제한합니다. 턱을 살짝 당기고 정수리를 천장으로 밀어 올리면 흉곽이 자연스럽게 열려 횡격막이 온전히 하강할 수 있습니다.',
      role: '상태: 중립 척추 축 유지',
    },
  };

  const currentOrganInfo = selectedOrgan ? organDetails[selectedOrgan] : null;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Layer Filters */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveLayer('all')}
          className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
            activeLayer === 'all'
              ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          X-Ray 정밀 뷰
        </button>
        <button
          onClick={() => {
            setActiveLayer('diaphragm');
            setSelectedOrgan('diaphragm');
          }}
          className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 ${
            activeLayer === 'diaphragm'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>횡격막 & 복벽</span>
        </button>
        <button
          onClick={() => {
            setActiveLayer('lungs');
            setSelectedOrgan('lungs');
          }}
          className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 ${
            activeLayer === 'lungs'
              ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>기관지 & 폐포망</span>
        </button>
        <button
          onClick={() => {
            setActiveLayer('vagus');
            setSelectedOrgan('vagus');
          }}
          className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 ${
            activeLayer === 'vagus'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>미주신경로</span>
        </button>
      </div>

      {/* Main Medical Stage Split: Anatomical SVG + Realtime Biomechanical HUD */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: Realtime Biometric HUD Telemetry Cards */}
        <div className="lg:col-span-3 space-y-3 order-2 lg:order-1">
          {/* Diaphragm Metric */}
          <div
            onClick={() => setSelectedOrgan('diaphragm')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              selectedOrgan === 'diaphragm'
                ? 'bg-amber-950/40 border-amber-500/70 shadow-lg shadow-amber-500/10'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                횡격막 가동폭 (Excursion)
              </span>
              <span className="text-amber-300 font-bold font-mono tabular-nums">
                {diaphragmExcursion.toFixed(1)} mm
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-100"
                style={{ width: `${(diaphragmExcursion / 35) * 100}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
              <span>이완 상단 (0mm)</span>
              <span className="text-amber-400 font-semibold">최대 하강 (35mm)</span>
            </div>
          </div>

          {/* Alveolar Lung Capacity */}
          <div
            onClick={() => setSelectedOrgan('lungs')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              selectedOrgan === 'lungs'
                ? 'bg-sky-950/40 border-sky-500/70 shadow-lg shadow-sky-500/10'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                폐포 팽창도 (Alveolar Vol)
              </span>
              <span className="text-sky-300 font-bold font-mono tabular-nums">
                {Math.round(40 + lungExpansion * 60)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-100"
                style={{ width: `${40 + lungExpansion * 60}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
              <span>기저 잔기량</span>
              <span className="text-sky-400 font-semibold">완전 환기</span>
            </div>
          </div>

          {/* Vagus Nerve Parasympathetic Tone */}
          <div
            onClick={() => setSelectedOrgan('vagus')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              selectedOrgan === 'vagus'
                ? 'bg-emerald-950/40 border-emerald-500/70 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-emerald-400" />
                미주신경 톤 (부교감신경)
              </span>
              <span className="text-emerald-300 font-bold font-mono tabular-nums">
                {Math.round(vagusActivity * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-100"
                style={{ width: `${vagusActivity * 100}%` }}
              />
            </div>
            <div className="text-[10px] text-emerald-400/90 mt-1 flex justify-between font-medium">
              <span>{phaseId === 'exhale' ? '⚡ 아세틸콜린 분비 촉진' : '심박 가변성 조절'}</span>
              <span>{phaseId === 'exhale' ? '심박수 저하' : '평형 유지'}</span>
            </div>
          </div>
        </div>

        {/* Center: High-Definition X-Ray Radiological Torso Scan */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center order-1 lg:order-2">
          <div className="relative w-80 h-96 sm:w-96 sm:h-[480px] rounded-3xl overflow-hidden border border-cyan-500/30 bg-[#060c18] shadow-[0_0_50px_rgba(6,182,212,0.25)] flex items-center justify-center">
            {/* 1. Underlying 8K Medical X-Ray Silhouette Image Asset */}
            <img
              src={XRAY_BG_IMAGE}
              alt="Medical X-ray anatomical torso scan"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-85 select-none transition-transform duration-700"
              style={{
                transform: `scale(${1.02 + lungExpansion * 0.03})`,
                filter: 'contrast(1.15) brightness(1.05)',
              }}
            />

            {/* Subtle Clinical Scanline overlay moving down */}
            <div
              className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent pointer-events-none animate-pulse"
              style={{
                top: `${(phaseProgress * 90 + 5)}%`,
                boxShadow: '0 0 15px rgba(34, 211, 238, 0.8)',
                transition: 'top 0.1s linear',
              }}
            />

            {/* Medical Grid Matrix Backdrop */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(34, 211, 238, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.2) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            {/* 2. Interactive SVG Dynamic Biomechanical Overlay (Target Element) */}
            <svg
              className="absolute inset-0 w-full h-full select-none pointer-events-auto"
              viewBox="0 0 380 480"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="lungBreathingGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.75" />
                  <stop offset="60%" stopColor="#0891b2" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.0" />
                </radialGradient>

                <linearGradient id="diaphragmGold" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                </linearGradient>

                <linearGradient id="vagusElectric" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* LUNGS ALVEOLAR SWELLING GLOW (Dynamic) */}
              {(activeLayer === 'all' || activeLayer === 'lungs') && (
                <g
                  transform={`translate(190, 205) scale(${lungScale}) translate(-190, -205)`}
                  className="transition-transform duration-100 ease-linear cursor-pointer"
                  onClick={() => setSelectedOrgan('lungs')}
                >
                  {/* Left Lung Lobe Glow */}
                  <ellipse cx="145" cy="205" rx="42" ry="58" fill="url(#lungBreathingGlow)" className="filter blur-md" />
                  {/* Right Lung Lobe Glow */}
                  <ellipse cx="235" cy="205" rx="42" ry="58" fill="url(#lungBreathingGlow)" className="filter blur-md" />

                  {/* Pulsing Alveoli Nodes */}
                  {[
                    { cx: 130, cy: 190 },
                    { cx: 155, cy: 220 },
                    { cx: 135, cy: 240 },
                    { cx: 225, cy: 190 },
                    { cx: 248, cy: 220 },
                    { cx: 230, cy: 240 },
                  ].map((node, i) => (
                    <circle
                      key={i}
                      cx={node.cx}
                      cy={node.cy}
                      r={3.5 + lungExpansion * 2.5}
                      fill="#ffffff"
                      stroke="#22d3ee"
                      strokeWidth="1.5"
                      className="filter drop-shadow-[0_0_6px_rgba(34,211,238,0.9)]"
                    />
                  ))}
                </g>
              )}

              {/* REALTIME AIRWAY AIR-STREAM PARTICLES */}
              <g>
                <path d="M 190 70 L 190 160 M 190 160 L 165 195 M 190 160 L 215 195" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="2" strokeDasharray="3 3" />
                {phaseId === 'inhale' && (
                  <g className="animate-pulse">
                    <circle cx="190" cy="80" r="3.5" fill="#ffffff" />
                    <circle cx="190" cy="115" r="3" fill="#22d3ee" />
                    <circle cx="190" cy="150" r="3" fill="#22d3ee" />
                    <circle cx="170" cy="185" r="2.5" fill="#22d3ee" />
                    <circle cx="210" cy="185" r="2.5" fill="#22d3ee" />
                  </g>
                )}
                {phaseId === 'exhale' && (
                  <g className="animate-pulse">
                    <circle cx="170" cy="185" r="2.5" fill="#34d399" />
                    <circle cx="210" cy="185" r="2.5" fill="#34d399" />
                    <circle cx="190" cy="145" r="3" fill="#34d399" />
                    <circle cx="190" cy="105" r="3" fill="#34d399" />
                    <circle cx="190" cy="75" r="3.5" fill="#ffffff" />
                  </g>
                )}
              </g>

              {/* DYNAMIC DIAPHRAGM MUSCULAR DOME (Moves down 35mm on inhale, curves up on exhale) */}
              {(activeLayer === 'all' || activeLayer === 'diaphragm') && (
                <g className="cursor-pointer" onClick={() => setSelectedOrgan('diaphragm')}>
                  {/* Muscular Dome Ribbon */}
                  <path
                    d={`M 110 ${255 + diaphragmShiftY * 0.35} Q 190 ${diaphragmCurve}, 270 ${255 + diaphragmShiftY * 0.35}`}
                    stroke="url(#diaphragmGold)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                    className="filter drop-shadow-[0_0_12px_rgba(245,158,11,0.95)]"
                  />
                  {/* Lower Tension Arch */}
                  <path
                    d={`M 120 ${262 + diaphragmShiftY * 0.35} Q 190 ${diaphragmCurve + 8}, 260 ${262 + diaphragmShiftY * 0.35}`}
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="2 3"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.8"
                  />

                  {/* Real-time Dynamic Motion Vector Arrow on Diaphragm */}
                  {phaseId === 'inhale' && (
                    <g transform={`translate(190, ${diaphragmCurve + 14})`}>
                      <line x1="0" y1="-8" x2="0" y2="16" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
                      <polyline points="-5,10 0,16 5,10" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      <text x="10" y="8" fill="#fef08a" fontSize="10" fontWeight="bold" fontFamily="monospace">
                        35mm 하강
                      </text>
                    </g>
                  )}
                  {phaseId === 'exhale' && (
                    <g transform={`translate(190, ${diaphragmCurve + 18})`}>
                      <line x1="0" y1="14" x2="0" y2="-10" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
                      <polyline points="-5,-4 0,-10 5,-4" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      <text x="10" y="5" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">
                        상승 이완
                      </text>
                    </g>
                  )}
                </g>
              )}

              {/* VAGUS NERVE BIO-ELECTRIC PATHWAY */}
              {(activeLayer === 'all' || activeLayer === 'vagus') && (
                <g className="cursor-pointer" onClick={() => setSelectedOrgan('vagus')}>
                  <path
                    d="M 184 90 C 182 140, 178 190, 182 245 C 185 280, 180 330, 182 390"
                    stroke="url(#vagusElectric)"
                    strokeWidth={vagusActivity > 0.7 ? 3 : 1.8}
                    strokeDasharray={vagusActivity > 0.7 ? 'none' : '4 3'}
                    fill="none"
                    className="filter drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  />
                  <path
                    d="M 196 90 C 198 140, 202 190, 198 245 C 195 280, 200 330, 198 390"
                    stroke="url(#vagusElectric)"
                    strokeWidth={vagusActivity > 0.7 ? 3 : 1.8}
                    strokeDasharray={vagusActivity > 0.7 ? 'none' : '4 3'}
                    fill="none"
                    className="filter drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  />
                  <circle cx="182" cy="245" r="4" fill="#34d399" className="animate-ping" style={{ animationDuration: '1.8s' }} />
                  <circle cx="198" cy="245" r="4" fill="#34d399" className="animate-ping" style={{ animationDuration: '1.8s' }} />
                </g>
              )}

              {/* ABDOMINAL WALL EXPANSION RIMS (Belly Breathing) */}
              <g>
                <path
                  d={`M 90 270 C ${80 - bellyBulge * 22} 315, ${80 - bellyBulge * 25} 355, 115 395`}
                  stroke={phaseId === 'inhale' ? '#38bdf8' : '#34d399'}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={`M 290 270 C ${300 + bellyBulge * 22} 315, ${300 + bellyBulge * 25} 355, 265 395`}
                  stroke={phaseId === 'inhale' ? '#38bdf8' : '#34d399'}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>

              {/* MEDICAL HOLOGRAPHIC TARGET CROSSHAIRS */}
              {/* Target 1: Clavicle / Shoulders */}
              <circle cx="68" cy="140" r="5" fill="#2dd4bf" stroke="#ffffff" strokeWidth="1.2" />
              <line x1="68" y1="140" x2="35" y2="130" stroke="#2dd4bf" strokeWidth="1" strokeDasharray="2 2" />

              {/* Target 2: Diaphragm Dome */}
              <circle cx="150" cy={diaphragmCurve} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.2" />
              <line x1="150" y1={diaphragmCurve} x2="305" y2={diaphragmCurve - 10} stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />

              {/* Target 3: Abdomen */}
              <circle cx={80 - bellyBulge * 20} cy="335" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.2" />
              <line x1={80 - bellyBulge * 20} y1="335" x2="35" y2="335" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />

              {/* Header Telemetry Text Inside SVG */}
              <text x="20" y="32" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" opacity="0.9">
                [X-RAY // CT-RADIOLOGICAL ACTIVE]
              </text>
              <text x="250" y="32" fill="#94a3b8" fontSize="9" fontFamily="monospace" opacity="0.7">
                FR: 60FPS · 8K
              </text>
            </svg>

            {/* Floating Live State Badges */}
            <div className="absolute left-2.5 top-11 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-teal-500/50 text-teal-300 text-[10px] font-bold shadow-lg flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>어깨 축: 안정 고정 (들썩임 ❌)</span>
            </div>

            <div className="absolute right-2.5 top-24 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-amber-500/60 text-amber-300 text-[10px] font-bold shadow-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>
                횡격막: {phaseId === 'inhale' ? '⬇️ 35mm 하강 (압력 생성)' : '⬆️ 상승 이완 (수축)'}
              </span>
            </div>

            <div className="absolute left-2.5 bottom-6 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-sky-500/50 text-sky-300 text-[10px] font-bold shadow-lg">
              복부: {phaseId === 'inhale' ? '↔️ 전방 복식 팽창' : '🔄 척추 쪽 수축'}
            </div>
          </div>
        </div>

        {/* Right Side: Biomechanical Guidance & Organ Detail Explorer */}
        <div className="lg:col-span-3 space-y-3 order-3">
          {/* Posture Checklist Card */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2.5">
            <div className="font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>생체역학 호흡 체크포인트</span>
            </div>
            <div className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">1.</span>
                <span><strong>경추 중립:</strong> 턱을 살짝 당겨 뒷목을 펴고 정수리를 천장으로 밀어 올립니다.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">2.</span>
                <span><strong>어깨 축 하강:</strong> 쇄골과 승모근이 위로 들썩이면 뇌가 산소 결핍으로 오인합니다.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">3.</span>
                <span><strong>횡격막 피스톤:</strong> 횡격막이 바닥 쪽으로 주사기 피스톤처럼 내려앉는 감각에 집중합니다.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">4.</span>
                <span><strong>미주신경 자극:</strong> 날숨을 들숨보다 길게 내쉴 때 심장 박동이 서서히 잦아듭니다.</span>
              </div>
            </div>
          </div>

          {/* Organ Detail Inspector Box */}
          <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-800/50 text-xs space-y-2">
            <div className="flex items-center justify-between text-teal-300 font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-teal-400" />
                <span>{currentOrganInfo?.title || '횡격막 생체 기전'}</span>
              </span>
              <span className="text-[10px] text-teal-400/80 font-normal">터치하여 탐색</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {currentOrganInfo?.desc ||
                '횡격막(가로막)은 흉강과 복강을 가르는 돔형 근육으로, 호흡 시 하강하며 내장기를 마사지하고 림프액 순환을 촉진합니다.'}
            </p>
            <div className="pt-1.5 border-t border-teal-800/40 text-[11px] font-semibold text-amber-300">
              💡 {currentOrganInfo?.role || '현재 횡격막이 폐포 음압을 형성하고 있습니다.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
