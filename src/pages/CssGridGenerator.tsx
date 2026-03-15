import { useState } from 'react';
import { Card, Button } from '../components/common';

export default function CssGridGenerator() {
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(2);
  const [gap, setGap] = useState(10);
  const [itemCount, setItemCount] = useState(6);

  const cssCode = `.container {
  display: grid;
  grid-template-columns: repeat(${columns}, 1fr);
  grid-template-rows: repeat(${rows}, 1fr);
  gap: ${gap}px;
}`;

  const renderGridItems = () => {
    const items = [];
    for (let i = 1; i <= itemCount; i++) {
      items.push(
        <div
          key={i}
          style={{
            background: 'var(--accent-primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            minHeight: '40px',
            fontWeight: 500,
          }}
        >
          {i}
        </div>
      );
    }
    return items;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(cssCode);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="CSS Grid 生成器">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                列数: {columns}
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={columns}
                onChange={e => setColumns(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                行数: {rows}
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={rows}
                onChange={e => setRows(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
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
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                元素数量: {itemCount}
              </div>
              <input
                type="range"
                min="1"
                max="24"
                value={itemCount}
                onChange={e => setItemCount(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Preview */}
          <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>预览</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                gap: `${gap}px`,
                minHeight: '200px',
              }}
            >
              {renderGridItems()}
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

      <Card title="CSS Grid 常用属性">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>grid-template-columns</strong>: 定义列的大小和数量
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>grid-template-rows</strong>: 定义行的大小和数量
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>gap</strong>: 定义网格项之间的间距
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>grid-column</strong>: 定义项目跨越的列数 (如: grid-column: span 2)
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>grid-row</strong>: 定义项目跨越的行数 (如: grid-row: span 2)
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>justify-items</strong>: 水平对齐网格项
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>align-items</strong>: 垂直对齐网格项
          </div>
        </div>
      </Card>

      <Card title="常用示例">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>三栏布局</div>
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px' }}>
{`grid-template-columns: 1fr 2fr 1fr;
/* 中间列宽度是两侧的两倍 */`}
            </pre>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>响应式网格</div>
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px' }}>
{`grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
/* 自动适应，每列最小200px */`}
            </pre>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>圣杯布局</div>
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px' }}>
{`grid-template-areas:
  "header header header"
  "nav main aside"
  "footer footer footer";
grid-template-columns: 200px 1fr 200px;
grid-template-rows: auto 1fr auto;`}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}