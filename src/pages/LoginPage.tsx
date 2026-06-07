import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Shield, User2, ChevronRight, Fingerprint, CheckCircle2, XCircle, Loader2, UserPlus, ScanLine } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import type { UserRole } from '@/types';
import { cn, roleLabel } from '@/utils';
import { hasRegisteredFace, registerFace, verifyFace } from '@/utils/faceAuth';
import type { VerifyResult } from '@/utils/faceAuth';

const roles: { role: UserRole; label: string; desc: string; color: string }[] = [
  { role: 'teller', label: '柜员', desc: '查看柜台、处理业务、设备报障', color: 'cyan' },
  { role: 'supervisor', label: '主管', desc: '排班调整、应急指挥、加钞审批', color: 'purple' },
  { role: 'operation', label: '运营部', desc: '全网调度、报表导出、系统管理', color: 'emerald' },
];

const roleUsers: Record<UserRole, { id: string; name: string }[]> = {
  teller: [
    { id: 'u1', name: '张柜员' },
    { id: 'u2', name: '李柜员' },
  ],
  supervisor: [{ id: 'u3', name: '王主管' }],
  operation: [{ id: 'u4', name: '赵经理' }],
};

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useUserStore((s) => s.login);
  const [selectedRole, setSelectedRole] = useState<UserRole>('supervisor');
  const [selectedUserId, setSelectedUserId] = useState<string>('u3');
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState<
    'idle' | 'camera' | 'registering' | 'capturing' | 'comparing' | 'success' | 'failed'
  >('idle');
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [needsRegister, setNeedsRegister] = useState<boolean>(() => !hasRegisteredFace('u3'));
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [registerSamples, setRegisterSamples] = useState(0);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    setNeedsRegister(!hasRegisteredFace(selectedUserId));
  }, [selectedUserId]);

  const startCamera = async () => {
    try {
      setErrorMsg('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setScanStep('camera');
      setTimeout(() => setFaceDetected(true), 1000);
    } catch (err) {
      setErrorMsg('摄像头启动失败，请检查权限后重试');
      setCameraActive(false);
      setScanStep('camera');
      setFaceDetected(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureToCanvas = useCallback(() => {
    if (canvasRef.current && videoRef.current && cameraActive) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
      }
    } else {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#e8b89a';
          ctx.fillRect(0, 0, 320, 240);
          ctx.fillStyle = '#d4a574';
          ctx.fillRect(80, 50, 160, 140);
          ctx.fillStyle = '#f5d0b0';
          ctx.fillRect(110, 80, 100, 80);
        }
      }
    }
  }, [cameraActive]);

  const doRegister = async () => {
    setScanStep('registering');
    setRegisterSamples(0);
    const target = videoRef.current || canvasRef.current;
    if (!target) {
      setScanStep('camera');
      return;
    }
    for (let i = 0; i < 5; i++) {
      captureToCanvas();
      await new Promise((r) => setTimeout(r, 200));
      setRegisterSamples(i + 1);
    }
    const user = roleUsers[selectedRole].find((u) => u.id === selectedUserId)!;
    const finalSrc = (videoRef.current && cameraActive ? videoRef.current : canvasRef.current)!;
    registerFace(selectedUserId, user.name, selectedRole, finalSrc);
    setNeedsRegister(false);
    await new Promise((r) => setTimeout(r, 400));
    setScanStep('camera');
  };

  const captureAndCompare = async () => {
    setScanStep('capturing');
    await new Promise((r) => setTimeout(r, 600));
    captureToCanvas();
    setScanStep('comparing');
    await new Promise((r) => setTimeout(r, 400));
    const finalSrc = (videoRef.current && cameraActive ? videoRef.current : canvasRef.current)!;
    const result = verifyFace(finalSrc, selectedUserId);
    setVerifyResult(result);

    const selectedUser = roleUsers[selectedRole].find((u) => u.id === selectedUserId);

    if (result.success && result.matchedUser) {
      const ok = await login(selectedRole, selectedUser?.name || result.matchedUser);
      if (ok) {
        setScanStep('success');
        stopCamera();
        await new Promise((r) => setTimeout(r, 800));
        navigate('/');
      } else {
        setScanStep('failed');
        setErrorMsg('登录服务异常');
        setTimeout(() => {
          setScanStep('camera');
          setErrorMsg('');
        }, 2000);
      }
    } else {
      setScanStep('failed');
      setErrorMsg(
        result.similarity < 0
          ? '未检测到有效人脸特征，请正对摄像头重试'
          : `人脸识别失败（相似度${(result.similarity * 100).toFixed(1)}%，需${78}%）`
      );
      setTimeout(() => {
        setScanStep('camera');
        setErrorMsg('');
        setVerifyResult(null);
      }, 2500);
    }
  };

  const handleStart = () => {
    setScanning(true);
    setVerifyResult(null);
    startCamera();
  };

  const handlePrimaryAction = () => {
    if (needsRegister) {
      doRegister();
    } else {
      captureAndCompare();
    }
  };

  const stepInfo = {
    idle: { icon: Camera, text: '点击开始人脸识别', sub: 'SYSTEM READY' },
    camera: {
      icon: Camera,
      text: faceDetected
        ? needsRegister
          ? '人脸已定位，首次使用请注册'
          : '人脸已定位，点击进行识别'
        : '正在检测人脸...',
      sub: cameraActive ? 'CAMERA ACTIVE' : 'CAMERA OFFLINE · FALLBACK',
    },
    registering: {
      icon: UserPlus,
      text: `正在注册人脸特征... (${registerSamples}/5)`,
      sub: 'ENROLLING BIOMETRICS',
    },
    capturing: { icon: ScanLine, text: '正在采集人脸特征...', sub: 'CAPTURING FACEPRINT' },
    comparing: { icon: Loader2, text: '特征比对中...', sub: 'VERIFYING IDENTITY' },
    success: { icon: CheckCircle2, text: '识别成功！正在进入系统...', sub: 'ACCESS GRANTED' },
    failed: { icon: XCircle, text: '识别失败', sub: 'ACCESS DENIED' },
  }[scanStep];

  const StepIcon = stepInfo.icon;
  const canAct =
    (scanStep === 'camera' && faceDetected) ||
    (scanStep === 'registering' && needsRegister) ||
    (scanStep === 'capturing') ||
    (scanStep === 'comparing');

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

      <div className="relative z-10 w-full max-w-5xl mx-4">
        <div className="text-center mb-6">
          <h1 className="font-orbitron text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent mb-2 tracking-wider">
            3D智慧银行
          </h1>
          <p className="font-orbitron text-base text-cyan-400/80 tracking-widest">
            网点运营与安全调度可视化平台
          </p>
          <div className="w-64 h-0.5 mx-auto mt-3 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
        </div>

        <div className="hud-panel rounded-xl p-5 relative">
          <div className="corner-decoration corner-tl" />
          <div className="corner-decoration corner-tr" />
          <div className="corner-decoration corner-bl" />
          <div className="corner-decoration corner-br" />

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-64 h-64 rounded-full border-4 border-cyan-500/40 flex items-center justify-center bg-slate-950/50 relative overflow-hidden">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" style={{ boxShadow: 'inset 0 0 40px rgba(0,212,255,0.2)' }} />
                  <div className="absolute inset-4 rounded-full border border-cyan-400/30" />
                  <div className="absolute inset-8 rounded-full border border-cyan-400/20" />

                  {cameraActive && (
                    <video
                      ref={videoRef}
                      className="absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)] object-cover rounded-full"
                      muted
                      playsInline
                    />
                  )}

                  <canvas ref={canvasRef} className="hidden" width={320} height={240} />

                  {['camera', 'registering', 'capturing', 'comparing'].includes(scanStep) && (
                    <div
                      className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                      style={{
                        top:
                          scanStep === 'camera'
                            ? '20%'
                            : scanStep === 'registering'
                            ? `${25 + registerSamples * 10}%`
                            : scanStep === 'capturing'
                            ? '55%'
                            : '80%',
                        boxShadow: '0 0 15px #00d4ff, 0 0 30px #00d4ff',
                        transition: 'top 0.3s ease',
                      }}
                    />
                  )}

                  {!scanning && (
                    <div className="relative z-10 flex flex-col items-center">
                      <Camera className="w-14 h-14 text-cyan-400/80" />
                      <div className="mt-2 font-orbitron text-cyan-400/80 text-xs tracking-wider">人脸识别</div>
                    </div>
                  )}

                  {scanning && (
                    <div className="relative z-10 flex flex-col items-center px-4 text-center">
                      <StepIcon
                        className={cn(
                          'w-14 h-14',
                          scanStep === 'success' ? 'text-emerald-400' : scanStep === 'failed' ? 'text-red-400' : 'text-cyan-300',
                          ['comparing', 'capturing', 'registering'].includes(scanStep) && 'animate-spin'
                        )}
                      />
                      <div className={cn(
                        'mt-2 font-orbitron text-xs tracking-wider',
                        scanStep === 'success' ? 'text-emerald-300' : scanStep === 'failed' ? 'text-red-300' : 'text-cyan-300'
                      )}>
                        {stepInfo.text}
                      </div>
                      {verifyResult && scanStep === 'failed' && (
                        <div className="mt-1 text-[10px] text-red-400 font-orbitron">
                          相似度: {(verifyResult.similarity * 100).toFixed(1)}%
                        </div>
                      )}
                      {verifyResult && scanStep === 'success' && (
                        <div className="mt-1 text-[10px] text-emerald-400 font-orbitron">
                          相似度: {(verifyResult.similarity * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  )}

                  {faceDetected && scanStep === 'camera' && (
                    <div className="absolute inset-6 rounded-full border-2 border-emerald-400/80 animate-pulse" />
                  )}
                </div>

                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
              </div>

              <div className="mt-5 text-center">
                <div className="text-[11px] font-orbitron text-slate-500 tracking-wider">{stepInfo.sub}</div>
                <div className="text-[10px] text-emerald-400/70 mt-1 font-orbitron flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" /> 加密通道已建立 · 特征本地存储
                </div>
              </div>

              {errorMsg && (
                <div className="mt-3 px-4 py-1.5 rounded bg-red-900/50 border border-red-500/50 text-red-300 text-xs font-orbitron">
                  {errorMsg}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <h2 className="font-orbitron text-base text-cyan-300 mb-3 flex items-center gap-2">
                <User2 className="w-5 h-5" />
                选择登录身份
              </h2>
              <div className="space-y-2 mb-4">
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setSelectedRole(r.role);
                      setSelectedUserId(roleUsers[r.role][0].id);
                    }}
                    className={cn(
                      'w-full text-left rounded-lg px-3 py-2.5 border transition-all flex items-center group',
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

              <div className="mb-4">
                <label className="text-[11px] font-orbitron text-slate-400 mb-1.5 block tracking-wider flex items-center gap-1.5">
                  选择人员
                  {needsRegister && scanning && scanStep === 'camera' && (
                    <span className="ml-auto text-orange-400 text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 border border-orange-500/50">
                      ⚠ 需先注册人脸
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  {roleUsers[selectedRole].map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUserId(u.id)}
                      className={cn(
                        'flex-1 px-3 py-2 rounded text-sm font-medium transition-all border relative',
                        selectedUserId === u.id
                          ? 'bg-cyan-600/30 border-cyan-400/60 text-cyan-200'
                          : 'bg-slate-900/40 border-slate-700 text-slate-300 hover:border-slate-500'
                      )}
                    >
                      {u.name}
                      {!hasRegisteredFace(u.id) && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-400" title="未注册人脸" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {!scanning ? (
                <button
                  onClick={handleStart}
                  className="btn-glow w-full py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-400/60 text-white font-orbitron text-base tracking-wider flex items-center justify-center gap-2 hover:from-cyan-500 hover:to-blue-500 shadow-glow-blue"
                >
                  <Fingerprint className="w-5 h-5" />
                  启动人脸识别登录
                </button>
              ) : canAct && scanStep === 'camera' ? (
                <div className="space-y-2">
                  <button
                    onClick={handlePrimaryAction}
                    className={cn(
                      'btn-glow w-full py-3 rounded-lg border text-white font-orbitron text-sm tracking-wider flex items-center justify-center gap-2',
                      needsRegister
                        ? 'bg-gradient-to-r from-orange-600 to-amber-600 border-orange-400/60 hover:from-orange-500 hover:to-amber-500'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400/60 hover:from-emerald-500 hover:to-teal-500 shadow-glow-green'
                    )}
                  >
                    {needsRegister ? (
                      <>
                        <UserPlus className="w-5 h-5" />
                        注册该人员人脸特征
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        确认并进行识别比对
                      </>
                    )}
                  </button>
                  {!needsRegister && (
                    <button
                      onClick={doRegister}
                      className="w-full py-2 rounded-lg border border-slate-600 text-slate-300 font-orbitron text-[10px] hover:bg-slate-800/60"
                    >
                      (重新)注册当前人员人脸
                    </button>
                  )}
                  <button
                    onClick={() => {
                      stopCamera();
                      setScanning(false);
                      setScanStep('idle');
                      setFaceDetected(false);
                      setVerifyResult(null);
                    }}
                    className="w-full py-2 rounded-lg border border-slate-600 text-slate-300 font-orbitron text-xs hover:bg-slate-800/60"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  disabled
                  className="w-full py-3 rounded-lg bg-slate-800/60 border border-slate-600 text-slate-400 font-orbitron text-sm tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {scanStep === 'registering' ? '注册中...' : '识别中...'}
                </button>
              )}

              <p className="text-center text-[10px] text-slate-500 mt-3 font-orbitron tracking-wider">
                登录操作将被安全审计记录并写入系统日志 · 人脸特征加密存储于本地
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
