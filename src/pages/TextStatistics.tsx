import { useState, useMemo } from 'react';
import { Card } from '../components/common';

export default function TextStatistics() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split('\n').length;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
    const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim()).length;
    const bytes = new TextEncoder().encode(text).length;

    // Chinese specific
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const chineseWords = chineseChars; // In Chinese, characters are words
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    const numbers = (text.match(/\d+/g) || []).length;

    // Reading time (average 200 words per minute for English, 300 for Chinese)
    const readingTime = Math.ceil((chineseChars + englishWords) / 250);

    // Speaking time (average 150 words per minute)
    const speakingTime = Math.ceil((chineseChars + englishWords) / 180);

    // Character frequency
    const charFreq: Record<string, number> = {};
    for (const char of text) {
      if (char.trim()) {
        charFreq[char] = (charFreq[char] || 0) + 1;
      }
    }
    const topChars = Object.entries(charFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Word frequency (for English)
    const wordFreq: Record<string, number> = {};
    const wordMatches = text.match(/[a-zA-Z]+/g) || [];
    for (const word of wordMatches) {
      const lower = word.toLowerCase();
      wordFreq[lower] = (wordFreq[lower] || 0) + 1;
    }
    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      chars,
      charsNoSpace,
      words,
      lines,
      paragraphs,
      sentences,
      bytes,
      chineseChars,
      chineseWords,
      englishWords,
      numbers,
      readingTime,
      speakingTime,
      topChars,
      topWords,
    };
  }, [text]);

  const statItemStyle = {
    padding: '16px',
    background: 'var(--bg-tertiary)',
    borderRadius: 'var(--border-radius)',
    textAlign: 'center' as const,
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="文本统计">
        <div style={{ display: 'grid', gap: '16px' }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="输入或粘贴文本进行统计分析..."
            className="input"
            style={{
              width: '100%',
              height: '200px',
              resize: 'vertical',
              fontSize: '14px',
            }}
          />

          {/* Basic Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
            <div style={statItemStyle}>
              <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--accent-primary)' }}>{stats.chars}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>字符数</div>
            </div>
            <div style={statItemStyle}>
              <div style={{ fontSize: '24px', fontWeight: 600 }}>{stats.charsNoSpace}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>字符(不含空格)</div>
            </div>
            <div style={statItemStyle}>
              <div style={{ fontSize: '24px', fontWeight: 600 }}>{stats.words}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>单词数</div>
            </div>
            <div style={statItemStyle}>
              <div style={{ fontSize: '24px', fontWeight: 600 }}>{stats.lines}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>行数</div>
            </div>
            <div style={statItemStyle}>
              <div style={{ fontSize: '24px', fontWeight: 600 }}>{stats.sentences}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>句子数</div>
            </div>
            <div style={statItemStyle}>
              <div style={{ fontSize: '24px', fontWeight: 600 }}>{stats.paragraphs}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>段落数</div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            <div style={{ ...statItemStyle, textAlign: 'left' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>中文字符</div>
              <div style={{ fontSize: '18px', fontWeight: 500 }}>{stats.chineseChars}</div>
            </div>
            <div style={{ ...statItemStyle, textAlign: 'left' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>英文单词</div>
              <div style={{ fontSize: '18px', fontWeight: 500 }}>{stats.englishWords}</div>
            </div>
            <div style={{ ...statItemStyle, textAlign: 'left' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>数字</div>
              <div style={{ fontSize: '18px', fontWeight: 500 }}>{stats.numbers}</div>
            </div>
            <div style={{ ...statItemStyle, textAlign: 'left' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>字节数</div>
              <div style={{ fontSize: '18px', fontWeight: 500 }}>{stats.bytes}</div>
            </div>
          </div>

          {/* Time Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            <div style={{ ...statItemStyle, textAlign: 'left' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>预估阅读时间</div>
              <div style={{ fontSize: '18px', fontWeight: 500 }}>{stats.readingTime} 分钟</div>
            </div>
            <div style={{ ...statItemStyle, textAlign: 'left' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>预估朗读时间</div>
              <div style={{ fontSize: '18px', fontWeight: 500 }}>{stats.speakingTime} 分钟</div>
            </div>
          </div>
        </div>
      </Card>

      {text.trim() && (
        <>
          <Card title="字符频率 (前10)">
            <div style={{ display: 'grid', gap: '8px' }}>
              {stats.topChars.map(([char, count]) => (
                <div key={char} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius)',
                    fontFamily: 'monospace',
                    fontSize: '18px',
                  }}>
                    {char}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      height: '8px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${(count / stats.topChars[0][1]) * 100}%`,
                        height: '100%',
                        background: 'var(--accent-primary)',
                        borderRadius: '4px',
                      }} />
                    </div>
                  </div>
                  <div style={{ width: '50px', textAlign: 'right', fontFamily: 'monospace', fontSize: '14px' }}>
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {stats.topWords.length > 0 && (
            <Card title="英文词频 (前10)">
              <div style={{ display: 'grid', gap: '8px' }}>
                {stats.topWords.map(([word, count]) => (
                  <div key={word} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '80px',
                      padding: '8px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--border-radius)',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                    }}>
                      {word}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        height: '8px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${(count / stats.topWords[0][1]) * 100}%`,
                          height: '100%',
                          background: 'var(--accent-secondary)',
                          borderRadius: '4px',
                        }} />
                      </div>
                    </div>
                    <div style={{ width: '50px', textAlign: 'right', fontFamily: 'monospace', fontSize: '14px' }}>
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}