import { useState } from 'react';
import { Card, Button, Input } from '../components/common';
import { CopyButton } from '../components/common';
import { generateUuids, generateShortUuid, isValidUuid } from '../utils/uuid';

type UuidVersion = 'v1' | 'v4';

export default function Uuid() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [version, setVersion] = useState<UuidVersion>('v4');
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [noDashes, setNoDashes] = useState(false);

  // 验证 UUID
  const [validateInput, setValidateInput] = useState('');
  const [validateResult, setValidateResult] = useState<{ valid: boolean; message: string } | null>(null);

  const handleGenerate = () => {
    let results = generateUuids(count, version);
    if (uppercase) {
      results = results.map(u => u.toUpperCase());
    }
    if (noDashes) {
      results = results.map(u => u.replace(/-/g, ''));
    }
    setUuids(results);
  };

  const handleGenerateShort = () => {
    let result = generateShortUuid();
    if (uppercase) {
      result = result.toUpperCase();
    }
    setUuids([result]);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
  };

  const handleValidate = () => {
    if (!validateInput.trim()) {
      setValidateResult(null);
      return;
    }
    const valid = isValidUuid(validateInput.trim());
    setValidateResult({
      valid,
      message: valid ? '有效的 UUID 格式' : '无效的 UUID 格式',
    });
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* UUID 生成器 */}
      <Card title="UUID 生成器">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ width: '120px' }}>
              <Input
                label="生成数量"
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={e => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>版本：</span>
              <Button
                variant={version === 'v4' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setVersion('v4')}
              >
                v4 (随机)
              </Button>
              <Button
                variant={version === 'v1' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setVersion('v1')}
              >
                v1 (时间)
              </Button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={uppercase}
                onChange={e => setUppercase(e.target.checked)}
              />
              <span style={{ fontSize: '14px' }}>大写</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={noDashes}
                onChange={e => setNoDashes(e.target.checked)}
              />
              <span style={{ fontSize: '14px' }}>无连字符</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" onClick={handleGenerate}>
              生成 UUID
            </Button>
            <Button variant="secondary" onClick={handleGenerateShort}>
              生成短 UUID
            </Button>
            {uuids.length > 0 && (
              <Button variant="secondary" onClick={handleCopyAll}>
                复制全部
              </Button>
            )}
          </div>

          {uuids.length > 0 && (
            <div
              style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--border-radius)',
                padding: '12px',
                fontFamily: 'monospace',
                fontSize: '13px',
                maxHeight: '300px',
                overflow: 'auto',
              }}
            >
              {uuids.map((uuid, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '4px 0',
                    borderBottom: index < uuids.length - 1 ? '1px solid var(--border-color)' : 'none',
                  }}
                >
                  <span>{uuid}</span>
                  <CopyButton text={uuid} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* UUID 验证器 */}
      <Card title="UUID 验证器">
        <div style={{ display: 'grid', gap: '12px' }}>
          <Input
            placeholder="输入要验证的 UUID..."
            value={validateInput}
            onChange={e => setValidateInput(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button variant="primary" onClick={handleValidate}>
              验证
            </Button>
            {validateResult && (
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  background: validateResult.valid ? 'rgba(64, 192, 87, 0.1)' : 'rgba(250, 82, 82, 0.1)',
                  color: validateResult.valid ? 'var(--accent-success)' : 'var(--accent-danger)',
                }}
              >
                {validateResult.message}
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}