import { useState, useRef } from 'react';
import { Card, Button, TextArea } from '../components/common';
import { CopyButton } from '../components/common';
import { computeAllHashes, fileHash } from '../utils/crypto';

export default function Hash() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [fileHashes, setFileHashes] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCompute = () => {
    if (!input) {
      setHashes({});
      return;
    }
    setHashes(computeAllHashes(input));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFileName(file.name);

    try {
      const result = await fileHash(file);
      setFileHashes(result);
    } catch (error) {
      console.error('Failed to compute file hash:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setHashes({});
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* 文本哈希 */}
      <Card title="文本哈希计算">
        <div style={{ display: 'grid', gap: '12px' }}>
          <TextArea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="输入要计算哈希的文本..."
            style={{ minHeight: '100px' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" onClick={handleCompute}>
              计算哈希
            </Button>
            <Button variant="secondary" onClick={handleClear}>
              清空
            </Button>
          </div>

          {Object.keys(hashes).length > 0 && (
            <div style={{ display: 'grid', gap: '8px', marginTop: '8px' }}>
              {Object.entries(hashes).map(([algorithm, hash]) => (
                <div
                  key={algorithm}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr auto',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius)',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{algorithm}</span>
                  <code
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {hash}
                  </code>
                  <CopyButton text={hash} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 文件哈希 */}
      <Card title="文件哈希计算">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--border-radius)',
              padding: '40px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color var(--transition-speed)',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {isProcessing ? (
              <div style={{ color: 'var(--text-secondary)' }}>正在计算...</div>
            ) : fileName ? (
              <div>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>📄 {fileName}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>点击选择其他文件</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
                <div style={{ color: 'var(--text-secondary)' }}>点击选择文件或拖放到此处</div>
              </div>
            )}
          </div>

          {Object.keys(fileHashes).length > 0 && (
            <div style={{ display: 'grid', gap: '8px' }}>
              {Object.entries(fileHashes).map(([algorithm, hash]) => (
                <div
                  key={algorithm}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr auto',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius)',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{algorithm}</span>
                  <code
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {hash}
                  </code>
                  <CopyButton text={hash} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 哈希对比 */}
      <Card title="哈希对比">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                哈希值 1
              </label>
              <input
                type="text"
                className="input"
                placeholder="粘贴哈希值..."
                style={{ fontFamily: 'monospace', fontSize: '13px' }}
                id="hash-compare-1"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                哈希值 2
              </label>
              <input
                type="text"
                className="input"
                placeholder="粘贴哈希值..."
                style={{ fontFamily: 'monospace', fontSize: '13px' }}
                id="hash-compare-2"
              />
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              const hash1 = (document.getElementById('hash-compare-1') as HTMLInputElement)?.value;
              const hash2 = (document.getElementById('hash-compare-2') as HTMLInputElement)?.value;
              if (hash1 && hash2) {
                const match = hash1.toLowerCase() === hash2.toLowerCase();
                alert(match ? '✓ 哈希值匹配' : '✗ 哈希值不匹配');
              }
            }}
          >
            对比
          </Button>
        </div>
      </Card>
    </div>
  );
}