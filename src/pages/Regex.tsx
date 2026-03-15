import { useState, useMemo } from 'react';
import { Card, TextArea } from '../components/common';
import { regexTemplates, testRegex, isValidRegex } from '../utils/regex';

export default function Regex() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  // 测试结果
  const result = useMemo(() => {
    if (!pattern) return null;
    return testRegex(pattern, text, flags);
  }, [pattern, text, flags]);

  // 正则有效性
  const validity = useMemo(() => {
    if (!pattern) return null;
    return isValidRegex(pattern);
  }, [pattern]);

  // 高亮显示匹配结果
  const highlightedText = useMemo(() => {
    if (!result?.matches.length || !text) return text;

    let highlighted = '';
    let lastIndex = 0;

    result.matches.forEach(match => {
      highlighted += text.slice(lastIndex, match.start);
      highlighted += `[[MATCH]]${match.match}[[/MATCH]]`;
      lastIndex = match.end;
    });
    highlighted += text.slice(lastIndex);

    return highlighted;
  }, [result, text]);

  const handleSelectTemplate = (index: number) => {
    const template = regexTemplates[index];
    setPattern(template.pattern.source);
    setText(template.example);
    setSelectedTemplate(index);
  };

  const handleFlagToggle = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* 正则表达式输入 */}
      <Card title="正则表达式">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>/</span>
            <input
              type="text"
              value={pattern}
              onChange={e => {
                setPattern(e.target.value);
                setSelectedTemplate(null);
              }}
              placeholder="输入正则表达式..."
              style={{
                flex: 1,
                padding: '10px 12px',
                fontSize: '14px',
                fontFamily: 'monospace',
                color: 'var(--text-primary)',
                background: 'var(--bg-primary)',
                border: validity?.valid === false ? '1px solid var(--accent-danger)' : '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>/</span>
            <input
              type="text"
              value={flags}
              onChange={e => setFlags(e.target.value)}
              placeholder="flags"
              style={{
                width: '60px',
                padding: '10px 12px',
                fontSize: '14px',
                fontFamily: 'monospace',
                color: 'var(--text-primary)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
              }}
            />
          </div>

          {/* 标志选择 */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { flag: 'g', label: 'global' },
              { flag: 'i', label: 'ignore case' },
              { flag: 'm', label: 'multiline' },
              { flag: 's', label: 'dotall' },
            ].map(item => (
              <button
                key={item.flag}
                onClick={() => handleFlagToggle(item.flag)}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  background: flags.includes(item.flag) ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: flags.includes(item.flag) ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                {item.flag} ({item.label})
              </button>
            ))}
          </div>

          {validity?.valid === false && (
            <div style={{ color: 'var(--accent-danger)', fontSize: '13px' }}>
              语法错误: {validity.error}
            </div>
          )}
        </div>
      </Card>

      {/* 常用模板 */}
      <Card title="常用模板">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {regexTemplates.map((template, index) => (
            <button
              key={index}
              onClick={() => handleSelectTemplate(index)}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)',
                background: selectedTemplate === index ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: selectedTemplate === index ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              {template.name}
            </button>
          ))}
        </div>
      </Card>

      {/* 测试文本 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <Card title="测试文本">
          <TextArea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="输入要测试的文本..."
            style={{ minHeight: '200px' }}
          />
        </Card>

        <Card title="匹配结果">
          <div
            style={{
              minHeight: '200px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--border-radius)',
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: '13px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {highlightedText.split('[[').map((part, i) => {
              if (part.startsWith('MATCH]]')) {
                const matchContent = part.replace('MATCH]]', '').split('[[/MATCH]]')[0];
                const rest = part.split('[[/MATCH]]')[1] || '';
                return (
                  <span key={i}>
                    <span style={{ background: 'rgba(66, 99, 235, 0.3)', borderRadius: '2px' }}>
                      {matchContent}
                    </span>
                    {rest}
                  </span>
                );
              }
              return <span key={i}>{part}</span>;
            })}
          </div>
        </Card>
      </div>

      {/* 匹配详情 */}
      {result?.matches.length ? (
        <Card title={`匹配结果 (${result.matches.length} 个)`}>
          <div style={{ display: 'grid', gap: '8px' }}>
            {result.matches.map((match, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--border-radius)',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                }}
              >
                <span style={{ color: 'var(--text-secondary)', width: '30px' }}>#{index + 1}</span>
                <span style={{ flex: 1 }}>{match.match}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  [{match.start}-{match.end}]
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : result && !result.matches.length ? (
        <Card>
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
            未找到匹配
          </div>
        </Card>
      ) : null}
    </div>
  );
}