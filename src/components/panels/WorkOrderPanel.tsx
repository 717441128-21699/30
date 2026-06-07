import { Wrench, CheckCircle, Clock, User, AlertCircle } from 'lucide-react';
import { useBankStore } from '@/store/useBankStore';
import { cn } from '@/utils';
import type { WorkOrderStatus } from '@/types';

const statusMap: Record<WorkOrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: '待处理', color: 'orange', icon: Clock },
  assigned: { label: '已分配', color: 'cyan', icon: User },
  inProgress: { label: '处理中', color: 'blue', icon: Wrench },
  resolved: { label: '已解决', color: 'emerald', icon: CheckCircle },
};

export default function WorkOrderPanel() {
  const workOrders = useBankStore((s) => s.workOrders);
  const updateStatus = useBankStore((s) => s.updateWorkOrderStatus);

  return (
    <div className="hud-panel rounded-lg p-1 relative overflow-hidden">
      <div className="corner-decoration corner-tl" />
      <div className="corner-decoration corner-tr" />
      <div className="corner-decoration corner-bl" />
      <div className="corner-decoration corner-br" />
      <div className="hud-panel-title px-3 py-2 flex items-center gap-2 mb-2 rounded">
        <Wrench className="w-4 h-4 text-cyan-400" />
        <span className="font-orbitron text-sm text-cyan-200 tracking-wider">设备工单</span>
        <span className="ml-auto px-1.5 py-0.5 text-[10px] bg-orange-500/30 border border-orange-500/50 rounded text-orange-300 font-orbitron">
          {workOrders.filter((w) => w.status !== 'resolved').length}
        </span>
      </div>
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto px-1 pb-1">
        {workOrders.map((w) => {
          const status = statusMap[w.status];
          const StatusIcon = status.icon;
          return (
            <div
              key={w.id}
              className="rounded bg-slate-900/40 border border-slate-700/50 px-2 py-1.5"
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <AlertCircle className="w-3 h-3 text-orange-400 flex-shrink-0" />
                  <span className="text-xs text-cyan-200 font-medium truncate">{w.deviceName}</span>
                </div>
                <span
                  className={cn(
                    'text-[9px] px-1.5 py-0.5 rounded font-orbitron whitespace-nowrap',
                    status.color === 'orange' && 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
                    status.color === 'cyan' && 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
                    status.color === 'blue' && 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
                    status.color === 'emerald' && 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  )}
                >
                  <StatusIcon className="w-2.5 h-2.5 inline mr-0.5" />
                  {status.label}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{w.issue}</div>
              {w.assignee && (
                <div className="text-[9px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <User className="w-2.5 h-2.5" />
                  {w.assignee}
                </div>
              )}
              {w.status !== 'resolved' && (
                <div className="flex gap-1 mt-1.5">
                  <button
                    onClick={() =>
                      updateStatus(
                        w.id,
                        w.status === 'pending' ? 'assigned' : w.status === 'assigned' ? 'inProgress' : 'resolved',
                        w.status === 'pending' ? '张柜员' : w.assignee
                      )
                    }
                    className="flex-1 py-0.5 text-[9px] rounded bg-cyan-900/40 border border-cyan-700/50 text-cyan-300 font-orbitron hover:bg-cyan-800/50"
                  >
                    {w.status === 'pending' ? '分配' : w.status === 'assigned' ? '开始' : '完成'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
