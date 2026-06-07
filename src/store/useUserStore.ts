import { create } from 'zustand';
import type { User, UserRole, LoginLog } from '@/types';
import { mockUsers } from '@/data/mockData';

interface UserState {
  user: User | null;
  currentUser: User | null;
  users: User[];
  loginLogs: LoginLog[];
  login: (role: UserRole, userName: string) => Promise<boolean>;
  logout: () => void;
  recordLoginLog: (log: Omit<LoginLog, 'id' | 'timestamp'>) => void;
}

const saveLoginLogs = (logs: LoginLog[]) => {
  try {
    localStorage.setItem('bank_login_logs', JSON.stringify(logs.slice(0, 100)));
  } catch {}
};

const loadLoginLogs = (): LoginLog[] => {
  try {
    const raw = localStorage.getItem('bank_login_logs');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  currentUser: null,
  users: mockUsers,
  loginLogs: loadLoginLogs(),

  login: async (role: UserRole, userName: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const user = mockUsers.find((u) => u.role === role && u.name === userName) || mockUsers.find((u) => u.role === role);
    if (user) {
      const log: LoginLog = {
        id: `log_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        role: user.role,
        timestamp: new Date(),
        success: true,
        ip: '192.168.1.' + Math.floor(Math.random() * 250 + 10),
        faceVerified: true,
      };
      const newLogs = [log, ...get().loginLogs];
      saveLoginLogs(newLogs);
      const updatedUser = { ...user, lastLogin: new Date() };
      set({
        user: updatedUser,
        currentUser: updatedUser,
        loginLogs: newLogs,
      });
      return true;
    }
    const failLog: LoginLog = {
      id: `log_${Date.now()}`,
      userId: 'unknown',
      userName,
      role: 'none',
      timestamp: new Date(),
      success: false,
      ip: '192.168.1.200',
      faceVerified: false,
      failReason: '人脸库未匹配',
    };
    const failLogs = [failLog, ...get().loginLogs];
    saveLoginLogs(failLogs);
    set({ loginLogs: failLogs });
    return false;
  },

  logout: () => {
    set({ user: null, currentUser: null });
  },

  recordLoginLog: (log) => {
    const fullLog: LoginLog = {
      ...log,
      id: `log_${Date.now()}`,
      timestamp: new Date(),
    };
    const newLogs = [fullLog, ...get().loginLogs];
    saveLoginLogs(newLogs);
    set({ loginLogs: newLogs });
  },
}));
