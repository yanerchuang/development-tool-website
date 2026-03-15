import { useState, useMemo } from 'react';
import { Card, Button } from '../components/common';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  randomColor,
  contrastRatio,
  generatePalette,
} from '../utils/color';

export default function Color() {
  const [hex, setHex] = useState('#4263eb');
  const [palette, setPalette] = useState<string[]>([]);
  const [contrastColor, setContrastColor] = useState('#ffffff');
  const [contrastResult, setContrastResult] = useState<number | null>(null);

  // 从 HEX 派生 RGB 和 HSL
  const rgb = useMemo(() => hexToRgb(hex) || { r: 66, g: 99, b: 235 }, [hex]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);

  // RGB 变化时更新 HEX 和 HSL
  const handleRgbChange = (key: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgb, [key]: Math.min(255, Math.max(0, value)) };
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  // HSL 变化时更新 HEX 和 RGB
  const handleHslChange = (key: 'h' | 's' | 'l', value: number) => {
    const newHsl = {
      ...hsl,
      [key]: key === 'h' ? Math.min(360, Math.max(0, value)) : Math.min(100, Math.max(0, value)),
    };
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  // 生成调色板
  const handleGeneratePalette = () => {
    setPalette(generatePalette(hex));
  };

  // 计算对比度
  const handleCalculateContrast = () => {
    setContrastResult(contrastRatio(hex, contrastColor));
  };

  // 随机颜色
  const handleRandomColor = () => {
    setHex(randomColor());
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* 颜色选择器 */}
      <Card title="颜色选择器">
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '120px',
                height: '120px',
                background: hex,
                borderRadius: 'var(--border-radius)',
                border: '2px solid var(--border-color)',
              }}
            />
            <input
              type="color"
              value={hex}
              onChange={e => setHex(e.target.value)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '120px',
                height: '120px',
                opacity: 0,
                cursor: 'pointer',
              }}
            />
          </div>
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* HEX */}
            <div>
              <label className="label">HEX</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="input"
                  value={hex}
                  onChange={e => setHex(e.target.value)}
                  style={{ width: '120px', fontFamily: 'monospace' }}
                />
                <Button variant="secondary" onClick={handleRandomColor}>
                  随机
                </Button>
              </div>
            </div>

            {/* RGB */}
            <div>
              <label className="label">RGB</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['r', 'g', 'b'] as const).map(key => (
                  <input
                    key={key}
                    type="number"
                    className="input"
                    value={rgb[key]}
                    onChange={e => handleRgbChange(key, parseInt(e.target.value) || 0)}
                    min={0}
                    max={255}
                    style={{ width: '80px' }}
                    placeholder={key.toUpperCase()}
                  />
                ))}
              </div>
            </div>

            {/* HSL */}
            <div>
              <label className="label">HSL</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['h', 's', 'l'] as const).map(key => (
                  <input
                    key={key}
                    type="number"
                    className="input"
                    value={hsl[key]}
                    onChange={e => handleHslChange(key, parseInt(e.target.value) || 0)}
                    min={0}
                    max={key === 'h' ? 360 : 100}
                    style={{ width: '80px' }}
                    placeholder={key.toUpperCase()}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CSS 变量格式 */}
        <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', fontFamily: 'monospace', fontSize: '13px' }}>
          <div>HEX: {hex}</div>
          <div>RGB: rgb({rgb.r}, {rgb.g}, {rgb.b})</div>
          <div>HSL: hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</div>
        </div>
      </Card>

      {/* 调色板生成 */}
      <Card title="调色板生成">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <Button variant="primary" onClick={handleGeneratePalette}>
            生成调色板
          </Button>
        </div>
        {palette.length > 0 && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {palette.map((color, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '60px',
                  background: color,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  padding: '4px',
                  fontSize: '11px',
                  color: i < 5 ? 'white' : 'black',
                  textShadow: '0 0 2px rgba(0,0,0,0.5)',
                }}
              >
                {color}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 对比度计算 */}
      <Card title="对比度计算">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label className="label">颜色 1</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', background: hex, borderRadius: '4px', border: '1px solid var(--border-color)' }} />
              <input className="input" value={hex} onChange={e => setHex(e.target.value)} style={{ width: '100px', fontFamily: 'monospace' }} />
            </div>
          </div>
          <div>
            <label className="label">颜色 2</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', background: contrastColor, borderRadius: '4px', border: '1px solid var(--border-color)' }} />
              <input className="input" value={contrastColor} onChange={e => setContrastColor(e.target.value)} style={{ width: '100px', fontFamily: 'monospace' }} />
            </div>
          </div>
          <Button variant="primary" onClick={handleCalculateContrast}>
            计算对比度
          </Button>
        </div>
        {contrastResult !== null && (
          <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--accent-primary)' }}>
              {contrastResult.toFixed(2)}:1
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
              {contrastResult >= 4.5 ? '✓ 符合 WCAG AA 标准' : '✗ 不符合 WCAG AA 标准 (需要 4.5:1)'}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}