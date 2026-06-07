import { AlertTriangle, Users, Plus, Minus, Power } from 'lucide-react';
import { useBankStore } from '@/store/useBankStore';
import { cn } from '@/utils';
import { useUserStore } from '@/store/useUserStore';

export default function QueuePanel() {
  const counters = useBankStore((s) => s.counters);
  const adjustQueue = useBankStore((s) => s.adjustQueueCount);
  const activateBackup = useBankStore((s) => s.activateBackupCounter);
  const user = useUserStore((s) => s.currentUser);
  const canManage = user?.role === 'supervisor' || user?.role === 'operation';

  return (
    <div className="hud-panel rounded-lg p-1 relative overflow-hidden">
      <div className="corner-decoration corner-tl" />
      <div className="corner-decoration corner-tr" />
      <div className="corner-decoration corner-bl" />
      <div className="corner-decoration corner-br" />
      <div className="hud-panel-title px-3 py-2 flex items-center gap-2 mb-2 rounded">
        <Users className="w-4 h-4 text-cyan-400" />
        <span className="font-orbitron text-sm text-cyan-200 tracking-wider">柜台排队调度</span>
      </div>
      <div className="space-y-1.5 max-h-[280px] overflow-y-auto px-1 pb-1">
        {counters.map((c) => {
          const overloaded = c.queueCount >= 10;
          return (
            <div
              key={c.id}
              className={cn(
                'rounded px-2 py-1.5 flex items-center justify-between gap-2 border transition-all',
                overloaded
                  ? 'bg-red-950/50 border-red-500/50 animate-pulse'
                  : c.isBackup
                  ? c.isActive
                    ? 'bg-orange-950/40 border-orange-500/40'
                    : 'bg-slate-900/40 border-slate-600/40'
                  : 'bg-slate-900/40 border-cyan-900/50'
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={cn(
                    'w-8 h-8 rounded flex items-center justify-center font-orbitron text-xs font-bold',
                    overloaded
                      ? 'bg-red-500/30 text-red-200 border border-red-400'
                      : c.isBackup
                      ? c.isActive
                        ? 'bg-orange-500/30 text-orange-200 border border-orange-400'
                        : 'bg-slate-700/50 text-slate-300 border border-slate-500'
                      : 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50'
                  )}
                >
                  {c.number}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-slate-300 leading-tight">
                    {c.isBackup ? '备用' : '营业'}窗口
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={cn(
                        'font-orbitron text-base font-bold',
                        overloaded ? 'text-red-300' : c.isActive ? 'text-cyan-300' : 'text-slate-500'
                      )}
                    >
                      {c.queueCount}
                    </span>
                    <span className="text-[10px] text-slate-400">人排队</span>
                    {overloaded && <AlertTriangle className="w-3 h-3 text-red-400 animate-bounce" />}
                  </div>
                </div>
              </div>
              {c.isActive && (
                <div className="flex gap-1">
                  <button
                    onClick={() => adjustQueue(c.id, -1)}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 flex items-center justify-center transition-colors"
                    title="减少1人"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => adjustQueue(c.id, 1)}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 flex items-center justify-center transition-colors"
                    title="增加1人"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
              {!c.isActive && c.isBackup && canManage && (
                <button
                  onClick={() => activateBackup(c.id)}
                  className="btn-glow px-2 py-1 rounded text-[10px] font-orbitron bg-orange-600/40 border border-orange-400/60 text-orange-200 flex items-center gap-1 hover:bg-orange-500/50"
                >
                  <Power className="w-3 h-3" />
                  启用
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
