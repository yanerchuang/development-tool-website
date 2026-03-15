import { useState } from 'react';
import { Card, Button, TextArea } from '../components/common';
import {
  urlEncode,
  urlDecode,
  htmlEncode,
  htmlDecode,
  unicodeEncode,
  unicodeDecode,
  escapeString,
  unescapeString,
} from '../utils/encoding';

type EncodingType = 'url' | 'html' | 'unicode' | 'escape';

export default function Encoding() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [encodingType, setEncodingType] = useState<EncodingType>('url');

  const handleEncode = () => {
    let result = '';
    switch (encodingType) {
      case 'url':
        result = urlEncode(input);
        break;
      case 'html':
        result = htmlEncode(input);
        break;
      case 'unicode':
        result = unicodeEncode(input);
        break;
      case 'escape':
        result = escapeString(input);
        break;
    }
    setOutput(result);
  };

  const handleDecode = () => {
    let result = '';
    switch (encodingType) {
      case 'url':
        result = urlDecode(input);
        break;
      case 'html':
        result = htmlDecode(input);
        break;
      case 'unicode':
        result = unicodeDecode(input);
        break;
      case 'escape':
        result = unescapeString(input);
        break;
    }
    setOutput(result);
  };

  const handleSwap = () => {
    const temp = input;
    setInput(output);
    setOutput(temp);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="tool-container">
      <Card style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="tool-panel-header">
          <span className="tool-panel-title">输入</span>
          <div className="tool-actions">
            <Button variant="secondary" size="sm" onClick={handleClear}>
              清空
            </Button>
          </div>
        </div>
        <TextArea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="请输入要编码或解码的内容..."
          style={{ flex: 1, minHeight: '200px' }}
        />
      </Card>

      <Card style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="tool-panel-header">
          <span className="tool-panel-title">输出</span>
          <div className="tool-actions">
            <Button variant="secondary" size="sm" onClick={handleSwap}>
              交换
            </Button>
          </div>
        </div>
        <div className="result-box" style={{ flex: 1, minHeight: '200px' }}>
          {output}
        </div>
      </Card>

      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text-secondary)', marginRight: '8px' }}>编码类型：</span>
        {[
          { type: 'url', label: 'URL' },
          { type: 'html', label: 'HTML实体' },
          { type: 'unicode', label: 'Unicode' },
          { type: 'escape', label: '字符串转义' },
        ].map(item => (
          <Button
            key={item.type}
            variant={encodingType === item.type ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setEncodingType(item.type as EncodingType)}
          >
            {item.label}
          </Button>
        ))}
        <div style={{ flex: 1 }} />
        <Button variant="success" onClick={handleEncode}>
          编码 →
        </Button>
        <Button variant="primary" onClick={handleDecode}>
          ← 解码
        </Button>
      </div>
    </div>
  );
}