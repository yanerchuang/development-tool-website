import { useState } from 'react';
import { Card, Button } from '../components/common';

type PaletteType = 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'tetradic' | 'monochromatic';

const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const hexToHsl = (hex: string): [number, number, number] => {
  hex = hex.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

const generatePalette = (baseColor: string, type: PaletteType): string[] => {
  const [h, s, l] = hexToHsl(baseColor);
  const colors: string[] = [baseColor];

  switch (type) {
    case 'complementary':
      colors.push(hslToHex((h + 180) % 360, s, l));
      break;
    case 'analogous':
      colors.push(hslToHex((h + 30) % 360, s, l));
      colors.push(hslToHex((h + 330) % 360, s, l));
      break;
    case 'triadic':
      colors.push(hslToHex((h + 120) % 360, s, l));
      colors.push(hslToHex((h + 240) % 360, s, l));
      break;
    case 'split-complementary':
      colors.push(hslToHex((h + 150) % 360, s, l));
      colors.push(hslToHex((h + 210) % 360, s, l));
      break;
    case 'tetradic':
      colors.push(hslToHex((h + 90) % 360, s, l));
      colors.push(hslToHex((h + 180) % 360, s, l));
      colors.push(hslToHex((h + 270) % 360, s, l));
      break;
    case 'monochromatic':
      colors.push(hslToHex(h, s, Math.max(l - 30, 10)));
      colors.push(hslToHex(h, s, Math.min(l + 30, 90)));
      colors.push(hslToHex(h, Math.max(s - 20, 20), l));
      colors.push(hslToHex(h, Math.min(s + 20, 100), l));
      break;
  }

  return colors;
};

const paletteTypes: { type: PaletteType; label: string; description: string }[] = [
  { type: 'complementary', label: '互补色', description: '色轮上相对的两个颜色' },
  { type: 'analogous', label: '类似色', description: '色轮上相邻的颜色' },
  { type: 'triadic', label: '三色', description: '色轮上等距的三个颜色' },
  { type: 'split-complementary', label: '分裂互补', description: '主色和互补色两侧的颜色' },
  { type: 'tetradic', label: '四色', description: '色轮上等距的四个颜色' },
  { type: 'monochromatic', label: '单色', description: '同一色相不同明度/饱和度' },
];

export default function PaletteGenerator() {
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [paletteType, setPaletteType] = useState<PaletteType>('complementary');
  const [savedPalettes, setSavedPalettes] = useState<{ name: string; colors: string[] }[]>([]);

  const palette = generatePalette(baseColor, paletteType);

  const randomColor = () => {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 40) + 60;
    const l = Math.floor(Math.random() * 30) + 35;
    setBaseColor(hslToHex(h, s, l));
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
  };

  const copyPalette = () => {
    navigator.clipboard.writeText(palette.join(', '));
  };

  const savePalette = () => {
    const name = `Palette ${savedPalettes.length + 1}`;
    setSavedPalettes(prev => [...prev, { name, colors: palette }]);
  };

  const exportCss = () => {
    const css = palette.map((color, i) => `--color-${i + 1}: ${color};`).join('\n');
    navigator.clipboard.writeText(css);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="调色板生成器">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Base Color */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>基础颜色</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={baseColor}
                  onChange={e => setBaseColor(e.target.value)}
                  style={{ width: 40, height: 40, border: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={e => setBaseColor(e.target.value)}
                  className="input"
                  style={{ flex: 1 }}
                />
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>调色板类型</div>
              <select
                className="input"
                value={paletteType}
                onChange={e => setPaletteType(e.target.value as PaletteType)}
                style={{ width: '100%' }}
              >
                {paletteTypes.map(pt => (
                  <option key={pt.type} value={pt.type}>{pt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Palette Type Info */}
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {paletteTypes.find(pt => pt.type === paletteType)?.description}
          </div>

          <Button variant="secondary" onClick={randomColor}>随机颜色</Button>

          {/* Palette Preview */}
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>调色板</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(palette.length, 6)}, 1fr)`,
              gap: '8px',
            }}>
              {palette.map((color, i) => (
                <button
                  key={i}
                  onClick={() => copyColor(color)}
                  style={{
                    aspectRatio: '1',
                    background: color,
                    border: '2px solid transparent',
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'transform 0.1s',
                  }}
                  title={`${color} - 点击复制`}
                />
              ))}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(palette.length, 6)}, 1fr)`,
              gap: '8px',
              textAlign: 'center',
            }}>
              {palette.map((color, i) => (
                <div key={i} style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                  {color.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={copyPalette}>复制调色板</Button>
            <Button variant="secondary" onClick={exportCss}>导出CSS变量</Button>
            <Button variant="secondary" onClick={savePalette}>保存调色板</Button>
          </div>
        </div>
      </Card>

      {/* Saved Palettes */}
      {savedPalettes.length > 0 && (
        <Card title="已保存的调色板">
          <div style={{ display: 'grid', gap: '12px' }}>
            {savedPalettes.map((saved, i) => (
              <div
                key={i}
                style={{
                  padding: '12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--border-radius)',
                }}
              >
                <div style={{ marginBottom: '8px', fontWeight: 500 }}>{saved.name}</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {saved.colors.map((color, j) => (
                    <div
                      key={j}
                      style={{
                        width: '40px',
                        height: '40px',
                        background: color,
                        borderRadius: '4px',
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="调色板类型说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          {paletteTypes.map(pt => (
            <div key={pt.type} style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <strong>{pt.label}</strong>: {pt.description}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}