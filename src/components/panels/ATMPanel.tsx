import { Banknote, CheckCircle, UserCheck, DollarSign } from 'lucide-react';
import { useBankStore } from '@/store/useBankStore';
import { useUserStore } from '@/store/useUserStore';
import { cn, formatCurrency } from '@/utils';

export default function ATMPanel() {
  const atms = useBankStore((s) => s.atms);
  const confirmTask = useBankStore((s) => s.confirmRefillTask);
  const completeRefill = useBankStore((s) => s.completeRefill);
  const user = useUserStore((s) => s.currentUser);
  const canConfirm = user?.role === 'supervisor' || user?.role === 'operation';

  return (
    <div className="hud-panel rounded-lg p-1 relative overflow-hidden">
      <div className="corner-decoration corner-tl" />
      <div className="corner-decoration corner-tr" />
      <div className="corner-decoration corner-bl" />
      <div className="corner-decoration corner-br" />
      <div className="hud-panel-title px-3 py-2 flex items-center gap-2 mb-2 rounded">
        <Banknote className="w-4 h-4 text-cyan-400" />
        <span className="font-orbitron text-sm text-cyan-200 tracking-wider">ATM现金管理</span>
      </div>
      <div className="space-y-1.5 px-1 pb-1 max-h-[260px] overflow-y-auto">
        {atms.map((atm) => {
          const percent = (atm.cashBalance / atm.maxCapacity) * 100;
          const isLow = atm.status === 'low';
          const isRefilling = atm.status === 'refilling';
          const task = atm.refillTask;
          return (
            <div
              key={atm.id}
              className={cn(
                'rounded border px-2 py-1.5',
                isLow
                  ? 'bg-red-950/40 border-red-500/50 animate-pulse'
                  : isRefilling
                  ? 'bg-blue-950/40 border-blue-500/50'
                  : 'bg-slate-900/40 border-slate-700/50'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-orbitron text-cyan-200 font-bold">{atm.name}</span>
                <span
                  className={cn(
                    'text-[9px] px-1.5 py-0.5 rounded font-orbitron',
                    isLow
                      ? 'bg-red-500/30 text-red-200 border border-red-500/50'
                      : isRefilling
                      ? 'bg-blue-500/30 text-blue-200 border border-blue-500/50'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  )}
                >
                  {isLow ? '余额不足' : isRefilling ? '加钞中' : '正常'}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <DollarSign className={cn('w-3 h-3', isLow ? 'text-red-400' : 'text-emerald-400')} />
                <span className={cn('font-orbitron text-sm font-bold', isLow ? 'text-red-300' : 'text-emerald-300')}>
                  {formatCurrency(atm.cashBalance)}
                </span>
                <span className="text-[9px] text-slate-500">/ {formatCurrency(atm.maxCapacity)}</span>
              </div>
              <div className="w-full h-1 rounded bg-slate-800 overflow-hidden mb-1.5">
                <div
                  className={cn(
                    'h-full rounded transition-all',
                    percent < 30 ? 'bg-red-500' : percent < 60 ? 'bg-orange-500' : 'bg-emerald-500'
                  )}
                  style={{ width: `${percent}%` }}
                />
              </div>
              {isLow && !task && canConfirm && (
                <button
                  onClick={() => user && confirmTask(atm.id, user.id)}
                  className="w-full py-1 text-[10px] rounded bg-blue-600/40 border border-blue-400/60 text-blue-200 font-orbitron hover:bg-blue-500/50 flex items-center justify-center gap-1"
                >
                  <UserCheck className="w-3 h-3" />
                  发起加钞任务
                </button>
              )}
              {task && task.status !== 'completed' && (
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-400 flex items-center justify-between">
                    <span>双人确认: {task.confirmedBy.length}/2</span>
                    <span
                      className={cn(
                        'px-1 rounded',
                        task.status === 'pending'
                          ? 'text-orange-300 bg-orange-500/20'
                          : 'text-cyan-300 bg-cyan-500/20'
                      )}
                    >
                      {task.status === 'pending' ? '待确认' : '已确认'}
                    </span>
                  </div>
                  {task.status === 'pending' && canConfirm && !task.confirmedBy.includes(user?.id || '') && (
                    <button
                      onClick={() => user && confirmTask(atm.id, user.id)}
                      className="w-full py-1 text-[10px] rounded bg-cyan-600/40 border border-cyan-400/60 text-cyan-200 font-orbitron hover:bg-cyan-500/50 flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      我已确认
                    </button>
                  )}
                  {task.status === 'confirmed' && canConfirm && (
                    <button
                      onClick={() => completeRefill(atm.id)}
                      className="w-full py-1 text-[10px] rounded bg-emerald-600/40 border border-emerald-400/60 text-emerald-200 font-orbitron hover:bg-emerald-500/50 flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      完成加钞
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
