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
  RefillTaskStatus,
  User,
  AccessRecord,
  Task,
  Approval,
  Protocol,
  Alert,
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
import { bankApi } from '@/api/bankApi';

interface BankState {
  loaded: boolean;
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
  tasks: Task[];
  approvals: Approval[];
  protocols: Protocol[];

  loadAllFromApi: () => Promise<void>;

  activateBackupCounter: (counterId: string) => void;
  adjustQueueCount: (counterId: string, delta: number) => void;

  requestRefill: (atmId: string, user: User, notes?: string) => void;
  approveRefillTask: (atmId: string, taskId: string, user: User) => void;
  startRefill: (atmId: string) => void;
  completeRefill: (atmId: string) => void;
  updateATMBalance: (atmId: string, newBalance: number) => void;

  recordVaultAccess: (userId: string, userName: string, authorized: boolean, action?: AccessRecord['action']) => void;
  tryVaultAccess: (userId: string, userName: string, authorized: boolean) => void;
  openVault: () => void;
  closeVault: () => void;
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
  loaded: false,
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
  tasks: [],
  approvals: [],
  protocols: [],

  loadAllFromApi: async () => {
    const [
      counters,
      atms,
      refillTasks,
      vipCustomers,
      workOrders,
      alerts,
      vaultLogs,
      tasks,
      approvals,
      protocols,
    ] = await Promise.all([
      bankApi.getCounters(),
      bankApi.getATMs(),
      bankApi.getRefillTasks(),
      bankApi.getVIPAppointments(),
      bankApi.getWorkOrders(),
      bankApi.getAlerts(),
      bankApi.getVaultLogs(),
      bankApi.getTasks(),
      bankApi.getApprovals(),
      bankApi.getProtocols(),
    ]);

    const refillMap = new Map<string, RefillTask>();
    refillTasks.forEach((t) => {
      const parsed: RefillTask = {
        ...t,
        createdAt: t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt as unknown as string),
        approvedBy: (t.approvedBy || []).map((a) => ({
          ...a,
          time: a.time instanceof Date ? a.time : new Date(a.time as unknown as string),
        })),
      };
      refillMap.set(t.atmId, parsed);
    });

    const mergedATMs: ATM[] = (atms.length ? atms : mockATMs).map((a) => ({
      ...a,
      refillTask: refillMap.get(a.id) || a.refillTask,
    }));

    const mergedVIP: VIPCustomer[] = (vipCustomers.length ? vipCustomers : mockVIPCustomers).map((v) => ({
      ...v,
      appointmentTime: v.appointmentTime instanceof Date ? v.appointmentTime : new Date(v.appointmentTime as unknown as string),
    }));

    const mergedWorkOrders: WorkOrder[] = (workOrders.length ? workOrders : mockWorkOrders).map((w) => ({
      ...w,
      createdAt: w.createdAt instanceof Date ? w.createdAt : new Date(w.createdAt as unknown as string),
    }));

    const alertNotifs: Notification[] = alerts.map((a) => ({
      id: a.id,
      type: (a.level === 'warning' ? 'alert' : a.level === 'info' ? 'info' : 'alert') as Notification['type'],
      title: a.title,
      message: a.message,
      timestamp: new Date(a.timestamp as unknown as string),
      read: false,
    }));

    const mergedAccess: AccessRecord[] = vaultLogs.map((r) => ({
      ...r,
      timestamp: r.timestamp instanceof Date ? r.timestamp : new Date(r.timestamp as unknown as string),
    }));

    const mergedVault: Vault = {
      ...mockVault,
      accessHistory: mergedAccess.length ? mergedAccess : mockVault.accessHistory,
    };

    set({
      loaded: true,
      counters: counters.length ? counters : mockCounters,
      atms: mergedATMs,
      vault: mergedVault,
      vipCustomers: mergedVIP,
      workOrders: mergedWorkOrders,
      notifications: [...alertNotifs, ...initialNotifications],
      tasks,
      approvals,
      protocols,
    });
  },

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

  requestRefill: (atmId: string, user: User, notes?: string) => {
    set((state) => {
      const atm = state.atms.find((a) => a.id === atmId);
      if (!atm || atm.refillTask) return state;

      const path: [number, number, number][] = [
        [0, 0.15, 8],
        [atm.position[0], 0.15, atm.position[2] - 1.5],
        [atm.position[0], 0.15, atm.position[2]],
      ];
      const task: RefillTask = {
        id: `rt_${Date.now()}`,
        atmId,
        atmName: atm.name,
        createdAt: new Date(),
        requestedBy: user.id,
        requestedByName: user.name,
        approvedBy: [],
        status: 'pending_approval',
        requiredApprovalCount: 2,
        path,
        currentBalance: atm.cashBalance,
        targetBalance: atm.maxCapacity,
        notes,
      };

      const notification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
        type: 'refill_approval',
        title: '加钞申请待审批',
        message: `${user.name}发起${atm.name}加钞申请，当前余额¥${atm.cashBalance.toLocaleString()}，请审批(需2人)`,
        action: { type: 'approve_refill', taskId: task.id, atmId },
      };

      return {
        atms: state.atms.map((a) => (a.id === atmId ? { ...a, refillTask: task } : a)),
        notifications: addNotification(state.notifications, notification),
      };
    });
  },

  approveRefillTask: (atmId: string, taskId: string, user: User) => {
    set((state) => {
      let notifications = state.notifications;
      const atms = state.atms.map((atm) => {
        if (atm.id !== atmId || !atm.refillTask || atm.refillTask.id !== taskId) return atm;
        const task = atm.refillTask;
        if (task.approvedBy.some((a) => a.userId === user.id)) {
          notifications = addNotification(notifications, {
            type: 'info',
            title: '重复审批',
            message: `${user.name}已审批过${atm.name}加钞申请`,
          });
          return atm;
        }
        const newApprovedBy = [...task.approvedBy, { userId: user.id, userName: user.name, time: new Date() }];
        const newStatus: RefillTaskStatus = newApprovedBy.length >= task.requiredApprovalCount ? 'approved' : 'pending_approval';

        if (newStatus === 'approved' && task.status !== 'approved') {
          notifications = addNotification(notifications, {
            type: 'refill',
            title: '加钞审批完成',
            message: `${atm.name}加钞任务双人审批通过，蓝色引导路径已显示，请开始加钞`,
          });
          return {
            ...atm,
            status: 'refilling' as const,
            refillTask: { ...task, approvedBy: newApprovedBy, status: newStatus },
          };
        }
        notifications = addNotification(notifications, {
          type: 'refill_approval',
          title: '加钞审批进度更新',
          message: `${user.name}已批准${atm.name}加钞申请(${newApprovedBy.length}/${task.requiredApprovalCount})`,
          action:
            newStatus === 'pending_approval'
              ? { type: 'approve_refill', taskId: task.id, atmId }
              : undefined,
        });
        return {
          ...atm,
          refillTask: { ...task, approvedBy: newApprovedBy, status: newStatus },
        };
      });
      return { atms, notifications };
    });
  },

  startRefill: (atmId: string) => {
    set((state) => ({
      atms: state.atms.map((atm) =>
        atm.id === atmId && atm.refillTask
          ? { ...atm, status: 'refilling', refillTask: { ...atm.refillTask, status: 'refilling' as const } }
          : atm
      ),
    }));
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
        if (newBalance < atm.threshold && atm.status === 'normal' && !atm.refillTask) {
          notifications = addNotification(notifications, {
            type: 'refill',
            title: 'ATM加钞提醒',
            message: `${atm.name}现金余额¥${newBalance.toLocaleString()}，已低于阈值¥${atm.threshold.toLocaleString()}`,
          });
          return { ...atm, cashBalance: newBalance, status: 'low' };
        }
        return { ...atm, cashBalance: newBalance };
      });
      return { atms, notifications };
    });
  },

  recordVaultAccess: (userId, userName, authorized, action) => {
    set((state) => {
      const record: AccessRecord = { userId, userName, timestamp: new Date(), authorized, action: action || (authorized ? 'entry' : 'attempted_entry') };
      if (!authorized) {
        return {
          vault: {
            ...state.vault,
            alertActive: true,
            accessHistory: [record, ...state.vault.accessHistory],
          },
          notifications: addNotification(state.notifications, {
            type: 'alert',
            title: '🚨 金库警报！',
            message: `检测到非授权人员[${userName}]尝试进入金库，身份验证失败！安保人员请注意`,
            action: { type: 'mark_vault_alert' },
          }),
        };
      }
      return {
        vault: {
          ...state.vault,
          isLocked: false,
          lastAccess: new Date(),
          accessHistory: [record, ...state.vault.accessHistory],
        },
        notifications: addNotification(state.notifications, {
          type: 'info',
          title: '金库访问记录',
          message: `${userName}通过人脸识别成功进入金库`,
        }),
      };
    });
  },

  tryVaultAccess: (userId: string, userName: string, authorized: boolean) => {
    get().recordVaultAccess(userId, userName, authorized);
  },

  openVault: () => {
    set((state) => ({ vault: { ...state.vault, isLocked: false } }));
  },

  closeVault: () => {
    set((state) => ({ vault: { ...state.vault, isLocked: true } }));
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
