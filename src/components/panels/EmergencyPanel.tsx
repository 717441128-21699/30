import { AlertTriangle, Lock, Shield, Siren, XCircle, Flame, Skull, Eye } from 'lucide-react';
import { useBankStore } from '@/store/useBankStore';
import type { EmergencyType } from '@/types';
import { useUserStore } from '@/store/useUserStore';
import { cn } from '@/utils';

const emergencyTypes: { type: EmergencyType; label: string; icon: typeof Flame; color: string }[] = [
  { type: 'fire', label: '火警', icon: Flame, color: 'orange' },
  { type: 'robbery', label: '抢劫', icon: Skull, color: 'red' },
  { type: 'intrusion', label: '入侵', icon: Eye, color: 'purple' },
  { type: 'other', label: '紧急', icon: AlertTriangle, color: 'yellow' },
];

export default function EmergencyPanel() {
  const emergency = useBankStore((s) => s.emergency);
  const triggerEmergency = useBankStore((s) => s.triggerEmergency);
  const resolveEmergency = useBankStore((s) => s.resolveEmergency);
  const vault = useBankStore((s) => s.vault);
  const tryVaultAccess = useBankStore((s) => s.tryVaultAccess);
  const clearVaultAlert = useBankStore((s) => s.clearVaultAlert);
  const user = useUserStore((s) => s.currentUser);
  const canManage = user?.role === 'supervisor' || user?.role === 'operation';

  return (
    <div className={cn('hud-panel rounded-lg p-1 relative overflow-hidden', emergency.active && 'emergency-active')}>
      <div className="corner-decoration corner-tl" />
      <div className="corner-decoration corner-tr" />
      <div className="corner-decoration corner-bl" />
      <div className="corner-decoration corner-br" />
      <div
        className={cn(
          'hud-panel-title px-3 py-2 flex items-center gap-2 mb-2 rounded',
          emergency.active && 'border-red-500 !bg-red-950/60'
        )}
        style={emergency.active ? { borderLeftColor: '#ff4757' } : {}}
      >
        <Siren className={cn('w-4 h-4', emergency.active ? 'text-red-400 animate-pulse' : 'text-cyan-400')} />
        <span className={cn('font-orbitron text-sm tracking-wider', emergency.active ? 'text-red-200' : 'text-cyan-200')}>
          应急指挥中心
        </span>
      </div>
      <div className="px-2 space-y-3">
        <div>
          <div className="text-[10px] text-slate-400 font-orbitron mb-1.5">一键应急启动</div>
          {emergency.active ? (
            <button
              onClick={resolveEmergency}
              disabled={!canManage}
              className="w-full btn-glow py-2.5 rounded bg-emerald-600/40 border border-emerald-400 text-emerald-100 font-orbitron text-sm flex items-center justify-center gap-2 hover:bg-emerald-500/50 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              解除警报
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {emergencyTypes.map(({ type, label, icon: Icon, color }) => (
                <button
                  key={type}
                  onClick={() => canManage && triggerEmergency(type)}
                  disabled={!canManage}
                  className={cn(
                    'btn-glow py-2 rounded border font-orbitron text-[11px] flex flex-col items-center gap-0.5 disabled:opacity-50 transition-all',
                    color === 'red' && 'bg-red-900/40 border-red-500 text-red-200 hover:bg-red-800/50 shadow-glow-red',
                    color === 'orange' && 'bg-orange-900/40 border-orange-500 text-orange-200 hover:bg-orange-800/50',
                    color === 'purple' && 'bg-fuchsia-900/40 border-fuchsia-500 text-fuchsia-200 hover:bg-fuchsia-800/50',
                    color === 'yellow' && 'bg-yellow-900/40 border-yellow-500 text-yellow-200 hover:bg-yellow-800/50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          <div className={cn('rounded border px-2 py-1.5', emergency.doorsLocked ? 'bg-red-950/50 border-red-500/50' : 'bg-slate-900/40 border-slate-700/50')}>
            <div className="flex items-center gap-1">
              <Lock className={cn('w-3 h-3', emergency.doorsLocked ? 'text-red-400' : 'text-slate-400')} />
              <span className={cn('font-orbitron', emergency.doorsLocked ? 'text-red-300' : 'text-slate-300')}>
                大门:{emergency.doorsLocked ? '已锁闭' : '正常'}
              </span>
            </div>
          </div>
          <div className={cn('rounded border px-2 py-1.5', vault.alertActive ? 'bg-red-950/50 border-red-500/50 animate-pulse' : 'bg-slate-900/40 border-slate-700/50')}>
            <div className="flex items-center gap-1">
              <Shield className={cn('w-3 h-3', vault.alertActive ? 'text-red-400 animate-bounce' : 'text-emerald-400')} />
              <span className={cn('font-orbitron', vault.alertActive ? 'text-red-300' : 'text-emerald-300')}>
                金库:{vault.alertActive ? '警报' : '安全'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 font-orbitron mb-1.5">金库访问控制</div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => user && tryVaultAccess(user.id, user.name, true)}
              disabled={!user}
              className="btn-glow py-1.5 rounded bg-emerald-900/40 border border-emerald-500/60 text-emerald-200 font-orbitron text-[10px] hover:bg-emerald-800/50 disabled:opacity-50"
            >
              授权进入
            </button>
            <button
              onClick={() => tryVaultAccess('intruder', '未知人员', false)}
              className="btn-glow py-1.5 rounded bg-red-900/40 border border-red-500/60 text-red-200 font-orbitron text-[10px] hover:bg-red-800/50"
            >
              模拟入侵
            </button>
          </div>
          {vault.alertActive && (
            <button
              onClick={clearVaultAlert}
              className="mt-1.5 w-full py-1.5 rounded bg-slate-800/60 border border-slate-600 text-slate-200 font-orbitron text-[10px] hover:bg-slate-700/60"
            >
              清除警报
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
