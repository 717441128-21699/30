import { useState } from 'react';
import { Camera, Shield, User2, ChevronRight, Fingerprint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import type { UserRole } from '@/types';
import { cn, roleLabel } from '@/utils';

const roles: { role: UserRole; label: string; desc: string; color: string }[] = [
  { role: 'teller', label: '柜员', desc: '查看柜台、处理业务', color: 'cyan' },
  { role: 'supervisor', label: '主管', desc: '排班调整、应急指挥', color: 'purple' },
  { role: 'operation', label: '运营部', desc: '全网调度、报表导出', color: 'emerald' },
];

const roleUsers: Record<UserRole, string[]> = {
  teller: ['张柜员', '李柜员'],
  supervisor: ['王主管'],
  operation: ['赵经理'],
};

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useUserStore((s) => s.login);
  const [selectedRole, setSelectedRole] = useState<UserRole>('supervisor');
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedUser, setSelectedUser] = useState<string>('王主管');

  const handleLogin = async () => {
    setScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((p) => Math.min(p + 8, 100));
    }, 80);
    const success = await login(selectedRole, selectedUser);
    clearInterval(interval);
    setScanProgress(100);
    setTimeout(() => {
      setScanning(false);
      if (success) navigate('/');
    }, 300);
  };

  return (
    <div className="w-full h-full flex items-center justify-center grid-bg relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan-400/40 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      <div className="relative z-10 w-full max-w-4xl mx-4">
        <div className="text-center mb-8">
          <h1 className="font-orbitron text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent mb-3 tracking-wider">
            3D智慧银行
          </h1>
          <p className="font-orbitron text-lg text-cyan-400/80 tracking-widest">
            网点运营与安全调度可视化平台
          </p>
          <div className="w-64 h-0.5 mx-auto mt-4 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
        </div>

        <div className="hud-panel rounded-xl p-6 relative">
          <div className="corner-decoration corner-tl" />
          <div className="corner-decoration corner-tr" />
          <div className="corner-decoration corner-bl" />
          <div className="corner-decoration corner-br" />

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-56 h-56 rounded-full border-4 border-cyan-500/40 flex items-center justify-center bg-slate-950/50 relative overflow-hidden scanline-overlay">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" style={{ boxShadow: 'inset 0 0 40px rgba(0,212,255,0.2)' }} />
                  <div className="absolute inset-4 rounded-full border border-cyan-400/30" />
                  <div className="absolute inset-8 rounded-full border border-cyan-400/20" />
                  {scanning && (
                    <div
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                      style={{
                        top: `${scanProgress}%`,
                        boxShadow: '0 0 15px #00d4ff, 0 0 30px #00d4ff',
                      }}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center">
                    {scanning ? (
                      <div className="text-center">
                        <Fingerprint className="w-20 h-20 text-cyan-400 animate-pulse mx-auto" />
                        <div className="mt-3 font-orbitron text-cyan-300 text-sm">识别中...</div>
                        <div className="w-40 h-1.5 mt-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-75"
                            style={{ width: `${scanProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Camera className="w-16 h-16 text-cyan-400/80" />
                        <div className="mt-3 font-orbitron text-cyan-400/80 text-xs tracking-wider">人脸识别</div>
                      </>
                    )}
                  </div>
                </div>
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
              </div>
              <div className="mt-6 text-center">
                <div className="text-[11px] font-orbitron text-slate-500 tracking-wider">SYSTEM SECURE CONNECTION</div>
                <div className="text-[10px] text-emerald-400/70 mt-1 font-orbitron flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" /> 加密通道已建立
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <h2 className="font-orbitron text-lg text-cyan-300 mb-4 flex items-center gap-2">
                <User2 className="w-5 h-5" />
                选择登录身份
              </h2>
              <div className="space-y-2 mb-5">
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setSelectedRole(r.role);
                      setSelectedUser(roleUsers[r.role][0]);
                    }}
                    className={cn(
                      'w-full text-left rounded-lg px-4 py-3 border transition-all flex items-center group',
                      selectedRole === r.role
                        ? r.color === 'cyan'
                          ? 'bg-cyan-950/60 border-cyan-400 shadow-glow-blue'
                          : r.color === 'purple'
                          ? 'bg-fuchsia-950/60 border-fuchsia-400 shadow-[0_0_20px_rgba(200,100,255,0.4)]'
                          : 'bg-emerald-950/60 border-emerald-400 shadow-glow-green'
                        : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center mr-3',
                        r.color === 'cyan' && 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50',
                        r.color === 'purple' && 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/50',
                        r.color === 'emerald' && 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                      )}
                    >
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className={cn(
                        'font-orbitron font-bold text-sm',
                        r.color === 'cyan' && 'text-cyan-200',
                        r.color === 'purple' && 'text-fuchsia-200',
                        r.color === 'emerald' && 'text-emerald-200'
                      )}>
                        {roleLabel(r.role)}
                      </div>
                      <div className="text-[11px] text-slate-400">{r.desc}</div>
                    </div>
                    <ChevronRight className={cn(
                      'w-4 h-4 transition-all',
                      selectedRole === r.role ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2',
                      r.color === 'cyan' && 'text-cyan-400',
                      r.color === 'purple' && 'text-fuchsia-400',
                      r.color === 'emerald' && 'text-emerald-400'
                    )} />
                  </button>
                ))}
              </div>

              <div className="mb-5">
                <label className="text-[11px] font-orbitron text-slate-400 mb-1.5 block tracking-wider">选择人员</label>
                <div className="flex gap-2">
                  {roleUsers[selectedRole].map((u) => (
                    <button
                      key={u}
                      onClick={() => setSelectedUser(u)}
                      className={cn(
                        'flex-1 px-3 py-2 rounded text-sm font-medium transition-all border',
                        selectedUser === u
                          ? 'bg-cyan-600/30 border-cyan-400/60 text-cyan-200'
                          : 'bg-slate-900/40 border-slate-700 text-slate-300 hover:border-slate-500'
                      )}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={scanning}
                className="btn-glow w-full py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-400/60 text-white font-orbitron text-base tracking-wider flex items-center justify-center gap-2 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-blue"
              >
                <Fingerprint className="w-5 h-5" />
                {scanning ? '正在识别身份...' : '人脸识别登录'}
              </button>
              <p className="text-center text-[10px] text-slate-500 mt-3 font-orbitron tracking-wider">
                登录操作将被安全审计记录
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
