import { useState, useRef } from 'react';
import { Card, Button } from '../components/common';

interface CompressedImage {
  original: string;
  compressed: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export default function ImageCompress() {
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [quality, setQuality] = useState(0.7);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setCompressing(true);
    const newImages: CompressedImage[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;

      const original = await readFileAsDataURL(file);
      const compressed = await compressImage(original);

      newImages.push({
        original,
        compressed: compressed.dataUrl,
        originalSize: file.size,
        compressedSize: compressed.size,
        width: compressed.width,
        height: compressed.height,
      });
    }

    setImages(prev => [...prev, ...newImages]);
    setCompressing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const compressImage = (dataUrl: string): Promise<{ dataUrl: string; size: number; width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Scale down if needed
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const mimeType = `image/${format}`;
          const compressedDataUrl = canvas.toDataURL(mimeType, quality);

          // Estimate compressed size
          const base64Length = compressedDataUrl.split(',')[1].length;
          const size = Math.round(base64Length * 0.75);

          resolve({ dataUrl: compressedDataUrl, size, width, height });
        }
      };
      img.src = dataUrl;
    });
  };

  const downloadImage = (image: CompressedImage, index: number) => {
    const a = document.createElement('a');
    a.href = image.compressed;
    a.download = `compressed-${index + 1}.${format}`;
    a.click();
  };

  const downloadAll = () => {
    images.forEach((image, index) => {
      setTimeout(() => downloadImage(image, index), index * 200);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setImages([]);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressedSize = images.reduce((sum, img) => sum + img.compressedSize, 0);
  const savedPercent = totalOriginalSize > 0 ? ((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1) : '0';

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="图片压缩">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Settings */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                质量: {Math.round(quality * 100)}%
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={quality}
                onChange={e => setQuality(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                最大宽度: {maxWidth}px
              </div>
              <input
                type="range"
                min="400"
                max="4000"
                step="100"
                value={maxWidth}
                onChange={e => setMaxWidth(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>输出格式</div>
              <select
                value={format}
                onChange={e => setFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
          </div>

          {/* Upload */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button variant="primary" onClick={() => fileInputRef.current?.click()}>
              {compressing ? '压缩中...' : '选择图片'}
            </Button>
            {images.length > 0 && (
              <>
                <Button variant="secondary" onClick={downloadAll}>下载全部</Button>
                <Button variant="secondary" onClick={clearAll}>清空全部</Button>
              </>
            )}
          </div>

          {/* Stats */}
          {images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>原始大小</div>
                <div style={{ fontFamily: 'monospace', fontSize: '16px' }}>{formatSize(totalOriginalSize)}</div>
              </div>
              <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>压缩后</div>
                <div style={{ fontFamily: 'monospace', fontSize: '16px' }}>{formatSize(totalCompressedSize)}</div>
              </div>
              <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>节省空间</div>
                <div style={{ fontFamily: 'monospace', fontSize: '16px', color: '#22c55e' }}>{savedPercent}%</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Image List */}
      {images.map((image, index) => (
        <Card key={index}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 500 }}>图片 {index + 1}</span>
              <Button variant="secondary" size="sm" onClick={() => removeImage(index)}>删除</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>
                  原图 ({formatSize(image.originalSize)})
                </div>
                <img
                  src={image.original}
                  alt="Original"
                  style={{ width: '100%', borderRadius: 'var(--border-radius)', maxHeight: '200px', objectFit: 'contain' }}
                />
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>
                  压缩后 ({formatSize(image.compressedSize)})
                </div>
                <img
                  src={image.compressed}
                  alt="Compressed"
                  style={{ width: '100%', borderRadius: 'var(--border-radius)', maxHeight: '200px', objectFit: 'contain' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                尺寸: {image.width} × {image.height}
              </span>
              <span style={{ fontSize: '13px', color: '#22c55e' }}>
                压缩率: {((1 - image.compressedSize / image.originalSize) * 100).toFixed(1)}%
              </span>
              <Button variant="secondary" size="sm" onClick={() => downloadImage(image, index)}>下载</Button>
            </div>
          </div>
        </Card>
      ))}

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 支持批量选择多张图片进行压缩</div>
          <div>• <strong>质量</strong>：数值越低压缩率越高，图片质量越低</div>
          <div>• <strong>最大宽度</strong>：图片超过此宽度会自动缩放</div>
          <div>• <strong>格式</strong>：WebP 格式通常能获得更好的压缩率</div>
          <div>• 所有处理在浏览器本地完成，图片不会上传到服务器</div>
        </div>
      </Card>
    </div>
  );
}