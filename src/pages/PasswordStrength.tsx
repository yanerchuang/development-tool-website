import { useState } from 'react';
import { Card, Button } from '../components/common';

export default function PasswordStrength() {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<{
    score: number;
    level: string;
    color: string;
    feedback: string[];
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const checkStrength = (pwd: string) => {
    if (!pwd) {
      setStrength(null);
      return;
    }

    let score = 0;
    const feedback: string[] = [];

    // Length checks
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;
    if (pwd.length < 6) feedback.push('密码太短，建议至少8个字符');

    // Character variety
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const hasOther = /[^a-zA-Z0-9!@#$%^&*(),.?":{}|<>]/.test(pwd);

    if (hasLower) score += 1;
    else feedback.push('添加小写字母');
    if (hasUpper) score += 1;
    else feedback.push('添加大写字母');
    if (hasNumber) score += 1;
    else feedback.push('添加数字');
    if (hasSpecial) score += 2;
    else feedback.push('添加特殊字符');
    if (hasOther) score += 1;

    // Pattern checks
    if (/(.)\1{2,}/.test(pwd)) {
      score -= 1;
      feedback.push('避免连续重复字符');
    }
    if (/^[a-zA-Z]+$/.test(pwd)) {
      score -= 1;
      feedback.push('不要只使用字母');
    }
    if (/^[0-9]+$/.test(pwd)) {
      score -= 2;
      feedback.push('不要只使用数字');
    }

    // Common patterns
    const commonPatterns = ['password', '123456', 'qwerty', 'abc', 'admin', 'login'];
    for (const pattern of commonPatterns) {
      if (pwd.toLowerCase().includes(pattern)) {
        score -= 2;
        feedback.push(`避免使用常见密码模式: "${pattern}"`);
      }
    }

    // Keyboard patterns
    if (/qwerty|asdf|zxcv|qazwsx/i.test(pwd)) {
      score -= 1;
      feedback.push('避免键盘连续字符');
    }

    score = Math.max(0, Math.min(10, score));

    let level: string;
    let color: string;
    if (score <= 2) {
      level = '非常弱';
      color = '#ef4444';
    } else if (score <= 4) {
      level = '弱';
      color = '#f97316';
    } else if (score <= 6) {
      level = '中等';
      color = '#f59e0b';
    } else if (score <= 8) {
      level = '强';
      color = '#22c55e';
    } else {
      level = '非常强';
      color = '#10b981';
    }

    setStrength({ score, level, color, feedback });
  };

  const generatePassword = (length: number = 16, options: {
    lowercase?: boolean;
    uppercase?: boolean;
    numbers?: boolean;
    special?: boolean;
  } = {}) => {
    const { lowercase = true, uppercase = true, numbers = true, special = true } = options;
    let chars = '';
    if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (numbers) chars += '0123456789';
    if (special) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setPassword(result);
    checkStrength(result);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
  };

  const clearPassword = () => {
    setPassword('');
    setStrength(null);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="密码强度检测">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Password Input */}
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  checkStrength(e.target.value);
                }}
                placeholder="输入密码检测强度..."
                className="input"
                style={{ flex: 1, fontFamily: 'monospace' }}
              />
              <Button variant="secondary" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '隐藏' : '显示'}
              </Button>
            </div>

            {/* Strength Bar */}
            {strength && (
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 8,
                        background: i < strength.score ? strength.color : 'var(--bg-tertiary)',
                        borderRadius: 4,
                        transition: 'background 0.2s',
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500, color: strength.color }}>{strength.level}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    得分: {strength.score}/10
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={copyPassword} disabled={!password}>复制密码</Button>
            <Button variant="secondary" onClick={clearPassword}>清空</Button>
          </div>

          {/* Feedback */}
          {strength && strength.feedback.length > 0 && (
            <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>改进建议：</div>
              <div style={{ display: 'grid', gap: '4px' }}>
                {strength.feedback.map((item, i) => (
                  <div key={i} style={{ fontSize: '13px', color: '#f59e0b' }}>• {item}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="密码生成器">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
            <Button variant="secondary" size="sm" onClick={() => generatePassword(8)}>8位</Button>
            <Button variant="secondary" size="sm" onClick={() => generatePassword(12)}>12位</Button>
            <Button variant="secondary" size="sm" onClick={() => generatePassword(16)}>16位</Button>
            <Button variant="secondary" size="sm" onClick={() => generatePassword(24)}>24位</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
            <Button variant="secondary" size="sm" onClick={() => generatePassword(16, { uppercase: true, lowercase: false })}>
              仅大写
            </Button>
            <Button variant="secondary" size="sm" onClick={() => generatePassword(16, { numbers: true, special: false })}>
              仅数字
            </Button>
            <Button variant="secondary" size="sm" onClick={() => generatePassword(16, { special: true })}>
              含特殊字符
            </Button>
          </div>
        </div>
      </Card>

      <Card title="密码安全建议">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 使用至少12个字符的密码</div>
          <div>• 混合使用大小写字母、数字和特殊字符</div>
          <div>• 避免使用生日、姓名等个人信息</div>
          <div>• 不同网站使用不同密码</div>
          <div>• 考虑使用密码管理器</div>
          <div>• 开启双因素认证 (2FA)</div>
        </div>
      </Card>
    </div>
  );
}