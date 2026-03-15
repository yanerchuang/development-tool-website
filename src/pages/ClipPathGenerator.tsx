import { useState } from 'react';
import { Card, Button } from '../components/common';

type ShapeType = 'circle' | 'ellipse' | 'polygon' | 'inset';

interface ShapeConfig {
  type: ShapeType;
  circle: { radius: number };
  ellipse: { rx: number; ry: number };
  polygon: { sides: number };
  inset: { top: number; right: number; bottom: number; left: number; borderRadius: number };
}

const getPolygonPoints = (sides: number): string => {
  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const x = 50 + 50 * Math.cos(angle);
    const y = 50 + 50 * Math.sin(angle);
    points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return points.join(', ');
};

export default function ClipPathGenerator() {
  const [config, setConfig] = useState<ShapeConfig>({
    type: 'polygon',
    circle: { radius: 50 },
    ellipse: { rx: 50, ry: 50 },
    polygon: { sides: 6 },
    inset: { top: 10, right: 10, bottom: 10, left: 10, borderRadius: 0 },
  });

  const getClipPath = (): string => {
    switch (config.type) {
      case 'circle':
        return `circle(${config.circle.radius}% at 50% 50%)`;
      case 'ellipse':
        return `ellipse(${config.ellipse.rx}% ${config.ellipse.ry}% at 50% 50%)`;
      case 'polygon':
        return `polygon(${getPolygonPoints(config.polygon.sides)})`;
      case 'inset':
        const { top, right, bottom, left, borderRadius } = config.inset;
        if (borderRadius > 0) {
          return `inset(${top}% ${right}% ${bottom}% ${left}% round ${borderRadius}px)`;
        }
        return `inset(${top}% ${right}% ${bottom}% ${left}%)`;
    }
  };

  const copyCode = () => {
    const css = `clip-path: ${getClipPath()};`;
    navigator.clipboard.writeText(css);
  };

  const clipPath = getClipPath();

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="CSS Clip-Path 生成器">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Shape Type */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['circle', 'ellipse', 'polygon', 'inset'] as ShapeType[]).map(type => (
              <button
                key={type}
                onClick={() => setConfig(prev => ({ ...prev, type }))}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: config.type === type ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: config.type === type ? 'white' : 'var(--text-primary)',
                  borderRadius: 'var(--border-radius)',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                {type === 'circle' ? '圆形' : type === 'ellipse' ? '椭圆' : type === 'polygon' ? '多边形' : '内边距'}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {config.type === 'circle' && (
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                  半径: {config.circle.radius}%
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={config.circle.radius}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    circle: { radius: parseInt(e.target.value) },
                  }))}
                  style={{ width: '100%' }}
                />
              </div>
            )}

            {config.type === 'ellipse' && (
              <>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                    水平半径: {config.ellipse.rx}%
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={config.ellipse.rx}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      ellipse: { ...prev.ellipse, rx: parseInt(e.target.value) },
                    }))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                    垂直半径: {config.ellipse.ry}%
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={config.ellipse.ry}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      ellipse: { ...prev.ellipse, ry: parseInt(e.target.value) },
                    }))}
                    style={{ width: '100%' }}
                  />
                </div>
              </>
            )}

            {config.type === 'polygon' && (
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                  边数: {config.polygon.sides}
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={config.polygon.sides}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    polygon: { sides: parseInt(e.target.value) },
                  }))}
                  style={{ width: '100%' }}
                />
              </div>
            )}

            {config.type === 'inset' && (
              <>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                    上边距: {config.inset.top}%
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={config.inset.top}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      inset: { ...prev.inset, top: parseInt(e.target.value) },
                    }))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                    右边距: {config.inset.right}%
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={config.inset.right}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      inset: { ...prev.inset, right: parseInt(e.target.value) },
                    }))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                    下边距: {config.inset.bottom}%
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={config.inset.bottom}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      inset: { ...prev.inset, bottom: parseInt(e.target.value) },
                    }))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                    左边距: {config.inset.left}%
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={config.inset.left}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      inset: { ...prev.inset, left: parseInt(e.target.value) },
                    }))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                    圆角: {config.inset.borderRadius}px
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={config.inset.borderRadius}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      inset: { ...prev.inset, borderRadius: parseInt(e.target.value) },
                    }))}
                    style={{ width: '100%' }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Preview */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--border-radius)',
          }}>
            <div style={{
              width: '200px',
              height: '200px',
              background: 'linear-gradient(135deg, var(--accent-primary), #a855f7)',
              clipPath,
              transition: 'clip-path 0.3s',
            }} />
          </div>

          {/* Code Output */}
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>CSS代码</div>
            <div style={{
              padding: '12px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--border-radius)',
              fontFamily: 'monospace',
              fontSize: '13px',
              wordBreak: 'break-all',
            }}>
              <span style={{ color: '#22c55e' }}>clip-path</span>: {clipPath};
            </div>
            <Button variant="secondary" onClick={copyCode}>复制代码</Button>
          </div>
        </div>
      </Card>

      <Card title="预设形状">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
          {[
            { label: '圆形', type: 'circle' as ShapeType, config: { circle: { radius: 50 } } },
            { label: '椭圆', type: 'ellipse' as ShapeType, config: { ellipse: { rx: 50, ry: 30 } } },
            { label: '三角形', type: 'polygon' as ShapeType, config: { polygon: { sides: 3 } } },
            { label: '菱形', type: 'polygon' as ShapeType, config: { polygon: { sides: 4 } } },
            { label: '五边形', type: 'polygon' as ShapeType, config: { polygon: { sides: 5 } } },
            { label: '六边形', type: 'polygon' as ShapeType, config: { polygon: { sides: 6 } } },
            { label: '八边形', type: 'polygon' as ShapeType, config: { polygon: { sides: 8 } } },
            { label: '内边距', type: 'inset' as ShapeType, config: { inset: { top: 10, right: 10, bottom: 10, left: 10, borderRadius: 8 } } },
          ].map(preset => (
            <button
              key={preset.label}
              onClick={() => setConfig({ ...config, type: preset.type, ...preset.config })}
              style={{
                padding: '12px',
                background: 'var(--bg-tertiary)',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: '50px',
                height: '50px',
                margin: '0 auto 8px',
                background: 'var(--accent-primary)',
                clipPath: preset.type === 'circle' ? 'circle(50%)' :
                  preset.type === 'ellipse' ? 'ellipse(50% 30%)' :
                  preset.type === 'polygon' ? `polygon(${getPolygonPoints((preset.config as { polygon: { sides: number } }).polygon.sides)})` :
                  'inset(10% round 8px)',
              }} />
              <div style={{ fontSize: '12px' }}>{preset.label}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card title="说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• clip-path 属性可以创建一个裁剪区域，只显示元素的一部分</div>
          <div>• circle(): 圆形裁剪</div>
          <div>• ellipse(): 椭圆裁剪</div>
          <div>• polygon(): 多边形裁剪，可自定义边数</div>
          <div>• inset(): 内边距裁剪，可以创建带圆角的矩形</div>
          <div>• 注意：部分旧版浏览器可能不支持</div>
        </div>
      </Card>
    </div>
  );
}