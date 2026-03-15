import { useState } from 'react';
import { Card, Button, Input } from '../components/common';

type GradientType = 'linear' | 'radial';
type GradientShape = 'circle' | 'ellipse';

interface ColorStop {
  color: string;
  position: number;
}

export default function GradientGenerator() {
  const [gradientType, setGradientType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState(90);
  const [shape, setShape] = useState<GradientShape>('circle');
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { color: '#667eea', position: 0 },
    { color: '#764ba2', position: 100 },
  ]);

  const generateCSS = (): string => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const colorString = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');

    if (gradientType === 'linear') {
      return `linear-gradient(${angle}deg, ${colorString})`;
    }
    return `radial-gradient(${shape}, ${colorString})`;
  };

  const addColorStop = () => {
    const newPosition = colorStops.length > 0
      ? Math.min(100, colorStops[colorStops.length - 1].position + 25)
      : 50;
    setColorStops([...colorStops, { color: '#ffffff', position: newPosition }]);
  };

  const removeColorStop = (index: number) => {
    if (colorStops.length > 2) {
      setColorStops(colorStops.filter((_, i) => i !== index));
    }
  };

  const updateColorStop = (index: number, field: 'color' | 'position', value: string | number) => {
    const newStops = [...colorStops];
    if (field === 'color') {
      newStops[index].color = value as string;
    } else {
      newStops[index].position = Math.max(0, Math.min(100, value as number));
    }
    setColorStops(newStops);
  };

  const presetGradients = [
    { name: '紫蓝渐变', colors: ['#667eea', '#764ba2'] },
    { name: '日落渐变', colors: ['#f093fb', '#f5576c'] },
    { name: '海洋渐变', colors: ['#4facfe', '#00f2fe'] },
    { name: '森林渐变', colors: ['#11998e', '#38ef7d'] },
    { name: '日落橙', colors: ['#fa709a', '#fee140'] },
    { name: '紫粉渐变', colors: ['#a18cd1', '#fbc2eb'] },
    { name: '冷色调', colors: ['#2c3e50', '#4ca1af'] },
    { name: '暖色调', colors: ['#f12711', '#f5af19'] },
    { name: '薄荷绿', colors: ['#0f0c29', '#302b63', '#24243e'] },
    { name: '深紫渐变', colors: ['#0f0c29', '#302b63', '#24243e'] },
  ];

  const applyPreset = (colors: string[]) => {
    const newStops = colors.map((color, index) => ({
      color,
      position: Math.round((index / (colors.length - 1)) * 100),
    }));
    setColorStops(newStops);
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(`background: ${generateCSS()};`);
  };

  const gradientStyle = generateCSS();

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="CSS 渐变生成器">
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Preview */}
          <div
            style={{
              height: '200px',
              background: gradientStyle,
              borderRadius: 'var(--border-radius)',
              boxShadow: 'var(--shadow-sm)',
            }}
          />

          {/* Type Selection */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant={gradientType === 'linear' ? 'primary' : 'secondary'}
              onClick={() => setGradientType('linear')}
            >
              线性渐变
            </Button>
            <Button
              variant={gradientType === 'radial' ? 'primary' : 'secondary'}
              onClick={() => setGradientType('radial')}
            >
              径向渐变
            </Button>
          </div>

          {/* Angle for Linear */}
          {gradientType === 'linear' && (
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>角度</span>
                <span style={{ fontFamily: 'monospace' }}>{angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={e => setAngle(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                  <Button key={deg} variant="secondary" size="sm" onClick={() => setAngle(deg)}>
                    {deg}°
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Shape for Radial */}
          {gradientType === 'radial' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant={shape === 'circle' ? 'primary' : 'secondary'}
                onClick={() => setShape('circle')}
              >
                圆形
              </Button>
              <Button
                variant={shape === 'ellipse' ? 'primary' : 'secondary'}
                onClick={() => setShape('ellipse')}
              >
                椭圆
              </Button>
            </div>
          )}

          {/* Color Stops */}
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>颜色节点</span>
              <Button variant="secondary" size="sm" onClick={addColorStop}>+ 添加颜色</Button>
            </div>

            {colorStops.map((stop, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={stop.color}
                  onChange={e => updateColorStop(index, 'color', e.target.value)}
                  style={{ width: '50px', height: '36px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                />
                <Input
                  value={stop.color}
                  onChange={e => updateColorStop(index, 'color', e.target.value)}
                  style={{ width: '120px', fontFamily: 'monospace' }}
                />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stop.position}
                    onChange={e => updateColorStop(index, 'position', Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ width: '40px', textAlign: 'right', fontFamily: 'monospace' }}>{stop.position}%</span>
                </div>
                {colorStops.length > 2 && (
                  <Button variant="secondary" size="sm" onClick={() => removeColorStop(index)}>×</Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* CSS Output */}
      <Card title="CSS 代码">
        <div style={{ display: 'grid', gap: '12px' }}>
          <pre className="result-box" style={{ margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {`background: ${gradientStyle};`}
          </pre>
          <Button variant="primary" onClick={copyCSS}>复制 CSS</Button>
        </div>
      </Card>

      {/* Presets */}
      <Card title="预设渐变">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
          {presetGradients.map(preset => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset.colors)}
              style={{
                padding: '12px',
                background: `linear-gradient(135deg, ${preset.colors.join(', ')})`,
                border: 'none',
                borderRadius: 'var(--border-radius)',
                color: 'white',
                fontWeight: 500,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                cursor: 'pointer',
                minHeight: '60px',
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </Card>

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• <strong>线性渐变</strong>：颜色沿直线方向变化，可设置角度</div>
          <div>• <strong>径向渐变</strong>：颜色从中心向外扩散</div>
          <div>• 拖动滑块调整颜色位置，点击预设快速应用常用渐变</div>
        </div>
      </Card>
    </div>
  );
}