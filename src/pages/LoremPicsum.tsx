import { useState } from 'react';
import { Card, Button } from '../components/common';

export default function LoremPicsum() {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [grayscale, setGrayscale] = useState(false);
  const [blur, setBlur] = useState(0);
  const [imageId, setImageId] = useState('');
  const [random, setRandom] = useState(true);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const generateUrl = () => {
    let url = 'https://picsum.photos';

    if (imageId && !random) {
      url += `/id/${imageId}`;
    }

    url += `/${width}/${height}`;

    const params: string[] = [];
    if (grayscale) params.push('grayscale');
    if (blur > 0) params.push(`blur=${blur}`);
    if (random) params.push(`random=${Date.now()}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    setGeneratedUrl(url);
    setPreviewUrl(url);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(generatedUrl);
  };

  const copyHtml = () => {
    const html = `<img src="${generatedUrl}" alt="Lorem Picsum" />`;
    navigator.clipboard.writeText(html);
  };

  const copyMarkdown = () => {
    const md = `![Lorem Picsum](${generatedUrl})`;
    navigator.clipboard.writeText(md);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = generatedUrl;
    link.download = `picsum-${width}x${height}.jpg`;
    link.target = '_blank';
    link.click();
  };

  const presets = [
    { label: '头像', width: 200, height: 200 },
    { label: '缩略图', width: 300, height: 200 },
    { label: '卡片', width: 400, height: 300 },
    { label: '横幅', width: 1200, height: 400 },
    { label: '全屏', width: 1920, height: 1080 },
    { label: '手机壁纸', width: 1080, height: 1920 },
  ];

  const applyPreset = (preset: { width: number; height: number }) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="Lorem Picsum 图片生成">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Size */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>宽度: {width}px</div>
              <input
                type="range"
                min="100"
                max="2000"
                value={width}
                onChange={e => setWidth(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>高度: {height}px</div>
              <input
                type="range"
                min="100"
                max="2000"
                value={height}
                onChange={e => setHeight(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Presets */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {presets.map(preset => (
              <Button
                key={preset.label}
                variant="secondary"
                size="sm"
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Options */}
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={grayscale}
                  onChange={e => setGrayscale(e.target.checked)}
                />
                <span style={{ fontSize: '13px' }}>灰度</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={random}
                  onChange={e => setRandom(e.target.checked)}
                />
                <span style={{ fontSize: '13px' }}>随机图片</span>
              </label>
            </div>

            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                模糊度: {blur}
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={blur}
                onChange={e => setBlur(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {!random && (
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                  图片ID (可选)
                </div>
                <input
                  type="text"
                  value={imageId}
                  onChange={e => setImageId(e.target.value)}
                  placeholder="输入图片ID..."
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </div>

          {/* Generate */}
          <Button variant="primary" onClick={generateUrl}>生成图片</Button>

          {/* Preview */}
          {previewUrl && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{
                padding: '20px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--border-radius)',
                textAlign: 'center',
              }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    borderRadius: 'var(--border-radius)',
                  }}
                />
              </div>

              {/* URL */}
              <div style={{
                padding: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--border-radius)',
                fontFamily: 'monospace',
                fontSize: '12px',
                wordBreak: 'break-all',
              }}>
                {generatedUrl}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Button variant="secondary" onClick={copyUrl}>复制URL</Button>
                <Button variant="secondary" onClick={copyHtml}>复制HTML</Button>
                <Button variant="secondary" onClick={copyMarkdown}>复制Markdown</Button>
                <Button variant="secondary" onClick={downloadImage}>下载图片</Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="关于 Lorem Picsum">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• Lorem Picsum 是一个免费的占位图片服务</div>
          <div>• 提供高质量、免费的随机图片</div>
          <div>• 支持自定义尺寸、灰度、模糊等效果</div>
          <div>• 可以通过图片ID获取特定的图片</div>
          <div>• 适合用于设计原型、演示、测试等场景</div>
        </div>
      </Card>
    </div>
  );
}