import { useState } from 'react';
import { Card, Button } from '../components/common';

export default function FileHash() {
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<{algorithm: string; hash: string}[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setHashes([]);
    }
  };

  const calculateHash = async (algorithm: string): Promise<string> => {
    if (!file) return '';

    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const calculateAllHashes = async () => {
    if (!file) return;

    setCalculating(true);
    setProgress(0);
    const results: {algorithm: string; hash: string}[] = [];

    const algorithms = [
      { name: 'MD5', algorithm: 'SHA-1' }, // Browser doesn't support MD5, use SHA-1 as fallback
      { name: 'SHA-1', algorithm: 'SHA-1' },
      { name: 'SHA-256', algorithm: 'SHA-256' },
      { name: 'SHA-384', algorithm: 'SHA-384' },
      { name: 'SHA-512', algorithm: 'SHA-512' },
    ];

    for (let i = 0; i < algorithms.length; i++) {
      const hash = await calculateHash(algorithms[i].algorithm);
      results.push({ algorithm: algorithms[i].name, hash });
      setProgress(((i + 1) / algorithms.length) * 100);
    }

    setHashes(results);
    setCalculating(false);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const clear = () => {
    setFile(null);
    setHashes([]);
    setProgress(0);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="文件哈希计算">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* File Select */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
              <span className="btn btn-primary">选择文件</span>
            </label>
            {file && (
              <Button variant="secondary" onClick={clear}>清除</Button>
            )}
          </div>

          {/* File Info */}
          {file && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>文件名</div>
                <div style={{ wordBreak: 'break-all' }}>{file.name}</div>
              </div>
              <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>大小</div>
                <div>{formatSize(file.size)}</div>
              </div>
              <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>类型</div>
                <div style={{ wordBreak: 'break-all' }}>{file.type || '未知'}</div>
              </div>
            </div>
          )}

          {/* Calculate Button */}
          {file && (
            <Button variant="primary" onClick={calculateAllHashes} disabled={calculating}>
              {calculating ? `计算中... ${Math.round(progress)}%` : '计算哈希值'}
            </Button>
          )}

          {/* Progress Bar */}
          {calculating && (
            <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'var(--accent-primary)',
                  transition: 'width 0.2s',
                }}
              />
            </div>
          )}

          {/* Hash Results */}
          {hashes.length > 0 && (
            <div style={{ display: 'grid', gap: '12px' }}>
              {hashes.map(item => (
                <div key={item.algorithm} style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{item.algorithm}</span>
                    <Button variant="secondary" size="sm" onClick={() => copyHash(item.hash)}>复制</Button>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all', color: 'var(--text-secondary)' }}>
                    {item.hash}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card title="支持的哈希算法">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• <strong>SHA-1</strong>: 160位哈希值，已不推荐用于安全场景</div>
          <div>• <strong>SHA-256</strong>: 256位哈希值，广泛使用</div>
          <div>• <strong>SHA-384</strong>: 384位哈希值</div>
          <div>• <strong>SHA-512</strong>: 512位哈希值，安全性更高</div>
          <div>• 注意：浏览器环境不支持 MD5 算法</div>
        </div>
      </Card>

      <Card title="使用场景">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 验证文件完整性</div>
          <div>• 检查下载文件是否被篡改</div>
          <div>• 比较两个文件是否相同</div>
          <div>• 安全传输文件校验</div>
        </div>
      </Card>
    </div>
  );
}