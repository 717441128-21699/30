import * as XLSX from 'xlsx';
import type { DailyReport } from '@/types';

export function exportDailyReportToExcel(report: DailyReport) {
  const wb = XLSX.utils.book_new();

  const summaryData = [
    ['3D智慧银行网点运营日报'],
    [`日期: ${report.date}`],
    [],
    ['核心指标汇总'],
    ['指标', '数值'],
    ['当日总业务量（笔）', report.totalTransactions],
    ['服务柜台数', report.counterStats.length],
    ['安防事件数', report.securityEvents.length],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  ws1['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws1, '汇总');

  const counterHeader = ['柜台号', '业务量（笔）', '占比'];
  const counterRows = report.counterStats.map((c) => [
    `${c.number}号`,
    c.transactionCount,
    `${((c.transactionCount / report.totalTransactions) * 100).toFixed(1)}%`,
  ]);
  const ws2 = XLSX.utils.aoa_to_sheet([counterHeader, ...counterRows]);
  ws2['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws2, '柜台业务统计');

  const cashHeader = ['ATM编号', '起始库存(元)', '终止库存(元)', '当日加钞(元)'];
  const cashRows = report.cashInventory.map((c) => [
    c.name,
    c.startBalance.toLocaleString(),
    c.endBalance.toLocaleString(),
    c.refilled.toLocaleString(),
  ]);
  const ws3 = XLSX.utils.aoa_to_sheet([cashHeader, ...cashRows]);
  ws3['!cols'] = [{ wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws3, '现金库存');

  const securityHeader = ['时间', '事件类型', '描述'];
  const securityRows = report.securityEvents.map((e) => [e.time, e.type, e.description]);
  const ws4 = XLSX.utils.aoa_to_sheet([securityHeader, ...securityRows]);
  ws4['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, ws4, '安防事件');

  XLSX.writeFile(wb, `银行网点运营日报_${report.date}.xlsx`);
}

export function formatCurrency(n: number): string {
  return `¥${n.toLocaleString('zh-CN')}`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

export function roleLabel(role: string): string {
  return { teller: '柜员', supervisor: '主管', operation: '运营部' }[role] || role;
}

export function cn(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
