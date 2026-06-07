import type {
  Counter,
  ATM,
  RefillTask,
  VIPCustomer,
  WorkOrder,
  Alert,
  Task,
  Approval,
  Protocol,
  AccessRecord,
  LoginLog,
} from '@/types';

const API_BASE = '/api';

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}/${path}`, { cache: 'no-store' });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch (e) {
    console.warn(`[bankApi] fetch ${path} failed, using fallback`, e);
    return fallback;
  }
}

export const bankApi = {
  getCounters: () => safeFetch<Counter[]>('counters.json', []),
  getATMs: () => safeFetch<ATM[]>('atms.json', []),
  getRefillTasks: () => safeFetch<RefillTask[]>('refill_tasks.json', []),
  getVIPAppointments: () => safeFetch<VIPCustomer[]>('vip_appointments.json', []),
  getWorkOrders: () => safeFetch<WorkOrder[]>('workorders.json', []),
  getAlerts: () => safeFetch<Alert[]>('alerts.json', []),
  getVaultLogs: () => safeFetch<AccessRecord[]>('vault_logs.json', []),
  getLoginLogs: () => safeFetch<LoginLog[]>('login_logs.json', []),
  getTasks: () => safeFetch<Task[]>('tasks.json', []),
  getApprovals: () => safeFetch<Approval[]>('approvals.json', []),
  getProtocols: () => safeFetch<Protocol[]>('protocols.json', []),
};
