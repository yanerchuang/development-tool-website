import { useState, useRef } from 'react';
import { Card, Button } from '../components/common';

type ExportFormat = 'png' | 'jpeg' | 'webp';

interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  backgroundColor: string;
  padding: number;
  borderRadius: number;
  lineHeight: number;
}

export default function CodeImage() {
  const [code, setCode] = useState('function hello() {\n  console.log("Hello, World!");\n  return 42;\n}');
  const [language, setLanguage] = useState('javascript');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [style, setStyle] = useState<TextStyle>({
    fontFamily: 'Monaco, Menlo, "Courier New", monospace',
    fontSize: 16,
    fontWeight: 'normal',
    color: '#f8f8f2',
    backgroundColor: '#282a36',
    padding: 24,
    borderRadius: 12,
    lineHeight: 1.6,
  });

  const themes = [
    { name: 'Dracula', background: '#282a36', color: '#f8f8f2' },
    { name: 'Monokai', background: '#272822', color: '#f8f8f2' },
    { name: 'GitHub Dark', background: '#0d1117', color: '#c9d1d9' },
    { name: 'One Dark', background: '#282c34', color: '#abb2bf' },
    { name: 'Nord', background: '#2e3440', color: '#d8dee9' },
    { name: 'Light', background: '#ffffff', color: '#24292e' },
    { name: 'Solarized Light', background: '#fdf6e3', color: '#657b83' },
  ];

  const syntaxHighlight = (code: string, lang: string): Array<{ text: string; color: string }> => {
    const keywords: Record<string, string[]> = {
      javascript: ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this'],
      python: ['def', 'class', 'return', 'if', 'else', 'elif', 'for', 'while', 'import', 'from', 'as', 'with', 'try', 'except', 'raise', 'lambda', 'yield', 'async', 'await'],
      java: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'return', 'if', 'else', 'for', 'while', 'new', 'this', 'static', 'void', 'int', 'String'],
      typescript: ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'interface', 'type', 'import', 'export', 'from', 'async', 'await', 'enum', 'namespace'],
    };

    const langKeywords = keywords[lang] || keywords.javascript;
    const result: Array<{ text: string; color: string }> = [];
    const lines = code.split('\n');

    lines.forEach((line, lineIndex) => {
      const tokens = line.match(/\/\/.*|\/\*[\s\S]*?\*\/|"[^"]*"|'[^']*'|`[^`]*`|\b\w+\b|[^\w\s]/g) || [];

      tokens.forEach(token => {
        let color = style.color;

        if (token.startsWith('//') || token.startsWith('/*')) {
          color = '#6272a4';
        } else if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) {
          color = '#f1fa8c';
        } else if (/^\d+$/.test(token)) {
          color = '#bd93f9';
        } else if (langKeywords.includes(token)) {
          color = '#ff79c6';
        } else if (['+', '-', '*', '/', '=', '==', '===', '!=', '!==', '<', '>', '<=', '>=', '&&', '||', '!'].includes(token)) {
          color = '#ff79c6';
        }

        result.push({ text: token, color });
      });

      if (lineIndex < lines.length - 1) {
        result.push({ text: '\n', color: style.color });
      }
    });

    return result;
  };

  const renderToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lines = code.split('\n');
    const maxWidth = Math.max(...lines.map(line => line.length * style.fontSize * 0.6)) + style.padding * 2;
    const height = lines.length * style.fontSize * style.lineHeight + style.padding * 2;

    canvas.width = Math.max(400, maxWidth);
    canvas.height = Math.max(200, height);

    // Draw background with rounded corners
    ctx.fillStyle = style.backgroundColor;
    if (style.borderRadius > 0) {
      const radius = style.borderRadius;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(canvas.width - radius, 0);
      ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
      ctx.lineTo(canvas.width, canvas.height - radius);
      ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
      ctx.lineTo(radius, canvas.height);
      ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw text
    ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
    ctx.textBaseline = 'top';

    const highlighted = syntaxHighlight(code, language);
    let x = style.padding;
    let y = style.padding;

    highlighted.forEach(({ text, color }) => {
      if (text === '\n') {
        x = style.padding;
        y += style.fontSize * style.lineHeight;
      } else {
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        x += ctx.measureText(text).width;
      }
    });
  };

  const downloadImage = (format: ExportFormat) => {
    renderToCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
    const url = canvas.toDataURL(mimeType, 0.9);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${format}`;
    a.click();
  };

  const applyTheme = (theme: typeof themes[0]) => {
    setStyle(prev => ({
      ...prev,
      backgroundColor: theme.background,
      color: theme.color,
    }));
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="代码转图片">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Language Selection */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>语言</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['javascript', 'typescript', 'python', 'java'].map(lang => (
                <Button
                  key={lang}
                  variant={language === lang ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setLanguage(lang)}
                >
                  {lang}
                </Button>
              ))}
            </div>
          </div>

          {/* Code Input */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>代码</div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              className="input"
              style={{
                width: '100%',
                minHeight: '200px',
                fontFamily: 'monospace',
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
          </div>
        </div>
      </Card>

      <Card title="样式设置">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Theme Presets */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>主题</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {themes.map(theme => (
                <button
                  key={theme.name}
                  onClick={() => applyTheme(theme)}
                  style={{
                    padding: '8px 16px',
                    background: theme.background,
                    color: theme.color,
                    border: '2px solid var(--border-color)',
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          {/* Style Options */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>字号: {style.fontSize}px</div>
              <input
                type="range"
                min="12"
                max="32"
                value={style.fontSize}
                onChange={e => setStyle(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>内边距: {style.padding}px</div>
              <input
                type="range"
                min="8"
                max="48"
                value={style.padding}
                onChange={e => setStyle(prev => ({ ...prev, padding: Number(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>圆角: {style.borderRadius}px</div>
              <input
                type="range"
                min="0"
                max="24"
                value={style.borderRadius}
                onChange={e => setStyle(prev => ({ ...prev, borderRadius: Number(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Color Pickers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>背景色</div>
              <input
                type="color"
                value={style.backgroundColor}
                onChange={e => setStyle(prev => ({ ...prev, backgroundColor: e.target.value }))}
                style={{ width: '100%', height: '36px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>文字颜色</div>
              <input
                type="color"
                value={style.color}
                onChange={e => setStyle(prev => ({ ...prev, color: e.target.value }))}
                style={{ width: '100%', height: '36px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Preview */}
      <Card title="预览">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '20px',
            borderRadius: 'var(--border-radius)',
            display: 'flex',
            justifyContent: 'center',
          }}>
            <canvas
              ref={canvasRef}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => downloadImage('png')}>下载 PNG</Button>
            <Button variant="secondary" onClick={() => downloadImage('jpeg')}>下载 JPEG</Button>
            <Button variant="secondary" onClick={() => downloadImage('webp')}>下载 WebP</Button>
          </div>
        </div>
      </Card>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 粘贴代码，选择语言和主题</div>
          <div>• 调整样式参数实时预览效果</div>
          <div>• 支持 PNG、JPEG、WebP 格式导出</div>
          <div>• 适合生成代码截图分享到社交媒体</div>
        </div>
      </Card>
    </div>
  );
}