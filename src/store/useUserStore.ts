import { create } from 'zustand';
import type { User, UserRole, LoginLog } from '@/types';
import { mockUsers } from '@/data/mockData';

interface UserState {
  currentUser: User | null;
  users: User[];
  loginLogs: LoginLog[];
  login: (role: UserRole, userName: string) => Promise<boolean>;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  users: mockUsers,
  loginLogs: [],
  login: async (role: UserRole, userName: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const user = mockUsers.find((u) => u.role === role && u.name === userName) || mockUsers.find((u) => u.role === role);
    if (user) {
      const log: LoginLog = {
        id: `log_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        role: user.role,
        timestamp: new Date(),
        success: true,
      };
      set((state) => ({
        currentUser: { ...user, lastLogin: new Date() },
        loginLogs: [log, ...state.loginLogs],
      }));
      return true;
    }
    return false;
  },
  logout: () => {
    set({ currentUser: null });
  },
}));
