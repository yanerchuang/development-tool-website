import { useState, useMemo } from 'react';
import { Card, Button, TextArea } from '../components/common';

interface RegexToken {
  type: string;
  value: string;
  label: string;
  description: string;
}

interface RegexPreset {
  name: string;
  pattern: string;
  description: string;
  examples: string[];
}

const regexPresets: RegexPreset[] = [
  {
    name: '邮箱',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: '匹配标准邮箱格式',
    examples: ['user@example.com', 'test.user@domain.co.uk'],
  },
  {
    name: '手机号（中国）',
    pattern: '^1[3-9]\\d{9}$',
    description: '匹配中国大陆手机号',
    examples: ['13812345678', '18900001111'],
  },
  {
    name: 'URL',
    pattern: '^https?://[\\w.-]+\\.[a-zA-Z]{2,}(/\\S*)?$',
    description: '匹配 HTTP/HTTPS URL',
    examples: ['https://example.com', 'http://test.com/path'],
  },
  {
    name: 'IPv4 地址',
    pattern: '^(\\d{1,3}\\.){3}\\d{1,3}$',
    description: '匹配 IPv4 地址',
    examples: ['192.168.1.1', '10.0.0.1'],
  },
  {
    name: '日期 (YYYY-MM-DD)',
    pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
    description: '匹配日期格式',
    examples: ['2024-01-15', '2023-12-31'],
  },
  {
    name: '时间 (HH:MM)',
    pattern: '^([01]?\\d|2[0-3]):[0-5]\\d$',
    description: '匹配时间格式',
    examples: ['09:30', '23:59'],
  },
  {
    name: '身份证号（中国）',
    pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$',
    description: '匹配18位身份证号',
    examples: ['11010519900307233X'],
  },
  {
    name: '密码强度',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$',
    description: '至少8位，包含大小写字母和数字',
    examples: ['Password123', 'MyPass99'],
  },
  {
    name: '十六进制颜色',
    pattern: '^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$',
    description: '匹配十六进制颜色值',
    examples: ['#FF5733', 'FFF', '#abc'],
  },
  {
    name: '用户名',
    pattern: '^[a-zA-Z][a-zA-Z0-9_-]{2,15}$',
    description: '字母开头，3-16位，可包含数字下划线横杠',
    examples: ['john_doe', 'User123'],
  },
  {
    name: '中文',
    pattern: '^[\\u4e00-\\u9fa5]+$',
    description: '匹配中文字符',
    examples: ['你好', '中文'],
  },
  {
    name: 'QQ号',
    pattern: '^[1-9]\\d{4,10}$',
    description: '匹配QQ号码',
    examples: ['123456789', '10000'],
  },
];

const tokenLibrary: { category: string; tokens: RegexToken[] }[] = [
  {
    category: '字符类',
    tokens: [
      { type: 'char', value: '.', label: '.', description: '任意字符（除换行）' },
      { type: 'char', value: '\\d', label: '\\d', description: '数字 [0-9]' },
      { type: 'char', value: '\\D', label: '\\D', description: '非数字 [^0-9]' },
      { type: 'char', value: '\\w', label: '\\w', description: '单词字符 [a-zA-Z0-9_]' },
      { type: 'char', value: '\\W', label: '\\W', description: '非单词字符' },
      { type: 'char', value: '\\s', label: '\\s', description: '空白字符' },
      { type: 'char', value: '\\S', label: '\\S', description: '非空白字符' },
      { type: 'char', value: '\\n', label: '\\n', description: '换行符' },
      { type: 'char', value: '\\t', label: '\\t', description: '制表符' },
    ],
  },
  {
    category: '量词',
    tokens: [
      { type: 'quantifier', value: '*', label: '*', description: '0次或多次' },
      { type: 'quantifier', value: '+', label: '+', description: '1次或多次' },
      { type: 'quantifier', value: '?', label: '?', description: '0次或1次' },
      { type: 'quantifier', value: '{n}', label: '{n}', description: '恰好n次' },
      { type: 'quantifier', value: '{n,}', label: '{n,}', description: '至少n次' },
      { type: 'quantifier', value: '{n,m}', label: '{n,m}', description: 'n到m次' },
    ],
  },
  {
    category: '位置',
    tokens: [
      { type: 'anchor', value: '^', label: '^', description: '行首' },
      { type: 'anchor', value: '$', label: '$', description: '行尾' },
      { type: 'anchor', value: '\\b', label: '\\b', description: '单词边界' },
      { type: 'anchor', value: '\\B', label: '\\B', description: '非单词边界' },
    ],
  },
  {
    category: '分组',
    tokens: [
      { type: 'group', value: '()', label: '()', description: '捕获分组' },
      { type: 'group', value: '(?:)', label: '(?:)', description: '非捕获分组' },
      { type: 'group', value: '(?=)', label: '(?=)', description: '正向先行断言' },
      { type: 'group', value: '(?!)', label: '(?!)', description: '负向先行断言' },
    ],
  },
  {
    category: '字符集',
    tokens: [
      { type: 'set', value: '[]', label: '[abc]', description: '字符集合' },
      { type: 'set', value: '[^]', label: '[^abc]', description: '排除字符集合' },
      { type: 'set', value: '[a-z]', label: '[a-z]', description: '字符范围' },
      { type: 'set', value: '[0-9]', label: '[0-9]', description: '数字范围' },
    ],
  },
];

export default function RegexBuilder() {
  const [pattern, setPattern] = useState('');
  const [testInput, setTestInput] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [customValue, setCustomValue] = useState('');

  const matchResult = useMemo(() => {
    if (!pattern || !testInput) return null;

    try {
      const flagStr = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag]) => flag)
        .join('');

      const regex = new RegExp(pattern, flagStr);
      const matches: RegExpMatchArray[] = [];

      if (flags.g) {
        let match;
        const globalRegex = new RegExp(pattern, flagStr);
        while ((match = globalRegex.exec(testInput)) !== null) {
          matches.push(match);
          if (match[0] === '') break; // 防止零宽匹配无限循环
        }
      } else {
        const match = testInput.match(regex);
        if (match) matches.push(match);
      }

      return { success: true, matches, regex };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }, [pattern, testInput, flags]);

  const addToken = (token: RegexToken) => {
    setPattern(prev => prev + token.value);
  };

  const addCustom = () => {
    if (customValue) {
      setPattern(prev => prev + customValue);
      setCustomValue('');
    }
  };

  const loadPreset = (preset: RegexPreset) => {
    setPattern(preset.pattern);
    setTestInput(preset.examples.join('\n'));
  };

  const copyPattern = () => {
    navigator.clipboard.writeText(pattern);
  };

  const generateCode = (language: string): string => {
    const flagStr = Object.entries(flags)
      .filter(([_, enabled]) => enabled)
      .map(([flag]) => flag)
      .join('');

    switch (language) {
      case 'javascript':
        return `const regex = /${pattern}/${flagStr};\nconst result = text.match(regex);`;
      case 'python':
        const pyFlags = (flags.i ? 're.IGNORECASE' : '') + (flags.m ? 're.MULTILINE' : '');
        return `import re\npattern = r"${pattern}"\nresult = re.findall(pattern, text${pyFlags ? ', ' + pyFlags : ''})`;
      case 'java':
        return `Pattern pattern = Pattern.compile("${pattern.replace(/\\/g, '\\\\')}");\nMatcher matcher = pattern.matcher(text);`;
      case 'go':
        return `re := regexp.MustCompile(\`${pattern}\`)\nmatches := re.FindAllString(text, -1)`;
      default:
        return '';
    }
  };

  const clearAll = () => {
    setPattern('');
    setTestInput('');
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="正则表达式可视化构建器">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          通过点击构建正则表达式，实时测试匹配结果
        </p>
      </Card>

      {/* 预设模板 */}
      <Card title="常用预设">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {regexPresets.map(preset => (
            <button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              style={{
                padding: '8px 12px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Token 库 */}
      <Card title="构建工具">
        <div style={{ display: 'grid', gap: '16px' }}>
          {tokenLibrary.map(group => (
            <div key={group.category}>
              <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                {group.category}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {group.tokens.map(token => (
                  <button
                    key={token.value}
                    onClick={() => addToken(token)}
                    title={token.description}
                    style={{
                      padding: '6px 10px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {token.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={customValue}
              onChange={e => setCustomValue(e.target.value)}
              placeholder="自定义字符..."
              className="input"
              style={{ maxWidth: '200px' }}
              onKeyDown={e => e.key === 'Enter' && addCustom()}
            />
            <Button variant="secondary" size="sm" onClick={addCustom}>添加</Button>
          </div>
        </div>
      </Card>

      {/* 正则表达式输入 */}
      <Card title="正则表达式">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>/</span>
            <input
              type="text"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="输入或点击构建正则表达式..."
              className="input"
              style={{ flex: 1, fontFamily: 'monospace' }}
            />
            <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>/</span>
            <span style={{ fontFamily: 'monospace' }}>{Object.entries(flags).filter(([_, e]) => e).map(([f]) => f).join('')}</span>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { flag: 'g', label: '全局匹配 (g)' },
              { flag: 'i', label: '忽略大小写 (i)' },
              { flag: 'm', label: '多行模式 (m)' },
              { flag: 's', label: '点匹配换行 (s)' },
            ].map(({ flag, label }) => (
              <label key={flag} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={flags[flag as keyof typeof flags]}
                  onChange={e => setFlags({ ...flags, [flag]: e.target.checked })}
                />
                <span style={{ fontSize: '13px' }}>{label}</span>
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" onClick={copyPattern}>复制</Button>
            <Button variant="secondary" size="sm" onClick={clearAll}>清空</Button>
          </div>
        </div>
      </Card>

      {/* 测试输入 */}
      <Card title="测试文本">
        <TextArea
          value={testInput}
          onChange={e => setTestInput(e.target.value)}
          placeholder="输入要匹配的文本..."
          style={{ minHeight: '100px' }}
        />
      </Card>

      {/* 匹配结果 */}
      {matchResult && (
        <Card title="匹配结果">
          {matchResult.success ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {'matches' in matchResult && matchResult.matches && matchResult.matches.length > 0 ? (
                <>
                  <div style={{ color: 'var(--accent-success)', fontWeight: 500 }}>
                    找到 {matchResult.matches.length} 个匹配
                  </div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {matchResult.matches.map((match, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '8px 12px',
                          background: 'var(--bg-secondary)',
                          borderRadius: '6px',
                          borderLeft: '3px solid var(--accent-success)',
                        }}
                      >
                        <span style={{ fontFamily: 'monospace' }}>{match[0]}</span>
                        {match.length > 1 && (
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            分组: {match.slice(1).map((g, j) => <span key={j} style={{ marginRight: '8px' }}>${j + 1}: "{g}"</span>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--text-secondary)' }}>无匹配</div>
              )}
            </div>
          ) : (
            <div style={{ color: 'var(--accent-danger)' }}>{matchResult.error}</div>
          )}
        </Card>
      )}

      {/* 代码生成 */}
      {pattern && (
        <Card title="代码生成">
          <div style={{ display: 'grid', gap: '12px' }}>
            {['javascript', 'python', 'java', 'go'].map(lang => (
              <div key={lang}>
                <div style={{ fontWeight: 600, marginBottom: '8px', textTransform: 'capitalize' }}>{lang}</div>
                <pre className="result-box" style={{ margin: 0, fontSize: '13px' }}>
                  {generateCode(lang)}
                </pre>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}