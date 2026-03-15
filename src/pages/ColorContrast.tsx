import { useState } from 'react';
import { Card, Button } from '../components/common';

// Calculate relative luminance
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Calculate contrast ratio
const getContrastRatio = (l1: number, l2: number): number => {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

// Parse hex color
const parseHex = (hex: string): [number, number, number] => {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return [r, g, b];
};

// Get WCAG level
const getWcagLevel = (ratio: number): { level: string; color: string } => {
  if (ratio >= 7) return { level: 'AAA', color: '#22c55e' };
  if (ratio >= 4.5) return { level: 'AA', color: '#eab308' };
  if (ratio >= 3) return { level: 'AA Large', color: '#f97316' };
  return { level: 'Fail', color: '#ef4444' };
};

export default function ColorContrast() {
  const [foreground, setForeground] = useState('#000000');
  const [background, setBackground] = useState('#ffffff');
  const [swapped, setSwapped] = useState(false);

  const [fgR, fgG, fgB] = parseHex(foreground);
  const [bgR, bgG, bgB] = parseHex(background);

  const fgLuminance = getLuminance(fgR, fgG, fgB);
  const bgLuminance = getLuminance(bgR, bgG, bgB);
  const contrastRatio = getContrastRatio(fgLuminance, bgLuminance);

  const wcagNormal = getWcagLevel(contrastRatio);
  const wcagLarge = getWcagLevel(contrastRatio);

  const swapColors = () => {
    setForeground(background);
    setBackground(foreground);
    setSwapped(!swapped);
  };

  const randomColors = () => {
    const randomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setForeground(randomHex());
    setBackground(randomHex());
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="颜色对比度检测">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Color Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>前景色 (文字)</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={foreground}
                  onChange={e => setForeground(e.target.value)}
                  style={{ width: 40, height: 40, border: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={foreground}
                  onChange={e => setForeground(e.target.value)}
                  className="input"
                  style={{ flex: 1 }}
                  placeholder="#000000"
                />
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>背景色</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={background}
                  onChange={e => setBackground(e.target.value)}
                  style={{ width: 40, height: 40, border: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={background}
                  onChange={e => setBackground(e.target.value)}
                  className="input"
                  style={{ flex: 1 }}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" onClick={swapColors}>交换颜色</Button>
            <Button variant="secondary" onClick={randomColors}>随机颜色</Button>
          </div>

          {/* Preview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{
              padding: '20px',
              background: background,
              borderRadius: 'var(--border-radius)',
              textAlign: 'center',
            }}>
              <div style={{ color: foreground, fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
                示例文字
              </div>
              <div style={{ color: foreground, fontSize: '14px' }}>
                Sample Text 样例
              </div>
            </div>
            <div style={{
              padding: '20px',
              background: foreground,
              borderRadius: 'var(--border-radius)',
              textAlign: 'center',
            }}>
              <div style={{ color: background, fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
                反色预览
              </div>
              <div style={{ color: background, fontSize: '14px' }}>
                Sample Text 样例
              </div>
            </div>
          </div>

          {/* Contrast Ratio */}
          <div style={{
            padding: '24px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--border-radius)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>对比度</div>
            <div style={{ fontSize: '48px', fontWeight: 600, color: wcagNormal.color }}>
              {contrastRatio.toFixed(2)}:1
            </div>
          </div>

          {/* WCAG Results */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>普通文字 (AA ≥ 4.5)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '4px 8px',
                  background: wcagNormal.color,
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 500,
                }}>
                  {wcagNormal.level}
                </span>
                {wcagNormal.level !== 'Fail' && <span style={{ color: 'var(--text-secondary)' }}>通过</span>}
              </div>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>大号文字 (AA ≥ 3)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '4px 8px',
                  background: wcagLarge.level === 'Fail' ? wcagLarge.color : wcagLarge.level === 'AAA' ? '#22c55e' : '#eab308',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 500,
                }}>
                  {wcagLarge.level === 'Fail' ? 'Fail' : wcagLarge.level === 'AAA' ? 'AAA' : 'AA'}
                </span>
                {wcagLarge.level !== 'Fail' && <span style={{ color: 'var(--text-secondary)' }}>通过</span>}
              </div>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>普通文字 (AAA ≥ 7)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '4px 8px',
                  background: contrastRatio >= 7 ? '#22c55e' : '#ef4444',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 500,
                }}>
                  {contrastRatio >= 7 ? 'AAA' : 'Fail'}
                </span>
                {contrastRatio >= 7 && <span style={{ color: 'var(--text-secondary)' }}>通过</span>}
              </div>
            </div>
          </div>

          {/* Color Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', fontSize: '13px' }}>
            <div style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>前景亮度: </span>
              {fgLuminance.toFixed(3)}
            </div>
            <div style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>背景亮度: </span>
              {bgLuminance.toFixed(3)}
            </div>
          </div>
        </div>
      </Card>

      <Card title="WCAG 对比度标准">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ padding: '2px 6px', background: '#22c55e', color: 'white', borderRadius: '4px', fontSize: '11px' }}>AAA</span>
              <strong>≥ 7:1</strong>
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>最高级别，适用于所有文本</div>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ padding: '2px 6px', background: '#eab308', color: 'white', borderRadius: '4px', fontSize: '11px' }}>AA</span>
              <strong>≥ 4.5:1</strong>
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>标准级别，适用于普通文本</div>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ padding: '2px 6px', background: '#f97316', color: 'white', borderRadius: '4px', fontSize: '11px' }}>AA Large</span>
              <strong>≥ 3:1</strong>
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>适用于大号文本（18px+ 或 14px 粗体）</div>
          </div>
        </div>
      </Card>
    </div>
  );
}