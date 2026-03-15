import { useState } from 'react';
import { Card, Button, Input } from '../components/common';
import { CopyButton } from '../components/common';
import { parseCron, validateCron, cronPresets, formatDateTime } from '../utils/cron';

export default function Cron() {
  const [expression, setExpression] = useState('0 9 * * 1-5');
  const [result, setResult] = useState<ReturnType<typeof parseCron> | null>(null);

  const handleParse = () => {
    const validation = validateCron(expression);
    if (!validation.valid) {
      setResult({
        fields: [],
        description: '',
        nextRuns: [],
        error: validation.error,
      });
      return;
    }
    setResult(parseCron(expression));
  };

  const handleSelectPreset = (preset: typeof cronPresets[0]) => {
    setExpression(preset.expression);
    setResult(parseCron(preset.expression));
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* 输入 */}
      <Card title="Cron 表达式解析">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input
              value={expression}
              onChange={e => setExpression(e.target.value)}
              placeholder="输入 Cron 表达式，如: 0 9 * * 1-5"
              style={{ flex: 1, fontFamily: 'monospace' }}
            />
            <Button variant="primary" onClick={handleParse}>
              解析
            </Button>
          </div>

          {result?.error && (
            <div style={{ color: 'var(--accent-danger)', fontSize: '14px' }}>
              {result.error}
            </div>
          )}

          {/* 字段说明 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              padding: '12px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--border-radius)',
              fontSize: '13px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)' }}>分钟</div>
              <div style={{ fontFamily: 'monospace' }}>0-59</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)' }}>小时</div>
              <div style={{ fontFamily: 'monospace' }}>0-23</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)' }}>日期</div>
              <div style={{ fontFamily: 'monospace' }}>1-31</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)' }}>月份</div>
              <div style={{ fontFamily: 'monospace' }}>1-12</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)' }}>星期</div>
              <div style={{ fontFamily: 'monospace' }}>0-6</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 解析结果 */}
      {result && !result.error && (
        <>
          <Card title="解析结果">
            <div style={{ display: 'grid', gap: '16px' }}>
              {/* 人类可读描述 */}
              <div
                style={{
                  padding: '16px',
                  background: 'rgba(64, 192, 87, 0.1)',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: 'var(--accent-success)',
                }}
              >
                {result.description}
              </div>

              {/* 字段详情 */}
              <div style={{ display: 'grid', gap: '8px' }}>
                {result.fields.map((field, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 100px 1fr',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--border-radius)',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>{field.name}</span>
                    <code style={{ fontFamily: 'monospace', fontSize: '13px' }}>{field.value}</code>
                    <span style={{ fontSize: '13px' }}>{field.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* 下次执行时间 */}
          <Card title="下次执行时间">
            <div style={{ display: 'grid', gap: '8px' }}>
              {result.nextRuns.map((date, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius)',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                  }}
                >
                  <span>
                    <span style={{ color: 'var(--text-muted)', marginRight: '12px' }}>#{index + 1}</span>
                    {formatDateTime(date)}
                  </span>
                  <CopyButton text={formatDateTime(date)} />
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* 常用预设 */}
      <Card title="常用表达式">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {cronPresets.map((preset, index) => (
            <button
              key={index}
              onClick={() => handleSelectPreset(preset)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                background: expression === preset.expression ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: expression === preset.expression ? 'white' : 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              <code style={{ fontFamily: 'monospace' }}>{preset.expression}</code>
              <span style={{ color: expression === preset.expression ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* 语法说明 */}
      <Card title="语法说明">
        <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px' }}>
            <code style={{ fontFamily: 'monospace' }}>*</code>
            <span>任意值</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px' }}>
            <code style={{ fontFamily: 'monospace' }}>,</code>
            <span>值列表分隔符，如: 1,3,5</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px' }}>
            <code style={{ fontFamily: 'monospace' }}>-</code>
            <span>范围，如: 1-5 表示 1 到 5</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px' }}>
            <code style={{ fontFamily: 'monospace' }}>/</code>
            <span>步长，如: */5 表示每 5 个单位</span>
          </div>
        </div>
      </Card>
    </div>
  );
}