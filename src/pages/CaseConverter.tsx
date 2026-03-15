import { useState, useMemo } from 'react';
import { Card } from '../components/common';

export default function CaseConverter() {
  const [text, setText] = useState('');

  const conversions = useMemo(() => {
    const str = text;
    return {
      upper: str.toUpperCase(),
      lower: str.toLowerCase(),
      title: str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
      sentence: str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()),
      camel: str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/^[A-Z]/, c => c.toLowerCase()),
      pascal: str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/^[a-z]/, c => c.toUpperCase()),
      snake: str
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .replace(/_+/g, '_'),
      kebab: str
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
        .replace(/-+/g, '-'),
      constant: str
        .toUpperCase()
        .replace(/\s+/g, '_')
        .replace(/[^A-Z0-9_]/g, '')
        .replace(/_+/g, '_'),
      dot: str
        .toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[^a-zA-Z0-9.]/g, '')
        .replace(/\.+/g, '.'),
      path: str
        .toLowerCase()
        .replace(/\s+/g, '/')
        .replace(/[^a-zA-Z0-9/]/g, '')
        .replace(/\/+/g, '/'),
      reverse: str.split('').reverse().join(''),
      alternate: str.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(''),
      inverse: str.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''),
    };
  }, [text]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const conversionList = [
    { key: 'upper', label: '大写 (UPPER CASE)', example: 'HELLO WORLD' },
    { key: 'lower', label: '小写 (lower case)', example: 'hello world' },
    { key: 'title', label: '标题大小写 (Title Case)', example: 'Hello World' },
    { key: 'sentence', label: '句首大写 (Sentence case)', example: 'Hello world. This is a test.' },
    { key: 'camel', label: '驼峰命名 (camelCase)', example: 'helloWorld' },
    { key: 'pascal', label: '帕斯卡命名 (PascalCase)', example: 'HelloWorld' },
    { key: 'snake', label: '蛇形命名 (snake_case)', example: 'hello_world' },
    { key: 'kebab', label: '短横命名 (kebab-case)', example: 'hello-world' },
    { key: 'constant', label: '常量命名 (CONSTANT_CASE)', example: 'HELLO_WORLD' },
    { key: 'dot', label: '点分隔 (dot.case)', example: 'hello.world' },
    { key: 'path', label: '路径分隔 (path/case)', example: 'hello/world' },
    { key: 'reverse', label: '反转', example: 'dlrow olleH' },
    { key: 'alternate', label: '交替大小写', example: 'hElLo wOrLd' },
    { key: 'inverse', label: '大小写互换', example: 'HELLO world' },
  ];

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="大小写转换">
        <div style={{ display: 'grid', gap: '16px' }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="输入文字进行转换..."
            className="input"
            style={{
              width: '100%',
              height: '120px',
              resize: 'vertical',
              fontSize: '14px',
            }}
          />

          <div style={{ display: 'grid', gap: '12px' }}>
            {conversionList.map(({ key, label, example }) => (
              <div
                key={key}
                style={{
                  padding: '12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--border-radius)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '14px', wordBreak: 'break-all' }}>
                    {conversions[key as keyof typeof conversions] || <span style={{ color: 'var(--text-secondary)' }}>{example}</span>}
                  </div>
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '4px 8px' }}
                  onClick={() => copyToClipboard(conversions[key as keyof typeof conversions])}
                  disabled={!text}
                >
                  复制
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card title="命名规范说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>camelCase</strong>: 首单词小写，后续单词首字母大写，常用于 JavaScript 变量名
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>PascalCase</strong>: 每个单词首字母大写，常用于类名、组件名
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>snake_case</strong>: 单词用下划线连接，常用于 Python、Ruby
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>kebab-case</strong>: 单词用短横线连接，常用于 CSS 类名、URL
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>CONSTANT_CASE</strong>: 全大写，单词用下划线连接，用于常量
          </div>
        </div>
      </Card>
    </div>
  );
}