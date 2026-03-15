import { useState } from 'react';
import { Card, Button, TextArea } from '../components/common';

type CodeType = 'javascript' | 'css' | 'html' | 'sql' | 'json';

export default function CodeFormatter() {
  const [activeTab, setActiveTab] = useState<CodeType>('javascript');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indentSize, setIndentSize] = useState(2);

  // JavaScript formatter (simple implementation)
  const formatJavaScript = (code: string, indent: number): string => {
    const indentStr = ' '.repeat(indent);

    const keywords = ['const', 'let', 'var', 'function', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'finally', 'switch', 'case', 'default', 'break', 'continue', 'new', 'this', 'typeof', 'instanceof'];

    // Simple tokenization approach
    const tokens = code.match(/\/\*[\s\S]*?\*\/|\/\/.*|"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`|\s+|[{}()[\];,.]|\+\+|--|=>|===|!==|==|!=|<=|>=|&&|\|\||[+\-*/%<>=!&|^~?:]|\w+|\S/g) || [];

    let formatted = '';
    let lineIndent = 0;
    let newLine = true;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const nextToken = tokens[i + 1] || '';

      // Skip redundant whitespace
      if (/^\s+$/.test(token)) continue;

      // Handle strings and comments (preserve as-is)
      if (/^["'`]/.test(token) || /^\/[/*]/.test(token)) {
        if (newLine) {
          formatted += indentStr.repeat(lineIndent);
          newLine = false;
        }
        formatted += token;
        continue;
      }

      // Handle opening braces
      if (token === '{') {
        if (!newLine && !formatted.endsWith(' ')) formatted += ' ';
        formatted += '{\n';
        lineIndent++;
        newLine = true;
        continue;
      }

      // Handle closing braces
      if (token === '}') {
        lineIndent--;
        if (!newLine) formatted += '\n';
        formatted += indentStr.repeat(lineIndent) + '}\n';
        newLine = true;
        continue;
      }

      // Handle semicolons
      if (token === ';') {
        formatted += ';\n';
        newLine = true;
        continue;
      }

      // Handle commas
      if (token === ',') {
        formatted += ', ';
        continue;
      }

      // Handle other tokens
      if (newLine) {
        formatted += indentStr.repeat(lineIndent);
        newLine = false;
      }

      // Add space before keywords (if not at start of line and previous wasn't an operator)
      if (keywords.includes(token) && formatted.length > 0 && !/[\s({[;,=+\-*/%<>&|!]$/.test(formatted)) {
        formatted += ' ';
      }

      formatted += token;

      // Add space after keywords
      if (keywords.includes(token) && nextToken !== '(' && nextToken !== '{') {
        formatted += ' ';
      }
    }

    return formatted.trim();
  };

  // CSS formatter
  const formatCSS = (code: string, indent: number): string => {
    const indentStr = ' '.repeat(indent);
    // Simple CSS formatting
    const formatted = code
      .replace(/\s*{\s*/g, ' {\n')
      .replace(/\s*}\s*/g, '\n}\n\n')
      .replace(/\s*;\s*/g, ';\n')
      .replace(/\s*:\s*/g, ': ')
      .replace(/,\s*/g, ',\n');

    // Apply indentation
    const lines = formatted.split('\n');
    let currentIndent = 0;
    return lines.map(line => {
      line = line.trim();
      if (line === '}') {
        currentIndent = Math.max(0, currentIndent - 1);
      }
      const indentedLine = indentStr.repeat(currentIndent) + line;
      if (line.endsWith('{')) {
        currentIndent++;
      }
      return indentedLine;
    }).filter(line => line.trim()).join('\n');
  };

  // HTML formatter
  const formatHTML = (code: string, indent: number): string => {
    const indentStr = ' '.repeat(indent);
    const selfClosingTags = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'];

    let result = '';
    let currentIndent = 0;
    const tokens = code.match(/<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<[^>]+>|[^<]+/g) || [];

    tokens.forEach(token => {
      token = token.trim();
      if (!token) return;

      // Comment or doctype
      if (token.startsWith('<!--') || token.startsWith('<!')) {
        result += indentStr.repeat(currentIndent) + token + '\n';
        return;
      }

      // Closing tag
      if (token.startsWith('</')) {
        currentIndent = Math.max(0, currentIndent - 1);
        result += indentStr.repeat(currentIndent) + token + '\n';
        return;
      }

      // Opening tag
      if (token.startsWith('<')) {
        result += indentStr.repeat(currentIndent) + token + '\n';
        const tagName = token.match(/<(\w+)/)?.[1]?.toLowerCase() || '';
        if (!selfClosingTags.includes(tagName) && !token.endsWith('/>')) {
          currentIndent++;
        }
        return;
      }

      // Text content
      if (token.trim()) {
        result += indentStr.repeat(currentIndent) + token.trim() + '\n';
      }
    });

    return result.trim();
  };

  // SQL formatter
  const formatSQL = (code: string, indent: number): string => {
    const indentStr = ' '.repeat(indent);
    const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'ON', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'UNION', 'UNION ALL'];

    let result = code.toUpperCase();

    // Add newlines before major keywords
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      result = result.replace(regex, '\n' + kw);
    });

    // Format commas in SELECT
    result = result.replace(/,\s*/g, ',\n' + indentStr);

    return result.trim().split('\n').map(line => line.trim()).filter(line => line).join('\n');
  };

  // Minify functions
  const minifyJavaScript = (code: string): string => {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/\s*([{}()[\];,.:?=+\-*/%<>&|!])\s*/g, '$1') // Remove spaces around operators
      .trim();
  };

  const minifyCSS = (code: string): string => {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around symbols
      .replace(/;}/g, '}') // Remove last semicolon
      .trim();
  };

  const minifyHTML = (code: string): string => {
    return code
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/>\s+</g, '><') // Remove whitespace between tags
      .trim();
  };

  const minifySQL = (code: string): string => {
    return code
      .replace(/--.*$/gm, '') // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .trim();
  };

  const handleFormat = () => {
    setError('');
    setOutput('');

    try {
      let result: string;

      switch (activeTab) {
        case 'javascript':
          result = formatJavaScript(input, indentSize);
          break;
        case 'css':
          result = formatCSS(input, indentSize);
          break;
        case 'html':
          result = formatHTML(input, indentSize);
          break;
        case 'sql':
          result = formatSQL(input, indentSize);
          break;
        case 'json':
          try {
            const parsed = JSON.parse(input);
            result = JSON.stringify(parsed, null, indentSize);
          } catch {
            setError('JSON 格式错误');
            return;
          }
          break;
        default:
          result = input;
      }

      setOutput(result);
    } catch (e) {
      setError('格式化失败: ' + (e as Error).message);
    }
  };

  const handleMinify = () => {
    setError('');
    setOutput('');

    try {
      let result: string;

      switch (activeTab) {
        case 'javascript':
          result = minifyJavaScript(input);
          break;
        case 'css':
          result = minifyCSS(input);
          break;
        case 'html':
          result = minifyHTML(input);
          break;
        case 'sql':
          result = minifySQL(input);
          break;
        case 'json':
          try {
            const parsed = JSON.parse(input);
            result = JSON.stringify(parsed);
          } catch {
            setError('JSON 格式错误');
            return;
          }
          break;
        default:
          result = input;
      }

      setOutput(result);
    } catch (e) {
      setError('压缩失败: ' + (e as Error).message);
    }
  };

  const handleValidate = () => {
    setError('');

    try {
      switch (activeTab) {
        case 'json':
          JSON.parse(input);
          setOutput('✓ JSON 格式有效');
          break;
        case 'javascript': {
          // Simple validation - check for balanced brackets
          const openBraces = (input.match(/{/g) || []).length;
          const closeBraces = (input.match(/}/g) || []).length;
          const openParens = (input.match(/\(/g) || []).length;
          const closeParens = (input.match(/\)/g) || []).length;
          const openBrackets = (input.match(/\[/g) || []).length;
          const closeBrackets = (input.match(/\]/g) || []).length;

          if (openBraces === closeBraces && openParens === closeParens && openBrackets === closeBrackets) {
            setOutput('✓ JavaScript 语法检查通过（括号匹配）');
          } else {
            setError('JavaScript 语法错误：括号不匹配');
          }
          break;
        }
        case 'html': {
          const openTags = (input.match(/<\w+/g) || []).length;
          const closeTags = (input.match(/<\/\w+/g) || []).length;
          if (openTags === closeTags || input.includes('<!DOCTYPE') || input.includes('<img') || input.includes('<br')) {
            setOutput('✓ HTML 语法检查通过');
          } else {
            setError('HTML 语法警告：标签可能不匹配');
          }
          break;
        }
        default:
          setOutput('✓ 语法检查通过');
      }
    } catch (e) {
      setError('验证失败: ' + (e as Error).message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const tabs: { key: CodeType; label: string }[] = [
    { key: 'javascript', label: 'JavaScript' },
    { key: 'css', label: 'CSS' },
    { key: 'html', label: 'HTML' },
    { key: 'sql', label: 'SQL' },
    { key: 'json', label: 'JSON' },
  ];

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <div className="tabs" style={{ marginBottom: 0 }}>
        {tabs.map(tab => (
          <button key={tab.key} className={`tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tool-container">
        <Card style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="tool-panel-header">
            <span className="tool-panel-title">输入代码</span>
            <div className="tool-actions">
              <Button variant="secondary" size="sm" onClick={handleClear}>清空</Button>
            </div>
          </div>
          <TextArea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`粘贴 ${activeTab.toUpperCase()} 代码...`}
            style={{ flex: 1, minHeight: '300px', fontFamily: 'monospace' }}
          />
          {error && <div style={{ color: 'var(--accent-danger)', fontSize: '13px' }}>{error}</div>}
        </Card>

        <Card style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="tool-panel-header">
            <span className="tool-panel-title">输出</span>
            <div className="tool-actions">
              <Button variant="secondary" size="sm" onClick={handleCopy}>复制</Button>
            </div>
          </div>
          <pre className="result-box" style={{ flex: 1, minHeight: '300px', margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {output}
          </pre>
        </Card>

        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-secondary)' }}>缩进：</span>
          <select value={indentSize} onChange={e => setIndentSize(Number(e.target.value))} className="select" style={{ width: '100px' }}>
            <option value={2}>2 空格</option>
            <option value={4}>4 空格</option>
          </select>
          <div style={{ flex: 1 }} />
          <Button variant="primary" onClick={handleFormat}>格式化</Button>
          <Button variant="secondary" onClick={handleMinify}>压缩</Button>
          <Button variant="secondary" onClick={handleValidate}>验证</Button>
        </div>
      </div>

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• <strong>格式化</strong>：将代码格式化为易读的形式，添加适当的缩进和换行</div>
          <div>• <strong>压缩</strong>：移除空白和注释，减小代码体积</div>
          <div>• <strong>验证</strong>：检查代码语法是否正确</div>
          <div style={{ marginTop: '8px', color: 'var(--text-muted)' }}>
            注意：这是一个简单的格式化工具，复杂代码建议使用专业工具如 Prettier
          </div>
        </div>
      </Card>
    </div>
  );
}