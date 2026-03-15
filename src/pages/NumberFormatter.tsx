import { useState } from 'react';
import { Card } from '../components/common';

export default function NumberFormatter() {
  const [number, setNumber] = useState('1234567.89');
  const [locale, setLocale] = useState('zh-CN');
  const [currency, setCurrency] = useState('CNY');
  const [decimals, setDecimals] = useState(2);

  const formatNumber = (num: number) => {
    try {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num);
    } catch {
      return 'Invalid';
    }
  };

  const formatCurrency = (num: number) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num);
    } catch {
      return 'Invalid';
    }
  };

  const formatPercent = (num: number) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num / 100);
    } catch {
      return 'Invalid';
    }
  };

  const formatCompact = (num: number) => {
    try {
      return new Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: 'short',
      }).format(num);
    } catch {
      return 'Invalid';
    }
  };

  const numValue = parseFloat(number);

  const localeOptions = [
    { value: 'zh-CN', label: '中文 (中国)' },
    { value: 'zh-TW', label: '中文 (台湾)' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'ja-JP', label: '日本語' },
    { value: 'ko-KR', label: '한국어' },
    { value: 'de-DE', label: 'Deutsch' },
    { value: 'fr-FR', label: 'Français' },
    { value: 'es-ES', label: 'Español' },
    { value: 'ru-RU', label: 'Русский' },
  ];

  const currencyOptions = [
    { value: 'CNY', label: 'CNY - 人民币' },
    { value: 'USD', label: 'USD - 美元' },
    { value: 'EUR', label: 'EUR - 欧元' },
    { value: 'GBP', label: 'GBP - 英镑' },
    { value: 'JPY', label: 'JPY - 日元' },
    { value: 'KRW', label: 'KRW - 韩元' },
    { value: 'HKD', label: 'HKD - 港币' },
    { value: 'TWD', label: 'TWD - 台币' },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="数字格式化">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Input */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>数字</div>
              <input
                type="number"
                value={number}
                onChange={e => setNumber(e.target.value)}
                step="any"
                className="input"
                style={{ width: '100%', fontSize: '16px' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>语言/地区</div>
              <select
                value={locale}
                onChange={e => setLocale(e.target.value)}
                className="input"
              >
                {localeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>货币</div>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="input"
              >
                {currencyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>小数位</div>
              <input
                type="number"
                value={decimals}
                onChange={e => setDecimals(parseInt(e.target.value) || 0)}
                min="0"
                max="10"
                className="input"
                style={{ width: '60px' }}
              />
            </div>
          </div>

          {/* Results */}
          {!isNaN(numValue) && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>标准格式</span>
                  <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 8px' }} onClick={() => copyToClipboard(formatNumber(numValue))}>复制</button>
                </div>
                <div style={{ fontSize: '20px', fontFamily: 'monospace' }}>{formatNumber(numValue)}</div>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>货币格式</span>
                  <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 8px' }} onClick={() => copyToClipboard(formatCurrency(numValue))}>复制</button>
                </div>
                <div style={{ fontSize: '20px', fontFamily: 'monospace' }}>{formatCurrency(numValue)}</div>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>百分比</span>
                  <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 8px' }} onClick={() => copyToClipboard(formatPercent(numValue))}>复制</button>
                </div>
                <div style={{ fontSize: '20px', fontFamily: 'monospace' }}>{formatPercent(numValue)}</div>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>紧凑格式</span>
                  <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 8px' }} onClick={() => copyToClipboard(formatCompact(numValue))}>复制</button>
                </div>
                <div style={{ fontSize: '20px', fontFamily: 'monospace' }}>{formatCompact(numValue)}</div>
              </div>

              {/* Other formats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>科学计数法</div>
                  <div style={{ fontFamily: 'monospace' }}>{numValue.toExponential(decimals)}</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>二进制</div>
                  <div style={{ fontFamily: 'monospace' }}>{numValue.toString(2).slice(0, 32)}...</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>八进制</div>
                  <div style={{ fontFamily: 'monospace' }}>{numValue.toString(8)}</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>十六进制</div>
                  <div style={{ fontFamily: 'monospace' }}>0x{numValue.toString(16).toUpperCase()}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="数字格式化说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• <strong>标准格式</strong>: 根据语言/地区添加千分位分隔符</div>
          <div>• <strong>货币格式</strong>: 添加货币符号和适当的格式</div>
          <div>• <strong>百分比</strong>: 将数值转换为百分比显示</div>
          <div>• <strong>紧凑格式</strong>: 使用 K、M、B 等单位表示大数</div>
          <div>• 不同地区的数字格式可能不同（如小数点和千分位符号）</div>
        </div>
      </Card>
    </div>
  );
}