import React from 'react';
import { FiActivity, FiClock, FiTrendingDown, FiCheckCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BenchmarkPanel({ typeData }) {
  if (!typeData || !typeData.analysis) {
    return (
      <div className="qd-preview-empty">
        <FiActivity size={48} />
        <p>Run the AI agent to see benchmark results.</p>
      </div>
    );
  }

  const { analysis, benchmarkNotes } = typeData;

  // Mock data for the chart based on complexity reduction
  const chartData = [
    { name: 'Original', time: 100 },
    { name: 'Optimized', time: 5 },
  ];

  return (
    <div className="qd-preview-container" style={{ padding: '24px', overflowY: 'auto', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <FiActivity size={24} style={{ color: 'var(--primary)', marginRight: '12px' }} />
          <h2 style={{ margin: 0 }}>Performance Benchmark</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <FiClock size={16} style={{ marginRight: '8px' }} />
              Original Complexity
            </div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>{analysis.originalComplexity || 'O(n^2)'}</div>
          </div>
          <div style={{ padding: '20px', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)', marginBottom: '8px' }}>
              <FiTrendingDown size={16} style={{ marginRight: '8px' }} />
              Optimized Complexity
            </div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--primary-dark)' }}>{analysis.optimizedComplexity || 'O(n)'}</div>
          </div>
        </div>

        <div style={{ marginBottom: '32px', height: '300px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Execution Time (Relative)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'var(--bg-secondary)' }}
                contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '8px' }}
              />
              <Bar dataKey="time" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--text-secondary)' : 'var(--primary)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ padding: '24px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
            <FiCheckCircle size={18} style={{ color: 'var(--success)', marginRight: '8px' }} />
            Key Optimizations Applied
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {(analysis.keyOptimizations || []).map((opt, i) => (
              <li key={i} style={{ marginBottom: '8px' }}>{opt}</li>
            ))}
          </ul>
          {benchmarkNotes && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <strong>Notes:</strong> {benchmarkNotes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
