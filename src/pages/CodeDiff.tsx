import { useState, useMemo } from 'react';
import { Card, Button, TextArea } from '../components/common';

interface DiffLine {
  type: 'add' | 'remove' | 'same';
  oldContent: string;
  newContent: string;
  oldLine: number;
  newLine: number;
}

export default function CodeDiff() {
  const [leftCode, setLeftCode] = useState('');
  const [rightCode, setRightCode] = useState('');
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('split');
  const [language, setLanguage] = useState('auto');

  const diff = useMemo<DiffLine[]>(() => {
    if (!leftCode && !rightCode) return [];

    const leftLines = leftCode.split('\n');
    const rightLines = rightCode.split('\n');

    const result: DiffLine[] = [];
    const lcs = computeLCS(leftLines, rightLines);

    let leftIdx = 0;
    let rightIdx = 0;
    let lcsIdx = 0;

    while (leftIdx < leftLines.length || rightIdx < rightLines.length) {
      if (lcsIdx < lcs.length && leftIdx < leftLines.length && rightIdx < rightLines.length) {
        if (leftLines[leftIdx] === lcs[lcsIdx] && rightLines[rightIdx] === lcs[lcsIdx]) {
          result.push({
            type: 'same',
            oldContent: leftLines[leftIdx],
            newContent: rightLines[rightIdx],
            oldLine: leftIdx + 1,
            newLine: rightIdx + 1,
          });
          leftIdx++;
          rightIdx++;
          lcsIdx++;
          continue;
        }
      }

      if (leftIdx < leftLines.length && (lcsIdx >= lcs.length || leftLines[leftIdx] !== lcs[lcsIdx])) {
        result.push({
          type: 'remove',
          oldContent: leftLines[leftIdx],
          newContent: '',
          oldLine: leftIdx + 1,
          newLine: 0,
        });
        leftIdx++;
      } else if (rightIdx < rightLines.length) {
        result.push({
          type: 'add',
          oldContent: '',
          newContent: rightLines[rightIdx],
          oldLine: 0,
          newLine: rightIdx + 1,
        });
        rightIdx++;
      }
    }

    return result;
  }, [leftCode, rightCode]);

  const stats = useMemo(() => {
    const added = diff.filter(d => d.type === 'add').length;
    const removed = diff.filter(d => d.type === 'remove').length;
    const unchanged = diff.filter(d => d.type === 'same').length;
    return { added, removed, unchanged };
  }, [diff]);

  const computeLCS = (a: string[], b: string[]): string[] => {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    const lcs: string[] = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        lcs.unshift(a[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    return lcs;
  };

  const handleSwap = () => {
    const temp = leftCode;
    setLeftCode(rightCode);
    setRightCode(temp);
  };

  const handleClear = () => {
    setLeftCode('');
    setRightCode('');
  };

  const loadSample = () => {
    setLeftCode(`function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`);

    setRightCode(`function calculateTotal(items) {
  return items.reduce((total, item) => {
    return total + item.price * (item.quantity || 1);
  }, 0);
}`);
  };

  const renderUnifiedLine = (line: DiffLine, index: number) => {
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

    return (
      <div
        key={index}
        style={{
          display: 'flex',
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: '1.6',
          background: bgColors[line.type],
          borderLeft: `3px solid ${borderColors[line.type]}`,
        }}
      >
        <span style={{ width: '50px', padding: '0 8px', color: 'var(--text-muted)', textAlign: 'right', background: 'var(--bg-tertiary)', flexShrink: 0 }}>
          {line.oldLine || ''}
        </span>
        <span style={{ width: '50px', padding: '0 8px', color: 'var(--text-muted)', textAlign: 'right', background: 'var(--bg-tertiary)', borderRight: '1px solid var(--border)', flexShrink: 0 }}>
          {line.newLine || ''}
        </span>
        <span style={{ width: '24px', textAlign: 'center', color: line.type === 'add' ? 'var(--accent-success)' : line.type === 'remove' ? 'var(--accent-danger)' : 'var(--text-muted)', flexShrink: 0 }}>
          {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
        </span>
        <span style={{ padding: '0 12px', whiteSpace: 'pre', flex: 1, overflow: 'hidden' }}>
          {line.type === 'remove' ? line.oldContent : line.newContent || ' '}
        </span>
      </div>
    );
  };

  const renderSplitLine = (line: DiffLine, index: number) => {
    const getBgStyle = (type: 'add' | 'remove' | 'same', side: 'left' | 'right') => {
      if (type === 'add' && side === 'right') return 'rgba(64, 192, 87, 0.15)';
      if (type === 'remove' && side === 'left') return 'rgba(250, 82, 82, 0.15)';
      return 'transparent';
    };

    const getBorderStyle = (type: 'add' | 'remove' | 'same', side: 'left' | 'right') => {
      if (type === 'add' && side === 'right') return '3px solid rgba(64, 192, 87, 0.5)';
      if (type === 'remove' && side === 'left') return '3px solid rgba(250, 82, 82, 0.5)';
      return 'none';
    };

    return (
      <div key={index} style={{ display: 'flex', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6' }}>
        {/* 左侧 */}
        <div style={{ display: 'flex', flex: 1, background: getBgStyle(line.type, 'left'), borderLeft: getBorderStyle(line.type, 'left') }}>
          <span style={{ width: '50px', padding: '0 8px', color: 'var(--text-muted)', textAlign: 'right', background: 'var(--bg-tertiary)', flexShrink: 0 }}>
            {line.oldLine || ''}
          </span>
          <span style={{ width: '24px', textAlign: 'center', color: line.type === 'remove' ? 'var(--accent-danger)' : 'var(--text-muted)', flexShrink: 0 }}>
            {line.type === 'remove' ? '-' : ' '}
          </span>
          <span style={{ padding: '0 12px', whiteSpace: 'pre', flex: 1, overflow: 'hidden', opacity: line.type === 'add' ? 0.3 : 1 }}>
            {line.oldContent || ' '}
          </span>
        </div>
        {/* 分隔线 */}
        <div style={{ width: '1px', background: 'var(--border)', flexShrink: 0 }} />
        {/* 右侧 */}
        <div style={{ display: 'flex', flex: 1, background: getBgStyle(line.type, 'right'), borderLeft: getBorderStyle(line.type, 'right') }}>
          <span style={{ width: '50px', padding: '0 8px', color: 'var(--text-muted)', textAlign: 'right', background: 'var(--bg-tertiary)', flexShrink: 0 }}>
            {line.newLine || ''}
          </span>
          <span style={{ width: '24px', textAlign: 'center', color: line.type === 'add' ? 'var(--accent-success)' : 'var(--text-muted)', flexShrink: 0 }}>
            {line.type === 'add' ? '+' : ' '}
          </span>
          <span style={{ padding: '0 12px', whiteSpace: 'pre', flex: 1, overflow: 'hidden', opacity: line.type === 'remove' ? 0.3 : 1 }}>
            {line.newContent || ' '}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="代码对比工具">
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" onClick={loadSample}>加载示例</Button>
            <Button variant="secondary" size="sm" onClick={handleClear}>清空</Button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="select" style={{ width: '120px' }}>
              <option value="auto">自动检测</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="json">JSON</option>
            </select>
            <Button variant="secondary" size="sm" onClick={handleSwap}>交换</Button>
          </div>
        </div>
      </Card>

      {viewMode === 'split' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Card title="原始代码">
            <TextArea
              value={leftCode}
              onChange={e => setLeftCode(e.target.value)}
              placeholder="输入原始代码..."
              style={{ minHeight: '250px', fontFamily: 'monospace' }}
            />
          </Card>
          <Card title="新代码">
            <TextArea
              value={rightCode}
              onChange={e => setRightCode(e.target.value)}
              placeholder="输入新代码..."
              style={{ minHeight: '250px', fontFamily: 'monospace' }}
            />
          </Card>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          <Card title="原始代码">
            <TextArea
              value={leftCode}
              onChange={e => setLeftCode(e.target.value)}
              placeholder="输入原始代码..."
              style={{ minHeight: '150px', fontFamily: 'monospace' }}
            />
          </Card>
          <Card title="新代码">
            <TextArea
              value={rightCode}
              onChange={e => setRightCode(e.target.value)}
              placeholder="输入新代码..."
              style={{ minHeight: '150px', fontFamily: 'monospace' }}
            />
          </Card>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-secondary)' }}>视图：</span>
        <div className="tabs" style={{ marginBottom: 0 }}>
          <button className={`tab ${viewMode === 'split' ? 'active' : ''}`} onClick={() => setViewMode('split')}>并排对比</button>
          <button className={`tab ${viewMode === 'unified' ? 'active' : ''}`} onClick={() => setViewMode('unified')}>统一视图</button>
        </div>
        <div style={{ flex: 1 }} />
        {diff.length > 0 && (
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
            <span style={{ color: 'var(--accent-success)' }}>+{stats.added} 新增</span>
            <span style={{ color: 'var(--accent-danger)' }}>-{stats.removed} 删除</span>
            <span style={{ color: 'var(--text-secondary)' }}>{stats.unchanged} 相同</span>
          </div>
        )}
      </div>

      {diff.length > 0 && (
        <Card title="对比结果">
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--border-radius)', overflow: 'auto', maxHeight: '500px' }}>
            {viewMode === 'unified' 
              ? diff.map((line, index) => renderUnifiedLine(line, index))
              : diff.map((line, index) => renderSplitLine(line, index))
            }
          </div>
        </Card>
      )}
    </div>
  );
}