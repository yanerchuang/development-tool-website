import { useState, useMemo } from 'react';
import { Card, Button, TextArea } from '../components/common';

interface QueryHistory {
  path: string;
  timestamp: Date;
}

export default function JsonPath() {
  const [jsonInput, setJsonInput] = useState('');
  const [jsonPath, setJsonPath] = useState('$');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [savedPaths, setSavedPaths] = useState<string[]>([
    '$.store.book[*].author',
    '$..author',
    '$.store.*',
    '$.store..price',
    '$..book[2]',
    '$..book[-1:]',
    '$..book[0,1]',
    '$..book[:2]',
    '$..book[?(@.isbn)]',
    '$..book[?(@.price<10)]',
  ]);

  const parsedJson = useMemo(() => {
    if (!jsonInput.trim()) return null;
    try {
      return JSON.parse(jsonInput);
    } catch {
      return null;
    }
  }, [jsonInput]);

  const executeQuery = (path: string = jsonPath) => {
    setError('');
    setOutput('');

    if (!parsedJson) {
      setError('请输入有效的 JSON 数据');
      return;
    }

    try {
      const result = jsonPathQuery(parsedJson, path);
      setOutput(JSON.stringify(result, null, 2));
      
      // 添加到历史记录
      setHistory(prev => {
        const newHistory = [{ path, timestamp: new Date() }, ...prev.filter(h => h.path !== path)].slice(0, 20);
        return newHistory;
      });
    } catch (e) {
      setError('查询错误：' + (e as Error).message);
    }
  };

  const jsonPathQuery = (obj: unknown, path: string): unknown => {
    if (!path || path === '$') return obj;

    // 处理过滤器表达式 [?(@.property)]
    if (path.includes('[?(')) {
      return handleFilter(obj, path);
    }

    // 处理切片 [start:end:step]
    if (path.match(/\[\d*:\d*:\d*\]/) || path.match(/\[\d*:\d*\]/)) {
      return handleSlice(obj, path);
    }

    // 解析路径
    let current: unknown = obj;
    const tokens = tokenize(path);

    for (const token of tokens) {
      if (current === null || current === undefined) {
        throw new Error(`路径不存在: ${token}`);
      }

      if (token.type === 'property') {
        if (typeof current !== 'object' || Array.isArray(current)) {
          throw new Error(`无法访问属性: ${token.value}`);
        }
        current = (current as Record<string, unknown>)[token.value];
      } else if (token.type === 'index') {
        if (!Array.isArray(current)) {
          throw new Error(`无法访问索引: ${token.value}`);
        }
        const index = token.value === '-' ? current.length - 1 : parseInt(token.value);
        current = current[index];
      } else if (token.type === 'wildcard') {
        if (Array.isArray(current)) {
          current = current;
        } else if (typeof current === 'object' && current !== null) {
          current = Object.values(current);
        }
      } else if (token.type === 'recursive') {
        current = recursiveSearch(current, token.value);
      }
    }

    return current;
  };

  const tokenize = (path: string): Array<{ type: string; value: string }> => {
    const tokens: Array<{ type: string; value: string }> = [];
    let remaining = path.replace(/^\$\.?/, '');

    while (remaining.length > 0) {
      // 递归下降 ..property
      if (remaining.startsWith('..')) {
        remaining = remaining.slice(2);
        const match = remaining.match(/^[\w]+/);
        if (match) {
          tokens.push({ type: 'recursive', value: match[0] });
          remaining = remaining.slice(match[0].length);
        }
        continue;
      }

      // 通配符 *
      if (remaining.startsWith('*')) {
        tokens.push({ type: 'wildcard', value: '*' });
        remaining = remaining.slice(1);
        continue;
      }

      // 数组索引或切片 [n] 或 ['property']
      if (remaining.startsWith('[')) {
        const endBracket = remaining.indexOf(']');
        if (endBracket === -1) throw new Error('未闭合的括号');
        
        const inner = remaining.slice(1, endBracket);
        
        // 字符串属性 ['property']
        if (inner.startsWith("'") || inner.startsWith('"')) {
          tokens.push({ type: 'property', value: inner.slice(1, -1) });
        } else if (inner === '*') {
          tokens.push({ type: 'wildcard', value: '*' });
        } else if (inner.includes(',') && !inner.includes(':')) {
          // 多索引 [0,1,2]
          const indices = inner.split(',').map(s => s.trim());
          tokens.push({ type: 'multiIndex', value: indices.join(',') });
        } else {
          tokens.push({ type: 'index', value: inner });
        }
        
        remaining = remaining.slice(endBracket + 1);
        continue;
      }

      // 点号属性 .property
      if (remaining.startsWith('.')) {
        remaining = remaining.slice(1);
        const match = remaining.match(/^[\w]+/);
        if (match) {
          tokens.push({ type: 'property', value: match[0] });
          remaining = remaining.slice(match[0].length);
        }
        continue;
      }

      // 直接属性名（在递归下降后）
      const match = remaining.match(/^[\w]+/);
      if (match) {
        tokens.push({ type: 'property', value: match[0] });
        remaining = remaining.slice(match[0].length);
        continue;
      }

      throw new Error(`无法解析路径: ${remaining}`);
    }

    return tokens;
  };

  const handleFilter = (obj: unknown, path: string): unknown => {
    const filterMatch = path.match(/\[\?\(@\.([\w]+)\s*([=<>!]+)\s*(.+?)\)\]/);
    if (!filterMatch) {
      throw new Error('无效的过滤器表达式');
    }

    const [, property, operator, value] = filterMatch;
    const basePath = path.slice(0, path.indexOf('[?('));
    const remainingPath = path.slice(path.indexOf(')') + 2);

    let targetArray: unknown[];
    if (basePath === '$' || !basePath) {
      targetArray = Array.isArray(obj) ? obj : [obj];
    } else {
      const base = jsonPathQuery(obj, basePath);
      targetArray = Array.isArray(base) ? base : [base];
    }

    const filterValue = value.startsWith("'") || value.startsWith('"') 
      ? value.slice(1, -1) 
      : isNaN(Number(value)) ? value : Number(value);

    const filtered = targetArray.filter(item => {
      if (typeof item !== 'object' || item === null) return false;
      const itemValue = (item as Record<string, unknown>)[property];
      
      switch (operator) {
        case '==':
        case '=':
          return itemValue == filterValue;
        case '!=':
          return itemValue != filterValue;
        case '<':
          return typeof itemValue === 'number' && itemValue < (filterValue as number);
        case '<=':
          return typeof itemValue === 'number' && itemValue <= (filterValue as number);
        case '>':
          return typeof itemValue === 'number' && itemValue > (filterValue as number);
        case '>=':
          return typeof itemValue === 'number' && itemValue >= (filterValue as number);
        default:
          return false;
      }
    });

    if (remainingPath) {
      return filtered.map(item => jsonPathQuery(item, remainingPath));
    }
    return filtered;
  };

  const handleSlice = (obj: unknown, path: string): unknown => {
    const sliceMatch = path.match(/\[(-?\d*):(-?\d*)(?::(-?\d*))?\]/);
    if (!sliceMatch) {
      throw new Error('无效的切片表达式');
    }

    const basePath = path.slice(0, path.indexOf('['));
    const remainingPath = path.slice(path.indexOf(']') + 1);

    let target: unknown = basePath ? jsonPathQuery(obj, basePath) : obj;
    if (!Array.isArray(target)) {
      throw new Error('切片操作只能应用于数组');
    }

    const start = sliceMatch[1] ? parseInt(sliceMatch[1]) : undefined;
    const end = sliceMatch[2] ? parseInt(sliceMatch[2]) : undefined;
    const step = sliceMatch[3] ? parseInt(sliceMatch[3]) : undefined;

    let result = target.slice(start, end);
    if (step) {
      result = result.filter((_, i) => i % step === 0);
    }

    if (remainingPath) {
      return result.map(item => jsonPathQuery(item, remainingPath));
    }
    return result;
  };

  const recursiveSearch = (obj: unknown, property: string): unknown[] => {
    const results: unknown[] = [];

    const search = (current: unknown) => {
      if (current === null || current === undefined) return;

      if (Array.isArray(current)) {
        current.forEach(item => search(item));
      } else if (typeof current === 'object') {
        const record = current as Record<string, unknown>;
        if (property in record) {
          results.push(record[property]);
        }
        Object.values(record).forEach(value => search(value));
      }
    };

    search(obj);
    return results;
  };

  const loadSample = () => {
    setJsonInput(JSON.stringify({
      store: {
        book: [
          { category: "reference", author: "Nigel Rees", title: "Sayings of the Century", price: 8.95 },
          { category: "fiction", author: "Evelyn Waugh", title: "Sword of Honour", price: 12.99 },
          { category: "fiction", author: "Herman Melville", title: "Moby Dick", isbn: "0-553-21311-3", price: 8.99 },
          { category: "fiction", author: "J. R. R. Tolkien", title: "The Lord of the Rings", isbn: "0-395-19395-8", price: 22.99 }
        ],
        bicycle: { color: "red", price: 19.95 }
      },
      expensive: 10
    }, null, 2));
    setJsonPath('$..author');
  };

  const saveCurrentPath = () => {
    if (jsonPath && !savedPaths.includes(jsonPath)) {
      setSavedPaths(prev => [jsonPath, ...prev].slice(0, 15));
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const clearAll = () => {
    setJsonInput('');
    setJsonPath('$');
    setOutput('');
    setError('');
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="JSONPath 查询工具">
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Button variant="secondary" size="sm" onClick={loadSample}>加载示例</Button>
          <Button variant="secondary" size="sm" onClick={clearAll}>清空</Button>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <Card title="JSON 数据">
          <TextArea
            value={jsonInput}
            onChange={e => setJsonInput(e.target.value)}
            placeholder="输入 JSON 数据..."
            style={{ minHeight: '300px' }}
          />
        </Card>

        <Card title="查询结果">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
            <pre className="result-box" style={{ flex: 1, minHeight: '300px', margin: 0, overflow: 'auto' }}>
              {output || <span style={{ color: 'var(--text-muted)' }}>执行查询后显示结果...</span>}
            </pre>
            {output && <Button variant="secondary" size="sm" onClick={copyOutput}>复制结果</Button>}
          </div>
        </Card>
      </div>

      <Card title="JSONPath 查询">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={jsonPath}
              onChange={e => setJsonPath(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && executeQuery()}
              placeholder="输入 JSONPath，如: $.store.book[*].author"
              className="input"
              style={{ flex: 1, fontFamily: 'monospace' }}
            />
            <Button variant="primary" onClick={() => executeQuery()}>执行</Button>
            <Button variant="secondary" onClick={saveCurrentPath}>保存路径</Button>
          </div>

          {error && <div style={{ color: 'var(--accent-danger)', fontSize: '13px' }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* 保存的路径 */}
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>常用路径示例</div>
              <div style={{ display: 'grid', gap: '4px' }}>
                {savedPaths.map((path, i) => (
                  <button
                    key={i}
                    onClick={() => { setJsonPath(path); executeQuery(path); }}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--bg-secondary)',
                      border: 'none',
                      borderRadius: '6px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {path}
                  </button>
                ))}
              </div>
            </div>

            {/* 历史记录 */}
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>查询历史</div>
              {history.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>暂无历史记录</div>
              ) : (
                <div style={{ display: 'grid', gap: '4px' }}>
                  {history.slice(0, 10).map((h, i) => (
                    <button
                      key={i}
                      onClick={() => { setJsonPath(h.path); executeQuery(h.path); }}
                      style={{
                        padding: '8px 12px',
                        background: 'var(--bg-secondary)',
                        border: 'none',
                        borderRadius: '6px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {h.path}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 语法帮助 */}
          <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>JSONPath 语法参考</div>
            <div style={{ display: 'grid', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div><code style={{ color: 'var(--text-primary)' }}>$</code> - 根对象</div>
              <div><code style={{ color: 'var(--text-primary)' }}>.</code> - 子属性访问</div>
              <div><code style={{ color: 'var(--text-primary)' }}>..</code> - 递归下降</div>
              <div><code style={{ color: 'var(--text-primary)' }}>*</code> - 通配符</div>
              <div><code style={{ color: 'var(--text-primary)' }}>[n]</code> - 数组索引</div>
              <div><code style={{ color: 'var(--text-primary)' }}>[start:end]</code> - 数组切片</div>
              <div><code style={{ color: 'var(--text-primary)' }}>[?(@.prop)]</code> - 过滤表达式</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}