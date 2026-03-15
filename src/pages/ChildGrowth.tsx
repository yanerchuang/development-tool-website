import { useState } from 'react';
import { Card, Button } from '../components/common';

interface GrowthData {
  age: number;
  height: { p3: number; p50: number; p97: number };
  weight: { p3: number; p50: number; p97: number };
  headCircumference?: { p3: number; p50: number; p97: number };
}

// WHO growth standards (simplified)
const boysData: GrowthData[] = [
  { age: 0, height: { p3: 46.3, p50: 49.9, p97: 53.7 }, weight: { p3: 2.5, p50: 3.3, p97: 4.4 }, headCircumference: { p3: 32.1, p50: 34.5, p97: 36.9 } },
  { age: 1, height: { p3: 50.8, p50: 54.7, p97: 58.6 }, weight: { p3: 3.4, p50: 4.5, p97: 5.8 }, headCircumference: { p3: 35.0, p50: 37.3, p97: 39.6 } },
  { age: 3, height: { p3: 57.3, p50: 61.4, p97: 65.5 }, weight: { p3: 4.9, p50: 6.4, p97: 8.0 }, headCircumference: { p3: 38.1, p50: 40.5, p97: 42.9 } },
  { age: 6, height: { p3: 63.3, p50: 67.6, p97: 71.9 }, weight: { p3: 6.4, p50: 7.9, p97: 9.8 }, headCircumference: { p3: 40.7, p50: 43.3, p97: 45.9 } },
  { age: 12, height: { p3: 71.0, p50: 75.7, p97: 80.5 }, weight: { p3: 7.7, p50: 9.6, p97: 12.0 }, headCircumference: { p3: 43.3, p50: 46.1, p97: 48.9 } },
  { age: 18, height: { p3: 76.2, p50: 81.2, p97: 86.4 }, weight: { p3: 8.4, p50: 10.7, p97: 13.3 }, headCircumference: { p3: 44.7, p50: 47.6, p97: 50.5 } },
  { age: 24, height: { p3: 81.4, p50: 86.8, p97: 92.4 }, weight: { p3: 9.3, p50: 12.0, p97: 14.9 } },
  { age: 36, height: { p3: 88.7, p50: 95.1, p97: 101.6 }, weight: { p3: 10.8, p50: 14.0, p97: 17.6 } },
  { age: 48, height: { p3: 94.9, p50: 102.3, p97: 109.9 }, weight: { p3: 12.1, p50: 16.0, p97: 20.4 } },
  { age: 60, height: { p3: 100.7, p50: 108.4, p97: 116.5 }, weight: { p3: 13.3, p50: 18.0, p97: 23.2 } },
];

const girlsData: GrowthData[] = [
  { age: 0, height: { p3: 45.6, p50: 49.1, p97: 52.9 }, weight: { p3: 2.4, p50: 3.2, p97: 4.2 }, headCircumference: { p3: 31.5, p50: 33.8, p97: 36.0 } },
  { age: 1, height: { p3: 49.8, p50: 53.7, p97: 57.6 }, weight: { p3: 3.2, p50: 4.2, p97: 5.5 }, headCircumference: { p3: 34.2, p50: 36.5, p97: 38.7 } },
  { age: 3, height: { p3: 56.1, p50: 60.2, p97: 64.3 }, weight: { p3: 4.5, p50: 5.9, p97: 7.5 }, headCircumference: { p3: 37.2, p50: 39.5, p97: 41.8 } },
  { age: 6, height: { p3: 61.5, p50: 65.7, p97: 70.0 }, weight: { p3: 5.8, p50: 7.3, p97: 9.2 }, headCircumference: { p3: 39.6, p50: 42.2, p97: 44.8 } },
  { age: 12, height: { p3: 68.9, p50: 74.0, p97: 79.2 }, weight: { p3: 7.0, p50: 8.9, p97: 11.3 }, headCircumference: { p3: 42.0, p50: 45.0, p97: 48.0 } },
  { age: 18, height: { p3: 74.3, p50: 79.7, p97: 85.2 }, weight: { p3: 7.7, p50: 10.0, p97: 12.7 }, headCircumference: { p3: 43.4, p50: 46.5, p97: 49.6 } },
  { age: 24, height: { p3: 79.6, p50: 85.4, p97: 91.4 }, weight: { p3: 8.6, p50: 11.3, p97: 14.3 } },
  { age: 36, height: { p3: 87.0, p50: 93.5, p97: 100.2 }, weight: { p3: 10.0, p50: 13.4, p97: 17.1 } },
  { age: 48, height: { p3: 93.3, p50: 100.3, p97: 107.5 }, weight: { p3: 11.3, p50: 15.2, p97: 19.7 } },
  { age: 60, height: { p3: 99.2, p50: 106.7, p97: 114.5 }, weight: { p3: 12.5, p50: 17.0, p97: 22.4 } },
];

export default function ChildGrowth() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [ageMonths, setAgeMonths] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [headCirc, setHeadCirc] = useState('');
  const [result, setResult] = useState<{
    heightPercentile: string;
    heightStatus: string;
    heightColor: string;
    weightPercentile: string;
    weightStatus: string;
    weightColor: string;
    headPercentile?: string;
    headStatus?: string;
    headColor?: string;
    bmi?: number;
    bmiStatus?: string;
    bmiColor?: string;
  } | null>(null);

  const getPercentile = (value: number, p3: number, p50: number, p97: number): { percentile: string; status: string; color: string } => {
    if (value < p3) {
      return { percentile: '<P3', status: '偏小/偏轻', color: '#3b82f6' };
    } else if (value < p50) {
      const percent = Math.round(((value - p3) / (p50 - p3)) * 47 + 3);
      return { percentile: `P${percent}`, status: '中等偏小', color: '#22c55e' };
    } else if (value <= p97) {
      const percent = Math.round(((value - p50) / (p97 - p50)) * 47 + 50);
      return { percentile: `P${percent}`, status: '中等偏大', color: '#22c55e' };
    } else {
      return { percentile: '>P97', status: '偏大/偏重', color: '#f59e0b' };
    }
  };

  const interpolateData = (data: GrowthData[], age: number): GrowthData => {
    const exactMatch = data.find(d => d.age === Math.round(age));
    if (exactMatch) return exactMatch;

    const lower = data.filter(d => d.age < age).pop();
    const upper = data.find(d => d.age > age);

    if (!lower || !upper) {
      return data[data.length - 1];
    }

    const ratio = (age - lower.age) / (upper.age - lower.age);

    return {
      age,
      height: {
        p3: lower.height.p3 + (upper.height.p3 - lower.height.p3) * ratio,
        p50: lower.height.p50 + (upper.height.p50 - lower.height.p50) * ratio,
        p97: lower.height.p97 + (upper.height.p97 - lower.height.p97) * ratio,
      },
      weight: {
        p3: lower.weight.p3 + (upper.weight.p3 - lower.weight.p3) * ratio,
        p50: lower.weight.p50 + (upper.weight.p50 - lower.weight.p50) * ratio,
        p97: lower.weight.p97 + (upper.weight.p97 - lower.weight.p97) * ratio,
      },
    };
  };

  const evaluate = () => {
    const age = parseFloat(ageMonths);
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const hc = parseFloat(headCirc);

    if (!age || !h || !w) return;

    const data = gender === 'male' ? boysData : girlsData;
    const ageData = interpolateData(data, age);

    const heightResult = getPercentile(h, ageData.height.p3, ageData.height.p50, ageData.height.p97);
    const weightResult = getPercentile(w, ageData.weight.p3, ageData.weight.p50, ageData.weight.p97);

    // BMI calculation (for children 2+)
    let bmi: number | undefined;
    let bmiStatus: string | undefined;
    let bmiColor: string | undefined;
    if (age >= 24) {
      bmi = w / ((h / 100) ** 2);
      if (bmi < 14) {
        bmiStatus = '偏瘦';
        bmiColor = '#3b82f6';
      } else if (bmi < 18) {
        bmiStatus = '正常';
        bmiColor = '#22c55e';
      } else if (bmi < 20) {
        bmiStatus = '超重风险';
        bmiColor = '#f59e0b';
      } else {
        bmiStatus = '超重';
        bmiColor = '#ef4444';
      }
    }

    // Head circumference (0-18 months)
    let headPercentile: string | undefined;
    let headStatus: string | undefined;
    let headColor: string | undefined;
    if (hc && ageData.headCircumference) {
      const headResult = getPercentile(hc, ageData.headCircumference.p3, ageData.headCircumference.p50, ageData.headCircumference.p97);
      headPercentile = headResult.percentile;
      headStatus = headResult.status;
      headColor = headResult.color;
    }

    setResult({
      heightPercentile: heightResult.percentile,
      heightStatus: heightResult.status,
      heightColor: heightResult.color,
      weightPercentile: weightResult.percentile,
      weightStatus: weightResult.status,
      weightColor: weightResult.color,
      headPercentile,
      headStatus,
      headColor,
      bmi,
      bmiStatus,
      bmiColor,
    });
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="儿童生长发育评估">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>性别</div>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as 'male' | 'female')}
                className="input"
              >
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>月龄</div>
              <input
                type="number"
                value={ageMonths}
                onChange={e => setAgeMonths(e.target.value)}
                placeholder="如: 12"
                className="input"
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>身高 (cm)</div>
              <input
                type="number"
                value={height}
                onChange={e => setHeight(e.target.value)}
                placeholder="如: 75"
                className="input"
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>体重 (kg)</div>
              <input
                type="number"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="如: 9.5"
                className="input"
                step="0.1"
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>头围 (cm，选填)</div>
              <input
                type="number"
                value={headCirc}
                onChange={e => setHeadCirc(e.target.value)}
                placeholder="如: 45"
                className="input"
              />
            </div>
          </div>
          <Button variant="primary" onClick={evaluate}>评估发育状况</Button>

          {result && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>身高百分位</div>
                  <div style={{ fontSize: '24px', fontWeight: 600, color: result.heightColor }}>{result.heightPercentile}</div>
                  <div style={{ fontSize: '13px', color: result.heightColor }}>{result.heightStatus}</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>体重百分位</div>
                  <div style={{ fontSize: '24px', fontWeight: 600, color: result.weightColor }}>{result.weightPercentile}</div>
                  <div style={{ fontSize: '13px', color: result.weightColor }}>{result.weightStatus}</div>
                </div>
                {result.headPercentile && (
                  <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>头围百分位</div>
                    <div style={{ fontSize: '24px', fontWeight: 600, color: result.headColor }}>{result.headPercentile}</div>
                    <div style={{ fontSize: '13px', color: result.headColor }}>{result.headStatus}</div>
                  </div>
                )}
                {result.bmi && (
                  <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>BMI</div>
                    <div style={{ fontSize: '24px', fontWeight: 600, color: result.bmiColor }}>{result.bmi.toFixed(1)}</div>
                    <div style={{ fontSize: '13px', color: result.bmiColor }}>{result.bmiStatus}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="百分位说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• <strong>P3-P97</strong>：正常范围，约覆盖94%的健康儿童</div>
          <div>• <strong>&lt;P3</strong>：可能偏小/偏轻，建议咨询医生</div>
          <div>• <strong>&gt;P97</strong>：可能偏大/偏重，建议咨询医生</div>
          <div>• 数据基于 WHO 儿童生长标准</div>
        </div>
      </Card>

      <Card title="免责声明">
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          本评估工具仅供参考，不能替代专业医疗诊断。儿童生长发育受多种因素影响，如有疑问请咨询儿科医生。
        </div>
      </Card>
    </div>
  );
}