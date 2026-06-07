import { TrendingUp, Clock, Users } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useBankStore } from '@/store/useBankStore';

export default function ForecastPanel() {
  const forecast = useBankStore((s) => s.forecastData);
  const suggestions = useBankStore((s) => s.scheduleSuggestions);

  const option = {
    grid: { top: 10, right: 10, bottom: 20, left: 30 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10,30,60,0.9)',
      borderColor: '#00d4ff',
      textStyle: { color: '#e0f2ff', fontSize: 11 },
    },
    xAxis: {
      type: 'category',
      data: forecast.map((d) => d.time),
      axisLine: { lineStyle: { color: '#1e3a5f' } },
      axisLabel: { color: '#88aacc', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#88aacc', fontSize: 10 },
      splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } },
    },
    series: [
      {
        data: forecast.map((d) => d.predictedCount),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#00d4ff', width: 2, shadowColor: '#00d4ff', shadowBlur: 10 },
        itemStyle: { color: '#00d4ff', borderColor: '#fff', borderWidth: 1 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,212,255,0.4)' },
              { offset: 1, color: 'rgba(0,212,255,0.02)' },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="hud-panel rounded-lg p-1 relative overflow-hidden">
      <div className="corner-decoration corner-tl" />
      <div className="corner-decoration corner-tr" />
      <div className="corner-decoration corner-bl" />
      <div className="corner-decoration corner-br" />
      <div className="hud-panel-title px-3 py-2 flex items-center gap-2 mb-2 rounded">
        <TrendingUp className="w-4 h-4 text-cyan-400" />
        <span className="font-orbitron text-sm text-cyan-200 tracking-wider">客流预测与排班</span>
      </div>
      <div className="px-2">
        <div className="h-[120px]">
          <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
        </div>
        <div className="mt-2 space-y-1">
          <div className="text-[10px] text-slate-400 font-orbitron flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3" />
            智能排班建议
          </div>
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-center justify-between bg-cyan-950/30 rounded px-2 py-1 border border-cyan-900/50">
              <span className="text-[11px] text-cyan-200">{s.period}</span>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-cyan-400" />
                <span className="font-orbitron text-xs text-cyan-300 font-bold">{s.suggestedTellers}人</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
