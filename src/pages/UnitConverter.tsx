import { useState } from 'react';
import { Card, Button, Input } from '../components/common';
import {
  lengthUnits,
  weightUnits,
  temperatureUnits,
  areaUnits,
  volumeUnits,
  timeUnits,
  dataUnits,
  speedUnits,
  convertUnit,
  convertTemperature,
  convertToAll,
} from '../utils/unit';

type CategoryType = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'time' | 'data' | 'speed';

interface UnitDefinition {
  name: string;
  key: string;
  factor?: number;
}

export default function UnitConverter() {
  const [category, setCategory] = useState<CategoryType>('length');
  const [inputValue, setInputValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [result, setResult] = useState<number | null>(null);
  const [allResults, setAllResults] = useState<Record<string, number> | null>(null);

  const categories: { key: CategoryType; label: string; units: UnitDefinition[] }[] = [
    { key: 'length', label: '长度', units: lengthUnits },
    { key: 'weight', label: '重量', units: weightUnits },
    { key: 'temperature', label: '温度', units: temperatureUnits },
    { key: 'area', label: '面积', units: areaUnits },
    { key: 'volume', label: '体积', units: volumeUnits },
    { key: 'time', label: '时间', units: timeUnits },
    { key: 'data', label: '数据存储', units: dataUnits },
    { key: 'speed', label: '速度', units: speedUnits },
  ];

  const currentCategory = categories.find(c => c.key === category) || categories[0];

  // Reset units when category changes
  const handleCategoryChange = (newCategory: CategoryType) => {
    setCategory(newCategory);
    const cat = categories.find(c => c.key === newCategory);
    if (cat && cat.units.length >= 2) {
      setFromUnit(cat.units[0].key);
      setToUnit(cat.units[1].key);
    }
    setResult(null);
    setAllResults(null);
  };

  const handleConvert = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setResult(null);
      return;
    }

    if (category === 'temperature') {
      const converted = convertTemperature(value, fromUnit, toUnit);
      setResult(converted);
    } else {
      const units = currentCategory.units as { key: string; factor: number }[];
      const converted = convertUnit(value, fromUnit, toUnit, units);
      setResult(converted);
    }
    setAllResults(null);
  };

  const handleConvertToAll = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) return;

    if (category === 'temperature') {
      // For temperature, manually convert to all
      const results: Record<string, number> = {};
      temperatureUnits.forEach(u => {
        if (u.key !== fromUnit) {
          results[u.name] = convertTemperature(value, fromUnit, u.key);
        }
      });
      setAllResults(results);
    } else {
      const unitsWithFactor = currentCategory.units.filter((u): u is { name: string; key: string; factor: number } => 'factor' in u);
      const results = convertToAll(value, fromUnit, unitsWithFactor);
      setAllResults(results);
    }
    setResult(null);
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    setResult(null);
    setAllResults(null);
  };

  const formatNumber = (num: number): string => {
    if (isNaN(num)) return '无效';
    if (Math.abs(num) < 0.000001 || Math.abs(num) > 999999999) {
      return num.toExponential(6);
    }
    return num.toLocaleString('zh-CN', { maximumFractionDigits: 10 });
  };

  const getUnitName = (key: string): string => {
    const unit = currentCategory.units.find(u => u.key === key);
    return unit?.name || key;
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* 分类选择 */}
      <Card title="单位转换">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {categories.map(cat => (
            <Button
              key={cat.key}
              variant={category === cat.key ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleCategoryChange(cat.key)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* 转换区域 */}
        <div style={{ display: 'grid', gap: '16px' }}>
          <Input
            label="输入值"
            type="number"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="输入数值"
          />

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>从</div>
              <select
                className="select"
                value={fromUnit}
                onChange={e => { setFromUnit(e.target.value); setResult(null); setAllResults(null); }}
              >
                {currentCategory.units.map(u => (
                  <option key={u.key} value={u.key}>{u.name} ({u.key})</option>
                ))}
              </select>
            </div>

            <Button variant="secondary" size="sm" onClick={swapUnits} style={{ marginBottom: '4px' }}>
              ⇄ 交换
            </Button>

            <div style={{ flex: 1, minWidth: '150px' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>到</div>
              <select
                className="select"
                value={toUnit}
                onChange={e => { setToUnit(e.target.value); setResult(null); setAllResults(null); }}
              >
                {currentCategory.units.map(u => (
                  <option key={u.key} value={u.key}>{u.name} ({u.key})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="primary" onClick={handleConvert}>转换</Button>
            <Button variant="secondary" onClick={handleConvertToAll}>转换为全部</Button>
          </div>

          {/* 结果 */}
          {result !== null && (
            <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>转换结果</div>
              <div style={{ fontSize: '32px', fontWeight: 600, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                {formatNumber(result)}
              </div>
              <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                {getUnitName(toUnit)}
              </div>
            </div>
          )}

          {/* 全部结果 */}
          {allResults && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              {Object.entries(allResults).map(([name, value]) => (
                <div key={name} style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{name}</div>
                  <div style={{ fontSize: '16px', fontWeight: 500, fontFamily: 'monospace' }}>
                    {formatNumber(value)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 常用换算参考 */}
      <Card title={`${currentCategory.label}换算参考`}>
        <div style={{ display: 'grid', gap: '8px' }}>
          {category === 'length' && (
            <>
              <div style={refStyle}>1 千米 = 1000 米</div>
              <div style={refStyle}>1 米 = 100 厘米 = 1000 毫米</div>
              <div style={refStyle}>1 英寸 = 2.54 厘米</div>
              <div style={refStyle}>1 英尺 = 12 英寸 = 30.48 厘米</div>
              <div style={refStyle}>1 英里 ≈ 1.609 千米</div>
              <div style={refStyle}>1 海里 = 1.852 千米</div>
            </>
          )}
          {category === 'weight' && (
            <>
              <div style={refStyle}>1 吨 = 1000 千克</div>
              <div style={refStyle}>1 千克 = 1000 克</div>
              <div style={refStyle}>1 斤 = 500 克 = 10 两</div>
              <div style={refStyle}>1 磅 ≈ 453.6 克</div>
              <div style={refStyle}>1 盎司 ≈ 28.35 克</div>
            </>
          )}
          {category === 'temperature' && (
            <>
              <div style={refStyle}>0°C = 32°F = 273.15K</div>
              <div style={refStyle}>100°C = 212°F = 373.15K</div>
              <div style={refStyle}>°F = °C × 9/5 + 32</div>
              <div style={refStyle}>K = °C + 273.15</div>
            </>
          )}
          {category === 'area' && (
            <>
              <div style={refStyle}>1 平方千米 = 100 公顷</div>
              <div style={refStyle}>1 公顷 = 10000 平方米</div>
              <div style={refStyle}>1 亩 ≈ 666.67 平方米</div>
              <div style={refStyle}>1 英亩 ≈ 4046.86 平方米</div>
            </>
          )}
          {category === 'volume' && (
            <>
              <div style={refStyle}>1 立方米 = 1000 升</div>
              <div style={refStyle}>1 升 = 1000 毫升</div>
              <div style={refStyle}>1 加仑(美) ≈ 3.785 升</div>
              <div style={refStyle}>1 品脱(美) ≈ 473 毫升</div>
            </>
          )}
          {category === 'time' && (
            <>
              <div style={refStyle}>1 天 = 24 小时 = 1440 分钟</div>
              <div style={refStyle}>1 小时 = 60 分钟 = 3600 秒</div>
              <div style={refStyle}>1 周 = 7 天</div>
              <div style={refStyle}>1 年 ≈ 365.25 天</div>
            </>
          )}
          {category === 'data' && (
            <>
              <div style={refStyle}>1 Byte = 8 bits</div>
              <div style={refStyle}>1 KB = 1024 Bytes</div>
              <div style={refStyle}>1 MB = 1024 KB</div>
              <div style={refStyle}>1 GB = 1024 MB</div>
              <div style={refStyle}>1 TB = 1024 GB</div>
            </>
          )}
          {category === 'speed' && (
            <>
              <div style={refStyle}>1 m/s = 3.6 km/h</div>
              <div style={refStyle}>1 km/h ≈ 0.278 m/s</div>
              <div style={refStyle}>1 mph ≈ 1.609 km/h</div>
              <div style={refStyle}>1 节 ≈ 1.852 km/h</div>
              <div style={refStyle}>1 马赫 ≈ 340 m/s (海平面)</div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

const refStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: 'var(--bg-tertiary)',
  borderRadius: '4px',
  fontSize: '13px',
  fontFamily: 'monospace',
};