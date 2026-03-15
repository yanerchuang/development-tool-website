import { useState } from 'react';
import { Card, Button, Input } from '../components/common';
import { CopyButton } from '../components/common';
import { numberBases, convertToAllBases, convertFloatToAllBases } from '../utils/numberBase';

export default function NumberBase() {
  const [inputValue, setInputValue] = useState('');
  const [inputBase, setInputBase] = useState(10);
  const [results, setResults] = useState<Record<string, string>>({});
  const [floatResults, setFloatResults] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<'integer' | 'float'>('integer');

  const handleConvert = () => {
    if (!inputValue.trim()) {
      setResults({});
      setFloatResults({});
      return;
    }

    if (mode === 'integer') {
      setResults(convertToAllBases(inputValue, inputBase));
      setFloatResults({});
    } else {
      setFloatResults(convertFloatToAllBases(inputValue));
      setResults({});
    }
  };

  const handleClear = () => {
    setInputValue('');
    setResults({});
    setFloatResults({});
  };

  const displayResults = mode === 'integer' ? results : floatResults;

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* 进制转换器 */}
      <Card title="进制转换器">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* 模式选择 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant={mode === 'integer' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setMode('integer');
                setResults({});
                setFloatResults({});
              }}
            >
              整数转换
            </Button>
            <Button
              variant={mode === 'float' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setMode('float');
                setResults({});
                setFloatResults({});
              }}
            >
              浮点数转换
            </Button>
          </div>

          {/* 输入区域 */}
          <div style={{ display: 'grid', gridTemplateColumns: mode === 'integer' ? '1fr auto' : '1fr', gap: '12px' }}>
            <Input
              label="输入数值"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={mode === 'integer' ? '输入整数...' : '输入数字（支持小数）...'}
              style={{ fontFamily: 'monospace' }}
            />
            {mode === 'integer' && (
              <div style={{ width: '140px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  输入进制
                </label>
                <select
                  className="select"
                  value={inputBase}
                  onChange={e => setInputBase(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                >
                  {numberBases.map(base => (
                    <option key={base.base} value={base.base}>
                      {base.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" onClick={handleConvert}>
              转换
            </Button>
            <Button variant="secondary" onClick={handleClear}>
              清空
            </Button>
          </div>

          {/* 转换结果 */}
          {Object.keys(displayResults).length > 0 && (
            <div style={{ display: 'grid', gap: '8px', marginTop: '8px' }}>
              {Object.entries(displayResults).map(([name, value]) => (
                <div
                  key={name}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr auto',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: value.startsWith('错误') ? 'rgba(250, 82, 82, 0.1)' : 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius)',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{name}</span>
                  <code
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      wordBreak: 'break-all',
                      color: value.startsWith('错误') ? 'var(--accent-danger)' : 'inherit',
                    }}
                  >
                    {value}
                  </code>
                  {!value.startsWith('错误') && <CopyButton text={value} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 进制对照表 */}
      <Card title="常用进制对照表">
        <div style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>十进制</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>二进制</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>八进制</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>十六进制</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 16, 31, 32, 63, 64, 127, 128, 255].map(num => (
                <tr key={num} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{num}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>0b{num.toString(2)}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>0o{num.toString(8)}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>0x{num.toString(16).toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 快速转换 */}
      <Card title="快速转换">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { from: '十进制', to: '二进制', example: '255 → 0b11111111' },
            { from: '十进制', to: '八进制', example: '255 → 0o377' },
            { from: '十进制', to: '十六进制', example: '255 → 0xFF' },
            { from: '十六进制', to: '十进制', example: '0xFF → 255' },
          ].map((item, index) => (
            <div
              key={index}
              style={{
                padding: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--border-radius)',
                fontSize: '13px',
              }}
            >
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {item.from} → {item.to}
              </div>
              <code style={{ fontFamily: 'monospace' }}>{item.example}</code>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}