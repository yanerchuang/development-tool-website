import { useState } from 'react';
import { Card, Button } from '../components/common';

export default function RegexVisualizer() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState<{match: string; start: number; end: number; groups?: string[]}[]>([]);
  const [error, setError] = useState('');
  const [explanation, setExplanation] = useState<string[]>([]);

  const explainRegex = (regex: string): string[] => {
    const explanations: string[] = [];
    let i = 0;

    while (i < regex.length) {
      const char = regex[i];

      // Character classes
      if (char === '[') {
        const end = regex.indexOf(']', i);
        if (end !== -1) {
          const content = regex.slice(i + 1, end);
          explanations.push(`[${content}] - 字符类，匹配 ${content} 中的任意一个字符`);
          i = end + 1;
          continue;
        }
      }

      // Escaped characters
      if (char === '\\' && i + 1 < regex.length) {
        const next = regex[i + 1];
        const escapeMap: Record<string, string> = {
          'd': '\\d - 匹配任意数字 [0-9]',
          'D': '\\D - 匹配任意非数字 [^0-9]',
          'w': '\\w - 匹配任意单词字符 [a-zA-Z0-9_]',
          'W': '\\W - 匹配任意非单词字符',
          's': '\\s - 匹配任意空白字符',
          'S': '\\S - 匹配任意非空白字符',
          'n': '\\n - 匹配换行符',
          'r': '\\r - 匹配回车符',
          't': '\\t - 匹配制表符',
          '.': '\\. - 匹配点号字符',
          '*': '\\* - 匹配星号字符',
          '+': '\\+ - 匹配加号字符',
          '?': '\\? - 匹配问号字符',
          '^': '\\^ - 匹配脱字符',
          '$': '\\$ - 匹配美元符号',
          '\\': '\\\\ - 匹配反斜杠',
          '(': '\\( - 匹配左括号',
          ')': '\\) - 匹配右括号',
          '[': '\\[ - 匹配左方括号',
          ']': '\\] - 匹配右方括号',
          '{': '\\{ - 匹配左花括号',
          '}': '\\} - 匹配右花括号',
          '|': '\\| - 匹配竖线字符',
        };
        explanations.push(escapeMap[next] || `\\${next} - 转义字符`);
        i += 2;
        continue;
      }

      // Quantifiers
      if (char === '*' || char === '+' || char === '?') {
        const quantMap: Record<string, string> = {
          '*': '* - 匹配前面的字符 0 次或多次',
          '+': '+ - 匹配前面的字符 1 次或多次',
          '?': '? - 匹配前面的字符 0 次或 1 次',
        };
        if (regex[i + 1] === '?') {
          explanations.push(quantMap[char] + ' (非贪婪模式)');
          i += 2;
        } else {
          explanations.push(quantMap[char]);
          i++;
        }
        continue;
      }

      // Anchors
      if (char === '^') {
        explanations.push('^ - 匹配字符串开头');
        i++;
        continue;
      }
      if (char === '$') {
        explanations.push('$ - 匹配字符串结尾');
        i++;
        continue;
      }

      // Groups
      if (char === '(') {
        if (regex.slice(i, i + 3) === '(?:') {
          explanations.push('(?:...) - 非捕获分组');
          i += 3;
        } else if (regex.slice(i, i + 4) === '(?=') {
          explanations.push('(?=...) - 正向先行断言');
          i += 4;
        } else if (regex.slice(i, i + 4) === '(?!') {
          explanations.push('(?!...) - 负向先行断言');
          i += 4;
        } else {
          explanations.push('(...) - 捕获分组');
          i++;
        }
        continue;
      }
      if (char === ')') {
        explanations.push(') - 分组结束');
        i++;
        continue;
      }

      // Alternation
      if (char === '|') {
        explanations.push('| - 或运算，匹配左边或右边');
        i++;
        continue;
      }

      // Dot
      if (char === '.') {
        explanations.push('. - 匹配任意字符（除换行符外）');
        i++;
        continue;
      }

      // Quantifier ranges
      if (char === '{') {
        const end = regex.indexOf('}', i);
        if (end !== -1) {
          const content = regex.slice(i + 1, end);
          explanations.push(`{${content}} - 量词，指定重复次数`);
          i = end + 1;
          continue;
        }
      }

      // Literal character
      explanations.push(`"${char}" - 匹配字符 ${char}`);
      i++;
    }

    return explanations;
  };

  const testRegex = () => {
    setError('');
    setMatches([]);
    setExplanation([]);

    if (!pattern) return;

    try {
      const regex = new RegExp(pattern, flags);
      setExplanation(explainRegex(pattern));

      if (testString) {
        const newMatches: {match: string; start: number; end: number; groups?: string[]}[] = [];
        let match;

        if (flags.includes('g')) {
          while ((match = regex.exec(testString)) !== null) {
            newMatches.push({
              match: match[0],
              start: match.index,
              end: match.index + match[0].length,
              groups: match.slice(1),
            });
            if (match[0].length === 0) regex.lastIndex++;
          }
        } else {
          match = regex.exec(testString);
          if (match) {
            newMatches.push({
              match: match[0],
              start: match.index,
              end: match.index + match[0].length,
              groups: match.slice(1),
            });
          }
        }

        setMatches(newMatches);
      }
    } catch (err) {
      setError(String(err));
    }
  };

  const highlightMatches = (): string => {
    if (!testString || matches.length === 0) return testString;

    let result = '';
    let lastIndex = 0;

    for (const m of matches) {
      result += testString.slice(lastIndex, m.start);
      result += `[[HIGHLIGHT]]${m.match}[[/HIGHLIGHT]]`;
      lastIndex = m.end;
    }
    result += testString.slice(lastIndex);

    return result;
  };

  const renderHighlighted = () => {
    const highlighted = highlightMatches();
    const parts = highlighted.split(/\[\[HIGHLIGHT\]\]|\[\[\/HIGHLIGHT\]\]/);

    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <span key={i} style={{ background: '#fef08a', color: '#000', padding: '1px 2px', borderRadius: '2px' }}>
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const loadExample = (example: 'email' | 'phone' | 'url' | 'ip') => {
    switch (example) {
      case 'email':
        setPattern('^[\\w.-]+@[\\w.-]+\\.\\w+$');
        setTestString('test@example.com\ninvalid-email\nuser.name@domain.org');
        setFlags('gm');
        break;
      case 'phone':
        setPattern('1[3-9]\\d{9}');
        setTestString('13812345678\n15987654321\n12345678901');
        setFlags('g');
        break;
      case 'url':
        setPattern('https?:\\/\\/[\\w.-]+(?:\\/[\\w./-]*)?');
        setTestString('https://www.example.com\nhttp://test.org/path\nftp://invalid');
        setFlags('g');
        break;
      case 'ip':
        setPattern('\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b');
        setTestString('192.168.1.1\n10.0.0.1\n256.1.1.1\n172.16.0.1');
        setFlags('g');
        break;
    }
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="正则表达式可视化">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Pattern Input */}
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>/</span>
              <input
                type="text"
                value={pattern}
                onChange={e => setPattern(e.target.value)}
                placeholder="输入正则表达式..."
                className="input"
                style={{ flex: 1, fontFamily: 'monospace' }}
              />
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>/</span>
              <input
                type="text"
                value={flags}
                onChange={e => setFlags(e.target.value)}
                placeholder="标志"
                className="input"
                style={{ width: '60px', fontFamily: 'monospace' }}
              />
            </div>
            {error && (
              <div style={{ color: 'var(--accent-danger)', fontSize: '13px' }}>{error}</div>
            )}
          </div>

          {/* Examples */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="secondary" size="sm" onClick={() => loadExample('email')}>邮箱</Button>
            <Button variant="secondary" size="sm" onClick={() => loadExample('phone')}>手机号</Button>
            <Button variant="secondary" size="sm" onClick={() => loadExample('url')}>URL</Button>
            <Button variant="secondary" size="sm" onClick={() => loadExample('ip')}>IP地址</Button>
          </div>

          {/* Test String */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>测试字符串</div>
            <textarea
              value={testString}
              onChange={e => setTestString(e.target.value)}
              placeholder="输入测试文本..."
              className="input"
              style={{ width: '100%', minHeight: '100px', fontFamily: 'monospace', fontSize: '13px' }}
            />
          </div>

          <Button variant="primary" onClick={testRegex}>测试正则</Button>

          {/* Highlighted Result */}
          {matches.length > 0 && (
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                匹配结果 ({matches.length} 个)
              </div>
              <div
                className="result-box"
                style={{ fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
              >
                {renderHighlighted()}
              </div>
            </div>
          )}

          {/* Matches List */}
          {matches.length > 0 && (
            <div style={{ display: 'grid', gap: '8px' }}>
              {matches.map((m, i) => (
                <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{m.match}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>位置: {m.start}-{m.end}</span>
                  </div>
                  {m.groups && m.groups.length > 0 && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      分组: {m.groups.filter(g => g).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Explanation */}
      {explanation.length > 0 && (
        <Card title="正则解释">
          <div style={{ display: 'grid', gap: '4px' }}>
            {explanation.map((exp, i) => (
              <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', fontSize: '13px', fontFamily: 'monospace' }}>
                {exp}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="常用标志">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div><strong>g</strong> - 全局匹配（查找所有匹配）</div>
          <div><strong>i</strong> - 忽略大小写</div>
          <div><strong>m</strong> - 多行模式（^和$匹配行首行尾）</div>
          <div><strong>s</strong> - 点号匹配包括换行符</div>
        </div>
      </Card>
    </div>
  );
}