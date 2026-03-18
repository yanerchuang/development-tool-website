import { useState } from 'react';
import { Card, Button, TextArea } from '../components/common';

type Language = 'javascript' | 'css' | 'html' | 'json';

interface Stats {
  originalSize: number;
  minifiedSize: number;
  savedPercent: number;
}

export default function CodeMinifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState<Language>('javascript');
  const [stats, setStats] = useState<Stats | null>(null);
  const [options, setOptions] = useState({
    removeComments: true,
    removeWhitespace: true,
    mangleVariables: false,
    preserveLineBreaks: false,
  });

  const minifyJavaScript = (code: string): string => {
    let result = code;

    // Remove single-line comments (but not URLs)
    if (options.removeComments) {
      result = result.replace(/(?<!:)\/\/.*$/gm, '');
      // Remove multi-line comments
      result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    // Remove whitespace
    if (options.removeWhitespace) {
      // Remove leading/trailing whitespace from lines
      result = result.replace(/^\s+|\s+$/gm, '');
      // Remove newlines
      if (!options.preserveLineBreaks) {
        result = result.replace(/\n+/g, '');
      }
      // Collapse multiple spaces to single space
      result = result.replace(/[ \t]+/g, ' ');
      // Remove spaces around operators
      result = result.replace(/\s*([{};,:=+\-*/<>!&|()])\s*/g, '$1');
      // Restore necessary spaces
      result = result.replace(/\b(return|var|let|const|if|else|for|while|function|class|extends|new|typeof|instanceof|in|of)\b/g, ' $1 ');
      result = result.replace(/\b(return|var|let|const|if|else|for|while|function|class|extends|new|typeof|instanceof|in|of)\b\s+/g, '$1 ');
      result = result.trim();
    }

    // Simple variable mangling (demo)
    if (options.mangleVariables) {
      const varMap = new Map<string, string>();
      let counter = 0;
      result = result.replace(/\b(var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, (_, keyword, varName) => {
        if (!varMap.has(varName) && varName.length > 2) {
          varMap.set(varName, `_${(counter++).toString(36)}`);
        }
        const newName = varMap.get(varName) || varName;
        return `${keyword} ${newName}`;
      });
      // Replace variable usages
      varMap.forEach((newName, oldName) => {
        const regex = new RegExp(`\\b${oldName}\\b`, 'g');
        result = result.replace(regex, newName);
      });
    }

    return result;
  };

  const minifyCSS = (code: string): string => {
    let result = code;

    // Remove comments
    if (options.removeComments) {
      result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    // Remove whitespace
    if (options.removeWhitespace) {
      result = result.replace(/\s+/g, ' ');
      result = result.replace(/\s*([{};:,>~+])\s*/g, '$1');
      result = result.replace(/;}/g, '}');
      result = result.trim();
    }

    return result;
  };

  const minifyHTML = (code: string): string => {
    let result = code;

    // Remove comments
    if (options.removeComments) {
      result = result.replace(/<!--[\s\S]*?-->/g, '');
    }

    // Remove whitespace
    if (options.removeWhitespace) {
      result = result.replace(/\s+/g, ' ');
      result = result.replace(/>\s+</g, '><');
      result = result.trim();
    }

    return result;
  };

  const minifyJSON = (code: string): string => {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed);
    } catch (e) {
      throw new Error('JSON 格式无效');
    }
  };

  const beautifyCode = () => {
    let result = output || input;

    switch (language) {
      case 'javascript':
        result = beautifyJavaScript(result);
        break;
      case 'css':
        result = beautifyCSS(result);
        break;
      case 'html':
        result = beautifyHTML(result);
        break;
      case 'json':
        result = beautifyJSON(result);
        break;
    }

    setOutput(result);
  };

  const beautifyJavaScript = (code: string): string => {
    let result = code;
    const indent = '  ';
    let level = 0;

    // Add newlines after semicolons and braces
    result = result.replace(/;/g, ';\n');
    result = result.replace(/\{/g, '{\n');
    result = result.replace(/\}/g, '\n}\n');

    // Split into lines and indent
    const lines = result.split('\n').map(line => {
      line = line.trim();
      if (line.endsWith('}')) {
        level = Math.max(0, level - 1);
      }
      const indented = indent.repeat(level) + line;
      if (line.endsWith('{')) {
        level++;
      }
      return indented;
    });

    return lines.filter(l => l.trim()).join('\n');
  };

  const beautifyCSS = (code: string): string => {
    let result = code;
    result = result.replace(/\{/g, ' {\n  ');
    result = result.replace(/;/g, ';\n  ');
    result = result.replace(/\}/g, '\n}\n');
    result = result.replace(/  \n\}/g, '}');
    return result.trim();
  };

  const beautifyHTML = (code: string): string => {
    let result = code;
    const indent = '  ';
    let level = 0;

    result = result.replace(/></g, '>\n<');
    const lines = result.split('\n').map(line => {
      line = line.trim();
      if (line.match(/^<\//)) {
        level = Math.max(0, level - 1);
      }
      const indented = indent.repeat(level) + line;
      if (line.match(/^<[^/][^>]*[^\/]>$/) && !line.match(/<(br|hr|img|input|meta|link)/i)) {
        level++;
      }
      return indented;
    });

    return lines.join('\n');
  };

  const beautifyJSON = (code: string): string => {
    const parsed = JSON.parse(code);
    return JSON.stringify(parsed, null, 2);
  };

  const minify = () => {
    try {
      let result = '';

      switch (language) {
        case 'javascript':
          result = minifyJavaScript(input);
          break;
        case 'css':
          result = minifyCSS(input);
          break;
        case 'html':
          result = minifyHTML(input);
          break;
        case 'json':
          result = minifyJSON(input);
          break;
      }

      const originalSize = new Blob([input]).size;
      const minifiedSize = new Blob([result]).size;
      const savedPercent = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize) * 100 : 0;

      setStats({ originalSize, minifiedSize, savedPercent });
      setOutput(result);
    } catch (e) {
      setOutput('错误: ' + (e as Error).message);
      setStats(null);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setStats(null);
  };

  const loadSample = () => {
    const samples: Record<Language, string> = {
      javascript: `// This is a sample JavaScript code
function calculateSum(numbers) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }
  return sum;
}

const result = calculateSum([1, 2, 3, 4, 5]);
console.log("The sum is: " + result);`,
      css: `/* Main container styles */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  margin: 0 auto;
}

.button {
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
}`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sample Page</title>
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
    <p>This is a sample HTML document.</p>
  </div>
</body>
</html>`,
      json: `{
  "name": "DevTools",
  "version": "1.0.0",
  "description": "Developer toolbox with 70+ online tools",
  "features": [
    "JSON formatting",
    "Code minification",
    "Hash calculation"
  ],
  "author": {
    "name": "Developer",
    "email": "dev@example.com"
  }
}`,
    };

    setInput(samples[language]);
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="代码压缩/混淆器">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>语言：</span>
          <div className="tabs" style={{ marginBottom: 0 }}>
            {(['javascript', 'css', 'html', 'json'] as Language[]).map(lang => (
              <button
                key={lang}
                className={`tab ${language === lang ? 'active' : ''}`}
                onClick={() => setLanguage(lang)}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Button variant="secondary" size="sm" onClick={loadSample}>加载示例</Button>
          <Button variant="secondary" size="sm" onClick={clearAll}>清空</Button>
        </div>

        <TextArea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入代码..."
          style={{ minHeight: '200px', fontFamily: 'monospace' }}
        />
      </Card>

      <Card title="选项">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={options.removeComments}
              onChange={() => toggleOption('removeComments')}
            />
            <span>移除注释</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={options.removeWhitespace}
              onChange={() => toggleOption('removeWhitespace')}
            />
            <span>移除空白</span>
          </label>
          {language === 'javascript' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={options.mangleVariables}
                onChange={() => toggleOption('mangleVariables')}
              />
              <span>混淆变量名</span>
            </label>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={options.preserveLineBreaks}
              onChange={() => toggleOption('preserveLineBreaks')}
            />
            <span>保留换行</span>
          </label>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Button variant="primary" onClick={minify}>压缩</Button>
        <Button variant="secondary" onClick={beautifyCode}>格式化</Button>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>原始大小</div>
              <div style={{ fontSize: '20px', fontWeight: 600 }}>{formatBytes(stats.originalSize)}</div>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>压缩后</div>
              <div style={{ fontSize: '20px', fontWeight: 600 }}>{formatBytes(stats.minifiedSize)}</div>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>压缩率</div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent-success)' }}>
                {stats.savedPercent.toFixed(1)}%
              </div>
            </div>
          </Card>
        </div>
      )}

      {output && (
        <Card title="输出结果">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <Button variant="secondary" size="sm" onClick={copyOutput}>复制</Button>
          </div>
          <pre className="result-box" style={{ margin: 0, maxHeight: '300px', overflow: 'auto' }}>
            {output}
          </pre>
        </Card>
      )}
    </div>
  );
}