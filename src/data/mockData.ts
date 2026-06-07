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
  User,
  DailyReport,
} from '@/types';

export const mockUsers: User[] = [
  { id: 'u1', name: '张柜员', role: 'teller', faceId: 'face_001' },
  { id: 'u2', name: '李柜员', role: 'teller', faceId: 'face_002' },
  { id: 'u3', name: '王主管', role: 'supervisor', faceId: 'face_003' },
  { id: 'u4', name: '赵经理', role: 'operation', faceId: 'face_004' },
];

export const mockCounters: Counter[] = [
  { id: 'c1', number: 1, queueCount: 5, isActive: true, isBackup: false, tellerId: 'u1', position: [-6, 0, -2] },
  { id: 'c2', number: 2, queueCount: 8, isActive: true, isBackup: false, tellerId: 'u2', position: [-3, 0, -2] },
  { id: 'c3', number: 3, queueCount: 12, isActive: true, isBackup: false, position: [0, 0, -2] },
  { id: 'c4', number: 4, queueCount: 3, isActive: true, isBackup: false, position: [3, 0, -2] },
  { id: 'c5', number: 5, queueCount: 0, isActive: false, isBackup: true, position: [6, 0, -2] },
  { id: 'c6', number: 6, queueCount: 0, isActive: false, isBackup: true, position: [9, 0, -2] },
];

export const mockATMs: ATM[] = [
  {
    id: 'atm1',
    name: 'ATM-A01',
    cashBalance: 280000,
    threshold: 100000,
    maxCapacity: 500000,
    status: 'normal',
    position: [-8, 0, 4],
  },
  {
    id: 'atm2',
    name: 'ATM-A02',
    cashBalance: 45000,
    threshold: 100000,
    maxCapacity: 500000,
    status: 'low',
    position: [-8, 0, 6.5],
  },
  {
    id: 'atm3',
    name: 'ATM-B01',
    cashBalance: 320000,
    threshold: 100000,
    maxCapacity: 500000,
    status: 'normal',
    position: [10, 0, 4],
  },
  {
    id: 'atm4',
    name: 'ATM-B02',
    cashBalance: 180000,
    threshold: 100000,
    maxCapacity: 500000,
    status: 'normal',
    position: [10, 0, 6.5],
  },
];

export const mockVault: Vault = {
  id: 'vault1',
  isLocked: true,
  accessHistory: [
    { userId: 'u3', userName: '王主管', timestamp: new Date(Date.now() - 3600000), authorized: true },
  ],
  alertActive: false,
  position: [0, 0, 8],
};

export const mockVIPCustomers: VIPCustomer[] = [
  {
    id: 'vip1',
    name: '陈总',
    appointmentId: 'APP20260607001',
    appointmentTime: new Date(),
    status: 'guided',
    guidePath: [
      [0, 0.1, 0],
      [6, 0.1, 0],
      [6, 0.1, 5],
    ],
  },
];

export const mockForecastData: ForecastData[] = [
  { time: '现在', predictedCount: 45 },
  { time: '+10分', predictedCount: 52 },
  { time: '+20分', predictedCount: 68 },
  { time: '+30分', predictedCount: 75 },
  { time: '+40分', predictedCount: 62 },
  { time: '+50分', predictedCount: 48 },
  { time: '+60分', predictedCount: 35 },
];

export const mockScheduleSuggestions: ScheduleSuggestion[] = [
  { period: '10:00-11:00', suggestedTellers: 5, reason: '早高峰业务集中期' },
  { period: '14:00-15:30', suggestedTellers: 4, reason: '午间回流客流' },
  { period: '16:30-17:30', suggestedTellers: 3, reason: '下班前平稳期' },
];

export const mockEmergency: Emergency = {
  id: 'em1',
  type: 'other',
  active: false,
  doorsLocked: false,
  evacuationPath: [
    [0, 0.1, 0],
    [-4, 0.1, 0],
    [-4, 0.1, -6],
  ],
  policePath: [
    [-10, 0.1, -6],
    [-4, 0.1, -6],
    [0, 0.1, 0],
  ],
};

export const mockWorkOrders: WorkOrder[] = [
  {
    id: 'wo1',
    deviceId: 'atm2',
    deviceName: 'ATM-A02',
    deviceType: 'atm',
    issue: '读卡器故障，无法识别银行卡',
    status: 'inProgress',
    createdAt: new Date(Date.now() - 1800000),
    assignee: '张柜员',
  },
  {
    id: 'wo2',
    deviceId: 'cam3',
    deviceName: '金库监控摄像头',
    deviceType: 'camera',
    issue: '画面模糊，需要清洁或更换镜头',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000),
  },
];

export const initialNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'queue',
    title: '排队预警',
    message: '3号柜台排队人数已达12人，建议增开备用窗口',
    timestamp: new Date(Date.now() - 300000),
    read: false,
  },
  {
    id: 'n2',
    type: 'refill',
    title: 'ATM加钞提醒',
    message: 'ATM-A02现金余额45,000元，已低于阈值100,000元',
    timestamp: new Date(Date.now() - 600000),
    read: false,
  },
];

export const mockDailyReport: DailyReport = {
  date: new Date().toISOString().split('T')[0],
  totalTransactions: 1286,
  counterStats: [
    { counterId: 'c1', number: 1, transactionCount: 256 },
    { counterId: 'c2', number: 2, transactionCount: 289 },
    { counterId: 'c3', number: 3, transactionCount: 312 },
    { counterId: 'c4', number: 4, transactionCount: 228 },
    { counterId: 'c5', number: 5, transactionCount: 112 },
    { counterId: 'c6', number: 6, transactionCount: 89 },
  ],
  cashInventory: [
    { atmId: 'atm1', name: 'ATM-A01', startBalance: 480000, endBalance: 280000, refilled: 0 },
    { atmId: 'atm2', name: 'ATM-A02', startBalance: 320000, endBalance: 45000, refilled: 0 },
    { atmId: 'atm3', name: 'ATM-B01', startBalance: 420000, endBalance: 320000, refilled: 0 },
    { atmId: 'atm4', name: 'ATM-B02', startBalance: 380000, endBalance: 180000, refilled: 200000 },
  ],
  securityEvents: [
    { time: '09:15', type: '金库访问', description: '王主管正常进入金库' },
    { time: '11:32', type: '异常行为', description: '自助区检测到人员逗留超时，已自动提醒' },
    { time: '14:08', type: 'VIP服务', description: '陈总到店，已引导至VIP室' },
  ],
};
