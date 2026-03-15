import { useState } from 'react';
import { Card, Button } from '../components/common';

type EditorTab = 'html' | 'css' | 'js';

export default function Playground() {
  const [html, setHtml] = useState('<div class="container">\n  <h1>Hello World</h1>\n  <p>这是一个 HTML/CSS/JS 演示环境</p>\n  <button id="btn">点击我</button>\n</div>');
  const [css, setCss] = useState(`.container {
  font-family: system-ui, sans-serif;
  padding: 20px;
  text-align: center;
}

h1 {
  color: #3b82f6;
  margin-bottom: 16px;
}

p {
  color: #666;
  margin-bottom: 20px;
}

button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #2563eb;
}

button:active {
  transform: scale(0.98);
}`);
  const [js, setJs] = useState(`document.getElementById('btn').addEventListener('click', () => {
  alert('Hello from JavaScript!');
});`);
  const [activeTab, setActiveTab] = useState<EditorTab>('html');
  const [autoRun, setAutoRun] = useState(true);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  const runCode = () => {
    const iframe = document.getElementById('preview-frame') as HTMLIFrameElement;
    if (!iframe) return;

    // Clear console
    setConsoleOutput([]);

    const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    // Console capture
    const originalConsole = { ...console };
    ['log', 'warn', 'error', 'info'].forEach(method => {
      console[method] = (...args) => {
        window.parent.postMessage({
          type: 'console',
          method,
          args: args.map(a => {
            try {
              return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a);
            } catch {
              return String(a);
            }
          })
        }, '*');
        originalConsole[method](...args);
      };
    });

    // Error capture
    window.onerror = (msg, url, line) => {
      window.parent.postMessage({
        type: 'console',
        method: 'error',
        args: ['Error: ' + msg + ' (line ' + line + ')']
      }, '*');
    };

    try {
      ${js}
    } catch (e) {
      console.error(e.message);
    }
  </script>
</body>
</html>`;

    iframe.srcdoc = content;
  };

  // Listen for console messages
  useState(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        setConsoleOutput(prev => [...prev, `[${event.data.method}] ${event.data.args.join(' ')}`]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  });

  const copyCode = () => {
    const fullCode = `<!-- HTML -->\n${html}\n\n/* CSS */\n${css}\n\n// JavaScript\n${js}`;
    navigator.clipboard.writeText(fullCode);
  };

  const clearConsole = () => {
    setConsoleOutput([]);
  };

  const resetCode = () => {
    setHtml('<div class="container">\n  <h1>Hello World</h1>\n  <p>开始编写您的代码</p>\n</div>');
    setCss('.container {\n  padding: 20px;\n}');
    setJs('');
    setConsoleOutput([]);
  };

  // Auto-run on change
  useState(() => {
    if (autoRun) {
      const timer = setTimeout(runCode, 500);
      return () => clearTimeout(timer);
    }
  });

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="HTML/CSS/JS Playground">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={runCode}>运行</Button>
            <Button variant="secondary" onClick={copyCode}>复制代码</Button>
            <Button variant="secondary" onClick={resetCode}>重置</Button>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginLeft: 'auto' }}>
              <input
                type="checkbox"
                checked={autoRun}
                onChange={e => setAutoRun(e.target.checked)}
              />
              <span style={{ fontSize: '13px' }}>自动运行</span>
            </label>
          </div>

          {/* Main Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', minHeight: '400px' }}>
            {/* Editor */}
            <div style={{ display: 'grid', gap: '8px' }}>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                {(['html', 'css', 'js'] as EditorTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      background: activeTab === tab ? 'var(--accent-primary)' : 'transparent',
                      color: activeTab === tab ? 'white' : 'var(--text-primary)',
                      borderRadius: 'var(--border-radius)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Editor Content */}
              <textarea
                value={activeTab === 'html' ? html : activeTab === 'css' ? css : js}
                onChange={e => {
                  const value = e.target.value;
                  if (activeTab === 'html') setHtml(value);
                  else if (activeTab === 'css') setCss(value);
                  else setJs(value);
                }}
                className="input"
                style={{
                  width: '100%',
                  height: '300px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  resize: 'vertical',
                }}
                spellCheck={false}
              />
            </div>

            {/* Preview */}
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ fontWeight: 500, fontSize: '13px' }}>预览</span>
              </div>
              <iframe
                id="preview-frame"
                title="Preview"
                style={{
                  width: '100%',
                  height: '300px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  background: 'white',
                }}
                sandbox="allow-scripts allow-modals"
              />
            </div>
          </div>

          {/* Console */}
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 500, fontSize: '13px' }}>控制台</span>
              <Button variant="secondary" size="sm" onClick={clearConsole}>清空</Button>
            </div>
            <div
              style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '12px',
                borderRadius: 'var(--border-radius)',
                fontFamily: 'monospace',
                fontSize: '12px',
                minHeight: '80px',
                maxHeight: '150px',
                overflow: 'auto',
              }}
            >
              {consoleOutput.length === 0 ? (
                <div style={{ color: '#666' }}>// 控制台输出将显示在这里</div>
              ) : (
                consoleOutput.map((line, i) => (
                  <div key={i} style={{ color: line.includes('[error]') ? '#ef4444' : line.includes('[warn]') ? '#f59e0b' : '#d4d4d4' }}>
                    {line}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 在编辑器中编写 HTML、CSS 和 JavaScript 代码</div>
          <div>• 点击"运行"或启用自动运行查看效果</div>
          <div>• 控制台会捕获 console.log、console.warn 和 console.error 输出</div>
          <div>• 代码在沙箱环境中运行，安全隔离</div>
        </div>
      </Card>
    </div>
  );
}