import { create } from 'zustand';
import type {
  Counter,
  ATM,
  Vault,
  VIPCustomer,
  ForecastData,
  ScheduleSuggestion,
  Emergency,
  WorkOrder,
  Notification,
  DailyReport,
  EmergencyType,
  RefillTask,
} from '@/types';
import {
  mockCounters,
  mockATMs,
  mockVault,
  mockVIPCustomers,
  mockForecastData,
  mockScheduleSuggestions,
  mockEmergency,
  mockWorkOrders,
  initialNotifications,
  mockDailyReport,
} from '@/data/mockData';

interface BankState {
  counters: Counter[];
  atms: ATM[];
  vault: Vault;
  vipCustomers: VIPCustomer[];
  forecastData: ForecastData[];
  scheduleSuggestions: ScheduleSuggestion[];
  emergency: Emergency;
  workOrders: WorkOrder[];
  notifications: Notification[];
  dailyReport: DailyReport;

  activateBackupCounter: (counterId: string) => void;
  adjustQueueCount: (counterId: string, delta: number) => void;

  confirmRefillTask: (atmId: string, userId: string) => void;
  completeRefill: (atmId: string) => void;
  updateATMBalance: (atmId: string, newBalance: number) => void;

  tryVaultAccess: (userId: string, userName: string, authorized: boolean) => void;
  toggleVaultLock: () => void;
  clearVaultAlert: () => void;

  addVIPCustomer: (customer: Omit<VIPCustomer, 'id' | 'status' | 'appointmentId'>) => void;
  updateVIPStatus: (vipId: string, status: VIPCustomer['status']) => void;
  releaseVIPTimeout: () => void;

  triggerEmergency: (type: EmergencyType) => void;
  resolveEmergency: () => void;

  addWorkOrder: (order: Omit<WorkOrder, 'id' | 'createdAt' | 'status'>) => void;
  updateWorkOrderStatus: (orderId: string, status: WorkOrder['status'], assignee?: string) => void;

  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const addNotification = (
  notifications: Notification[],
  n: Omit<Notification, 'id' | 'timestamp' | 'read'>
): Notification[] => [
  { ...n, id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, timestamp: new Date(), read: false },
  ...notifications,
];

export const useBankStore = create<BankState>((set, get) => ({
  counters: mockCounters,
  atms: mockATMs,
  vault: mockVault,
  vipCustomers: mockVIPCustomers,
  forecastData: mockForecastData,
  scheduleSuggestions: mockScheduleSuggestions,
  emergency: mockEmergency,
  workOrders: mockWorkOrders,
  notifications: initialNotifications,
  dailyReport: mockDailyReport,

  activateBackupCounter: (counterId: string) => {
    set((state) => {
      const counter = state.counters.find((c) => c.id === counterId);
      if (!counter || !counter.isBackup) return state;
      return {
        counters: state.counters.map((c) =>
          c.id === counterId ? { ...c, isActive: true } : c
        ),
        notifications: addNotification(state.notifications, {
          type: 'queue',
          title: '备用窗口已启用',
          message: `${counter.number}号备用窗口已自动开启，缓解排队压力`,
        }),
      };
    });
  },

  adjustQueueCount: (counterId: string, delta: number) => {
    set((state) => {
      let notifications = state.notifications;
      const counters = state.counters.map((c) => {
        if (c.id !== counterId) return c;
        const newCount = Math.max(0, c.queueCount + delta);
        if (newCount >= 10 && c.queueCount < 10) {
          notifications = addNotification(notifications, {
            type: 'queue',
            title: '排队预警',
            message: `${c.number}号柜台排队人数已达${newCount}人，请尽快增开窗口`,
          });
          const backup = state.counters.find((bc) => bc.isBackup && !bc.isActive);
          if (backup) {
            setTimeout(() => get().activateBackupCounter(backup.id), 500);
          }
        }
        return { ...c, queueCount: newCount };
      });
      return { counters, notifications };
    });
  },

  confirmRefillTask: (atmId: string, userId: string) => {
    set((state) => {
      let notifications = state.notifications;
      const atms: ATM[] = state.atms.map((atm) => {
        if (atm.id !== atmId) return atm;
        const existingTask = atm.refillTask;
        const path: [number, number, number][] = [
          [0, 0.15, 8],
          [atm.position[0], 0.15, atm.position[2] - 1.5],
          [atm.position[0], 0.15, atm.position[2]],
        ];
        if (existingTask) {
          const confirmed = existingTask.confirmedBy.includes(userId)
            ? existingTask.confirmedBy
            : [...existingTask.confirmedBy, userId];
          const newStatus: RefillTask['status'] = confirmed.length >= 2 ? 'confirmed' : existingTask.status;
          if (newStatus === 'confirmed' && existingTask.status !== 'confirmed') {
            notifications = addNotification(notifications, {
              type: 'refill',
              title: '加钞任务已确认',
              message: `${atm.name}加钞任务双人确认完成，蓝色引导路径已显示`,
            });
          }
          const atmStatus: ATM['status'] = newStatus === 'confirmed' ? 'refilling' : atm.status;
          return {
            ...atm,
            status: atmStatus,
            refillTask: { ...existingTask, confirmedBy: confirmed, status: newStatus },
          };
        } else {
          return {
            ...atm,
            refillTask: {
              id: `rt_${Date.now()}`,
              atmId,
              createdAt: new Date(),
              confirmedBy: [userId],
              status: 'pending' as const,
              path,
            },
          };
        }
      });
      return { atms, notifications };
    });
  },

  completeRefill: (atmId: string) => {
    set((state) => ({
      atms: state.atms.map((atm) =>
        atm.id === atmId
          ? { ...atm, status: 'normal', cashBalance: atm.maxCapacity, refillTask: undefined }
          : atm
      ),
      notifications: addNotification(state.notifications, {
        type: 'refill',
        title: '加钞完成',
        message: `ATM加钞完成，现金已补充至满额`,
      }),
    }));
  },

  updateATMBalance: (atmId: string, newBalance: number) => {
    set((state) => {
      let notifications = state.notifications;
      const atms: ATM[] = state.atms.map((atm) => {
        if (atm.id !== atmId) return atm;
        if (newBalance < atm.threshold && atm.status === 'normal') {
          notifications = addNotification(notifications, {
            type: 'refill',
            title: 'ATM加钞提醒',
            message: `${atm.name}现金余额${newBalance.toLocaleString()}元，已低于阈值${atm.threshold.toLocaleString()}元`,
          });
          const status: ATM['status'] = 'low';
          return { ...atm, cashBalance: newBalance, status };
        }
        return { ...atm, cashBalance: newBalance };
      });
      return { atms, notifications };
    });
  },

  tryVaultAccess: (userId: string, userName: string, authorized: boolean) => {
    set((state) => {
      const record = { userId, userName, timestamp: new Date(), authorized };
      if (!authorized) {
        return {
          vault: {
            ...state.vault,
            alertActive: true,
            accessHistory: [record, ...state.vault.accessHistory],
          },
          notifications: addNotification(state.notifications, {
            type: 'alert',
            title: '金库警报！',
            message: `检测到非授权人员尝试进入金库！${userName} 身份验证失败`,
          }),
        };
      }
      return {
        vault: {
          ...state.vault,
          lastAccess: new Date(),
          accessHistory: [record, ...state.vault.accessHistory],
        },
      };
    });
  },

  toggleVaultLock: () => {
    set((state) => ({ vault: { ...state.vault, isLocked: !state.vault.isLocked } }));
  },

  clearVaultAlert: () => {
    set((state) => ({ vault: { ...state.vault, alertActive: false } }));
  },

  addVIPCustomer: (customer) => {
    set((state) => ({
      vipCustomers: [
        ...state.vipCustomers,
        {
          ...customer,
          id: `vip_${Date.now()}`,
          appointmentId: `APP${Date.now()}`,
          status: 'waiting',
        },
      ],
      notifications: addNotification(state.notifications, {
        type: 'vip',
        title: 'VIP客户预约',
        message: `${customer.name} 已预约VIP服务，请做好接待准备`,
      }),
    }));
  },

  updateVIPStatus: (vipId: string, status: VIPCustomer['status']) => {
    set((state) => ({
      vipCustomers: state.vipCustomers.map((v) => (v.id === vipId ? { ...v, status } : v)),
    }));
  },

  releaseVIPTimeout: () => {
    set((state) => ({
      vipCustomers: state.vipCustomers.map((v) => {
        const diff = Date.now() - v.appointmentTime.getTime();
        if (diff > 30 * 60 * 1000 && v.status !== 'serving') {
          return { ...v, status: 'timeout' };
        }
        return v;
      }),
    }));
  },

  triggerEmergency: (type: EmergencyType) => {
    const typeNames: Record<EmergencyType, string> = {
      fire: '火警',
      robbery: '抢劫',
      intrusion: '入侵',
      other: '紧急',
    };
    set((state) => ({
      emergency: {
        ...state.emergency,
        active: true,
        type,
        startTime: new Date(),
        doorsLocked: true,
      },
      notifications: addNotification(state.notifications, {
        type: 'emergency',
        title: `⚠️ ${typeNames[type]}警报`,
        message: `已启动应急响应：全部门锁闭，疏散路径已生成，请立即行动！`,
      }),
    }));
  },

  resolveEmergency: () => {
    set((state) => ({
      emergency: { ...state.emergency, active: false, doorsLocked: false, startTime: undefined },
      notifications: addNotification(state.notifications, {
        type: 'info',
        title: '警报解除',
        message: '紧急情况已解除，恢复正常营业',
      }),
    }));
  },

  addWorkOrder: (order) => {
    set((state) => ({
      workOrders: [
        { ...order, id: `wo_${Date.now()}`, createdAt: new Date(), status: 'pending' },
        ...state.workOrders,
      ],
      notifications: addNotification(state.notifications, {
        type: 'workorder',
        title: '新工单',
        message: `${order.deviceName} - ${order.issue}`,
      }),
    }));
  },

  updateWorkOrderStatus: (orderId, status, assignee) => {
    set((state) => ({
      workOrders: state.workOrders.map((w) =>
        w.id === orderId ? { ...w, status, assignee: assignee || w.assignee } : w
      ),
    }));
  },

  addNotification: (n) => set((state) => ({ notifications: addNotification(state.notifications, n) })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  clearAllNotifications: () =>
    set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) })),
}));
