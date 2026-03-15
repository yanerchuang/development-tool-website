import { useState } from 'react';
import { Card, Button, Input, TextArea } from '../components/common';

// 生成 UUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 生成随机密码
const generatePassword = (length: number, options: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }): string => {
  let chars = '';
  if (options.upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (options.lower) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (options.numbers) chars += '0123456789';
  if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export default function Dev() {
  // UUID
  const [uuids, setUuids] = useState<string[]>([]);
  const [uuidCount, setUuidCount] = useState(1);

  // 密码生成
  const [password, setPassword] = useState('');
  const [passwordLength, setPasswordLength] = useState(16);
  const [passwordOptions, setPasswordOptions] = useState({
    upper: true,
    lower: true,
    numbers: true,
    symbols: false,
  });

  // 代码格式化
  const [codeInput, setCodeInput] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [codeType, setCodeType] = useState<'json' | 'css' | 'html'>('json');

  // 生成 UUID
  const handleGenerateUUID = () => {
    const newUuids = [];
    for (let i = 0; i < uuidCount; i++) {
      newUuids.push(generateUUID());
    }
    setUuids(newUuids);
  };

  // 生成密码
  const handleGeneratePassword = () => {
    setPassword(generatePassword(passwordLength, passwordOptions));
  };

  // 代码格式化
  const handleFormatCode = () => {
    try {
      if (codeType === 'json') {
        const parsed = JSON.parse(codeInput);
        setCodeOutput(JSON.stringify(parsed, null, 2));
      } else {
        // 简单的缩进处理
        let formatted = codeInput;
        if (codeType === 'html') {
          formatted = codeInput
            .replace(/></g, '>\n<')
            .split('\n')
            .map(line => line.trim())
            .join('\n');
        } else if (codeType === 'css') {
          formatted = codeInput
            .replace(/\{/g, ' {\n  ')
            .replace(/\}/g, '\n}\n')
            .replace(/;/g, ';\n  ')
            .replace(/\n\s*\n/g, '\n');
        }
        setCodeOutput(formatted);
      }
    } catch (e) {
      setCodeOutput('格式化失败: ' + (e as Error).message);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* UUID 生成器 */}
      <Card title="UUID/GUID 生成器">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <Input
              label="生成数量"
              type="number"
              value={uuidCount}
              onChange={e => setUuidCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              style={{ width: '100px' }}
            />
            <Button variant="primary" onClick={handleGenerateUUID}>
              生成
            </Button>
          </div>
          {uuids.length > 0 && (
            <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              {uuids.map((uuid, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < uuids.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <code style={{ fontFamily: 'monospace' }}>{uuid}</code>
                  <Button variant="secondary" size="sm" onClick={() => copyToClipboard(uuid)}>
                    复制
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 密码生成器 */}
      <Card title="随机密码生成器">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>长度: {passwordLength}</div>
              <input
                type="range"
                min="8"
                max="64"
                value={passwordLength}
                onChange={e => setPasswordLength(parseInt(e.target.value))}
                style={{ width: '150px' }}
              />
            </div>
            {[
              { key: 'upper', label: '大写字母' },
              { key: 'lower', label: '小写字母' },
              { key: 'numbers', label: '数字' },
              { key: 'symbols', label: '特殊字符' },
            ].map(opt => (
              <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={passwordOptions[opt.key as keyof typeof passwordOptions]}
                  onChange={e => setPasswordOptions({ ...passwordOptions, [opt.key]: e.target.checked })}
                />
                <span style={{ fontSize: '13px' }}>{opt.label}</span>
              </label>
            ))}
          </div>
          <Button variant="primary" onClick={handleGeneratePassword} style={{ width: 'fit-content' }}>
            生成密码
          </Button>
          {password && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ flex: 1, padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', fontFamily: 'monospace', fontSize: '16px' }}>
                {password}
              </div>
              <Button variant="secondary" onClick={() => copyToClipboard(password)}>
                复制
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* 代码格式化 */}
      <Card title="代码格式化">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['json', 'html', 'css'] as const).map(type => (
              <Button
                key={type}
                variant={codeType === type ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCodeType(type)}
              >
                {type.toUpperCase()}
              </Button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>输入</div>
              <TextArea
                value={codeInput}
                onChange={e => setCodeInput(e.target.value)}
                placeholder={codeType === 'json' ? '{"key": "value"}' : codeType === 'html' ? '<div>...</div>' : '.class { }'}
                style={{ minHeight: '200px' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>输出</div>
              <pre className="result-box" style={{ height: '200px', margin: 0 }}>
                {codeOutput}
              </pre>
            </div>
          </div>
          <Button variant="primary" onClick={handleFormatCode} style={{ width: 'fit-content' }}>
            格式化
          </Button>
        </div>
      </Card>

      {/* 常用正则 */}
      <Card title="常用正则表达式">
        <div style={{ display: 'grid', gap: '8px' }}>
          {[
            { name: '邮箱', pattern: String.raw`^[\w.-]+@[\w.-]+\.\w+$` },
            { name: '手机号（中国）', pattern: String.raw`^1[3-9]\d{9}$` },
            { name: 'URL', pattern: String.raw`^https?:\/\/[\w.-]+(:\d+)?(\/[\w./-]*)?$` },
            { name: 'IP地址', pattern: String.raw`^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$` },
            { name: '身份证号', pattern: String.raw`^\d{17}[\dXx]$` },
            { name: '日期 YYYY-MM-DD', pattern: String.raw`^\d{4}-\d{2}-\d{2}$` },
          ].map(item => (
            <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
              <code style={{ fontFamily: 'monospace', fontSize: '12px' }}>{item.pattern}</code>
              <Button variant="secondary" size="sm" onClick={() => copyToClipboard(item.pattern)}>
                复制
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}