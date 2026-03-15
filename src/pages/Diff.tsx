import { useState, useMemo } from 'react';
import { Card, Button, TextArea } from '../components/common';
import { computeDiff, getDiffStats, type DiffLine } from '../utils/diff';

export default function Diff() {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');

  const diff = useMemo(() => {
    if (!leftText && !rightText) return [];
    return computeDiff(leftText, rightText);
  }, [leftText, rightText]);

  const stats = useMemo(() => getDiffStats(diff), [diff]);

  const handleSwap = () => {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
  };

  const handleClear = () => {
    setLeftText('');
    setRightText('');
  };

  const renderDiffLine = (line: DiffLine, index: number) => {
    const bgColors = {
      add: 'rgba(64, 192, 87, 0.15)',
      remove: 'rgba(250, 82, 82, 0.15)',
      same: 'transparent',
    };
    const borderColors = {
      add: 'rgba(64, 192, 87, 0.5)',
      remove: 'rgba(250, 82, 82, 0.5)',
      same: 'transparent',
    };
    const prefixes = {
      add: '+',
      remove: '-',
      same: ' ',
    };

    return (
      <div
        key={index}
        style={{
          display: 'flex',
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: '1.5',
          background: bgColors[line.type],
          borderLeft: `3px solid ${borderColors[line.type]}`,
        }}
      >
        <span
          style={{
            width: '40px',
            padding: '0 8px',
            color: 'var(--text-muted)',
            textAlign: 'right',
            background: 'var(--bg-tertiary)',
            flexShrink: 0,
          }}
        >
          {line.oldLine || ''}
        </span>
        <span
          style={{
            width: '40px',
            padding: '0 8px',
            color: 'var(--text-muted)',
            textAlign: 'right',
            background: 'var(--bg-tertiary)',
            borderRight: '1px solid var(--border-color)',
            flexShrink: 0,
          }}
        >
          {line.newLine || ''}
        </span>
        <span
          style={{
            width: '20px',
            textAlign: 'center',
            color: line.type === 'add' ? 'var(--accent-success)' : line.type === 'remove' ? 'var(--accent-danger)' : 'var(--text-muted)',
            flexShrink: 0,
          }}
        >
          {prefixes[line.type]}
        </span>
        <span style={{ padding: '0 8px', whiteSpace: 'pre', overflow: 'hidden' }}>
          {line.content || ' '}
        </span>
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* 输入区域 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <Card title="原始文本">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <TextArea
              value={leftText}
              onChange={e => setLeftText(e.target.value)}
              placeholder="输入原始文本..."
              style={{ minHeight: '200px' }}
            />
          </div>
        </Card>

        <Card title="新文本">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <TextArea
              value={rightText}
              onChange={e => setRightText(e.target.value)}
              placeholder="输入新文本..."
              style={{ minHeight: '200px' }}
            />
          </div>
        </Card>
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Button variant="secondary" size="sm" onClick={handleClear}>
          清空
        </Button>
        <Button variant="secondary" size="sm" onClick={handleSwap}>
          交换
        </Button>
        <div style={{ flex: 1 }} />
        {diff.length > 0 && (
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
            <span style={{ color: 'var(--accent-success)' }}>+{stats.added} 新增</span>
            <span style={{ color: 'var(--accent-danger)' }}>-{stats.removed} 删除</span>
            <span style={{ color: 'var(--text-secondary)' }}>{stats.unchanged} 相同</span>
          </div>
        )}
      </div>

      {/* 差异结果 */}
      {diff.length > 0 && (
        <Card title="差异对比">
          <div
            style={{
              background: 'var(--bg-primary)',
              borderRadius: 'var(--border-radius)',
              overflow: 'auto',
              maxHeight: '500px',
            }}
          >
            {diff.map((line, index) => renderDiffLine(line, index))}
          </div>
        </Card>
      )}
    </div>
  );
}