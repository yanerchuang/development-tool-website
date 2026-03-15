import { useState } from 'react';
import { Card, Button, TextArea, Input } from '../components/common';

type TabType = 'transform' | 'case' | 'sort' | 'replace' | 'analyze';

export default function Text() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('transform');

  // 查找替换
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(true);

  // 字数统计
  const getStats = (text: string) => {
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split('\n').length;
    const linesNonEmpty = text.split('\n').filter(l => l.trim()).length;
    const bytes = new TextEncoder().encode(text).length;
    const sentences = (text.match(/[.!?。！？]+/g) || []).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
    return { chars, charsNoSpace, words, lines, linesNonEmpty, bytes, sentences, paragraphs };
  };

  const stats = getStats(input);

  // 字符频率分析
  const getCharFrequency = (text: string) => {
    const freq: Record<string, number> = {};
    for (const char of text) {
      freq[char] = (freq[char] || 0) + 1;
    }
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
  };

  const charFreq = getCharFrequency(input);

  // 文本转换
  const transformations: { label: string; action: () => void }[] = [
    {
      label: '去除首尾空白',
      action: () => setOutput(input.trim()),
    },
    {
      label: '去除所有空白',
      action: () => setOutput(input.replace(/\s+/g, '')),
    },
    {
      label: '去除空行',
      action: () => setOutput(input.split('\n').filter(line => line.trim()).join('\n')),
    },
    {
      label: '去除重复行',
      action: () => setOutput([...new Set(input.split('\n'))].join('\n')),
    },
    {
      label: '添加行号',
      action: () => setOutput(input.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n')),
    },
    {
      label: '反转文本',
      action: () => setOutput(input.split('').reverse().join('')),
    },
    {
      label: '反转行序',
      action: () => setOutput(input.split('\n').reverse().join('\n')),
    },
    {
      label: '打乱行序',
      action: () => {
        const lines = input.split('\n');
        for (let i = lines.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [lines[i], lines[j]] = [lines[j], lines[i]];
        }
        setOutput(lines.join('\n'));
      },
    },
    {
      label: '合并为单行',
      action: () => setOutput(input.split('\n').join(' ')),
    },
    {
      label: '每行加引号',
      action: () => setOutput(input.split('\n').map(line => `"${line}"`).join('\n')),
    },
    {
      label: '每行加逗号',
      action: () => setOutput(input.split('\n').map(line => line + ',').join('\n')),
    },
    {
      label: '提取URL',
      action: () => {
        const urls = input.match(/https?:\/\/[^\s<>"]+/g) || [];
        setOutput(urls.join('\n'));
      },
    },
    {
      label: '提取邮箱',
      action: () => {
        const emails = input.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
        setOutput(emails.join('\n'));
      },
    },
    {
      label: '提取数字',
      action: () => {
        const numbers = input.match(/-?\d+\.?\d*/g) || [];
        setOutput(numbers.join('\n'));
      },
    },
    {
      label: '全角转半角',
      action: () => {
        let result = input;
        for (let i = 0xFF01; i <= 0xFF5E; i++) {
          result = result.replace(new RegExp(String.fromCharCode(i), 'g'), String.fromCharCode(i - 0xFEE0));
        }
        result = result.replace(/\u3000/g, ' ');
        setOutput(result);
      },
    },
    {
      label: '半角转全角',
      action: () => {
        let result = input;
        for (let i = 0x21; i <= 0x7E; i++) {
          result = result.replace(new RegExp(String.fromCharCode(i), 'g'), String.fromCharCode(i + 0xFEE0));
        }
        result = result.replace(/ /g, '\u3000');
        setOutput(result);
      },
    },
  ];

  // 大小写转换
  const caseTransforms: { label: string; action: () => void }[] = [
    { label: '全大写', action: () => setOutput(input.toUpperCase()) },
    { label: '全小写', action: () => setOutput(input.toLowerCase()) },
    { label: '首字母大写', action: () => setOutput(input.replace(/\b\w/g, c => c.toUpperCase())) },
    { label: '每个单词首字母大写', action: () => setOutput(input.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())) },
    { label: '驼峰命名', action: () => setOutput(input.toLowerCase().replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')) },
    { label: '蛇形命名', action: () => setOutput(input.replace(/\s+/g, '_').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()) },
    { label: '短横线命名', action: () => setOutput(input.replace(/\s+/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()) },
    { label: '句首大写', action: () => setOutput(input.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase())) },
    { label: '大小写互换', action: () => setOutput(input.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('')) },
  ];

  // 排序
  const sortActions: { label: string; action: () => void }[] = [
    { label: '按字母升序', action: () => setOutput(input.split('\n').sort().join('\n')) },
    { label: '按字母降序', action: () => setOutput(input.split('\n').sort().reverse().join('\n')) },
    { label: '按长度升序', action: () => setOutput(input.split('\n').sort((a, b) => a.length - b.length).join('\n')) },
    { label: '按长度降序', action: () => setOutput(input.split('\n').sort((a, b) => b.length - a.length).join('\n')) },
    { label: '按数字升序', action: () => setOutput(input.split('\n').sort((a, b) => {
      const numA = parseFloat(a.match(/-?\d+\.?\d*/)?.[0] || '0');
      const numB = parseFloat(b.match(/-?\d+\.?\d*/)?.[0] || '0');
      return numA - numB;
    }).join('\n')) },
    { label: '按数字降序', action: () => setOutput(input.split('\n').sort((a, b) => {
      const numA = parseFloat(a.match(/-?\d+\.?\d*/)?.[0] || '0');
      const numB = parseFloat(b.match(/-?\d+\.?\d*/)?.[0] || '0');
      return numB - numA;
    }).join('\n')) },
    { label: '随机排序', action: () => {
      const lines = input.split('\n');
      for (let i = lines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lines[i], lines[j]] = [lines[j], lines[i]];
      }
      setOutput(lines.join('\n'));
    }},
  ];

  // 查找替换
  const handleReplace = () => {
    if (!findText) {
      setOutput(input);
      return;
    }
    try {
      if (useRegex) {
        const flags = caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(findText, flags);
        setOutput(input.replace(regex, replaceText));
      } else {
        const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const flags = caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(escaped, flags);
        setOutput(input.replace(regex, replaceText));
      }
    } catch (e) {
      setOutput('错误：' + (e as Error).message);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'transform', label: '文本转换' },
    { key: 'case', label: '大小写' },
    { key: 'sort', label: '排序' },
    { key: 'replace', label: '查找替换' },
    { key: 'analyze', label: '统计分析' },
  ];

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Tab 切换 */}
      <div className="tabs" style={{ marginBottom: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 输入区域 */}
      <Card title="输入文本">
        <TextArea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入要处理的文本..."
          style={{ minHeight: '150px' }}
        />
      </Card>

      {/* 转换 Tab */}
      {activeTab === 'transform' && (
        <>
          <Card title="转换操作">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {transformations.map(t => (
                <Button key={t.label} variant="secondary" size="sm" onClick={t.action}>
                  {t.label}
                </Button>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* 大小写 Tab */}
      {activeTab === 'case' && (
        <Card title="大小写转换">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {caseTransforms.map(t => (
              <Button key={t.label} variant="secondary" size="sm" onClick={t.action}>
                {t.label}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* 排序 Tab */}
      {activeTab === 'sort' && (
        <Card title="行排序">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {sortActions.map(t => (
              <Button key={t.label} variant="secondary" size="sm" onClick={t.action}>
                {t.label}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* 查找替换 Tab */}
      {activeTab === 'replace' && (
        <Card title="查找替换">
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="查找内容"
                value={findText}
                onChange={e => setFindText(e.target.value)}
                placeholder="要查找的文本或正则..."
              />
              <Input
                label="替换为"
                value={replaceText}
                onChange={e => setReplaceText(e.target.value)}
                placeholder="替换后的文本..."
              />
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={useRegex} onChange={e => setUseRegex(e.target.checked)} />
                <span style={{ fontSize: '14px' }}>使用正则表达式</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={caseSensitive} onChange={e => setCaseSensitive(e.target.checked)} />
                <span style={{ fontSize: '14px' }}>区分大小写</span>
              </label>
              <Button variant="primary" onClick={handleReplace}>替换全部</Button>
            </div>
          </div>
        </Card>
      )}

      {/* 统计分析 Tab */}
      {activeTab === 'analyze' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <Card title="文本统计">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
              {[
                { label: '字符数', value: stats.chars },
                { label: '不含空格', value: stats.charsNoSpace },
                { label: '单词数', value: stats.words },
                { label: '行数', value: stats.lines },
                { label: '非空行', value: stats.linesNonEmpty },
                { label: '段落数', value: stats.paragraphs },
                { label: '句子数', value: stats.sentences },
                { label: '字节数', value: stats.bytes },
              ].map(item => (
                <div key={item.label} style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent-primary)' }}>{item.value}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </Card>

          {charFreq.length > 0 && (
            <Card title="字符频率 (前20)">
              <div style={{ display: 'grid', gap: '4px' }}>
                {charFreq.map(([char, count]) => (
                  <div key={char} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                    <span style={{ fontFamily: 'monospace', width: '30px', textAlign: 'center' }}>
                      {char === ' ' ? '␣' : char === '\n' ? '↵' : char === '\t' ? '→' : char}
                    </span>
                    <div style={{ flex: 1, height: '8px', background: 'var(--bg-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(count / charFreq[0][1]) * 100}%`, height: '100%', background: 'var(--accent-primary)' }} />
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px', width: '40px' }}>{count}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 输出区域 */}
      {output && activeTab !== 'analyze' && (
        <Card title="输出结果">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <pre className="result-box" style={{ minHeight: '150px', margin: 0, whiteSpace: 'pre-wrap' }}>{output}</pre>
            <Button variant="secondary" size="sm" onClick={copyOutput} style={{ width: 'fit-content' }}>
              复制结果
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}