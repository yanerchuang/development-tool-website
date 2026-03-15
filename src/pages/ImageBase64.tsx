import { useState, useRef } from 'react';
import { Card, Button } from '../components/common';

export default function ImageBase64() {
  const [base64, setBase64] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number; size: string; type: string } | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      setBase64(result);

      // Get image info
      const img = new Image();
      img.onload = () => {
        setImageInfo({
          width: img.width,
          height: img.height,
          size: (file.size / 1024).toFixed(2) + ' KB',
          type: file.type,
        });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleUrlToBase64 = () => {
    if (!imageUrl) return;

    setError('');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        setBase64(dataUrl);
        setImageInfo({
          width: img.width,
          height: img.height,
          size: Math.round(dataUrl.length * 0.75 / 1024) + ' KB (base64)',
          type: 'image/png',
        });
      }
    };
    img.onerror = () => {
      setError('无法加载图片，可能是跨域限制');
    };
    img.src = imageUrl;
  };

  const handleBase64ToImage = () => {
    if (!base64) return;

    setError('');
    const img = new Image();
    img.onload = () => {
      setImageInfo({
        width: img.width,
        height: img.height,
        size: Math.round(base64.length * 0.75 / 1024) + ' KB',
        type: base64.match(/data:(image\/\w+);/)?.[1] || 'unknown',
      });
    };
    img.onerror = () => {
      setError('无效的 Base64 图片数据');
    };
    img.src = base64;
  };

  const copyDataUrl = () => {
    navigator.clipboard.writeText(base64);
  };

  const copyPureBase64 = () => {
    const pure = base64.replace(/^data:image\/\w+;base64,/, '');
    navigator.clipboard.writeText(pure);
  };

  const downloadImage = () => {
    if (!base64) return;
    const a = document.createElement('a');
    a.href = base64;
    a.download = 'image.png';
    a.click();
  };

  const clear = () => {
    setBase64('');
    setImageUrl('');
    setImageInfo(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="图片转 Base64">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button variant="primary" onClick={() => fileInputRef.current?.click()}>选择图片</Button>
            <Button variant="secondary" onClick={clear}>清空</Button>
          </div>

          {error && <div style={{ color: 'var(--accent-danger)', fontSize: '13px' }}>{error}</div>}

          {imageInfo && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>尺寸</div>
                <div style={{ fontFamily: 'monospace' }}>{imageInfo.width} × {imageInfo.height}</div>
              </div>
              <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>大小</div>
                <div style={{ fontFamily: 'monospace' }}>{imageInfo.size}</div>
              </div>
              <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>类型</div>
                <div style={{ fontFamily: 'monospace' }}>{imageInfo.type}</div>
              </div>
            </div>
          )}

          {base64 && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <img
                  src={base64}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 'var(--border-radius)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Button variant="secondary" size="sm" onClick={copyDataUrl}>复制 Data URL</Button>
                <Button variant="secondary" size="sm" onClick={copyPureBase64}>复制纯 Base64</Button>
                <Button variant="secondary" size="sm" onClick={downloadImage}>下载图片</Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="URL 转 Base64">
        <div style={{ display: 'grid', gap: '12px' }}>
          <input
            type="text"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="输入图片 URL..."
            className="input"
            style={{ width: '100%' }}
          />
          <Button variant="primary" onClick={handleUrlToBase64}>转换</Button>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            注意：目标图片服务器需要支持跨域访问 (CORS)
          </div>
        </div>
      </Card>

      <Card title="Base64 转图片">
        <div style={{ display: 'grid', gap: '12px' }}>
          <textarea
            value={base64}
            onChange={e => setBase64(e.target.value)}
            placeholder="粘贴 Base64 数据 (支持 Data URL 或纯 Base64)..."
            className="input"
            style={{ width: '100%', minHeight: '100px', fontFamily: 'monospace', fontSize: '12px' }}
          />
          <Button variant="primary" onClick={handleBase64ToImage}>解析</Button>
        </div>
      </Card>

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• <strong>图片转 Base64</strong>：选择本地图片文件，生成 Base64 编码</div>
          <div>• <strong>URL 转 Base64</strong>：输入图片 URL，需要目标服务器支持 CORS</div>
          <div>• <strong>Base64 转图片</strong>：粘贴 Base64 数据，预览并下载图片</div>
          <div>• Data URL 格式：data:image/png;base64,...</div>
        </div>
      </Card>
    </div>
  );
}