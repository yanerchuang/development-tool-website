import { useState, useRef } from 'react';
import { Card, Button, TextArea } from '../components/common';
import { base64Encode, base64Decode } from '../utils/crypto';

export default function Base64() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [imageBase64, setImageBase64] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 文本 Base64 编码
  const handleEncode = () => {
    setOutput(base64Encode(input));
  };

  // 文本 Base64 解码
  const handleDecode = () => {
    setOutput(base64Decode(input));
  };

  // 交换输入输出
  const handleSwap = () => {
    const temp = input;
    setInput(output);
    setOutput(temp);
  };

  // 清空
  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  // 图片转 Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImageBase64(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 复制 Base64
  const handleCopy = () => {
    navigator.clipboard.writeText(imageBase64);
  };

  // 下载 Base64 为文件
  const handleDownload = () => {
    const blob = new Blob([imageBase64], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'base64.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* 模式切换 */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          variant={mode === 'text' ? 'primary' : 'secondary'}
          onClick={() => setMode('text')}
        >
          文本转换
        </Button>
        <Button
          variant={mode === 'image' ? 'primary' : 'secondary'}
          onClick={() => setMode('image')}
        >
          图片转换
        </Button>
      </div>

      {mode === 'text' ? (
        /* 文本 Base64 */
        <div className="tool-container">
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
              placeholder="输入要编码或解码的文本..."
              style={{ flex: 1, minHeight: '200px' }}
            />
          </Card>

          <Card style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px' }}>
            <Button variant="primary" onClick={handleEncode}>
              编码 →
            </Button>
            <Button variant="secondary" onClick={handleDecode}>
              ← 解码
            </Button>
          </div>
        </div>
      ) : (
        /* 图片 Base64 */
        <Card title="图片转 Base64">
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <Button variant="primary" onClick={() => fileInputRef.current?.click()}>
                选择图片
              </Button>
              {imageBase64 && (
                <>
                  <Button variant="secondary" onClick={handleCopy}>
                    复制 Base64
                  </Button>
                  <Button variant="secondary" onClick={handleDownload}>
                    下载
                  </Button>
                </>
              )}
            </div>

            {imageBase64 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '16px', alignItems: 'start' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>预览</div>
                  <img
                    src={imageBase64}
                    alt="预览"
                    style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>Base64 ({imageBase64.length} 字符)</div>
                  <div style={{
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius)',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    maxHeight: '200px',
                    overflow: 'auto',
                    wordBreak: 'break-all',
                  }}>
                    {imageBase64.substring(0, 500)}...
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}