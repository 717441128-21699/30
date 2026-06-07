import { FileSpreadsheet, Download, ArrowLeft, BarChart3, DollarSign, Shield, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { useBankStore } from '@/store/useBankStore';
import { useUserStore } from '@/store/useUserStore';
import { exportDailyReportToExcel, formatCurrency } from '@/utils';
import { useEffect } from 'react';

export default function ReportsPage() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.currentUser);
  const report = useBankStore((s) => s.dailyReport);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const counterOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10,30,60,0.9)',
      borderColor: '#00d4ff',
      textStyle: { color: '#e0f2ff', fontSize: 11 },
    },
    grid: { top: 20, right: 20, bottom: 30, left: 40 },
    xAxis: {
      type: 'category',
      data: report.counterStats.map((c) => `${c.number}号`),
      axisLine: { lineStyle: { color: '#1e3a5f' } },
      axisLabel: { color: '#88aacc', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#88aacc', fontSize: 11 },
      splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } },
    },
    series: [
      {
        name: '业务量',
        type: 'bar',
        data: report.counterStats.map((c) => c.transactionCount),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#00d4ff' },
              { offset: 1, color: '#0066aa' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '50%',
        label: { show: true, position: 'top', color: '#88ddff', fontSize: 10, fontFamily: 'Orbitron' },
      },
    ],
  };

  const cashOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10,30,60,0.9)',
      borderColor: '#2ed573',
      textStyle: { color: '#e0f2ff', fontSize: 11 },
    },
    legend: {
      data: ['起始库存', '终止库存'],
      textStyle: { color: '#88aacc', fontSize: 10 },
      top: 0,
    },
    grid: { top: 40, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: 'category',
      data: report.cashInventory.map((c) => c.name),
      axisLine: { lineStyle: { color: '#1e3a5f' } },
      axisLabel: { color: '#88aacc', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#88aacc', fontSize: 10, formatter: (v: number) => `${v / 10000}万` },
      splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } },
    },
    series: [
      {
        name: '起始库存',
        type: 'bar',
        data: report.cashInventory.map((c) => c.startBalance),
        itemStyle: { color: '#00d4ff', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '终止库存',
        type: 'bar',
        data: report.cashInventory.map((c) => c.endBalance),
        itemStyle: { color: '#2ed573', borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  const statCards = [
    { label: '当日总业务量', value: report.totalTransactions.toLocaleString(), suffix: '笔', icon: BarChart3, color: 'cyan' },
    {
      label: 'ATM现金总额',
      value: (report.cashInventory.reduce((s, c) => s + c.endBalance, 0) / 10000).toFixed(1),
      suffix: '万元',
      icon: DollarSign,
      color: 'emerald',
    },
    { label: '安防事件数', value: report.securityEvents.length, suffix: '起', icon: Shield, color: 'orange' },
    { label: '活跃柜台数', value: report.counterStats.length, suffix: '个', icon: TrendingUp, color: 'fuchsia' },
  ];

  return (
    <div className="w-full h-full overflow-y-auto grid-bg">
      <header className="hud-panel border-b border-cyan-900/50 sticky top-0 z-10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded border border-cyan-800/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-900/40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-orbitron text-xl text-cyan-200 tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
              运营日报统计
            </h1>
            <p className="text-[11px] text-cyan-500 font-orbitron">数据日期: {report.date}</p>
          </div>
        </div>
        <button
          onClick={() => exportDailyReportToExcel(report)}
          disabled={user.role === 'teller'}
          className="btn-glow px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400/60 text-white font-orbitron text-sm tracking-wider flex items-center gap-2 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-green"
        >
          <Download className="w-4 h-4" />
          导出 Excel
        </button>
      </header>

      <main className="p-4 md:p-6 space-y-4 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="hud-panel rounded-lg p-4 relative overflow-hidden">
                <div className="corner-decoration corner-tl" />
                <div className="corner-decoration corner-br" />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400 font-orbitron tracking-wider">{card.label}</div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span
                        className={`font-orbitron text-2xl font-bold ${
                          card.color === 'cyan'
                            ? 'text-cyan-300'
                            : card.color === 'emerald'
                            ? 'text-emerald-300'
                            : card.color === 'orange'
                            ? 'text-orange-300'
                            : 'text-fuchsia-300'
                        }`}
                      >
                        {card.value}
                      </span>
                      <span className="text-xs text-slate-400">{card.suffix}</span>
                    </div>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      card.color === 'cyan'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : card.color === 'emerald'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : card.color === 'orange'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                        : 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="hud-panel rounded-lg p-1 relative overflow-hidden">
            <div className="corner-decoration corner-tl" />
            <div className="corner-decoration corner-tr" />
            <div className="corner-decoration corner-bl" />
            <div className="corner-decoration corner-br" />
            <div className="hud-panel-title px-4 py-2 mb-2 rounded">
              <span className="font-orbitron text-sm text-cyan-200 tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                柜台业务量统计
              </span>
            </div>
            <div className="h-[280px] px-2">
              <ReactECharts option={counterOption} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>

          <div className="hud-panel rounded-lg p-1 relative overflow-hidden">
            <div className="corner-decoration corner-tl" />
            <div className="corner-decoration corner-tr" />
            <div className="corner-decoration corner-bl" />
            <div className="corner-decoration corner-br" />
            <div className="hud-panel-title px-4 py-2 mb-2 rounded">
              <span className="font-orbitron text-sm text-cyan-200 tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                ATM现金库存统计
              </span>
            </div>
            <div className="h-[280px] px-2">
              <ReactECharts option={cashOption} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>

        <div className="hud-panel rounded-lg p-1 relative overflow-hidden">
          <div className="corner-decoration corner-tl" />
          <div className="corner-decoration corner-tr" />
          <div className="corner-decoration corner-bl" />
          <div className="corner-decoration corner-br" />
          <div className="hud-panel-title px-4 py-2 mb-2 rounded">
            <span className="font-orbitron text-sm text-cyan-200 tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4" />
              安防事件记录
            </span>
          </div>
          <div className="px-2 pb-2">
            <div className="overflow-x-auto rounded border border-cyan-900/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cyan-950/50">
                    <th className="px-4 py-2 text-left text-[11px] font-orbitron text-cyan-400 tracking-wider">时间</th>
                    <th className="px-4 py-2 text-left text-[11px] font-orbitron text-cyan-400 tracking-wider">事件类型</th>
                    <th className="px-4 py-2 text-left text-[11px] font-orbitron text-cyan-400 tracking-wider">事件描述</th>
                  </tr>
                </thead>
                <tbody>
                  {report.securityEvents.map((e, i) => (
                    <tr key={i} className="border-t border-cyan-900/30 hover:bg-cyan-950/30">
                      <td className="px-4 py-2 text-cyan-200 font-orbitron text-xs">{e.time}</td>
                      <td className="px-4 py-2">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40 font-orbitron">
                          {e.type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-300 text-xs">{e.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="hud-panel rounded-lg p-1 relative overflow-hidden">
          <div className="corner-decoration corner-tl" />
          <div className="corner-decoration corner-tr" />
          <div className="corner-decoration corner-bl" />
          <div className="corner-decoration corner-br" />
          <div className="hud-panel-title px-4 py-2 mb-2 rounded">
            <span className="font-orbitron text-sm text-cyan-200 tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              现金库存明细
            </span>
          </div>
          <div className="px-2 pb-2">
            <div className="overflow-x-auto rounded border border-cyan-900/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cyan-950/50">
                    <th className="px-4 py-2 text-left text-[11px] font-orbitron text-cyan-400 tracking-wider">ATM编号</th>
                    <th className="px-4 py-2 text-right text-[11px] font-orbitron text-cyan-400 tracking-wider">起始库存</th>
                    <th className="px-4 py-2 text-right text-[11px] font-orbitron text-cyan-400 tracking-wider">终止库存</th>
                    <th className="px-4 py-2 text-right text-[11px] font-orbitron text-cyan-400 tracking-wider">当日加钞</th>
                  </tr>
                </thead>
                <tbody>
                  {report.cashInventory.map((c, i) => (
                    <tr key={i} className="border-t border-cyan-900/30 hover:bg-cyan-950/30">
                      <td className="px-4 py-2 text-cyan-200 font-orbitron font-bold text-xs">{c.name}</td>
                      <td className="px-4 py-2 text-right text-slate-300 font-orbitron text-xs">{formatCurrency(c.startBalance)}</td>
                      <td className={`px-4 py-2 text-right font-orbitron text-xs ${c.endBalance < 100000 ? 'text-red-300' : 'text-emerald-300'}`}>
                        {formatCurrency(c.endBalance)}
                      </td>
                      <td className="px-4 py-2 text-right text-cyan-300 font-orbitron text-xs">{formatCurrency(c.refilled)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
