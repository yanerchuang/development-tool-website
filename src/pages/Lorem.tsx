import { useState } from 'react';
import { Card, Button } from '../components/common';
import { CopyButton } from '../components/common';
import { generateLorem, generateArticle } from '../utils/lorem';

type Language = 'zh' | 'en';
type ContentType = 'paragraphs' | 'sentences' | 'words';

export default function Lorem() {
  const [lang, setLang] = useState<Language>('zh');
  const [type, setType] = useState<ContentType>('paragraphs');
  const [count, setCount] = useState(3);
  const [includeTitle, setIncludeTitle] = useState(false);
  const [result, setResult] = useState('');

  const handleGenerate = () => {
    if (includeTitle && type === 'paragraphs') {
      setResult(generateArticle(lang, count));
    } else {
      setResult(generateLorem({ lang, type, count }));
    }
  };

  const handleClear = () => {
    setResult('');
  };

  const typeLabels: Record<ContentType, string> = {
    paragraphs: '段落',
    sentences: '句子',
    words: '字词',
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* 生成器 */}
      <Card title="假文生成器">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* 语言选择 */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>语言：</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant={lang === 'zh' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setLang('zh')}
              >
                中文
              </Button>
              <Button
                variant={lang === 'en' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setLang('en')}
              >
                English (Lorem Ipsum)
              </Button>
            </div>
          </div>

          {/* 类型选择 */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>生成类型：</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(Object.keys(typeLabels) as ContentType[]).map(t => (
                <Button
                  key={t}
                  variant={type === t ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setType(t)}
                >
                  {typeLabels[t]}
                </Button>
              ))}
            </div>
          </div>

          {/* 数量设置 */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>数量：</span>
            <input
              type="range"
              min={1}
              max={type === 'words' ? 100 : 10}
              value={count}
              onChange={e => setCount(parseInt(e.target.value))}
              style={{ flex: 1, maxWidth: '200px' }}
            />
            <span style={{ width: '40px', textAlign: 'right', fontFamily: 'monospace' }}>
              {count}
            </span>
          </div>

          {/* 包含标题 */}
          {type === 'paragraphs' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeTitle}
                onChange={e => setIncludeTitle(e.target.checked)}
              />
              <span style={{ fontSize: '14px' }}>包含标题（生成完整文章）</span>
            </label>
          )}

          {/* 生成按钮 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" onClick={handleGenerate}>
              生成
            </Button>
            <Button variant="secondary" onClick={handleClear}>
              清空
            </Button>
          </div>
        </div>
      </Card>

      {/* 结果 */}
      {result && (
        <Card title="生成结果">
          <div
            style={{
              position: 'relative',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--border-radius)',
              padding: '16px',
              minHeight: '150px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                display: 'flex',
                gap: '8px',
              }}
            >
              <CopyButton text={result} />
            </div>
            <div
              style={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.8,
                fontSize: '14px',
              }}
            >
              {result}
            </div>
          </div>
          <div
            style={{
              marginTop: '12px',
              color: 'var(--text-muted)',
              fontSize: '13px',
            }}
          >
            共 {result.length} 个字符，{result.split(/\s+/).filter(w => w).length} 个{lang === 'zh' ? '字' : '单词'}
          </div>
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>中文假文</strong>：随机组合常用汉字，适合排版测试。
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Lorem Ipsum</strong>：经典拉丁文假文，广泛用于印刷和排版行业。
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '8px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <strong>段落</strong>
              <p style={{ margin: '4px 0 0', fontSize: '13px' }}>生成 3-7 句话的段落</p>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <strong>句子</strong>
              <p style={{ margin: '4px 0 0', fontSize: '13px' }}>生成指定数量的句子</p>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <strong>字词</strong>
              <p style={{ margin: '4px 0 0', fontSize: '13px' }}>生成指定数量的字/词</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}