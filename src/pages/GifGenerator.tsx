import { useState, useRef } from 'react';
import { Card, Button } from '../components/common';

export default function GifGenerator() {
  const [images, setImages] = useState<string[]>([]);
  const [delay, setDelay] = useState(200);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [width, setWidth] = useState(320);
  const [height, setHeight] = useState(240);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        newImages.push(result);
        if (newImages.length === files.length) {
          setImages(prev => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setImages(newImages);
  };

  const generateGif = async () => {
    if (images.length < 2) return;

    setGenerating(true);

    // Load all images
    const loadedImages: HTMLImageElement[] = [];
    for (const src of images) {
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.src = src;
      });
      loadedImages.push(img);
    }

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setGenerating(false);
      return;
    }

    // Generate frames
    const frames: ImageData[] = [];
    for (const img of loadedImages) {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Calculate scaling to fit
      const scale = Math.min(width / img.width, height / img.height);
      const x = (width - img.width * scale) / 2;
      const y = (height - img.height * scale) / 2;

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      frames.push(ctx.getImageData(0, 0, width, height));
    }

    // Simple GIF encoder (limited but works)
    const gif = await encodeGif(frames, delay);
    const blob = new Blob([new Uint8Array(gif)], { type: 'image/gif' });
    const url = URL.createObjectURL(blob);
    setGifUrl(url);
    setGenerating(false);
  };

  // Simple GIF encoder
  const encodeGif = async (frames: ImageData[], delayMs: number): Promise<Uint8Array> => {
    const encoder = new GifEncoder(frames[0].width, frames[0].height, delayMs);
    for (const frame of frames) {
      encoder.addFrame(frame);
    }
    return encoder.getData();
  };

  const downloadGif = () => {
    if (!gifUrl) return;
    const a = document.createElement('a');
    a.href = gifUrl;
    a.download = 'animation.gif';
    a.click();
  };

  const clearAll = () => {
    setImages([]);
    setGifUrl(null);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="GIF 动画生成器">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Settings */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                帧间隔: {delay}ms
              </div>
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={delay}
                onChange={e => setDelay(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                宽度: {width}px
              </div>
              <input
                type="range"
                min="100"
                max="800"
                step="10"
                value={width}
                onChange={e => setWidth(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                高度: {height}px
              </div>
              <input
                type="range"
                min="100"
                max="600"
                step="10"
                value={height}
                onChange={e => setHeight(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
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
              添加图片
            </Button>
            <Button
              variant="secondary"
              onClick={generateGif}
              disabled={images.length < 2 || generating}
            >
              {generating ? '生成中...' : '生成 GIF'}
            </Button>
            <Button variant="secondary" onClick={clearAll}>清空</Button>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            已添加 {images.length} 张图片 {images.length < 2 && '(至少需要 2 张)'}
          </div>
        </div>
      </Card>

      {/* Image Frames */}
      {images.length > 0 && (
        <Card title="帧列表">
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {images.map((img, index) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    width: '120px',
                    height: '120px',
                    border: '2px solid var(--border-color)',
                    borderRadius: 'var(--border-radius)',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={img}
                    alt={`Frame ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f0f0f0' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: 12,
                  }}>
                    {index + 1}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    gap: 2,
                    background: 'rgba(0,0,0,0.6)',
                  }}>
                    <button
                      onClick={() => moveImage(index, 'up')}
                      disabled={index === 0}
                      style={{
                        flex: 1,
                        padding: 4,
                        border: 'none',
                        background: 'transparent',
                        color: index === 0 ? '#666' : 'white',
                        cursor: index === 0 ? 'default' : 'pointer',
                      }}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveImage(index, 'down')}
                      disabled={index === images.length - 1}
                      style={{
                        flex: 1,
                        padding: 4,
                        border: 'none',
                        background: 'transparent',
                        color: index === images.length - 1 ? '#666' : 'white',
                        cursor: index === images.length - 1 ? 'default' : 'pointer',
                      }}
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeImage(index)}
                      style={{
                        flex: 1,
                        padding: 4,
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        cursor: 'pointer',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* GIF Preview */}
      {gifUrl && (
        <Card title="GIF 预览">
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ textAlign: 'center', background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--border-radius)' }}>
              <img
                src={gifUrl}
                alt="Generated GIF"
                style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: 'var(--border-radius)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="primary" onClick={downloadGif}>下载 GIF</Button>
            </div>
          </div>
        </Card>
      )}

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 添加多张图片作为 GIF 的帧</div>
          <div>• 拖动调整帧的顺序</div>
          <div>• <strong>帧间隔</strong>：每帧之间的时间间隔</div>
          <div>• <strong>宽度/高度</strong>：输出 GIF 的尺寸</div>
          <div>• 图片会自动缩放以适应指定尺寸</div>
        </div>
      </Card>
    </div>
  );
}

// Simple GIF Encoder
class GifEncoder {
  private width: number;
  private height: number;
  private delay: number;
  private data: number[];

  constructor(width: number, height: number, delay: number) {
    this.width = width;
    this.height = height;
    this.delay = delay;
    this.data = [];
    this.writeHeader();
  }

  private writeHeader() {
    // GIF89a
    this.data.push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61);

    // Logical Screen Descriptor
    this.writeShort(this.width);
    this.writeShort(this.height);
    this.data.push(0xF7); // Global Color Table Flag + Color Resolution + Sort Flag + Size of Global Color Table
    this.data.push(0x00); // Background Color Index
    this.data.push(0x00); // Pixel Aspect Ratio

    // Global Color Table (256 colors)
    for (let i = 0; i < 256; i++) {
      this.data.push(i, i, i);
    }

    // Netscape Extension for looping
    this.data.push(0x21, 0xFF, 0x0B);
    this.writeString('NETSCAPE2.0');
    this.data.push(0x03, 0x01);
    this.writeShort(0); // Loop count (0 = infinite)
    this.data.push(0x00);
  }

  private writeShort(value: number) {
    this.data.push(value & 0xFF, (value >> 8) & 0xFF);
  }

  private writeString(str: string) {
    for (let i = 0; i < str.length; i++) {
      this.data.push(str.charCodeAt(i));
    }
  }

  addFrame(imageData: ImageData) {
    // Graphic Control Extension
    this.data.push(0x21, 0xF9, 0x04);
    this.data.push(0x04); // Disposal method
    this.writeShort(Math.round(this.delay / 10)); // Delay in 1/100 seconds
    this.data.push(0x00); // Transparent color index
    this.data.push(0x00); // Block terminator

    // Image Descriptor
    this.data.push(0x2C);
    this.writeShort(0); // Left
    this.writeShort(0); // Top
    this.writeShort(this.width);
    this.writeShort(this.height);
    this.data.push(0x00); // No local color table

    // Image Data (LZW compressed)
    const pixels = this.quantize(imageData);
    this.writeLZW(pixels);
  }

  private quantize(imageData: ImageData): number[] {
    const pixels: number[] = [];
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Simple grayscale conversion for basic quantization
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      pixels.push(gray);
    }

    return pixels;
  }

  private writeLZW(pixels: number[]) {
    const minCodeSize = 8;
    this.data.push(minCodeSize);

    const encoder = new LZWEncoder(minCodeSize);
    const compressed = encoder.encode(pixels);

    let offset = 0;
    while (offset < compressed.length) {
      const chunkSize = Math.min(255, compressed.length - offset);
      this.data.push(chunkSize);
      for (let i = 0; i < chunkSize; i++) {
        this.data.push(compressed[offset + i]);
      }
      offset += chunkSize;
    }

    this.data.push(0x00); // Block terminator
  }

  getData(): Uint8Array {
    // Trailer
    this.data.push(0x3B);
    return new Uint8Array(this.data);
  }
}

class LZWEncoder {
  private minCodeSize: number;
  private clearCode: number;
  private endCode: number;
  private codeTable: Map<string, number>;
  private nextCode: number;
  private codeSize: number;
  private buffer: number[];
  private bitBuffer: number;
  private bitCount: number;

  constructor(minCodeSize: number) {
    this.minCodeSize = minCodeSize;
    this.clearCode = 1 << minCodeSize;
    this.endCode = this.clearCode + 1;
    this.codeTable = new Map();
    this.nextCode = this.endCode + 1;
    this.codeSize = minCodeSize + 1;
    this.buffer = [];
    this.bitBuffer = 0;
    this.bitCount = 0;
    this.initTable();
  }

  private initTable() {
    this.codeTable.clear();
    for (let i = 0; i < this.clearCode; i++) {
      this.codeTable.set(String(i), i);
    }
    this.nextCode = this.endCode + 1;
    this.codeSize = this.minCodeSize + 1;
  }

  private writeBits(code: number, size: number) {
    this.bitBuffer |= code << this.bitCount;
    this.bitCount += size;

    while (this.bitCount >= 8) {
      this.buffer.push(this.bitBuffer & 0xFF);
      this.bitBuffer >>= 8;
      this.bitCount -= 8;
    }
  }

  private flushBits() {
    if (this.bitCount > 0) {
      this.buffer.push(this.bitBuffer & 0xFF);
    }
  }

  encode(pixels: number[]): number[] {
    this.initTable();
    this.writeBits(this.clearCode, this.codeSize);

    let current = String(pixels[0]);

    for (let i = 1; i < pixels.length; i++) {
      const next = String(pixels[i]);
      const combined = current + ',' + next;

      if (this.codeTable.has(combined)) {
        current = combined;
      } else {
        const code = this.codeTable.get(current);
        if (code !== undefined) {
          this.writeBits(code, this.codeSize);
        }

        if (this.nextCode < 4096) {
          this.codeTable.set(combined, this.nextCode++);

          if (this.nextCode > (1 << this.codeSize) && this.codeSize < 12) {
            this.codeSize++;
          }
        } else {
          this.writeBits(this.clearCode, this.codeSize);
          this.initTable();
        }

        current = next;
      }
    }

    const lastCode = this.codeTable.get(current);
    if (lastCode !== undefined) {
      this.writeBits(lastCode, this.codeSize);
    }

    this.writeBits(this.endCode, this.codeSize);
    this.flushBits();

    return this.buffer;
  }
}