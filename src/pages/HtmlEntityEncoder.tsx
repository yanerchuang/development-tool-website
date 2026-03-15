import { useState } from 'react';
import { Card, Button } from '../components/common';

const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
  ' ': '&nbsp;',
  '©': '&copy;',
  '®': '&reg;',
  '™': '&trade;',
  '€': '&euro;',
  '£': '&pound;',
  '¥': '&yen;',
  '¢': '&cent;',
  '§': '&sect;',
  '¶': '&para;',
  '°': '&deg;',
  '±': '&plusmn;',
  '×': '&times;',
  '÷': '&divide;',
  '¼': '&frac14;',
  '½': '&frac12;',
  '¾': '&frac34;',
  '←': '&larr;',
  '→': '&rarr;',
  '↑': '&uarr;',
  '↓': '&darr;',
  '↔': '&harr;',
  '♠': '&spades;',
  '♣': '&clubs;',
  '♥': '&hearts;',
  '♦': '&diams;',
  'α': '&alpha;',
  'β': '&beta;',
  'γ': '&gamma;',
  'δ': '&delta;',
  'π': '&pi;',
  '∑': '&sum;',
  '∞': '&infin;',
};

export default function HtmlEntityEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const encode = (text: string) => {
    let result = text;
    // First encode ampersand
    result = result.replace(/&/g, '&amp;');
    // Then encode other special characters
    result = result.replace(/</g, '&lt;');
    result = result.replace(/>/g, '&gt;');
    result = result.replace(/"/g, '&quot;');
    result = result.replace(/'/g, '&apos;');
    return result;
  };

  const decode = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const process = () => {
    if (mode === 'encode') {
      setOutput(encode(input));
    } else {
      setOutput(decode(input));
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const swap = () => {
    setInput(output);
    setOutput(input);
    setMode(mode === 'encode' ? 'decode' : 'decode');
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="HTML 实体编码/解码">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Mode selector */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn ${mode === 'encode' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('encode')}
            >
              编码
            </button>
            <button
              className={`btn ${mode === 'decode' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('decode')}
            >
              解码
            </button>
          </div>

          {/* Input */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
              {mode === 'encode' ? '原始文本' : 'HTML 实体'}
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入 HTML 实体...'}
              className="input"
              style={{
                width: '100%',
                height: '120px',
                resize: 'vertical',
                fontFamily: 'monospace',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" onClick={process}>转换</Button>
            <Button variant="secondary" onClick={swap} disabled={!input && !output}>交换</Button>
          </div>

          {/* Output */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                {mode === 'encode' ? 'HTML 实体' : '解码文本'}
              </span>
              <Button variant="secondary" size="sm" onClick={copyOutput} disabled={!output}>复制</Button>
            </div>
            <div style={{
              padding: '12px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--border-radius)',
              fontFamily: 'monospace',
              fontSize: '14px',
              minHeight: '80px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
              {output || <span style={{ color: 'var(--text-secondary)' }}>结果将显示在这里</span>}
            </div>
          </div>
        </div>
      </Card>

      <Card title="常用 HTML 实体">
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '8px', fontSize: '13px', alignItems: 'center' }}>
            <div style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>字符</div>
            <div style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>实体名称</div>
            <div style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>实体编号</div>
          </div>
          {Object.entries(htmlEntities).slice(0, 15).map(([char, entity]) => (
            <div
              key={char}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: '8px',
                fontSize: '13px',
                alignItems: 'center',
                padding: '8px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--border-radius)',
              }}
            >
              <div style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{char}</div>
              <div style={{ fontFamily: 'monospace' }}>{entity}</div>
              <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                &#{char.charCodeAt(0)};
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="使用场景">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• <strong>防止 XSS 攻击</strong>: 将用户输入的 HTML 特殊字符转义</div>
          <div>• <strong>显示代码</strong>: 在网页中显示 HTML/XML 代码片段</div>
          <div>• <strong>特殊符号</strong>: 显示版权、商标、货币等特殊符号</div>
          <div>• <strong>保留空格</strong>: 使用 &amp;nbsp; 保留多个连续空格</div>
        </div>
      </Card>
    </div>
  );
}