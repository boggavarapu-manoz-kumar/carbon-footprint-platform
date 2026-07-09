import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ZAxis, ReferenceArea, AreaChart, Area, LineChart, Line, Cell
} from 'recharts';

// ─── Theme Constants ──────────────────────────────────────────────────────────
const BLUE = '#3b82f6';
const LIGHT = '#f8fafc';
const SLATE_BAR = '#94a3b8';
const DOT_COLOR = '#0ea5e9';

// ─── Scrollable Wrapper ─────────────────────────────────────────────────────────
const ScrollWrap = ({ children, lastActiveTimestamp, startOfDay }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current && lastActiveTimestamp && startOfDay) {
      // Total timeline duration is 24 hours
      const durationMs = 24 * 60 * 60 * 1000;
      // Calculate fraction of the day where the last activity occurred
      const fraction = (lastActiveTimestamp - startOfDay) / durationMs;
      
      // Calculate total scrollable width (1440px content width)
      const containerWidth = scrollRef.current.clientWidth;
      const scrollableWidth = 1440;
      
      // Center the last active point in the view
      const targetScroll = (fraction * scrollableWidth) - (containerWidth / 2);
      
      if (targetScroll > 0) {
        scrollRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }
    }
  }, [lastActiveTimestamp, startOfDay]);

  return (
    <div 
      ref={scrollRef}
      style={{ overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', paddingBottom: 4, width: '100%' }}
    >
      <style>{`.thin-scroll::-webkit-scrollbar{height:4px}.thin-scroll::-webkit-scrollbar-track{background:#f1f5f9;border-radius:9999px}.thin-scroll::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:9999px}`}</style>
      <div className="thin-scroll" style={{ minWidth: 1440, height: 350 }}>
        {children}
      </div>
    </div>
  );
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ExactTimeTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        minWidth: '200px'
      }}>
        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px', fontSize: '14px' }}>
          {data.activityName}
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
          {data.categoryName}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Emission:</span>
          <span style={{ fontWeight: 600, color: '#ef4444' }}>{data.emissionValue} kg CO₂e</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Time:</span>
          <span style={{ fontWeight: 500, color: '#334155' }}>{data.formattedTime}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Date:</span>
          <span style={{ fontWeight: 500, color: '#334155' }}>{data.formattedDate}</span>
        </div>
      </div>
    );
  }
  return null;
};

// ─── Shared Props ─────────────────────────────────────────────────────────────
const formatHour = (tickItem) => {
  const date = new Date(tickItem);
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  return `${hours} ${ampm}`;
};

// ─── Individual Charts ────────────────────────────────────────────────────────
const ScatterTimeline = ({ data, startOfDay, endOfDay, lastActiveTimestamp }) => (
  <ScrollWrap lastActiveTimestamp={lastActiveTimestamp} startOfDay={startOfDay}>
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
          dataKey="timestamp" 
          type="number" 
          domain={[startOfDay, endOfDay]} 
          tickFormatter={formatHour}
          ticks={Array.from({length: 25}, (_, i) => startOfDay + i * 3600000)} // Every hour
          interval={0}
          stroke="#94a3b8" 
          tick={{ fill: '#64748b', fontSize: 12 }} 
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          dataKey="emissionValue" 
          stroke="#94a3b8" 
          tick={{ fill: '#64748b', fontSize: 12 }} 
          tickLine={false}
          axisLine={false}
        />
        <ZAxis dataKey="emissionValue" range={[60, 400]} />
        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<ExactTimeTooltip />} />
        <Scatter name="Activities" data={data} fill={DOT_COLOR}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={DOT_COLOR} opacity={0.8} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  </ScrollWrap>
);

const ExactAreaChart = ({ data, startOfDay, endOfDay, lastActiveTimestamp }) => (
  <ScrollWrap lastActiveTimestamp={lastActiveTimestamp} startOfDay={startOfDay}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <defs>
          <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={BLUE} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={BLUE} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
          dataKey="timestamp" 
          type="number" 
          domain={[startOfDay, endOfDay]} 
          tickFormatter={formatHour}
          ticks={Array.from({length: 25}, (_, i) => startOfDay + i * 3600000)} // Every hour
          interval={0}
          stroke="#94a3b8" 
          tick={{ fill: '#64748b', fontSize: 12 }} 
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#94a3b8" 
          tick={{ fill: '#64748b', fontSize: 12 }} 
          tickLine={false}
          axisLine={false}
        />
        <RechartsTooltip content={<ExactTimeTooltip />} />
        <Area type="monotone" dataKey="emissionValue" stroke={BLUE} fillOpacity={1} fill="url(#areaColor)" />
      </AreaChart>
    </ResponsiveContainer>
  </ScrollWrap>
);

const ExactLineChart = ({ data, startOfDay, endOfDay, lastActiveTimestamp }) => (
  <ScrollWrap lastActiveTimestamp={lastActiveTimestamp} startOfDay={startOfDay}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
          dataKey="timestamp" 
          type="number" 
          domain={[startOfDay, endOfDay]} 
          tickFormatter={formatHour}
          ticks={Array.from({length: 25}, (_, i) => startOfDay + i * 3600000)} // Every hour
          interval={0}
          stroke="#94a3b8" 
          tick={{ fill: '#64748b', fontSize: 12 }} 
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#94a3b8" 
          tick={{ fill: '#64748b', fontSize: 12 }} 
          tickLine={false}
          axisLine={false}
        />
        <RechartsTooltip content={<ExactTimeTooltip />} />
        <Line type="monotone" dataKey="emissionValue" stroke={BLUE} strokeWidth={3} dot={{ r: 5, fill: BLUE }} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  </ScrollWrap>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const DailyTimelineAnalyticsChart = ({ data = [], date = new Date() }) => {
  const [chartType, setChartType] = useState('scatter');
  const isEmpty = !data || data.length === 0;

  // Compute domains based on the requested date
  const startOfDay = useMemo(() => {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    return d.getTime();
  }, [date]);

  const endOfDay = useMemo(() => {
    const d = new Date(date);
    d.setHours(23,59,59,999);
    return d.getTime();
  }, [date]);

  // Format data
  const formattedData = useMemo(() => {
    if (!data) return [];
    return data.map(d => ({
      ...d,
      formattedDate: new Date(d.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
    })).sort((a, b) => a.timestamp - b.timestamp);
  }, [data]);

  // Analytics Insights
  const insights = useMemo(() => {
    if (isEmpty) return null;
    let totalEmissions = 0;
    const hourlyCounts = Array(24).fill(0);
    const hourlyEmissions = Array(24).fill(0);
    
    formattedData.forEach(d => {
      totalEmissions += d.emissionValue;
      const hour = new Date(d.timestamp).getHours();
      hourlyCounts[hour]++;
      hourlyEmissions[hour] += d.emissionValue;
    });

    const maxActiveHour = hourlyCounts.indexOf(Math.max(...hourlyCounts));
    const maxCarbonHour = hourlyEmissions.indexOf(Math.max(...hourlyEmissions));
    const minCarbonHour = hourlyEmissions.indexOf(Math.min(...hourlyEmissions.filter(e => e > 0)) || 0);

    const formatHr = (hr) => {
      if (hr === -1) return 'N/A';
      const ampm = hr >= 12 ? 'PM' : 'AM';
      const h = hr % 12 || 12;
      return `${h}:00 ${ampm}`;
    };

    return {
      mostActiveHour: formatHr(maxActiveHour),
      peakUsageTime: formatHr(maxCarbonHour),
      highestCarbonHour: formatHr(maxCarbonHour),
      lowestCarbonHour: formatHr(minCarbonHour),
      totalActivities: formattedData.length,
      averageCarbon: (totalEmissions / formattedData.length).toFixed(2)
    };
  }, [formattedData, isEmpty]);

  const lastActiveTimestamp = useMemo(() => {
    if (!formattedData || formattedData.length === 0) return null;
    return formattedData[formattedData.length - 1].timestamp;
  }, [formattedData]);

  const renderChart = () => {
    if (isEmpty) {
      return (
        <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
          No activities recorded for this date.
        </div>
      );
    }
    const props = { data: formattedData, startOfDay, endOfDay, lastActiveTimestamp };
    switch (chartType) {
      case 'area':
        return <ExactAreaChart {...props} />;
      case 'line':
        return <ExactLineChart {...props} />;
      default:
        return <ScatterTimeline {...props} />;
    }
  };

  return (
    <div>
      {/* Header & Tabs */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>Daily Activity Timeline</h3>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#f8fafc', padding: 4, borderRadius: 8, width: 'fit-content' }}>
          {['scatter', 'area', 'line'].map(type => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                border: 'none',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                background: chartType === type ? '#fff' : 'transparent',
                color: chartType === type ? '#0f172a' : '#64748b',
                boxShadow: chartType === type ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {type === 'scatter' ? 'Timeline' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 350, width: '100%', marginBottom: 24 }}>
        {renderChart()}
      </div>

      {/* Insights */}
      {!isEmpty && insights && (
        <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 600, color: '#334155' }}>Analytics Insights</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
            <InsightItem label="Total Activities" value={insights.totalActivities} />
            <InsightItem label="Avg Carbon/Activity" value={`${insights.averageCarbon} kg`} />
            <InsightItem label="Peak Usage Time" value={insights.peakUsageTime} />
            <InsightItem label="Most Active Hour" value={insights.mostActiveHour} />
            <InsightItem label="Highest Carbon Hour" value={insights.highestCarbonHour} />
            <InsightItem label="Lowest Carbon Hour" value={insights.lowestCarbonHour} />
          </div>
        </div>
      )}
    </div>
  );
};

const InsightItem = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 600 }}>{value}</span>
  </div>
);
