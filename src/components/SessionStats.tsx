import React from 'react';
import { Award, Flame, Clock, HeartHandshake, History, TrendingDown, Trash2 } from 'lucide-react';
import { UserProgress } from '../types/breathing';

interface SessionStatsProps {
  progress: UserProgress;
  onClearHistory: () => void;
}

export const SessionStats: React.FC<SessionStatsProps> = ({ progress, onClearHistory }) => {
  // Calculate average stress reduction
  const logsWithDiff = progress.logs.filter((l) => l.preStressLevel && l.postStressLevel);
  const avgReduction =
    logsWithDiff.length > 0
      ? (
          logsWithDiff.reduce((acc, curr) => acc + (curr.preStressLevel - curr.postStressLevel), 0) /
          logsWithDiff.length
        ).toFixed(1)
      : '0.0';

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>나의 호흡 & 릴렉스 여정</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            지속적인 호흡 훈련이 만든 자율신경계 회복 기록입니다.
          </p>
        </div>

        {progress.logs.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-400 transition-colors self-start sm:self-auto"
            title="기록 초기화"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>기록 초기화</span>
          </button>
        )}
      </div>

      {/* 4-Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Minutes */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>누적 호흡 시간</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {progress.totalMinutes}
            <span className="text-sm font-sans text-slate-400 ml-1">분</span>
          </div>
          <div className="text-[11px] text-teal-400/80 mt-1">심신 정화 완료</div>
        </div>

        {/* Streak */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>연속 실천 일수</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {progress.streakDays}
            <span className="text-sm font-sans text-slate-400 ml-1">일째</span>
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">지속적 뇌파 안정</div>
        </div>

        {/* Total Sessions */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <HeartHandshake className="w-4 h-4 text-indigo-400" />
            <span>완료한 세션 수</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {progress.totalSessions}
            <span className="text-sm font-sans text-slate-400 ml-1">회</span>
          </div>
          <div className="text-[11px] text-indigo-400/80 mt-1">호흡 습관 체득</div>
        </div>

        {/* Stress Reduction */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span>평균 스트레스 완화</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            -{avgReduction}
            <span className="text-sm font-sans text-slate-400 ml-1">점</span>
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">즉각적 긴장 완화 효과</div>
        </div>
      </div>

      {/* Recent Session Logs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            최근 호흡 기록
          </span>
          <span className="text-slate-500 font-normal">총 {progress.logs.length}개 기록</span>
        </div>

        {progress.logs.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-xs text-slate-500">
            아직 완료된 호흡 세션이 없습니다. 상단에서 호흡 훈련을 시작해 보세요.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {progress.logs.slice(0, 10).map((log) => {
              const dateStr = new Date(log.timestamp).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{log.patternName}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {dateStr} · {log.completedCycles}세트 ({log.durationSeconds}초)
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">스트레스:</span>
                    <span className="text-rose-400 font-bold">{log.preStressLevel}점</span>
                    <span className="text-slate-600">→</span>
                    <span className="text-teal-400 font-bold">{log.postStressLevel}점</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
