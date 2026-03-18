import { useState } from 'react';
import { Card, Button, TextArea } from '../components/common';

export default function XmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);

  const formatXml = () => {
    setError('');
    try {
      const formatted = formatXmlString(input, indent);
      setOutput(formatted);
    } catch (e) {
      setError('XML 格式错误：' + (e as Error).message);
      setOutput('');
    }
  };

  const minifyXml = () => {
    setError('');
    try {
      const minified = input
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .trim();
      setOutput(minified);
    } catch (e) {
      setError('压缩失败：' + (e as Error).message);
      setOutput('');
    }
  };

  const validateXml = () => {
    setError('');
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'text/xml');
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        setError('XML 格式无效：' + parseError.textContent);
        setOutput('');
      } else {
        setOutput('✓ XML 格式有效');
      }
    } catch (e) {
      setError('验证失败：' + (e as Error).message);
      setOutput('');
    }
  };

  const xmlToJson = () => {
    setError('');
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'text/xml');
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        setError('XML 格式无效');
        setOutput('');
        return;
      }
      const json = xmlNodeToJson(doc.documentElement);
      setOutput(JSON.stringify(json, null, indent));
    } catch (e) {
      setError('转换失败：' + (e as Error).message);
      setOutput('');
    }
  };

  const xmlNodeToJson = (node: Element): unknown => {
    const obj: Record<string, unknown> = {};

    if (node.attributes.length > 0) {
      const attrs: Record<string, string> = {};
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        attrs[attr.name] = attr.value;
      }
      obj['@attributes'] = attrs;
    }

    if (node.childNodes.length === 0) {
      return obj;
    }

    if (node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text && Object.keys(obj).length === 0) {
        return text;
      }
      if (text) {
        obj['#text'] = text;
      }
      return obj;
    }

    const children: Record<string, unknown[]> = {};
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (child.nodeType === Node.ELEMENT_NODE) {
        const childElement = child as Element;
        const childName = childElement.nodeName;
        if (!children[childName]) {
          children[childName] = [];
        }
        const arr = children[childName];
        if (arr) {
          arr.push(xmlNodeToJson(childElement));
        }
      }
    }

    for (const [name, values] of Object.entries(children)) {
      if (values.length === 1) {
        obj[name] = values[0];
      } else {
        obj[name] = values;
      }
    }

    return obj;
  };

  const formatXmlString = (xml: string, indentSize: number): string => {
    const PADDING = ' '.repeat(indentSize);
    let formatted = '';
    let pad = 0;

    xml = xml.replace(/(>)(<)(\/*)/g, '$1\n$2$3');
    xml.split('\n').forEach(line => {
      line = line.trim();
      if (!line) return;

      if (line.match(/<\/\w/)) {
        if (pad > 0) pad -= 1;
      }

      const indent = PADDING.repeat(pad);
      formatted += indent + line + '\n';

      if (line.match(/<\w([^>]*[^\/])?>.*$/)) {
        pad += 1;
      }
    });

    return formatted.trim();
  };

  const escapeXml = () => {
    setError('');
    try {
      const escaped = input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
      setOutput(escaped);
    } catch (e) {
      setError('转义失败：' + (e as Error).message);
    }
  };

  const unescapeXml = () => {
    setError('');
    try {
      const unescaped = input
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&');
      setOutput(unescaped);
    } catch (e) {
      setError('反转义失败：' + (e as Error).message);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const loadSample = () => {
    setInput(`<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="编程">
    <title>JavaScript高级程序设计</title>
    <author>Nicholas C. Zakas</author>
    <year>2020</year>
    <price>99.00</price>
  </book>
  <book category="数据库">
    <title>SQL必知必会</title>
    <author>Ben Forta</author>
    <year>2020</year>
    <price>59.00</price>
  </book>
</bookstore>`);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="XML 格式化工具">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
            <Button variant="secondary" size="sm" onClick={loadSample}>加载示例</Button>
            <Button variant="secondary" size="sm" onClick={clearAll}>清空</Button>
          </div>
          <TextArea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="输入 XML 代码..."
            style={{ minHeight: '200px' }}
          />
        </div>
      </Card>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text-secondary)' }}>缩进：</span>
        <select value={indent} onChange={e => setIndent(Number(e.target.value))} className="select" style={{ width: '100px' }}>
          <option value={2}>2 空格</option>
          <option value={4}>4 空格</option>
        </select>
        <div style={{ flex: 1 }} />
        <Button variant="primary" onClick={formatXml}>格式化</Button>
        <Button variant="secondary" onClick={minifyXml}>压缩</Button>
        <Button variant="secondary" onClick={validateXml}>校验</Button>
        <Button variant="secondary" onClick={xmlToJson}>转 JSON</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Button variant="secondary" onClick={escapeXml}>XML 转义</Button>
        <Button variant="secondary" onClick={unescapeXml}>XML 反转义</Button>
      </div>

      {error && <div style={{ color: 'var(--accent-danger)', fontSize: '13px' }}>{error}</div>}

      {output && (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="tool-panel-header">
            <span className="tool-panel-title">输出结果</span>
            <Button variant="secondary" size="sm" onClick={copyOutput}>复制</Button>
          </div>
          <pre className="result-box" style={{ margin: 0, minHeight: '200px', overflow: 'auto' }}>{output}</pre>
        </Card>
      )}
    </div>
  );
}