import { Bell, X, AlertTriangle, DollarSign, Shield, Info, Siren, Crown, Wrench, CheckCheck } from 'lucide-react';
import { useBankStore } from '@/store/useBankStore';
import { cn, formatTime } from '@/utils';
import type { NotificationType } from '@/types';

const typeConfig: Record<NotificationType, { color: string; icon: typeof Bell; label: string }> = {
  queue: { color: 'orange', icon: AlertTriangle, label: '排队' },
  refill: { color: 'blue', icon: DollarSign, label: '加钞' },
  alert: { color: 'red', icon: Shield, label: '警报' },
  info: { color: 'cyan', icon: Info, label: '信息' },
  emergency: { color: 'red', icon: Siren, label: '紧急' },
  vip: { color: 'emerald', icon: Crown, label: 'VIP' },
  workorder: { color: 'purple', icon: Wrench, label: '工单' },
};

export default function NotificationPanel() {
  const notifications = useBankStore((s) => s.notifications);
  const markRead = useBankStore((s) => s.markNotificationRead);
  const clearAll = useBankStore((s) => s.clearAllNotifications);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="hud-panel rounded-lg p-1 relative overflow-hidden">
      <div className="corner-decoration corner-tl" />
      <div className="corner-decoration corner-tr" />
      <div className="corner-decoration corner-bl" />
      <div className="corner-decoration corner-br" />
      <div className="hud-panel-title px-3 py-2 flex items-center gap-2 mb-2 rounded">
        <Bell className="w-4 h-4 text-cyan-400" />
        <span className="font-orbitron text-sm text-cyan-200 tracking-wider">通知中心</span>
        {unread > 0 && (
          <span className="ml-auto px-1.5 py-0.5 text-[10px] bg-red-500/30 border border-red-500/60 rounded-full text-red-200 font-orbitron animate-pulse">
            {unread}
          </span>
        )}
        {unread > 0 && (
          <button
            onClick={clearAll}
            className="ml-1 text-[9px] px-1.5 py-0.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-800 flex items-center gap-0.5"
          >
            <CheckCheck className="w-2.5 h-2.5" />
            全部已读
          </button>
        )}
      </div>
      <div className="space-y-1 max-h-[180px] overflow-y-auto px-1 pb-1">
        {notifications.length === 0 && (
          <div className="text-center text-slate-500 text-xs py-4">暂无通知</div>
        )}
        {notifications.map((n) => {
          const cfg = typeConfig[n.type];
          const Icon = cfg.icon;
          return (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={cn(
                'relative rounded px-2 py-1.5 cursor-pointer transition-all border',
                n.read
                  ? 'bg-slate-900/20 border-slate-800/50 opacity-60'
                  : cfg.color === 'red'
                  ? 'bg-red-950/40 border-red-500/40'
                  : cfg.color === 'orange'
                  ? 'bg-orange-950/40 border-orange-500/40'
                  : cfg.color === 'blue'
                  ? 'bg-blue-950/40 border-blue-500/40'
                  : cfg.color === 'emerald'
                  ? 'bg-emerald-950/40 border-emerald-500/40'
                  : cfg.color === 'purple'
                  ? 'bg-fuchsia-950/40 border-fuchsia-500/40'
                  : 'bg-cyan-950/40 border-cyan-500/40'
              )}
            >
              <div className="flex items-start gap-1.5">
                <Icon
                  className={cn(
                    'w-3.5 h-3.5 mt-0.5 flex-shrink-0',
                    cfg.color === 'red' && 'text-red-400',
                    cfg.color === 'orange' && 'text-orange-400',
                    cfg.color === 'blue' && 'text-blue-400',
                    cfg.color === 'emerald' && 'text-emerald-400',
                    cfg.color === 'purple' && 'text-fuchsia-400',
                    cfg.color === 'cyan' && 'text-cyan-400'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-slate-200">{n.title}</span>
                    <span className="text-[9px] text-slate-500 ml-auto">{formatTime(n.timestamp)}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{n.message}</div>
                </div>
                {!n.read && (
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 animate-pulse flex-shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
