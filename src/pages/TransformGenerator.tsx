import { useState, useMemo } from 'react';
import { Card, Button } from '../components/common';

export default function TransformGenerator() {
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [skewX, setSkewX] = useState(0);
  const [skewY, setSkewY] = useState(0);
  const [originX, setOriginX] = useState(50);
  const [originY, setOriginY] = useState(50);

  const cssCode = useMemo(() => {
    const transforms: string[] = [];

    if (translateX !== 0 || translateY !== 0) {
      transforms.push(`translate(${translateX}px, ${translateY}px)`);
    }
    if (rotate !== 0) {
      transforms.push(`rotate(${rotate}deg)`);
    }
    if (scaleX !== 1 || scaleY !== 1) {
      transforms.push(`scale(${scaleX}, ${scaleY})`);
    }
    if (skewX !== 0 || skewY !== 0) {
      transforms.push(`skew(${skewX}deg, ${skewY}deg)`);
    }

    const transformStr = transforms.length > 0 ? transforms.join(' ') : 'none';
    const originStr = `${originX}% ${originY}%`;

    return `.element {
  transform: ${transformStr};
  transform-origin: ${originStr};
}`;
  }, [translateX, translateY, rotate, scaleX, scaleY, skewX, skewY, originX, originY]);

  const copyCode = () => {
    navigator.clipboard.writeText(cssCode);
  };

  const reset = () => {
    setTranslateX(0);
    setTranslateY(0);
    setRotate(0);
    setScaleX(1);
    setScaleY(1);
    setSkewX(0);
    setSkewY(0);
    setOriginX(50);
    setOriginY(50);
  };

  const sliderStyle = {
    width: '100%',
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="CSS Transform 生成器">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Preview */}
          <div style={{
            padding: '40px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--border-radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              borderRadius: '8px',
              transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg) scale(${scaleX}, ${scaleY}) skew(${skewX}deg, ${skewY}deg)`,
              transformOrigin: `${originX}% ${originY}%`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: '14px',
            }}>
              Preview
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Translate */}
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>位移 (Translate)</div>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '20px', fontSize: '12px' }}>X:</span>
                  <input type="range" min="-200" max="200" value={translateX} onChange={e => setTranslateX(parseInt(e.target.value))} style={sliderStyle} />
                  <span style={{ width: '50px', textAlign: 'right', fontSize: '12px', fontFamily: 'monospace' }}>{translateX}px</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '20px', fontSize: '12px' }}>Y:</span>
                  <input type="range" min="-200" max="200" value={translateY} onChange={e => setTranslateY(parseInt(e.target.value))} style={sliderStyle} />
                  <span style={{ width: '50px', textAlign: 'right', fontSize: '12px', fontFamily: 'monospace' }}>{translateY}px</span>
                </div>
              </div>
            </div>

            {/* Rotate */}
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>旋转 (Rotate)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="range" min="-180" max="180" value={rotate} onChange={e => setRotate(parseInt(e.target.value))} style={sliderStyle} />
                <span style={{ width: '50px', textAlign: 'right', fontSize: '12px', fontFamily: 'monospace' }}>{rotate}°</span>
              </div>
            </div>

            {/* Scale */}
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>缩放 (Scale)</div>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '20px', fontSize: '12px' }}>X:</span>
                  <input type="range" min="0" max="3" step="0.1" value={scaleX} onChange={e => setScaleX(parseFloat(e.target.value))} style={sliderStyle} />
                  <span style={{ width: '50px', textAlign: 'right', fontSize: '12px', fontFamily: 'monospace' }}>{scaleX.toFixed(1)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '20px', fontSize: '12px' }}>Y:</span>
                  <input type="range" min="0" max="3" step="0.1" value={scaleY} onChange={e => setScaleY(parseFloat(e.target.value))} style={sliderStyle} />
                  <span style={{ width: '50px', textAlign: 'right', fontSize: '12px', fontFamily: 'monospace' }}>{scaleY.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Skew */}
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>倾斜 (Skew)</div>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '20px', fontSize: '12px' }}>X:</span>
                  <input type="range" min="-45" max="45" value={skewX} onChange={e => setSkewX(parseInt(e.target.value))} style={sliderStyle} />
                  <span style={{ width: '50px', textAlign: 'right', fontSize: '12px', fontFamily: 'monospace' }}>{skewX}°</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '20px', fontSize: '12px' }}>Y:</span>
                  <input type="range" min="-45" max="45" value={skewY} onChange={e => setSkewY(parseInt(e.target.value))} style={sliderStyle} />
                  <span style={{ width: '50px', textAlign: 'right', fontSize: '12px', fontFamily: 'monospace' }}>{skewY}°</span>
                </div>
              </div>
            </div>

            {/* Transform Origin */}
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>变换原点 (Origin)</div>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '20px', fontSize: '12px' }}>X:</span>
                  <input type="range" min="0" max="100" value={originX} onChange={e => setOriginX(parseInt(e.target.value))} style={sliderStyle} />
                  <span style={{ width: '50px', textAlign: 'right', fontSize: '12px', fontFamily: 'monospace' }}>{originX}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '20px', fontSize: '12px' }}>Y:</span>
                  <input type="range" min="0" max="100" value={originY} onChange={e => setOriginY(parseInt(e.target.value))} style={sliderStyle} />
                  <span style={{ width: '50px', textAlign: 'right', fontSize: '12px', fontFamily: 'monospace' }}>{originY}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" onClick={copyCode}>复制 CSS</Button>
            <Button variant="secondary" onClick={reset}>重置</Button>
          </div>

          {/* CSS Code */}
          <pre style={{
            padding: '16px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--border-radius)',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '13px',
            margin: 0,
          }}>
            {cssCode}
          </pre>
        </div>
      </Card>

      <Card title="Transform 函数说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>translate(x, y)</strong>: 沿 X 和 Y 轴移动元素
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>rotate(angle)</strong>: 围绕变换原点旋转元素
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>scale(x, y)</strong>: 缩放元素大小
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>skew(x, y)</strong>: 倾斜/扭曲元素
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>transform-origin</strong>: 设置变换的原点位置
          </div>
        </div>
      </Card>
    </div>
  );
}