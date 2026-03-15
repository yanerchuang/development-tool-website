import { useState } from 'react';
import { Card, Button } from '../components/common';

interface ShadowConfig {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

export default function ShadowGenerator() {
  const [shadows, setShadows] = useState<ShadowConfig[]>([
    { offsetX: 0, offsetY: 4, blur: 6, spread: -1, color: '#000000', opacity: 10, inset: false },
  ]);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [boxColor, setBoxColor] = useState('#3b82f6');
  const [boxRadius, setBoxRadius] = useState(8);

  const generateCSS = (): string => {
    const shadowStrings = shadows.map(shadow => {
      const r = parseInt(shadow.color.slice(1, 3), 16);
      const g = parseInt(shadow.color.slice(3, 5), 16);
      const b = parseInt(shadow.color.slice(5, 7), 16);
      const rgba = `rgba(${r}, ${g}, ${b}, ${shadow.opacity / 100})`;
      return `${shadow.inset ? 'inset ' : ''}${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px ${rgba}`;
    });
    return `box-shadow: ${shadowStrings.join(', ')};`;
  };

  const updateShadow = (index: number, field: keyof ShadowConfig, value: number | string | boolean) => {
    const newShadows = [...shadows];
    (newShadows[index] as ShadowConfig)[field] = value as never;
    setShadows(newShadows);
  };

  const addShadow = () => {
    setShadows([...shadows, { offsetX: 0, offsetY: 4, blur: 6, spread: 0, color: '#000000', opacity: 10, inset: false }]);
  };

  const removeShadow = (index: number) => {
    if (shadows.length > 1) {
      setShadows(shadows.filter((_, i) => i !== index));
    }
  };

  const presetShadows = [
    { name: '柔和阴影', css: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);' },
    { name: '中等阴影', css: 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);' },
    { name: '大阴影', css: 'box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);' },
    { name: '内阴影', css: 'box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);' },
    { name: '悬浮效果', css: 'box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);' },
    { name: '卡片阴影', css: 'box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);' },
    { name: '立体按钮', css: 'box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.39);' },
    { name: '霓虹效果', css: 'box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0070e0, 0 0 20px #0070e0;' },
  ];

  const copyCSS = () => {
    navigator.clipboard.writeText(generateCSS());
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="CSS 阴影生成器">
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Preview */}
          <div
            style={{
              height: '250px',
              background: backgroundColor,
              borderRadius: 'var(--border-radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '200px',
                height: '100px',
                background: boxColor,
                borderRadius: `${boxRadius}px`,
                boxShadow: generateCSS().replace('box-shadow: ', '').replace(';', ''),
              }}
            />
          </div>

          {/* Box Settings */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>背景颜色</div>
              <input
                type="color"
                value={backgroundColor}
                onChange={e => setBackgroundColor(e.target.value)}
                style={{ width: '100%', height: '36px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>盒子颜色</div>
              <input
                type="color"
                value={boxColor}
                onChange={e => setBoxColor(e.target.value)}
                style={{ width: '100%', height: '36px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>圆角: {boxRadius}px</div>
              <input
                type="range"
                min="0"
                max="50"
                value={boxRadius}
                onChange={e => setBoxRadius(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Shadow Layers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500 }}>阴影层</span>
            <Button variant="secondary" size="sm" onClick={addShadow}>+ 添加阴影层</Button>
          </div>

          {shadows.map((shadow, index) => (
            <div key={index} style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 500 }}>阴影 {index + 1}</span>
                {shadows.length > 1 && (
                  <Button variant="secondary" size="sm" onClick={() => removeShadow(index)}>删除</Button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '12px' }}>X偏移: {shadow.offsetX}px</div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={shadow.offsetX}
                    onChange={e => updateShadow(index, 'offsetX', Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '12px' }}>Y偏移: {shadow.offsetY}px</div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={shadow.offsetY}
                    onChange={e => updateShadow(index, 'offsetY', Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '12px' }}>模糊: {shadow.blur}px</div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={shadow.blur}
                    onChange={e => updateShadow(index, 'blur', Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '12px' }}>扩展: {shadow.spread}px</div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={shadow.spread}
                    onChange={e => updateShadow(index, 'spread', Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '12px' }}>颜色</div>
                  <input
                    type="color"
                    value={shadow.color}
                    onChange={e => updateShadow(index, 'color', e.target.value)}
                    style={{ width: '100%', height: '28px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '12px' }}>透明度: {shadow.opacity}%</div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={shadow.opacity}
                    onChange={e => updateShadow(index, 'opacity', Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={shadow.inset}
                    onChange={e => updateShadow(index, 'inset', e.target.checked)}
                  />
                  <span style={{ fontSize: '13px' }}>内阴影 (inset)</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* CSS Output */}
      <Card title="CSS 代码">
        <div style={{ display: 'grid', gap: '12px' }}>
          <pre className="result-box" style={{ margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {generateCSS()}
          </pre>
          <Button variant="primary" onClick={copyCSS}>复制 CSS</Button>
        </div>
      </Card>

      {/* Presets */}
      <Card title="预设阴影">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
          {presetShadows.map(preset => (
            <div
              key={preset.name}
              style={{
                padding: '20px',
                background: 'white',
                borderRadius: 'var(--border-radius)',
                boxShadow: preset.css.replace('box-shadow: ', '').replace(';', ''),
                cursor: 'pointer',
                textAlign: 'center',
              }}
              title={preset.css}
            >
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#333' }}>{preset.name}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 调整参数实时预览阴影效果</div>
          <div>• 支持添加多个阴影层，创建复杂效果</div>
          <div>• <strong>box-shadow</strong>: offset-x offset-y blur spread color</div>
          <div>• 点击预设阴影可快速应用常用效果</div>
        </div>
      </Card>
    </div>
  );
}