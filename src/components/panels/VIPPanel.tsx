import { Crown, Clock, UserPlus, TimerReset } from 'lucide-react';
import { useBankStore } from '@/store/useBankStore';
import { useUserStore } from '@/store/useUserStore';
import { cn, formatTime } from '@/utils';

const statusLabel: Record<string, { text: string; color: string }> = {
  waiting: { text: '等待中', color: 'orange' },
  guided: { text: '引导中', color: 'cyan' },
  serving: { text: '服务中', color: 'emerald' },
  timeout: { text: '已超时', color: 'red' },
};

export default function VIPPanel() {
  const vips = useBankStore((s) => s.vipCustomers);
  const addVIP = useBankStore((s) => s.addVIPCustomer);
  const updateStatus = useBankStore((s) => s.updateVIPStatus);
  const releaseTimeout = useBankStore((s) => s.releaseVIPTimeout);
  const user = useUserStore((s) => s.currentUser);
  const canManage = user?.role === 'supervisor' || user?.role === 'operation';

  return (
    <div className="hud-panel rounded-lg p-1 relative overflow-hidden">
      <div className="corner-decoration corner-tl" />
      <div className="corner-decoration corner-tr" />
      <div className="corner-decoration corner-bl" />
      <div className="corner-decoration corner-br" />
      <div className="hud-panel-title px-3 py-2 flex items-center gap-2 mb-2 rounded">
        <Crown className="w-4 h-4 text-emerald-400" />
        <span className="font-orbitron text-sm text-cyan-200 tracking-wider">VIP客户服务</span>
      </div>
      <div className="px-1 pb-1 space-y-1.5 max-h-[200px] overflow-y-auto">
        {canManage && (
          <button
            onClick={() =>
              addVIP({
                name: `VIP客户${Math.floor(Math.random() * 100)}`,
                appointmentTime: new Date(),
                guidePath: [
                  [0, 0.15, 0],
                  [6, 0.15, 0],
                  [6, 0.15, 5],
                ],
              })
            }
            className="w-full py-1.5 text-[11px] rounded bg-emerald-600/30 border border-emerald-400/60 text-emerald-200 font-orbitron hover:bg-emerald-500/40 flex items-center justify-center gap-1 mb-2"
          >
            <UserPlus className="w-3.5 h-3.5" />
            新增VIP预约
          </button>
        )}
        {vips.length === 0 && <div className="text-center text-slate-500 text-xs py-3">暂无VIP客户</div>}
        {vips.map((v) => {
          const st = statusLabel[v.status];
          return (
            <div
              key={v.id}
              className={cn(
                'rounded border px-2 py-1.5',
                st.color === 'orange' && 'bg-orange-950/30 border-orange-500/40',
                st.color === 'cyan' && 'bg-cyan-950/30 border-cyan-500/40',
                st.color === 'emerald' && 'bg-emerald-950/30 border-emerald-500/40',
                st.color === 'red' && 'bg-red-950/30 border-red-500/40'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 min-w-0">
                  <Crown className={cn('w-3 h-3 flex-shrink-0',
                    st.color === 'orange' && 'text-orange-400',
                    st.color === 'cyan' && 'text-cyan-400',
                    st.color === 'emerald' && 'text-emerald-400',
                    st.color === 'red' && 'text-red-400'
                  )} />
                  <span className="text-xs text-slate-200 font-medium truncate">{v.name}</span>
                </div>
                <span
                  className={cn(
                    'text-[9px] px-1.5 py-0.5 rounded font-orbitron',
                    st.color === 'orange' && 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
                    st.color === 'cyan' && 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
                    st.color === 'emerald' && 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
                    st.color === 'red' && 'bg-red-500/20 text-red-300 border border-red-500/40'
                  )}
                >
                  {st.text}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[9px] text-slate-500">
                <span className="flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {formatTime(v.appointmentTime)}
                </span>
                <span className="font-orbitron text-slate-600">{v.appointmentId.slice(-6)}</span>
              </div>
              {v.status === 'waiting' && (
                <button
                  onClick={() => updateStatus(v.id, 'guided')}
                  className="mt-1.5 w-full py-1 text-[10px] rounded bg-cyan-600/30 border border-cyan-500/50 text-cyan-200 font-orbitron hover:bg-cyan-500/40"
                >
                  开始引导 (显示路径)
                </button>
              )}
              {v.status === 'guided' && (
                <button
                  onClick={() => updateStatus(v.id, 'serving')}
                  className="mt-1.5 w-full py-1 text-[10px] rounded bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 font-orbitron hover:bg-emerald-500/40"
                >
                  开始服务
                </button>
              )}
            </div>
          );
        })}
        {vips.length > 0 && (
          <button
            onClick={releaseTimeout}
            className="mt-1 w-full py-1 text-[10px] rounded bg-slate-800/60 border border-slate-600 text-slate-300 font-orbitron hover:bg-slate-700/60 flex items-center justify-center gap-1"
          >
            <TimerReset className="w-3 h-3" />
            释放超时预约
          </button>
        )}
      </div>
    </div>
  );
}
