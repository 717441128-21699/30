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
}

export interface RefillTask {
  id: string;
  atmId: string;
  createdAt: Date;
  confirmedBy: string[];
  status: 'pending' | 'confirmed' | 'inProgress' | 'completed';
  path: [number, number, number][];
}

export interface AccessRecord {
  userId: string;
  userName: string;
  timestamp: Date;
  authorized: boolean;
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
  appointmentId: string;
  appointmentTime: Date;
  status: 'waiting' | 'guided' | 'serving' | 'timeout';
  guidePath: [number, number, number][];
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

export interface WorkOrder {
  id: string;
  deviceId: string;
  deviceName: string;
  issue: string;
  status: WorkOrderStatus;
  createdAt: Date;
  assignee?: string;
  deviceType: 'atm' | 'counter' | 'camera' | 'door' | 'other';
}

export type NotificationType = 'queue' | 'refill' | 'alert' | 'info' | 'emergency' | 'vip' | 'workorder';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
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
  role: UserRole;
  timestamp: Date;
  success: boolean;
}
