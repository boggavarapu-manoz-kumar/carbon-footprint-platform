import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LabelList, AreaChart, Area, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ComposedChart,
} from 'recharts';

// ─── design tokens ────────────────────────────────────────────────────────────
const BLUE   = '#2563eb';
const SLATE_BAR = '#475569';
const GREEN  = '#059669';
const SLATE  = '#64748b';
const LIGHT  = '#f8fafc';
const BORDER = '#e2e8f0';

// ─── chart type config ────────────────────────────────────────────────────────
const CHART_TYPES = [
  { id: 'labeled',    label: 'Labeled' },
  { id: 'bar',        label: 'Bar' },
  { id: 'horizontal', label: 'Horizontal' },
  { id: 'area',       label: 'Area' },
  { id: 'line',       label: 'Line' },
  { id: 'composed',   label: 'Combined' },
  { id: 'radar',      label: 'Radar' },
];

// ─── number formatter ─────────────────────────────────────────────────────────
const fmtAxis = (v) => {
  const n = Number(v);
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n % 1 === 0 ? n.toString() : n.toFixed(1);
};
const fmtVal = (v) =>
  Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });

// ─── shared axis props ────────────────────────────────────────────────────────
const xAxisProps = {
  tick: { fill: SLATE, fontSize: 11, fontFamily: 'inherit' },
  tickLine: false,
  axisLine: false,
  dy: 6,
};
const yAxisProps = {
  tick: { fill: '#94a3b8', fontSize: 11, fontFamily: 'inherit' },
  tickLine: false,
  axisLine: false,
  tickFormatter: fmtAxis,
  width: 48,
};
const gridProps = {
  strokeDasharray: '4 4',
  vertical: false,
  stroke: '#f1f5f9',
};

// ─── rich tooltip ─────────────────────────────────────────────────────────────
const RichTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = Number(payload[0]?.value || 0);
  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${BORDER}`,
      borderRadius: 10,
      padding: '10px 16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.09)',
      minWidth: 160,
    }}>
      <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </p>
      <p style={{ fontSize: 20, color: '#0f172a', fontWeight: 700, lineHeight: 1 }}>
        {fmtVal(val)}
        <span style={{ fontSize: 12, color: SLATE, fontWeight: 400, marginLeft: 4 }}>kg CO₂e</span>
      </p>
    </div>
  );
};

// ─── value label rendered on top of a bar ─────────────────────────────────────
const TopLabel = ({ x, y, width, value }) => {
  if (!value || Number(value) === 0) return null;
  return (
    <text
      x={x + width / 2} y={y - 7}
      fill={BLUE} textAnchor="middle"
      fontSize={10} fontWeight={700} fontFamily="inherit"
    >
      {fmtAxis(value)}
    </text>
  );
};

// ─── gradient defs reused across charts ──────────────────────────────────────
const GradDef = ({ id, color }) => (
  <defs>
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor={color} stopOpacity={0.22} />
      <stop offset="100%" stopColor={color} stopOpacity={0} />
    </linearGradient>
  </defs>
);

// ─── scrollable wrapper – auto-scrolls to target index on mount ──────────────
const ScrollWrap = ({ data, children, minPer = 52, autoScrollToIndex = null }) => {
  const containerRef = useRef(null);
  const minW = Math.max(data.length * minPer, 500);
  const barW  = minW / data.length;

  useEffect(() => {
    if (autoScrollToIndex === null || !containerRef.current) return;
    // Scroll so the target bar is roughly centered in the viewport
    const targetPx = autoScrollToIndex * barW;
    const containerW = containerRef.current.clientWidth;
    const scrollTo = Math.max(0, targetPx - containerW / 2 + barW / 2);
    containerRef.current.scrollLeft = scrollTo;
  }, [autoScrollToIndex, barW]);

  return (
    <div
      ref={containerRef}
      style={{ overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', paddingBottom: 4 }}
    >
      <style>{`.thin-scroll::-webkit-scrollbar{height:4px}.thin-scroll::-webkit-scrollbar-track{background:#f1f5f9;border-radius:9999px}.thin-scroll::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:9999px}`}</style>
      <div className="thin-scroll" style={{ minWidth: minW, height: 310 }}>
        {children}
      </div>
    </div>
  );
};

// ─── individual charts ────────────────────────────────────────────────────────
/* ── plain Bar: slate color, square tops, no labels ── */
const PlainBar = ({ data, autoScrollToIndex }) => (
  <ScrollWrap data={data} minPer={44} autoScrollToIndex={autoScrollToIndex}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 4 }} barCategoryGap="35%">
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<RichTooltip />} cursor={{ fill: LIGHT }} />
        <Bar dataKey="emissions" fill={SLATE_BAR} fillOpacity={0.75} radius={[2, 2, 0, 0]} maxBarSize={64} />
      </BarChart>
    </ResponsiveContainer>
  </ScrollWrap>
);

/* ── Labeled Bar: blue, rounded tops, value above each bar ── */
const LabeledBar = ({ data, autoScrollToIndex }) => (
  <ScrollWrap data={data} minPer={64} autoScrollToIndex={autoScrollToIndex}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 30, right: 8, left: 0, bottom: 4 }} barCategoryGap="40%">
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<RichTooltip />} cursor={{ fill: LIGHT }} />
        <Bar dataKey="emissions" fill={BLUE} fillOpacity={1} radius={[6, 6, 0, 0]} maxBarSize={48}>
          <LabelList content={<TopLabel />} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </ScrollWrap>
);

const HorizontalBar = ({ data }) => {
  const itemH = 40;
  const h = Math.max(data.length * itemH + 32, 260);
  return (
    <div style={{ overflowY: 'auto', maxHeight: 340, paddingRight: 2 }}>
      <div style={{ height: h }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 6, right: 80, left: 4, bottom: 6 }}>
            <CartesianGrid {...gridProps} horizontal={false} vertical={true} />
            <XAxis type="number" {...xAxisProps} dy={0} />
            <YAxis type="category" dataKey="label" width={88}
              tick={{ fill: '#334155', fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}
              tickLine={false} axisLine={false}
            />
            <Tooltip content={<RichTooltip />} cursor={{ fill: LIGHT }} />
            <Bar dataKey="emissions" fill={GREEN} fillOpacity={0.9} radius={[0, 5, 5, 0]} maxBarSize={26}>
              <LabelList
                dataKey="emissions"
                position="right"
                formatter={(v) => `${fmtVal(v)} kg`}
                style={{ fontSize: 10, fill: SLATE, fontWeight: 600, fontFamily: 'inherit' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const AreaChart_ = ({ data, autoScrollToIndex }) => (
  <ScrollWrap data={data} minPer={44} autoScrollToIndex={autoScrollToIndex}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={BLUE} stopOpacity={1} />
            <stop offset="100%" stopColor={BLUE} stopOpacity={0.85} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...xAxisProps} minTickGap={24} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<RichTooltip />} />
        <Area
          type="monotone" dataKey="emissions"
          stroke={BLUE} strokeWidth={2.5} fill="url(#areaFill)"
          dot={{ r: 3.5, fill: '#fff', stroke: BLUE, strokeWidth: 2 }}
          activeDot={{ r: 5.5, fill: BLUE, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  </ScrollWrap>
);

const LineChart_ = ({ data, autoScrollToIndex }) => (
  <ScrollWrap data={data} minPer={44} autoScrollToIndex={autoScrollToIndex}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...xAxisProps} minTickGap={24} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<RichTooltip />} />
        <Line
          type="monotone" dataKey="emissions"
          stroke={GREEN} strokeWidth={2.5}
          dot={{ r: 4, fill: '#fff', stroke: GREEN, strokeWidth: 2.5 }}
          activeDot={{ r: 6, fill: GREEN, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </ScrollWrap>
);

const ComposedChart_ = ({ data, autoScrollToIndex }) => (
  <ScrollWrap data={data} minPer={52} autoScrollToIndex={autoScrollToIndex}>
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
        <GradDef id="compFill" color={BLUE} />
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<RichTooltip />} cursor={{ fill: LIGHT }} />
        <Bar dataKey="emissions" fill={BLUE} fillOpacity={0.15} radius={[4, 4, 0, 0]} maxBarSize={52} />
        <Area type="monotone" dataKey="emissions" stroke={BLUE} strokeWidth={2} fill="url(#compFill)" dot={false} />
        <Line type="monotone" dataKey="emissions" stroke={GREEN} strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
      </ComposedChart>
    </ResponsiveContainer>
  </ScrollWrap>
);

const RadarChart_ = ({ data }) => (
  <div style={{ height: 310 }}>
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
        <PolarGrid stroke={BORDER} radialLines={true} />
        <PolarAngleAxis dataKey="label"
          tick={{ fill: SLATE, fontSize: 11, fontFamily: 'inherit' }}
        />
        <PolarRadiusAxis tick={{ fill: '#94a3b8', fontSize: 9 }} tickFormatter={fmtAxis} />
        <Tooltip content={<RichTooltip />} />
        <Radar dataKey="emissions" stroke={BLUE} fill={BLUE} fillOpacity={0.16} strokeWidth={2}
          dot={{ r: 3, fill: BLUE, strokeWidth: 0 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  </div>
);

// ─── empty state ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div style={{ height: 310 }} className="flex flex-col items-center justify-center gap-3">
    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#94a3b8">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </div>
    <p style={{ color: '#94a3b8', fontSize: 13 }}>No data for this period</p>
  </div>
);

// ─── main exported component ──────────────────────────────────────────────────
const EmissionsTrendChart = ({ data = [], title = 'Emissions Trend', defaultChartType = 'labeled', isDaily = false }) => {
  const [chartType, setChartType] = useState(defaultChartType);
  const isEmpty = !data || data.length === 0;
  const maxVal = isEmpty ? 0 : Math.max(...data.map(d => Number(d.emissions || 0)));

  // For daily view: auto-scroll to the last hour that has actual activity
  const lastActiveIdx = isDaily && !isEmpty
    ? (() => {
        let last = -1;
        data.forEach((d, i) => { if (Number(d.emissions || 0) > 0) last = i; });
        return last >= 0 ? last : null;
      })()
    : null;

  const renderChart = () => {
    if (isEmpty) return <EmptyState />;
    const asProp = lastActiveIdx;
    switch (chartType) {
      case 'bar':        return <PlainBar      data={data} autoScrollToIndex={asProp} />;
      case 'labeled':    return <LabeledBar    data={data} autoScrollToIndex={asProp} />;
      case 'horizontal': return <HorizontalBar data={data} />;
      case 'area':       return <AreaChart_    data={data} autoScrollToIndex={asProp} />;
      case 'line':       return <LineChart_    data={data} autoScrollToIndex={asProp} />;
      case 'composed':   return <ComposedChart_ data={data} autoScrollToIndex={asProp} />;
      case 'radar':      return <RadarChart_   data={data} />;
      default:           return <LabeledBar    data={data} autoScrollToIndex={asProp} />;
    }
  };

  return (
    <div>
      {/* ── header ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>{title}</h3>
            {!isEmpty && (
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                {data.length} period{data.length !== 1 ? 's' : ''} · peak {fmtVal(maxVal)} kg CO₂e
              </p>
            )}
          </div>
        </div>

        {/* ── chart type tab strip ─────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: 14,
          background: '#f1f5f9',
          borderRadius: 8,
          padding: 4,
          gap: 2,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          {CHART_TYPES.map((ct) => {
            const active = chartType === ct.id;
            return (
              <button
                key={ct.id}
                onClick={() => setChartType(ct.id)}
                style={{
                  flex: '0 0 auto',
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: active ? '#ffffff' : 'transparent',
                  color: active ? '#1e40af' : '#64748b',
                  fontSize: 12,
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  lineHeight: '1',
                }}
              >
                {ct.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── chart body ─────────────────────────────────────── */}
      {renderChart()}

      {/* ── scroll hint ────────────────────────────────────── */}
      {!isEmpty && data.length > 7 && !['horizontal', 'radar'].includes(chartType) && (
        <p style={{ textAlign: 'center', fontSize: 11, color: '#cbd5e1', marginTop: 8, letterSpacing: '0.02em' }}>
          ← scroll to see all →
        </p>
      )}
    </div>
  );
};

export default React.memo(EmissionsTrendChart);
