import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Waves, CloudRain, Bell, Sparkles, Radio, Mic, ChevronUp, ChevronDown } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { SoundscapeState } from '../types/breathing';

interface SoundscapeMixerProps {
  soundState: SoundscapeState;
  onUpdateSoundState: (updater: (prev: SoundscapeState) => SoundscapeState) => void;
}

export const SoundscapeMixer: React.FC<SoundscapeMixerProps> = ({ soundState, onUpdateSoundState }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (soundState.isPlaying) {
      soundEngine.startSoundscapes({
        ocean: soundState.oceanVolume,
        rain: soundState.rainVolume,
        bowl: soundState.bowlVolume,
        binaural: soundState.binauralVolume,
        master: soundState.masterVolume,
      });
    } else {
      soundEngine.stopSoundscapes();
    }
  }, [
    soundState.isPlaying,
    soundState.oceanVolume,
    soundState.rainVolume,
    soundState.bowlVolume,
    soundState.binauralVolume,
    soundState.masterVolume,
  ]);

  const toggleSoundscape = () => {
    soundEngine.ensureContext();
    onUpdateSoundState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleSliderChange = (key: keyof SoundscapeState, value: number) => {
    soundEngine.ensureContext();
    onUpdateSoundState((prev) => ({
      ...prev,
      [key]: value,
      isPlaying: prev.isPlaying || value > 0,
    }));
  };

  const toggleBoolean = (key: 'chimesEnabled' | 'voiceGuide') => {
    soundEngine.ensureContext();
    onUpdateSoundState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl transition-all duration-300">
      {/* Top Header Row */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSoundscape}
            className={`p-2 rounded-xl transition-all ${
              soundState.isPlaying
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50'
            }`}
            title={soundState.isPlaying ? '사운드스케이프 일시정지' : '사운드스케이프 재생'}
            aria-label="Soundscape toggle"
          >
            {soundState.isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <div>
            <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span>자연 앰비언트 사운드스케이프</span>
              <span className="text-xs text-slate-500 font-normal">
                {soundState.isPlaying ? '재생 중' : '정지됨'}
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              파도 · 빗소리 · 싱잉볼 · 432Hz 힐링 주파수
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Master Volume Slider */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-slate-400">마스터 볼륨</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundState.masterVolume}
              onChange={(e) => handleSliderChange('masterVolume', parseFloat(e.target.value))}
              className="w-20 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-xs tabular-nums text-slate-400 w-8">
              {Math.round(soundState.masterVolume * 100)}%
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-medium px-3 py-1.5 rounded-lg bg-teal-950/40 border border-teal-800/50 transition-colors"
          >
            <span>믹서 조절</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Mixer Controls */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Ocean */}
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Waves className="w-4 h-4 text-cyan-400" />
                바다 파도
              </span>
              <span className="text-xs tabular-nums text-slate-400">
                {Math.round(soundState.oceanVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundState.oceanVolume}
              onChange={(e) => handleSliderChange('oceanVolume', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Rain */}
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <CloudRain className="w-4 h-4 text-blue-400" />
                숲속의 비
              </span>
              <span className="text-xs tabular-nums text-slate-400">
                {Math.round(soundState.rainVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundState.rainVolume}
              onChange={(e) => handleSliderChange('rainVolume', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Tibetan Bowl */}
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                티베탄 싱잉볼
              </span>
              <span className="text-xs tabular-nums text-slate-400">
                {Math.round(soundState.bowlVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundState.bowlVolume}
              onChange={(e) => handleSliderChange('bowlVolume', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* 432Hz Drone */}
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Radio className="w-4 h-4 text-purple-400" />
                432Hz 바이노럴
              </span>
              <span className="text-xs tabular-nums text-slate-400">
                {Math.round(soundState.binauralVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundState.binauralVolume}
              onChange={(e) => handleSliderChange('binauralVolume', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Toggles Row */}
          <div className="col-span-full flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleBoolean('chimesEnabled')}
                className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  soundState.chimesEnabled
                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>호흡 전환 싱잉볼 차임음 ({soundState.chimesEnabled ? '켜짐' : '꺼짐'})</span>
              </button>

              <button
                onClick={() => toggleBoolean('voiceGuide')}
                className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  soundState.voiceGuide
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>한국어 음성 코칭 안내 ({soundState.voiceGuide ? '켜짐' : '꺼짐'})</span>
              </button>
            </div>

            <div className="text-xs text-slate-500">
              * 이어폰 착용 시 432Hz 바이노럴 세타파 효과가 극대화됩니다.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
