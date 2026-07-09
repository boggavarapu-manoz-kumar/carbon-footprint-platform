import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, Cell } from 'recharts';

const ZoomableBarChart = ({ data = [], dataKey = "emissions", xAxisKey = "label", color = "#0ea5e9" }) => {
  const [refAreaLeft, setRefAreaLeft] = useState('');
  const [refAreaRight, setRefAreaRight] = useState('');
  const [left, setLeft] = useState('dataMin');
  const [right, setRight] = useState('dataMax');
  const [top, setTop] = useState('dataMax+1');
  const [bottom, setBottom] = useState('dataMin');
  const [activeIndex, setActiveIndex] = useState(null);

  const getAxisYDomain = (from, to, refLeft, refRight) => {
    let min = Infinity;
    let max = -Infinity;
    if (!data || data.length === 0) return [0, 100];
    let leftIndex = data.findIndex(d => d[xAxisKey] === refLeft);
    let rightIndex = data.findIndex(d => d[xAxisKey] === refRight);
    if (leftIndex > rightIndex) [leftIndex, rightIndex] = [rightIndex, leftIndex];
    if (leftIndex === -1 || rightIndex === -1) return [0, 100];
    const subData = data.slice(leftIndex, rightIndex + 1);
    for (let i = 0; i < subData.length; i++) {
      if (subData[i][dataKey] < min) min = subData[i][dataKey];
      if (subData[i][dataKey] > max) max = subData[i][dataKey];
    }
    return [(min | 0), (max | 0) + 1];
  };

  const zoom = () => {
    if (refAreaLeft === refAreaRight || refAreaRight === '') {
      setRefAreaLeft('');
      setRefAreaRight('');
      return;
    }
    let leftBound = refAreaLeft;
    let rightBound = refAreaRight;
    const leftIndex = data.findIndex(d => d[xAxisKey] === refAreaLeft);
    const rightIndex = data.findIndex(d => d[xAxisKey] === refAreaRight);
    if (leftIndex > rightIndex) {
      leftBound = refAreaRight;
      rightBound = refAreaLeft;
    }
    const [bottomDomain, topDomain] = getAxisYDomain(bottom, top, leftBound, rightBound);
    setRefAreaLeft('');
    setRefAreaRight('');
    setLeft(leftBound);
    setRight(rightBound);
    setBottom(bottomDomain);
    setTop(topDomain);
  };

  const zoomOut = () => {
    setRefAreaLeft('');
    setRefAreaRight('');
    setLeft('dataMin');
    setRight('dataMax');
    setTop('dataMax+1');
    setBottom('dataMin');
  };

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[350px] text-slate-500 text-sm">No data available</div>;
  }

  return (
    <div className="w-full h-[350px] flex flex-col select-none">
      <div className="flex justify-end mb-2">
        <button onClick={zoomOut} className="text-xs font-medium px-2 py-1 text-slate-600 hover:text-slate-900 transition-colors">
          Reset Zoom
        </button>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} onMouseDown={(e) => e && setRefAreaLeft(e.activeLabel)} onMouseMove={(e) => e && refAreaLeft && setRefAreaRight(e.activeLabel)} onMouseUp={zoom} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey={xAxisKey} domain={[left, right]} allowDataOverflow tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis domain={[bottom, top]} allowDataOverflow tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: 'none' }} formatter={(value) => [Number(value).toLocaleString() + ' kg', 'Emissions']} />
            <Bar dataKey={dataKey} radius={[2, 2, 0, 0]} onMouseEnter={(_, index) => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={color} fillOpacity={activeIndex === null || activeIndex === index ? 1 : 0.6} style={{ transition: 'fill-opacity 0.2s ease' }} />
              ))}
            </Bar>
            {refAreaLeft && refAreaRight ? <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill={color} fillOpacity={0.1} /> : null}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default React.memo(ZoomableBarChart);
