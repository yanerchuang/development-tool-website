import { useState, useMemo } from 'react';
import { Card, Button, TextArea, Input } from '../components/common';

type OutputFormat = 'iso' | 'date' | 'datetime' | 'custom';

export default function TimestampBatch() {
  const [input, setInput] = useState('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('datetime');
  const [customFormat, setCustomFormat] = useState('YYYY-MM-DD HH:mm:ss');
  const [timezone, setTimezone] = useState('local');
  const [output, setOutput] = useState('');

  const currentTimestamp = useMemo(() => {
    const now = Date.now();
    return {
      unix: Math.floor(now / 1000),
      millis: now,
      iso: new Date().toISOString(),
    };
  }, []);

  const formatOptions = [
    { value: 'iso', label: 'ISO 8601' },
    { value: 'date', label: '日期 (YYYY-MM-DD)' },
    { value: 'datetime', label: '日期时间' },
    { value: 'custom', label: '自定义格式' },
  ];

  const formatTokens = [
    { token: 'YYYY', description: '年份 (2024)' },
    { token: 'YY', description: '年份后两位 (24)' },
    { token: 'MM', description: '月份 (01-12)' },
    { token: 'DD', description: '日期 (01-31)' },
    { token: 'HH', description: '小时 (00-23)' },
    { token: 'mm', description: '分钟 (00-59)' },
    { token: 'ss', description: '秒 (00-59)' },
    { token: 'SSS', description: '毫秒 (000-999)' },
  ];

  const formatDate = (date: Date, format: string, tz: string): string => {
    let d = date;
    
    if (tz === 'utc') {
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      const seconds = date.getUTCSeconds();
      const ms = date.getUTCMilliseconds();
      d = new Date(year, month, day, hours, minutes, seconds, ms);
    }

    const pad = (n: number, len = 2) => String(n).padStart(len, '0');

    const replacements: Record<string, string> = {
      'YYYY': String(d.getFullYear()),
      'YY': String(d.getFullYear()).slice(-2),
      'MM': pad(d.getMonth() + 1),
      'DD': pad(d.getDate()),
      'HH': pad(d.getHours()),
      'mm': pad(d.getMinutes()),
      'ss': pad(d.getSeconds()),
      'SSS': pad(d.getMilliseconds(), 3),
    };

    let result = format;
    Object.entries(replacements).forEach(([token, value]) => {
      result = result.replace(new RegExp(token, 'g'), value);
    });

    return result;
  };

  const parseAndFormat = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return '';

    let date: Date;
    let timestamp: number;

    // 尝试解析为数字（时间戳）
    const num = Number(trimmed);

    if (!isNaN(num)) {
      // 判断是秒还是毫秒
      if (num < 10000000000) {
        // Unix 时间戳（秒）
        timestamp = num * 1000;
      } else {
        // 毫秒时间戳
        timestamp = num;
      }
      date = new Date(timestamp);
    } else {
      // 尝试解析为日期字符串
      date = new Date(trimmed);
    }

    if (isNaN(date.getTime())) {
      return '无效的时间戳或日期';
    }

    // 根据输出格式生成结果
    switch (outputFormat) {
      case 'iso':
        return date.toISOString();
      case 'date':
        return formatDate(date, 'YYYY-MM-DD', timezone);
      case 'datetime':
        return formatDate(date, 'YYYY-MM-DD HH:mm:ss', timezone);
      case 'custom':
        return formatDate(date, customFormat, timezone);
      default:
        return date.toISOString();
    }
  };

  const convert = () => {
    const lines = input.split('\n').filter(line => line.trim());
    const results = lines.map(line => {
      const result = parseAndFormat(line);
      return `${line}\t→\t${result}`;
    });
    setOutput(results.join('\n'));
  };

  const convertToTimestamp = () => {
    const lines = input.split('\n').filter(line => line.trim());
    const results = lines.map(line => {
      const trimmed = line.trim();
      const date = new Date(trimmed);
      if (isNaN(date.getTime())) {
        return `${line}\t→\t无效日期`;
      }
      const unix = Math.floor(date.getTime() / 1000);
      const millis = date.getTime();
      return `${line}\t→\tUnix: ${unix}\t毫秒: ${millis}`;
    });
    setOutput(results.join('\n'));
  };

  const setCurrentTimestamp = () => {
    setInput(String(currentTimestamp.unix));
  };

  const setCurrentMillis = () => {
    setInput(String(currentTimestamp.millis));
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="时间戳批量转换">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          批量转换时间戳和日期，支持多种格式
        </p>
      </Card>

      {/* 当前时间 */}
      <Card title="当前时间">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Unix 时间戳（秒）</div>
            <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: 'monospace' }}>{currentTimestamp.unix}</div>
            <Button variant="secondary" size="sm" style={{ marginTop: '8px' }} onClick={() => navigator.clipboard.writeText(String(currentTimestamp.unix))}>复制</Button>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>毫秒时间戳</div>
            <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: 'monospace' }}>{currentTimestamp.millis}</div>
            <Button variant="secondary" size="sm" style={{ marginTop: '8px' }} onClick={() => navigator.clipboard.writeText(String(currentTimestamp.millis))}>复制</Button>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>ISO 8601</div>
            <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'monospace' }}>{currentTimestamp.iso}</div>
            <Button variant="secondary" size="sm" style={{ marginTop: '8px' }} onClick={() => navigator.clipboard.writeText(currentTimestamp.iso)}>复制</Button>
          </div>
        </div>
      </Card>

      {/* 转换选项 */}
      <Card title="转换选项">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>输出格式</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {formatOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setOutputFormat(opt.value as OutputFormat)}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    background: outputFormat === opt.value ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: outputFormat === opt.value ? 'white' : 'var(--text-primary)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>时区</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setTimezone('local')}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  background: timezone === 'local' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  color: timezone === 'local' ? 'white' : 'var(--text-primary)',
                }}
              >
                本地时间
              </button>
              <button
                onClick={() => setTimezone('utc')}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  background: timezone === 'utc' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  color: timezone === 'utc' ? 'white' : 'var(--text-primary)',
                }}
              >
                UTC
              </button>
            </div>
          </div>
        </div>

        {outputFormat === 'custom' && (
          <div style={{ marginTop: '16px' }}>
            <Input
              label="自定义格式"
              value={customFormat}
              onChange={e => setCustomFormat(e.target.value)}
              placeholder="YYYY-MM-DD HH:mm:ss"
            />
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {formatTokens.map(t => (
                <span
                  key={t.token}
                  onClick={() => setCustomFormat(prev => prev + t.token)}
                  style={{
                    padding: '4px 8px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                  }}
                  title={t.description}
                >
                  {t.token}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 输入 */}
      <Card title="输入">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" onClick={setCurrentTimestamp}>插入当前 Unix</Button>
            <Button variant="secondary" size="sm" onClick={setCurrentMillis}>插入当前毫秒</Button>
            <Button variant="secondary" size="sm" onClick={clearAll}>清空</Button>
          </div>
          <TextArea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="输入时间戳或日期，每行一个...&#10;1707868800&#10;2024-02-14&#10;2024-02-14T12:00:00Z"
            style={{ minHeight: '150px', fontFamily: 'monospace' }}
          />
        </div>
      </Card>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <Button variant="primary" onClick={convert}>时间戳 → 日期</Button>
        <Button variant="secondary" onClick={convertToTimestamp}>日期 → 时间戳</Button>
      </div>

      {/* 输出 */}
      {output && (
        <Card title="转换结果">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <Button variant="secondary" size="sm" onClick={copyOutput}>复制</Button>
          </div>
          <pre className="result-box" style={{ margin: 0, maxHeight: '400px', overflow: 'auto' }}>
            {output}
          </pre>
        </Card>
      )}
    </div>
  );
}