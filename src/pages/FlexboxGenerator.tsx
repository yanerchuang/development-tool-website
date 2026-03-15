import { useState } from 'react';
import { Card, Button } from '../components/common';

export default function FlexboxGenerator() {
  const [direction, setDirection] = useState<'row' | 'column'>('row');
  const [justify, setJustify] = useState<'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'>('flex-start');
  const [align, setAlign] = useState<'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'>('stretch');
  const [wrap, setWrap] = useState<'nowrap' | 'wrap' | 'wrap-reverse'>('nowrap');
  const [gap, setGap] = useState(10);

  const cssCode = `.container {
  display: flex;
  flex-direction: ${direction};
  justify-content: ${justify};
  align-items: ${align};
  flex-wrap: ${wrap};
  gap: ${gap}px;
}`;

  const renderFlexItems = () => {
    return [1, 2, 3, 4].map(i => (
      <div
        key={i}
        style={{
          background: 'var(--accent-primary)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          minWidth: '60px',
          minHeight: '40px',
          fontWeight: 500,
          padding: '8px 16px',
        }}
      >
        {i}
      </div>
    ));
  };

  const copyCode = () => {
    navigator.clipboard.writeText(cssCode);
  };

  const selectStyle = {
    padding: '8px',
    borderRadius: 'var(--border-radius)',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="Flexbox 生成器">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>方向</div>
              <select
                value={direction}
                onChange={e => setDirection(e.target.value as typeof direction)}
                style={{ ...selectStyle, width: '100%' }}
              >
                <option value="row">row (水平)</option>
                <option value="column">column (垂直)</option>
              </select>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>主轴对齐</div>
              <select
                value={justify}
                onChange={e => setJustify(e.target.value as typeof justify)}
                style={{ ...selectStyle, width: '100%' }}
              >
                <option value="flex-start">flex-start</option>
                <option value="flex-end">flex-end</option>
                <option value="center">center</option>
                <option value="space-between">space-between</option>
                <option value="space-around">space-around</option>
                <option value="space-evenly">space-evenly</option>
              </select>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>交叉轴对齐</div>
              <select
                value={align}
                onChange={e => setAlign(e.target.value as typeof align)}
                style={{ ...selectStyle, width: '100%' }}
              >
                <option value="flex-start">flex-start</option>
                <option value="flex-end">flex-end</option>
                <option value="center">center</option>
                <option value="stretch">stretch</option>
                <option value="baseline">baseline</option>
              </select>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>换行</div>
              <select
                value={wrap}
                onChange={e => setWrap(e.target.value as typeof wrap)}
                style={{ ...selectStyle, width: '100%' }}
              >
                <option value="nowrap">nowrap</option>
                <option value="wrap">wrap</option>
                <option value="wrap-reverse">wrap-reverse</option>
              </select>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                间距: {gap}px
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={gap}
                onChange={e => setGap(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Preview */}
          <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>预览</div>
            <div
              style={{
                display: 'flex',
                flexDirection: direction,
                justifyContent: justify,
                alignItems: align,
                flexWrap: wrap,
                gap: `${gap}px`,
                minHeight: direction === 'row' ? '150px' : '300px',
                padding: '8px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--border-radius)',
              }}
            >
              {renderFlexItems()}
            </div>
          </div>

          {/* CSS Code */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>CSS 代码</span>
              <Button variant="secondary" size="sm" onClick={copyCode}>复制</Button>
            </div>
            <pre style={{
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--border-radius)',
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '13px',
              margin: 0,
            }}>
              {cssCode}
            </pre>
          </div>
        </div>
      </Card>

      <Card title="Flexbox 属性说明">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>justify-content (主轴对齐)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
              {['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'].map(j => (
                <div key={j} style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', fontSize: '12px', fontFamily: 'monospace' }}>
                  {j}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>align-items (交叉轴对齐)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
              {['flex-start', 'flex-end', 'center', 'stretch', 'baseline'].map(a => (
                <div key={a} style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', fontSize: '12px', fontFamily: 'monospace' }}>
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card title="常用示例">
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>水平垂直居中</div>
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px' }}>
{`display: flex;
justify-content: center;
align-items: center;`}
            </pre>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>两端对齐</div>
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px' }}>
{`display: flex;
justify-content: space-between;`}
            </pre>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>等宽元素</div>
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px' }}>
{`display: flex;
/* 子元素设置 */
.item { flex: 1; }`}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}