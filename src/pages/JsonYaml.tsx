import { useState } from 'react';
import { Card, Button } from '../components/common';

// Simple YAML parser/serializer
const parseYAML = (yaml: string): unknown => {
  const lines = yaml.split('\n');
  const result: Record<string, unknown> = {};
  const stack: Array<{ obj: Record<string, unknown>; indent: number }> = [{ obj: result, indent: -1 }];

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const indent = line.search(/\S/);
    const content = line.trim();
    const colonIndex = content.indexOf(':');

    if (colonIndex === -1) continue;

    const key = content.slice(0, colonIndex).trim();
    let value = content.slice(colonIndex + 1).trim();

    // Handle nested objects
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const current = stack[stack.length - 1].obj;

    if (value === '' || value === '|' || value === '>') {
      // Nested object
      current[key] = {};
      stack.push({ obj: current[key] as Record<string, unknown>, indent });
    } else {
      // Parse value
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      } else if (value === 'true') {
        value = true as unknown as string;
      } else if (value === 'false') {
        value = false as unknown as string;
      } else if (value === 'null') {
        value = null as unknown as string;
      } else if (!isNaN(Number(value))) {
        value = Number(value) as unknown as string;
      }
      current[key] = value;
    }
  }

  return result;
};

const toYAML = (obj: unknown, indent = 0): string => {
  const spaces = '  '.repeat(indent);

  if (obj === null) return 'null';
  if (typeof obj === 'boolean') return obj.toString();
  if (typeof obj === 'number') return obj.toString();
  if (typeof obj === 'string') {
    if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    return obj.includes(' ') ? `"${obj}"` : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => {
      const value = toYAML(item, indent + 1);
      return `${spaces}- ${value.trim()}`;
    }).join('\n');
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>);
    return entries.map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `${spaces}${key}:\n${toYAML(value, indent + 1)}`;
      }
      return `${spaces}${key}: ${toYAML(value, indent + 1)}`;
    }).join('\n');
  }

  return String(obj);
};

type ConvertMode = 'json2yaml' | 'yaml2json';

export default function JsonYaml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<ConvertMode>('json2yaml');
  const [error, setError] = useState('');

  const convert = () => {
    setError('');
    setOutput('');

    if (!input.trim()) return;

    try {
      if (mode === 'json2yaml') {
        const parsed = JSON.parse(input);
        setOutput(toYAML(parsed));
      } else {
        const parsed = parseYAML(input);
        setOutput(JSON.stringify(parsed, null, 2));
      }
    } catch (err) {
      setError(`转换失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  const swap = () => {
    setInput(output);
    setOutput('');
    setMode(mode === 'json2yaml' ? 'yaml2json' : 'json2yaml');
    setError('');
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 2));
      setError('');
    } catch {
      setError('无效的JSON格式');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
      setError('');
    } catch {
      setError('无效的JSON格式');
    }
  };

  const loadSample = () => {
    if (mode === 'json2yaml') {
      setInput(JSON.stringify({
        name: "DevTools",
        version: "1.0.0",
        features: ["JSON格式化", "YAML转换"],
        config: {
          theme: "dark",
          language: "zh-CN"
        }
      }, null, 2));
    } else {
      setInput(`name: DevTools
version: 1.0.0
features:
  - JSON格式化
  - YAML转换
config:
  theme: dark
  language: zh-CN`);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="JSON/YAML转换">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Mode Toggle */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setMode('json2yaml')}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: mode === 'json2yaml' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: mode === 'json2yaml' ? 'white' : 'var(--text-primary)',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
              }}
            >
              JSON → YAML
            </button>
            <button
              onClick={() => setMode('yaml2json')}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: mode === 'yaml2json' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: mode === 'yaml2json' ? 'white' : 'var(--text-primary)',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
              }}
            >
              YAML → JSON
            </button>
          </div>

          {/* Input */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
              输入 {mode === 'json2yaml' ? 'JSON' : 'YAML'}
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'json2yaml' ? '{"key": "value"}' : 'key: value'}
              className="input"
              style={{ width: '100%', minHeight: '200px', resize: 'vertical', fontFamily: 'monospace' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={convert}>转换</Button>
            <Button variant="secondary" onClick={swap}>交换</Button>
            {mode === 'json2yaml' && (
              <>
                <Button variant="secondary" onClick={formatJson}>格式化JSON</Button>
                <Button variant="secondary" onClick={minifyJson}>压缩JSON</Button>
              </>
            )}
            <Button variant="secondary" onClick={loadSample}>加载示例</Button>
            {output && <Button variant="secondary" onClick={copyOutput}>复制结果</Button>}
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--border-radius)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* Output */}
          {output && (
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                输出 {mode === 'json2yaml' ? 'YAML' : 'JSON'}
              </div>
              <pre style={{
                padding: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--border-radius)',
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '13px',
                margin: 0,
                maxHeight: '400px',
              }}>
                {output}
              </pre>
            </div>
          )}
        </div>
      </Card>

      <Card title="说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 支持JSON和YAML格式互相转换</div>
          <div>• YAML解析器支持基本语法（键值对、嵌套对象、注释）</div>
          <div>• 复杂的YAML特性（锚点、多行字符串等）可能不完全支持</div>
          <div>• 建议使用专业的YAML库处理复杂场景</div>
        </div>
      </Card>
    </div>
  );
}