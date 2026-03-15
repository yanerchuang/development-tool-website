import { useState } from 'react';
import { Card } from '../components/common';

export default function PercentageCalculator() {
  const [calc1, setCalc1] = useState({ value: '', percent: '', result: '' });
  const [calc2, setCalc2] = useState({ part: '', whole: '', result: '' });
  const [calc3, setCalc3] = useState({ from: '', to: '', result: '' });
  const [calc4, setCalc4] = useState({ value: '', percent: '', result: '' });

  const calculate1 = () => {
    const value = parseFloat(calc1.value);
    const percent = parseFloat(calc1.percent);
    if (!isNaN(value) && !isNaN(percent)) {
      const result = (value * percent) / 100;
      setCalc1(prev => ({ ...prev, result: result.toFixed(4) }));
    }
  };

  const calculate2 = () => {
    const part = parseFloat(calc2.part);
    const whole = parseFloat(calc2.whole);
    if (!isNaN(part) && !isNaN(whole) && whole !== 0) {
      const result = (part / whole) * 100;
      setCalc2(prev => ({ ...prev, result: result.toFixed(4) }));
    }
  };

  const calculate3 = () => {
    const from = parseFloat(calc3.from);
    const to = parseFloat(calc3.to);
    if (!isNaN(from) && !isNaN(to) && from !== 0) {
      const result = ((to - from) / from) * 100;
      setCalc3(prev => ({ ...prev, result: result.toFixed(4) }));
    }
  };

  const calculate4 = () => {
    const value = parseFloat(calc4.value);
    const percent = parseFloat(calc4.percent);
    if (!isNaN(value) && !isNaN(percent)) {
      const result = value + (value * percent) / 100;
      setCalc4(prev => ({ ...prev, result: result.toFixed(4) }));
    }
  };

  const inputStyle = {
    width: '100px',
    padding: '8px',
    borderRadius: 'var(--border-radius)',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
  };

  const resultBoxStyle = {
    padding: '12px',
    background: 'var(--bg-tertiary)',
    borderRadius: 'var(--border-radius)',
    textAlign: 'center' as const,
    fontFamily: 'monospace',
    fontSize: '16px',
    fontWeight: 500,
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="百分比计算器">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Calc 1: What is X% of Y? */}
          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              求一个数的百分之几
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="number"
                value={calc1.percent}
                onChange={e => setCalc1(prev => ({ ...prev, percent: e.target.value }))}
                placeholder="百分比"
                style={inputStyle}
              />
              <span>% 的</span>
              <input
                type="number"
                value={calc1.value}
                onChange={e => setCalc1(prev => ({ ...prev, value: e.target.value }))}
                placeholder="数值"
                style={inputStyle}
              />
              <span>= </span>
              <button className="btn btn-primary" onClick={calculate1}>计算</button>
            </div>
            {calc1.result && (
              <div style={{ ...resultBoxStyle, marginTop: '12px' }}>
                {calc1.percent}% 的 {calc1.value} = <strong>{calc1.result}</strong>
              </div>
            )}
          </div>

          {/* Calc 2: X is what % of Y? */}
          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              求一个数是另一个数的百分之几
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="number"
                value={calc2.part}
                onChange={e => setCalc2(prev => ({ ...prev, part: e.target.value }))}
                placeholder="部分"
                style={inputStyle}
              />
              <span>是</span>
              <input
                type="number"
                value={calc2.whole}
                onChange={e => setCalc2(prev => ({ ...prev, whole: e.target.value }))}
                placeholder="整体"
                style={inputStyle}
              />
              <span>的 </span>
              <button className="btn btn-primary" onClick={calculate2}>计算</button>
            </div>
            {calc2.result && (
              <div style={{ ...resultBoxStyle, marginTop: '12px' }}>
                {calc2.part} 是 {calc2.whole} 的 <strong>{calc2.result}%</strong>
              </div>
            )}
          </div>

          {/* Calc 3: Percentage change */}
          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              计算百分比变化（增加或减少）
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>从</span>
              <input
                type="number"
                value={calc3.from}
                onChange={e => setCalc3(prev => ({ ...prev, from: e.target.value }))}
                placeholder="原值"
                style={inputStyle}
              />
              <span>到</span>
              <input
                type="number"
                value={calc3.to}
                onChange={e => setCalc3(prev => ({ ...prev, to: e.target.value }))}
                placeholder="新值"
                style={inputStyle}
              />
              <button className="btn btn-primary" onClick={calculate3}>计算</button>
            </div>
            {calc3.result && (
              <div style={{ ...resultBoxStyle, marginTop: '12px' }}>
                从 {calc3.from} 到 {calc3.to}: <strong>{calc3.result}%</strong>
                {parseFloat(calc3.result) > 0 ? ' (增加)' : ' (减少)'}
              </div>
            )}
          </div>

          {/* Calc 4: Add/Subtract percentage */}
          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              增加/减少百分比
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="number"
                value={calc4.value}
                onChange={e => setCalc4(prev => ({ ...prev, value: e.target.value }))}
                placeholder="数值"
                style={inputStyle}
              />
              <span>增加</span>
              <input
                type="number"
                value={calc4.percent}
                onChange={e => setCalc4(prev => ({ ...prev, percent: e.target.value }))}
                placeholder="百分比"
                style={inputStyle}
              />
              <span>% = </span>
              <button className="btn btn-primary" onClick={calculate4}>计算</button>
            </div>
            {calc4.result && (
              <div style={{ ...resultBoxStyle, marginTop: '12px' }}>
                {calc4.value} + {calc4.percent}% = <strong>{calc4.result}</strong>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card title="常用百分比公式">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', fontFamily: 'monospace' }}>
            X% of Y = (X / 100) × Y
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', fontFamily: 'monospace' }}>
            X is what % of Y = (X / Y) × 100
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', fontFamily: 'monospace' }}>
            Percentage change = ((New - Old) / Old) × 100
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', fontFamily: 'monospace' }}>
            X + Y% = X × (1 + Y/100)
          </div>
        </div>
      </Card>
    </div>
  );
}