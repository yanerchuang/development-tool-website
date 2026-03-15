import { useState, useMemo } from 'react';
import { Card, Button, TextArea } from '../components/common';

export default function MarkdownPreview() {
  const [input, setInput] = useState('# 标题\n\n这是一段 **粗体** 和 *斜体* 文字。\n\n## 列表示例\n\n- 项目 1\n- 项目 2\n  - 嵌套项目\n- 项目 3\n\n### 有序列表\n\n1. 第一项\n2. 第二项\n3. 第三项\n\n## 代码块\n\n```javascript\nfunction hello() {\n  console.log("Hello, World!");\n}\n```\n\n行内代码：`const x = 1;`\n\n## 引用\n\n> 这是一段引用文字\n> 可以多行\n\n## 链接和图片\n\n[这是一个链接](https://example.com)\n\n## 表格\n\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| A   | B   | C   |\n| D   | E   | F   |\n\n---\n\n水平分割线');
  const [copied, setCopied] = useState(false);

  const parseMarkdown = (text: string): string => {
    let html = text;

    // Escape HTML
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%" />');

    // Blockquotes
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    // Merge consecutive blockquotes
    html = html.replace(/<\/blockquote>\n<blockquote>/g, '<br>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr />');

    // Unordered lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<oli>$1</oli>');
    html = html.replace(/(<oli>.*<\/oli>\n?)+/g, match => {
      return '<ol>' + match.replace(/<\/?oli>/g, m => m === '<oli>' ? '<li>' : '</li>') + '</ol>';
    });

    // Tables
    const tableRegex = /^\|(.+)\|\n\|[-|\s]+\|\n((?:\|.+\|\n?)+)/gm;
    html = html.replace(tableRegex, (_match, header, body) => {
      const headers = header.split('|').filter((h: string) => h.trim()).map((h: string) => `<th>${h.trim()}</th>`).join('');
      const rows = body.trim().split('\n').map((row: string) => {
        const cells = row.split('|').filter((c: string) => c.trim()).map((c: string) => `<td>${c.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    });

    // Paragraphs
    html = html.split('\n\n').map(block => {
      if (block.startsWith('<h') || block.startsWith('<ul') || block.startsWith('<ol') ||
          block.startsWith('<pre') || block.startsWith('<blockquote') || block.startsWith('<table') ||
          block.startsWith('<hr')) {
        return block;
      }
      if (block.trim()) {
        return `<p>${block.replace(/\n/g, '<br>')}</p>`;
      }
      return block;
    }).join('\n');

    return html;
  };

  const renderedHTML = useMemo(() => parseMarkdown(input), [input]);

  const handleCopy = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="Markdown 编辑器">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="tool-panel-header">
              <span className="tool-panel-title">Markdown</span>
              <div className="tool-actions">
                <Button variant="secondary" size="sm" onClick={handleClear}>清空</Button>
                <Button variant="secondary" size="sm" onClick={handleCopy}>{copied ? '已复制' : '复制'}</Button>
              </div>
            </div>
            <TextArea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="输入 Markdown 文本..."
              style={{ flex: 1, minHeight: '400px', fontFamily: 'monospace' }}
            />
          </div>

          {/* Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="tool-panel-header">
              <span className="tool-panel-title">预览</span>
            </div>
            <div
              className="markdown-preview"
              style={{
                flex: 1,
                minHeight: '400px',
                padding: '16px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--border-radius)',
                overflow: 'auto',
              }}
              dangerouslySetInnerHTML={{ __html: renderedHTML }}
            />
          </div>
        </div>
      </Card>

      <style>{`
        .markdown-preview h1 { font-size: 2em; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; margin-bottom: 0.5em; }
        .markdown-preview h2 { font-size: 1.5em; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; margin-bottom: 0.5em; }
        .markdown-preview h3 { font-size: 1.25em; margin-bottom: 0.5em; }
        .markdown-preview p { margin: 1em 0; line-height: 1.6; }
        .markdown-preview ul, .markdown-preview ol { padding-left: 2em; margin: 1em 0; }
        .markdown-preview li { margin: 0.5em 0; }
        .markdown-preview code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
        .markdown-preview pre { background: var(--bg-secondary); padding: 16px; border-radius: var(--border-radius); overflow-x: auto; margin: 1em 0; }
        .markdown-preview pre code { background: none; padding: 0; }
        .markdown-preview blockquote { border-left: 4px solid var(--accent-primary); padding-left: 16px; margin: 1em 0; color: var(--text-secondary); }
        .markdown-preview a { color: var(--accent-primary); text-decoration: none; }
        .markdown-preview a:hover { text-decoration: underline; }
        .markdown-preview hr { border: none; border-top: 1px solid var(--border-color); margin: 2em 0; }
        .markdown-preview table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        .markdown-preview th, .markdown-preview td { border: 1px solid var(--border-color); padding: 8px 12px; text-align: left; }
        .markdown-preview th { background: var(--bg-secondary); }
        .markdown-preview img { max-width: 100%; border-radius: var(--border-radius); }
      `}</style>

      <Card title="Markdown 语法参考">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', fontSize: '13px' }}>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ fontWeight: 500, marginBottom: '8px' }}>标题</div>
            <code style={{ fontFamily: 'monospace' }}># H1 / ## H2 / ### H3</code>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ fontWeight: 500, marginBottom: '8px' }}>粗体/斜体</div>
            <code style={{ fontFamily: 'monospace' }}>**粗体** / *斜体*</code>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ fontWeight: 500, marginBottom: '8px' }}>链接</div>
            <code style={{ fontFamily: 'monospace' }}>[文字](URL)</code>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ fontWeight: 500, marginBottom: '8px' }}>代码块</div>
            <code style={{ fontFamily: 'monospace' }}>```语言 代码 ```</code>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ fontWeight: 500, marginBottom: '8px' }}>引用</div>
            <code style={{ fontFamily: 'monospace' }}>&gt; 引用文字</code>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ fontWeight: 500, marginBottom: '8px' }}>列表</div>
            <code style={{ fontFamily: 'monospace' }}>- 无序 / 1. 有序</code>
          </div>
        </div>
      </Card>
    </div>
  );
}