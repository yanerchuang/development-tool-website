import { useState } from 'react';
import { Card, Button, TextArea, Input } from '../components/common';

type TabType = 'format' | 'query' | 'convert' | 'tools';

export default function Json() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [activeTab, setActiveTab] = useState<TabType>('format');
  const [jsonPath, setJsonPath] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // 格式化
  const formatJson = () => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
    } catch (e) {
      setError('JSON 格式错误：' + (e as Error).message);
      setOutput('');
    }
  };

  // 压缩
  const minifyJson = () => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (e) {
      setError('JSON 格式错误：' + (e as Error).message);
      setOutput('');
    }
  };

  // 校验
  const validateJson = () => {
    setError('');
    try {
      JSON.parse(input);
      setOutput('✓ JSON 格式有效');
    } catch (e) {
      setError('JSON 格式错误：' + (e as Error).message);
      setOutput('');
    }
  };

  // 转 YAML
  const jsonToYaml = () => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      const yaml = convertToYaml(parsed, 0);
      setOutput(yaml);
    } catch (e) {
      setError('JSON 格式错误：' + (e as Error).message);
      setOutput('');
    }
  };

  const convertToYaml = (obj: unknown, level: number): string => {
    const spaces = '  '.repeat(level);
    if (obj === null) return 'null';
    if (typeof obj !== 'object') return String(obj);
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj.map(item => {
        if (typeof item === 'object' && item !== null) {
          const inner = convertToYaml(item, level + 1);
          return `- ${inner.split('\n').join('\n  ' + spaces)}`;
        }
        return `- ${item}`;
      }).join('\n' + spaces);
    }
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return entries.map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `${key}:\n${spaces}  ${convertToYaml(value, level + 1)}`;
      }
      return `${key}: ${value}`;
    }).join('\n' + spaces);
  };

  // 转 CSV
  const jsonToCsv = () => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) {
        setError('只有 JSON 数组才能转换为 CSV');
        setOutput('');
        return;
      }
      if (parsed.length === 0) {
        setOutput('');
        return;
      }
      const headers = Object.keys(parsed[0] as Record<string, unknown>);
      const rows = parsed.map(item =>
        headers.map(h => {
          const val = (item as Record<string, unknown>)[h];
          const str = val === null ? '' : String(val);
          // 处理包含逗号或引号的值
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',')
      );
      setOutput([headers.join(','), ...rows].join('\n'));
    } catch (e) {
      setError('转换失败：' + (e as Error).message);
      setOutput('');
    }
  };

  // JSON Path 查询
  const queryJson = () => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      const result = jsonPathQuery(parsed, jsonPath);
      setOutput(JSON.stringify(result, null, indent));
    } catch (e) {
      setError('查询失败：' + (e as Error).message);
      setOutput('');
    }
  };

  const jsonPathQuery = (obj: unknown, path: string): unknown => {
    if (!path || path === '$') return obj;

    const parts = path.replace(/^\$\.?/, '').split(/[.[\]]+/).filter(Boolean);
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        throw new Error(`路径不存在: ${part}`);
      }
      if (Array.isArray(current)) {
        const index = parseInt(part);
        if (isNaN(index)) {
          current = current.map(item => (item as Record<string, unknown>)?.[part]);
        } else {
          current = current[index];
        }
      } else if (typeof current === 'object') {
        current = (current as Record<string, unknown>)[part];
      }
    }

    return current;
  };

  // 排序键
  const sortKeys = () => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      const sorted = sortObjectKeys(parsed, sortOrder);
      setOutput(JSON.stringify(sorted, null, indent));
    } catch (e) {
      setError('排序失败：' + (e as Error).message);
      setOutput('');
    }
  };

  const sortObjectKeys = (obj: unknown, order: 'asc' | 'desc'): unknown => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => sortObjectKeys(item, order));

    const entries = Object.entries(obj as Record<string, unknown>);
    entries.sort((a, b) => order === 'asc' ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0]));

    const sorted: Record<string, unknown> = {};
    for (const [key, value] of entries) {
      sorted[key] = sortObjectKeys(value, order);
    }
    return sorted;
  };

  // 转义/反转义
  const escapeJson = () => {
    setError('');
    try {
      setOutput(JSON.stringify(input));
    } catch (e) {
      setError('转义失败：' + (e as Error).message);
    }
  };

  const unescapeJson = () => {
    setError('');
    try {
      const unescaped = JSON.parse(input);
      if (typeof unescaped === 'string') {
        setOutput(unescaped);
      } else {
        setError('输入不是转义的 JSON 字符串');
      }
    } catch (e) {
      setError('反转义失败：' + (e as Error).message);
    }
  };

  // 统计信息
  const getStats = () => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      const stats = analyzeJson(parsed);
      setOutput(JSON.stringify(stats, null, indent));
    } catch (e) {
      setError('分析失败：' + (e as Error).message);
      setOutput('');
    }
  };

  const analyzeJson = (obj: unknown, depth = 0): Record<string, unknown> => {
    const stats: Record<string, unknown> = {
      type: Array.isArray(obj) ? 'array' : typeof obj,
      depth,
    };

    if (obj === null) {
      stats.type = 'null';
      return stats;
    }

    if (Array.isArray(obj)) {
      stats.length = obj.length;
      if (obj.length > 0) {
        stats.itemTypes = [...new Set(obj.map(item => Array.isArray(item) ? 'array' : typeof item))];
      }
    } else if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      stats.keyCount = keys.length;
      stats.keys = keys;
    }

    return stats;
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'format', label: '格式化' },
    { key: 'query', label: '查询' },
    { key: 'convert', label: '转换' },
    { key: 'tools', label: '工具' },
  ];

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Tab 切换 */}
      <div className="tabs" style={{ marginBottom: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 格式化 Tab */}
      {activeTab === 'format' && (
        <div className="tool-container">
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="tool-panel-header">
              <span className="tool-panel-title">JSON 输入</span>
              <div className="tool-actions">
                <Button variant="secondary" size="sm" onClick={clearAll}>清空</Button>
              </div>
            </div>
            <TextArea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='{"name": "value", ...}'
              style={{ flex: 1, minHeight: '300px' }}
            />
            {error && <div style={{ color: 'var(--accent-danger)', fontSize: '13px' }}>{error}</div>}
          </Card>

          <Card style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="tool-panel-header">
              <span className="tool-panel-title">输出</span>
              <div className="tool-actions">
                <Button variant="secondary" size="sm" onClick={copyOutput}>复制</Button>
              </div>
            </div>
            <pre className="result-box" style={{ flex: 1, minHeight: '300px', margin: 0 }}>{output}</pre>
          </Card>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-secondary)' }}>缩进：</span>
            <select value={indent} onChange={e => setIndent(Number(e.target.value))} className="select" style={{ width: '100px' }}>
              <option value={2}>2 空格</option>
              <option value={4}>4 空格</option>
              <option value={1}>Tab</option>
            </select>
            <div style={{ flex: 1 }} />
            <Button variant="primary" onClick={formatJson}>格式化</Button>
            <Button variant="secondary" onClick={minifyJson}>压缩</Button>
            <Button variant="secondary" onClick={validateJson}>校验</Button>
          </div>
        </div>
      )}

      {/* 查询 Tab */}
      {activeTab === 'query' && (
        <Card title="JSON Path 查询">
          <div style={{ display: 'grid', gap: '16px' }}>
            <TextArea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='输入 JSON 数据...'
              style={{ minHeight: '150px' }}
            />
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Input
                value={jsonPath}
                onChange={e => setJsonPath(e.target.value)}
                placeholder="JSONPath，如: $.users[0].name 或 $.store.book[*].title"
                style={{ flex: 1 }}
              />
              <Button variant="primary" onClick={queryJson}>查询</Button>
            </div>
            {error && <div style={{ color: 'var(--accent-danger)', fontSize: '13px' }}>{error}</div>}
            {output && (
              <pre className="result-box" style={{ minHeight: '150px', margin: 0 }}>{output}</pre>
            )}
          </div>
        </Card>
      )}

      {/* 转换 Tab */}
      {activeTab === 'convert' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <Card title="输入 JSON">
            <TextArea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='输入 JSON 数据...'
              style={{ minHeight: '150px' }}
            />
          </Card>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={jsonToYaml}>转 YAML</Button>
            <Button variant="primary" onClick={jsonToCsv}>转 CSV</Button>
          </div>
          {error && <div style={{ color: 'var(--accent-danger)', fontSize: '13px' }}>{error}</div>}
          {output && (
            <Card title="转换结果">
              <pre className="result-box" style={{ minHeight: '150px', margin: 0 }}>{output}</pre>
            </Card>
          )}
        </div>
      )}

      {/* 工具 Tab */}
      {activeTab === 'tools' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <Card title="输入 JSON">
            <TextArea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='输入 JSON 数据...'
              style={{ minHeight: '150px' }}
            />
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {/* 排序键 */}
            <Card title="键排序">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')} className="select">
                  <option value="asc">升序</option>
                  <option value="desc">降序</option>
                </select>
                <Button variant="primary" onClick={sortKeys}>排序</Button>
              </div>
            </Card>

            {/* 转义 */}
            <Card title="转义/反转义">
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="primary" onClick={escapeJson}>转义</Button>
                <Button variant="secondary" onClick={unescapeJson}>反转义</Button>
              </div>
            </Card>
          </div>

          {error && <div style={{ color: 'var(--accent-danger)', fontSize: '13px' }}>{error}</div>}
          {output && (
            <Card title="结果">
              <pre className="result-box" style={{ minHeight: '150px', margin: 0 }}>{output}</pre>
            </Card>
          )}

          <Button variant="secondary" onClick={getStats}>分析 JSON 结构</Button>
        </div>
      )}
    </div>
  );
}