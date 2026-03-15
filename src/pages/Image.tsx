import { useState, useRef } from 'react';
import { Card, Button } from '../components/common';

type TabType = 'convert' | 'edit' | 'tools';

export default function Image() {
  const [image, setImage] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number; size: number; type: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('convert');
  const [targetFormat, setTargetFormat] = useState('image/png');
  const [quality, setQuality] = useState(0.9);
  const [targetWidth, setTargetWidth] = useState(800);
  const [targetHeight, setTargetHeight] = useState(600);
  const [keepRatio, setKeepRatio] = useState(true);
  const [rotate, setRotate] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [filter, setFilter] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [base64Output, setBase64Output] = useState('');
  const [asciiArt, setAsciiArt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImage(result);
        setRotate(0);
        setFlipH(false);
        setFlipV(false);
        setFilter('none');
        setBrightness(100);
        setContrast(100);

        const img = new window.Image();
        img.onload = () => {
          setImageInfo({
            width: img.width,
            height: img.height,
            size: file.size,
            type: file.type,
            name: file.name,
          });
          setTargetWidth(img.width);
          setTargetHeight(img.height);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadCanvas = (filename: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    }, targetFormat, quality);
  };

  const processImage = (callback: (ctx: CanvasRenderingContext2D, img: HTMLImageElement, canvas: HTMLCanvasElement) => void) => {
    if (!image) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new window.Image();
    img.onload = () => {
      canvas.width = targetWidth || img.width;
      canvas.height = targetHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        // 应用变换
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        // 应用滤镜
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        callback(ctx, img, canvas);
        ctx.restore();
      }
    };
    img.src = image;
  };

  const handleConvert = () => {
    processImage((ctx, img, canvas) => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      downloadCanvas(`converted.${targetFormat.split('/')[1]}`);
    });
  };

  const handleResize = () => {
    processImage((ctx, img, canvas) => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      downloadCanvas(`resized_${targetWidth}x${targetHeight}.png`);
    });
  };

  const handleCompress = () => {
    processImage((ctx, img, canvas) => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      downloadCanvas('compressed.jpg');
    });
  };

  const handleFlipRotate = () => {
    processImage((ctx, img, canvas) => {
      ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
      downloadCanvas('transformed.png');
    });
  };

  const handleApplyFilter = () => {
    processImage((ctx, img, canvas) => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      if (filter !== 'none') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (filter === 'grayscale') {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            data[i] = data[i + 1] = data[i + 2] = gray;
          } else if (filter === 'sepia') {
            data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
            data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
            data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
          } else if (filter === 'invert') {
            data[i] = 255 - r;
            data[i + 1] = 255 - g;
            data[i + 2] = 255 - b;
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }
      downloadCanvas('filtered.png');
    });
  };

  const imageToBase64 = () => {
    if (!image) return;
    setBase64Output(image);
  };

  const imageToAscii = () => {
    if (!image) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      const width = 100;
      const height = Math.floor((img.height / img.width) * width * 0.5);
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const chars = ' .:-=+*#%@';
      let ascii = '';
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const brightness = (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3;
          const charIdx = Math.floor((brightness / 255) * (chars.length - 1));
          ascii += chars[charIdx];
        }
        ascii += '\n';
      }
      setAsciiArt(ascii);
    };
    img.src = image;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'convert', label: '格式转换' },
    { key: 'edit', label: '图片编辑' },
    { key: 'tools', label: '实用工具' },
  ];

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* 上传图片 */}
      <Card title="图片上传">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          <Button variant="primary" onClick={() => fileInputRef.current?.click()}>选择图片</Button>
          {imageInfo && (
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '13px', flexWrap: 'wrap' }}>
              <span>{imageInfo.name}</span>
              <span>{imageInfo.width} × {imageInfo.height} px</span>
              <span>{formatBytes(imageInfo.size)}</span>
              <span>{imageInfo.type}</span>
            </div>
          )}
        </div>
        {image && (
          <div style={{ marginTop: '16px' }}>
            <img src={image} alt="预览" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }} />
          </div>
        )}
      </Card>

      {/* Tab 切换 */}
      <div className="tabs" style={{ marginBottom: 0 }}>
        {tabs.map(tab => (
          <button key={tab.key} className={`tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 格式转换 */}
      {activeTab === 'convert' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <Card title="格式转换">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>目标格式</div>
                <select className="select" value={targetFormat} onChange={e => setTargetFormat(e.target.value)} style={{ minWidth: '120px' }}>
                  <option value="image/png">PNG</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
              {targetFormat !== 'image/png' && (
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>质量: {Math.round(quality * 100)}%</div>
                  <input type="range" min="0.1" max="1" step="0.1" value={quality} onChange={e => setQuality(parseFloat(e.target.value))} style={{ width: '120px' }} />
                </div>
              )}
              <Button variant="primary" onClick={handleConvert} disabled={!image}>转换并下载</Button>
            </div>
          </Card>

          <Card title="调整尺寸">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>宽度</div>
                <input type="number" className="input" value={targetWidth} onChange={e => { setTargetWidth(parseInt(e.target.value) || 0); if (keepRatio && imageInfo) setTargetHeight(Math.round((parseInt(e.target.value) / imageInfo.width) * imageInfo.height)); }} style={{ width: '100px' }} />
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>高度</div>
                <input type="number" className="input" value={targetHeight} onChange={e => { setTargetHeight(parseInt(e.target.value) || 0); if (keepRatio && imageInfo) setTargetWidth(Math.round((parseInt(e.target.value) / imageInfo.height) * imageInfo.width)); }} style={{ width: '100px' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '4px' }}>
                <input type="checkbox" checked={keepRatio} onChange={e => setKeepRatio(e.target.checked)} />
                <span style={{ fontSize: '13px' }}>保持比例</span>
              </label>
              <Button variant="primary" onClick={handleResize} disabled={!image}>调整并下载</Button>
            </div>
          </Card>

          <Card title="图片压缩">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>压缩质量: {Math.round(quality * 100)}%</div>
              <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={e => setQuality(parseFloat(e.target.value))} style={{ width: '200px' }} />
              <Button variant="primary" onClick={handleCompress} disabled={!image}>压缩并下载</Button>
            </div>
          </Card>
        </div>
      )}

      {/* 图片编辑 */}
      {activeTab === 'edit' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <Card title="旋转翻转">
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>旋转角度: {rotate}°</span>
                <input type="range" min="0" max="360" value={rotate} onChange={e => setRotate(parseInt(e.target.value))} style={{ width: '200px' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="secondary" size="sm" onClick={() => setFlipH(!flipH)} style={{ background: flipH ? 'var(--accent-primary)' : undefined, color: flipH ? 'white' : undefined }}>
                  水平翻转
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setFlipV(!flipV)} style={{ background: flipV ? 'var(--accent-primary)' : undefined, color: flipV ? 'white' : undefined }}>
                  垂直翻转
                </Button>
                <Button variant="primary" onClick={handleFlipRotate} disabled={!image}>应用并下载</Button>
              </div>
            </div>
          </Card>

          <Card title="滤镜效果">
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { value: 'none', label: '原图' },
                  { value: 'grayscale', label: '灰度' },
                  { value: 'sepia', label: '复古' },
                  { value: 'invert', label: '反色' },
                ].map(f => (
                  <Button key={f.value} variant={filter === f.value ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter(f.value)}>
                    {f.label}
                  </Button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>亮度: {brightness}%</span>
                <input type="range" min="0" max="200" value={brightness} onChange={e => setBrightness(parseInt(e.target.value))} style={{ width: '150px' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>对比度: {contrast}%</span>
                <input type="range" min="0" max="200" value={contrast} onChange={e => setContrast(parseInt(e.target.value))} style={{ width: '150px' }} />
              </div>
              <Button variant="primary" onClick={handleApplyFilter} disabled={!image}>应用并下载</Button>
            </div>
          </Card>
        </div>
      )}

      {/* 实用工具 */}
      {activeTab === 'tools' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <Card title="图片转 Base64">
            <div style={{ display: 'grid', gap: '12px' }}>
              <Button variant="primary" onClick={imageToBase64} disabled={!image}>转换为 Base64</Button>
              {base64Output && (
                <div style={{ display: 'grid', gap: '8px' }}>
                  <textarea className="textarea" value={base64Output} readOnly style={{ height: '150px', fontSize: '12px' }} />
                  <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(base64Output)}>复制 Base64</Button>
                </div>
              )}
            </div>
          </Card>

          <Card title="图片转 ASCII 艺术">
            <div style={{ display: 'grid', gap: '12px' }}>
              <Button variant="primary" onClick={imageToAscii} disabled={!image}>转换为 ASCII</Button>
              {asciiArt && (
                <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--border-radius)', overflow: 'auto', fontSize: '8px', lineHeight: 1, maxHeight: '300px' }}>
                  {asciiArt}
                </pre>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}