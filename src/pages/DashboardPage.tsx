import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useNavigate } from 'react-router-dom';
import { Building2, LogOut, FileBarChart, Bell, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import BankScene from '@/components/scene3d/BankScene';
import QueuePanel from '@/components/panels/QueuePanel';
import ForecastPanel from '@/components/panels/ForecastPanel';
import EmergencyPanel from '@/components/panels/EmergencyPanel';
import WorkOrderPanel from '@/components/panels/WorkOrderPanel';
import NotificationPanel from '@/components/panels/NotificationPanel';
import ATMPanel from '@/components/panels/ATMPanel';
import VIPPanel from '@/components/panels/VIPPanel';
import { useUserStore } from '@/store/useUserStore';
import { useBankStore } from '@/store/useBankStore';
import { cn, roleLabel } from '@/utils';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.currentUser);
  const logout = useUserStore((s) => s.logout);
  const notifications = useBankStore((s) => s.notifications);
  const emergency = useBankStore((s) => s.emergency);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const unread = notifications.filter((n) => !n.read).length;

  if (!user) return null;

  return (
    <div className={cn('w-full h-full relative flex flex-col', emergency.active && 'emergency-active')}>
      <header className="relative z-20 h-14 hud-panel flex items-center justify-between px-4 border-b border-cyan-900/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLeftOpen(!leftOpen)}
            className="w-8 h-8 rounded border border-cyan-800/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-900/40 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-cyan-400" />
            <div>
              <h1 className="font-orbitron text-lg text-cyan-200 leading-none tracking-wider">
                智慧银行运营调度中心
              </h1>
              <p className="text-[10px] text-cyan-500 font-orbitron tracking-widest">
                INTELLIGENT BANK CONTROL CENTER
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded border border-cyan-800/50 bg-cyan-950/30">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-glow-green" />
            <span className="text-[11px] text-cyan-300 font-orbitron">系统运行正常</span>
            <div className="w-px h-4 bg-cyan-800/50" />
            <span className="text-[11px] text-slate-400">
              {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}
            </span>
          </div>

          <button
            onClick={() => navigate('/reports')}
            className="w-9 h-9 rounded border border-cyan-800/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-900/40 transition-colors"
            title="日报报表"
          >
            <FileBarChart className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="w-9 h-9 rounded border border-cyan-800/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-900/40 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unread}
                </span>
              )}
            </button>
            {showNotif && (
              <div className="absolute right-0 top-12 w-80 z-50">
                <NotificationPanel />
              </div>
            )}
          </div>

          <button
            onClick={() => setRightOpen(!rightOpen)}
            className="w-8 h-8 rounded border border-cyan-800/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-900/40 transition-colors md:hidden"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 pl-2 ml-1 border-l border-cyan-800/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-glow-blue">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-cyan-200 leading-tight">{user.name}</div>
              <div className="text-[9px] text-cyan-500 font-orbitron tracking-wider">{roleLabel(user.role)}</div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="w-8 h-8 rounded border border-red-900/50 flex items-center justify-center text-red-400 hover:bg-red-900/40 transition-colors"
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex relative overflow-hidden">
        {leftOpen && (
          <aside className="absolute left-0 top-0 bottom-0 w-80 z-10 p-2 space-y-2 overflow-y-auto pointer-events-auto">
            <QueuePanel />
            <ATMPanel />
            <ForecastPanel />
          </aside>
        )}

        <main className="flex-1 relative">
          <Canvas
            shadows
            camera={{ position: [10, 10, 12], fov: 50 }}
            gl={{ antialias: true, alpha: false }}
          >
            <BankScene />
            <EffectComposer multisampling={0} enableNormalPass={true}>
              <Bloom
                intensity={0.8}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                mipmapBlur
              />
              <Vignette eskil={false} offset={0.15} darkness={0.6} />
            </EffectComposer>
          </Canvas>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {[
              { label: '营业大厅', pos: 'bg-cyan-600/60' },
              { label: '自助区', pos: 'bg-blue-600/60' },
              { label: 'VIP室', pos: 'bg-emerald-600/60' },
              { label: '金库', pos: 'bg-yellow-600/60' },
              { label: '监控中心', pos: 'bg-fuchsia-600/60' },
            ].map((r, i) => (
              <div
                key={i}
                className={`${r.pos} px-3 py-1 rounded border border-white/20 text-[10px] font-orbitron text-white backdrop-blur-sm`}
              >
                {r.label}
              </div>
            ))}
          </div>

          {emergency.active && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-red-600/90 border-2 border-red-300 rounded-lg px-6 py-2 animate-pulse shadow-glow-red">
                <div className="font-orbitron text-white font-bold text-center tracking-wider text-lg">
                  ⚠ 紧急警报 - {emergency.type === 'fire' ? '火警' : emergency.type === 'robbery' ? '抢劫' : emergency.type === 'intrusion' ? '非法入侵' : '紧急情况'} ⚠
                </div>
                <div className="text-[11px] text-red-100 text-center font-orbitron">
                  全部门已锁闭 · 疏散路径已生成 · 警方支援已通知
                </div>
              </div>
            </div>
          )}
        </main>

        {rightOpen && (
          <aside className="absolute right-0 top-0 bottom-0 w-80 z-10 p-2 space-y-2 overflow-y-auto pointer-events-auto">
            <EmergencyPanel />
            <VIPPanel />
            <WorkOrderPanel />
          </aside>
        )}
      </div>
    </div>
  );
}
