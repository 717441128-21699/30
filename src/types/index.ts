export type UserRole = 'teller' | 'supervisor' | 'operation';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  faceId: string;
  lastLogin?: Date;
}

export interface Counter {
  id: string;
  number: number;
  queueCount: number;
  isActive: boolean;
  isBackup: boolean;
  tellerId?: string;
  position: [number, number, number];
  todayTransactions?: number;
}

export interface ATM {
  id: string;
  name: string;
  cashBalance: number;
  threshold: number;
  maxCapacity: number;
  status: 'normal' | 'low' | 'refilling' | 'offline';
  position: [number, number, number];
  refillTask?: RefillTask;
  todayWithdrawals?: number;
}

export type RefillTaskStatus = 'pending_approval' | 'approved' | 'refilling' | 'completed';

export interface RefillTask {
  id: string;
  atmId: string;
  atmName: string;
  createdAt: Date;
  requestedBy: string;
  requestedByName: string;
  approvedBy: { userId: string; userName: string; time: Date }[];
  status: RefillTaskStatus;
  requiredApprovalCount: number;
  path: [number, number, number][];
  currentBalance: number;
  targetBalance: number;
  notes?: string;
}

export interface AccessRecord {
  userId: string;
  userName: string;
  timestamp: Date;
  authorized: boolean;
  action?: 'entry' | 'exit' | 'attempted_entry';
}

export interface Vault {
  id: string;
  isLocked: boolean;
  lastAccess?: Date;
  accessHistory: AccessRecord[];
  alertActive: boolean;
  position: [number, number, number];
}

export interface VIPCustomer {
  id: string;
  name: string;
  phone?: string;
  level?: '黄金' | '白金' | '钻石';
  appointmentId: string;
  appointmentTime: Date;
  status: 'waiting' | 'guided' | 'serving' | 'timeout';
  guidePath: [number, number, number][];
  businessType?: string;
  handler?: string;
}

export interface ForecastData {
  time: string;
  predictedCount: number;
}

export interface ScheduleSuggestion {
  period: string;
  suggestedTellers: number;
  reason: string;
}

export type EmergencyType = 'fire' | 'robbery' | 'intrusion' | 'other';

export interface Emergency {
  id: string;
  type: EmergencyType;
  active: boolean;
  startTime?: Date;
  doorsLocked: boolean;
  evacuationPath: [number, number, number][];
  policePath: [number, number, number][];
}

export type WorkOrderStatus = 'pending' | 'assigned' | 'inProgress' | 'resolved';
export type WorkOrderPriority = 'low' | 'medium' | 'high';

export interface WorkOrder {
  id: string;
  deviceId: string;
  deviceName: string;
  issue: string;
  status: WorkOrderStatus;
  createdAt: Date;
  assignee?: string;
  deviceType: 'atm' | 'counter' | 'camera' | 'door' | 'other';
  priority?: WorkOrderPriority;
}

export type NotificationType = 'queue' | 'refill' | 'alert' | 'info' | 'emergency' | 'vip' | 'workorder' | 'refill_approval';

export type NotificationAction =
  | { type: 'approve_refill'; taskId: string; atmId: string }
  | { type: 'mark_vault_alert' }
  | null;

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: NotificationAction;
}

export interface DailyReport {
  date: string;
  totalTransactions: number;
  counterStats: { counterId: string; number: number; transactionCount: number }[];
  cashInventory: { atmId: string; name: string; startBalance: number; endBalance: number; refilled: number }[];
  securityEvents: { time: string; type: string; description: string }[];
}

export interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole | 'none';
  timestamp: Date;
  success: boolean;
  ip?: string;
  faceVerified?: boolean;
  failReason?: string;
}
