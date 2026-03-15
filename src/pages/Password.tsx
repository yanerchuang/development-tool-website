import { useState, useMemo } from 'react';
import { Card, Button, Input } from '../components/common';
import { CopyButton } from '../components/common';
import { generatePasswords, generatePassphrase, calculatePasswordStrength, type PasswordOptions } from '../utils/password';

export default function Password() {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
  });
  const [passwords, setPasswords] = useState<string[]>([]);
  const [passphrase, setPassphrase] = useState('');
  const [passphraseWords, setPassphraseWords] = useState(4);
  const [passphraseSeparator, setPassphraseSeparator] = useState('-');
  const [count, setCount] = useState(5);

  const handleGenerate = () => {
    setPasswords(generatePasswords(count, options));
  };

  const handleGeneratePassphrase = () => {
    setPassphrase(generatePassphrase(passphraseWords, passphraseSeparator));
  };

  const handleOptionChange = (key: keyof PasswordOptions, value: boolean | number) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const lastPassword = passwords[passwords.length - 1];
  const strength = useMemo(() => {
    if (!lastPassword) return null;
    return calculatePasswordStrength(lastPassword);
  }, [lastPassword]);

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* 密码生成器 */}
      <Card title="密码生成器">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* 长度设置 */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', width: '80px' }}>长度：</span>
            <input
              type="range"
              min={4}
              max={64}
              value={options.length}
              onChange={e => handleOptionChange('length', parseInt(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ width: '40px', textAlign: 'right', fontFamily: 'monospace' }}>
              {options.length}
            </span>
          </div>

          {/* 生成数量 */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', width: '80px' }}>数量：</span>
            <input
              type="range"
              min={1}
              max={20}
              value={count}
              onChange={e => setCount(parseInt(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ width: '40px', textAlign: 'right', fontFamily: 'monospace' }}>
              {count}
            </span>
          </div>

          {/* 字符类型 */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>包含字符：</div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { key: 'includeLowercase', label: '小写字母 (a-z)' },
                { key: 'includeUppercase', label: '大写字母 (A-Z)' },
                { key: 'includeNumbers', label: '数字 (0-9)' },
                { key: 'includeSymbols', label: '符号 (!@#$...)' },
              ].map(item => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={options[item.key as keyof PasswordOptions] as boolean}
                    onChange={e => handleOptionChange(item.key as keyof PasswordOptions, e.target.checked)}
                  />
                  <span style={{ fontSize: '14px' }}>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 高级选项 */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>高级选项：</div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={options.excludeSimilar}
                  onChange={e => handleOptionChange('excludeSimilar', e.target.checked)}
                />
                <span style={{ fontSize: '14px' }}>排除相似字符 (i, l, 1, L, o, 0, O)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={options.excludeAmbiguous}
                  onChange={e => handleOptionChange('excludeAmbiguous', e.target.checked)}
                />
                <span style={{ fontSize: '14px' }}>排除歧义字符 ({`{ } [ ] ( ) / \\ ' " \` ~ , ; : . < >`})</span>
              </label>
            </div>
          </div>

          {/* 生成按钮 */}
          <Button variant="primary" onClick={handleGenerate} style={{ width: 'fit-content' }}>
            生成密码
          </Button>

          {/* 密码结果 */}
          {passwords.length > 0 && (
            <div style={{ display: 'grid', gap: '8px' }}>
              {strength && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>强度：</span>
                  <div
                    style={{
                      flex: 1,
                      height: '8px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${(strength.score / 5) * 100}%`,
                        height: '100%',
                        background: strength.color,
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                  <span style={{ color: strength.color, fontSize: '14px', fontWeight: 500 }}>
                    {strength.label}
                  </span>
                </div>
              )}
              {passwords.map((pwd, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius)',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                  }}
                >
                  <span style={{ wordBreak: 'break-all' }}>{pwd}</span>
                  <CopyButton text={pwd} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 易记密码生成器 */}
      <Card title="易记密码 (Passphrase)">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
            <div style={{ width: '120px' }}>
              <Input
                label="单词数量"
                type="number"
                min={3}
                max={10}
                value={passphraseWords}
                onChange={e => setPassphraseWords(Math.max(3, Math.min(10, parseInt(e.target.value) || 4)))}
              />
            </div>
            <div style={{ width: '80px' }}>
              <Input
                label="分隔符"
                value={passphraseSeparator}
                onChange={e => setPassphraseSeparator(e.target.value)}
                placeholder="-"
              />
            </div>
            <Button variant="primary" onClick={handleGeneratePassphrase}>
              生成
            </Button>
          </div>

          {passphrase && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--border-radius)',
                fontFamily: 'monospace',
                fontSize: '16px',
              }}
            >
              <span>{passphrase}</span>
              <CopyButton text={passphrase} />
            </div>
          )}

          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            示例：apple-banana-cherry-dragon
          </div>
        </div>
      </Card>
    </div>
  );
}