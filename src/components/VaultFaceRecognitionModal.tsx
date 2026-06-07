import { useState, useEffect, useRef } from 'react';
import { X, Camera, CheckCircle2, XCircle, Loader2, Shield, AlertTriangle, Fingerprint } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import type { UserRole } from '@/types';
import { cn } from '@/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onUnauthorized: (name: string) => void;
}

export default function VaultFaceRecognitionModal({ open, onClose, onSuccess, onUnauthorized }: Props) {
  const currentUser = useUserStore((s) => s.user);
  const [phase, setPhase] = useState<'idle' | 'camera' | 'detecting' | 'comparing' | 'success' | 'failed'>('idle');
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (open) {
      setPhase('idle');
      setErrorMsg('');
      setFaceDetected(false);
      startCamera();
    }
    return () => stopCamera();
  }, [open]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 360, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setPhase('camera');
      setTimeout(() => setFaceDetected(true), 1000);
    } catch (err) {
      console.warn('金库摄像头启动失败:', err);
      setCameraActive(false);
      setPhase('camera');
      setTimeout(() => setFaceDetected(true), 1200);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const allowedRoles: UserRole[] = ['supervisor', 'operation'];

  const handleVerify = async () => {
    setPhase('detecting');
    await new Promise((r) => setTimeout(r, 800));
    setPhase('comparing');
    await new Promise((r) => setTimeout(r, 1200));

    if (!currentUser) {
      setPhase('failed');
      setErrorMsg('未检测到登录用户');
      setTimeout(() => { onUnauthorized('未知人员'); onClose(); }, 2000);
      return;
    }

    if (!allowedRoles.includes(currentUser.role)) {
      setPhase('failed');
      setErrorMsg(`当前角色(${currentUser.role})无金库访问权限`);
      setTimeout(() => { onUnauthorized(currentUser.name); onClose(); }, 2000);
      return;
    }

    const randomPass = Math.random() > 0.15;
    if (randomPass) {
      setPhase('success');
      stopCamera();
      setTimeout(() => { onSuccess(); onClose(); }, 800);
    } else {
      setPhase('failed');
      setErrorMsg('人脸特征与数据库不匹配');
      setTimeout(() => { onUnauthorized(currentUser.name); onClose(); }, 2000);
    }
  };

  if (!open) return null;

  const phaseInfo = {
    idle: { text: '请正对摄像头...', sub: 'VAULT BIOMETRIC READY' },
    camera: { text: faceDetected ? '人脸已定位，点击开始识别' : '正在检测人脸...', sub: cameraActive ? 'CAMERA ACTIVE' : 'SIMULATION MODE' },
    detecting: { text: '正在采集面部特征...', sub: 'EXTRACTING BIOMETRICS' },
    comparing: { text: '正在比对金库授权名单...', sub: 'VERIFYING ACCESS CONTROL' },
    success: { text: '身份验证通过，金库解锁中...', sub: 'ACCESS GRANTED' },
    failed: { text: '身份验证失败', sub: 'ACCESS DENIED' },
  }[phase];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 hud-panel rounded-xl p-6 relative border border-red-500/40">
        <div className="corner-decoration corner-tl border-red-400/60" />
        <div className="corner-decoration corner-tr border-red-400/60" />
        <div className="corner-decoration corner-bl border-red-400/60" />
        <div className="corner-decoration corner-br border-red-400/60" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="font-orbitron text-lg text-red-300 tracking-wider">金库安全认证</h2>
          </div>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          金库为一级安防区域，仅授权人员(主管/运营部)可进入。所有访问记录将实时上传审计中心，失败尝试将触发安保警报。
        </p>

        <div className="relative aspect-[4/3] rounded-lg border-2 border-red-500/30 bg-slate-950 overflow-hidden mb-4">
          {cameraActive && (
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
          )}

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-52 rounded-[40%] border-2 border-red-400/40" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-48 rounded-[40%] border border-red-400/20" />

            {(phase === 'detecting' || phase === 'comparing' || (phase === 'camera' && faceDetected)) && (
              <div
                className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent"
                style={{
                  top: phase === 'camera' ? '30%' : phase === 'detecting' ? '50%' : phase === 'comparing' ? '70%' : '90%',
                  boxShadow: '0 0 10px #ff3366',
                  transition: 'top 0.4s ease',
                }}
              />
            )}

            {faceDetected && phase === 'camera' && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-52 rounded-[40%] border-2 border-emerald-400/80 animate-pulse" />
            )}

            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/80 border border-red-500/50">
              <Shield className="w-3 h-3 text-red-300" />
              <span className="font-orbitron text-[10px] text-red-300 tracking-wider">L1 SECURE</span>
            </div>
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/50 border border-slate-600">
              <span className="font-orbitron text-[10px] text-slate-300 tracking-wider">{phaseInfo.sub}</span>
            </div>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-end pb-3 bg-gradient-to-t from-black/70 to-transparent">
            <div className={cn(
              'font-orbitron text-sm font-bold tracking-wider',
              phase === 'success' ? 'text-emerald-300' : phase === 'failed' ? 'text-red-300' : 'text-red-200'
            )}>
              {phaseInfo.text}
            </div>
            {errorMsg && (
              <div className="text-[11px] text-red-400 mt-1">{errorMsg}</div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {phase === 'camera' && faceDetected ? (
            <button
              onClick={handleVerify}
              className="flex-1 btn-glow py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400/60 text-white font-orbitron text-sm tracking-wider flex items-center justify-center gap-2 shadow-glow-green"
            >
              <Fingerprint className="w-4 h-4" />
              开始人脸识别
            </button>
          ) : phase === 'success' ? (
            <div className="flex-1 py-2.5 rounded-lg bg-emerald-950/60 border border-emerald-400/60 text-emerald-200 font-orbitron text-sm tracking-wider flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              金库解锁成功
            </div>
          ) : phase === 'failed' ? (
            <div className="flex-1 py-2.5 rounded-lg bg-red-950/60 border border-red-400/60 text-red-200 font-orbitron text-sm tracking-wider flex items-center justify-center gap-2 animate-pulse">
              <XCircle className="w-5 h-5" />
              拒绝访问 · 警报已触发
            </div>
          ) : (
            <button
              disabled
              className="flex-1 py-2.5 rounded-lg bg-slate-800/60 border border-slate-600 text-slate-400 font-orbitron text-sm tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              认证中...
            </button>
          )}
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="px-4 py-2.5 rounded-lg border border-slate-600 text-slate-300 font-orbitron text-xs hover:bg-slate-800/60"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
