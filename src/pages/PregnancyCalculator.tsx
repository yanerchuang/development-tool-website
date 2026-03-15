import { useState } from 'react';
import { Card, Button } from '../components/common';

export default function PregnancyCalculator() {
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [result, setResult] = useState<{
    dueDate: string;
    currentWeek: number;
    currentDay: number;
    trimester: string;
    conceptionDate: string;
    remainingDays: number;
  } | null>(null);

  const calculateDueDate = () => {
    if (!lastPeriod) return;

    const lmp = new Date(lastPeriod);
    const dueDate = new Date(lmp);
    dueDate.setDate(dueDate.getDate() + 280 + (cycleLength - 28));

    const today = new Date();
    const diffTime = today.getTime() - lmp.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const currentWeek = Math.floor(diffDays / 7);
    const currentDay = diffDays % 7;

    // Conception date (approximately 14 days after LMP)
    const conceptionDate = new Date(lmp);
    conceptionDate.setDate(conceptionDate.getDate() + 14 + (cycleLength - 28));

    // Remaining days
    const remainingTime = dueDate.getTime() - today.getTime();
    const remainingDays = Math.max(0, Math.floor(remainingTime / (1000 * 60 * 60 * 24)));

    // Trimester
    let trimester: string;
    if (currentWeek < 13) {
      trimester = '第一孕期 (1-12周)';
    } else if (currentWeek < 27) {
      trimester = '第二孕期 (13-26周)';
    } else {
      trimester = '第三孕期 (27-40周)';
    }

    setResult({
      dueDate: dueDate.toLocaleDateString('zh-CN'),
      currentWeek: Math.max(0, currentWeek),
      currentDay: Math.max(0, currentDay),
      trimester,
      conceptionDate: conceptionDate.toLocaleDateString('zh-CN'),
      remainingDays,
    });
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="预产期计算器">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>末次月经日期</div>
              <input
                type="date"
                value={lastPeriod}
                onChange={e => setLastPeriod(e.target.value)}
                className="input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>月经周期天数</div>
              <input
                type="number"
                value={cycleLength}
                onChange={e => setCycleLength(parseInt(e.target.value) || 28)}
                className="input"
                style={{ width: '100%' }}
                min={21}
                max={35}
              />
            </div>
          </div>
          <Button variant="primary" onClick={calculateDueDate}>计算预产期</Button>

          {result && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>预产期</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--accent-primary)' }}>{result.dueDate}</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>当前孕周</div>
                  <div style={{ fontSize: '18px', fontWeight: 600 }}>{result.currentWeek}周+{result.currentDay}天</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>剩余天数</div>
                  <div style={{ fontSize: '18px', fontWeight: 600 }}>{result.remainingDays}天</div>
                </div>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>孕期阶段</span>
                    <span style={{ fontWeight: 500 }}>{result.trimester}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>预计受孕日期</span>
                    <span style={{ fontWeight: 500 }}>{result.conceptionDate}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="孕期里程碑">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>6-8周</span>
            <span>首次B超，确认胎心</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>11-13周</span>
            <span>NT检查（早期唐筛）</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>15-20周</span>
            <span>中期唐筛/无创DNA</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>20-24周</span>
            <span>大排畸检查</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>24-28周</span>
            <span>糖耐量测试（糖筛）</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>28-32周</span>
            <span>小排畸检查</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>37周后</span>
            <span>足月，随时准备分娩</span>
          </div>
        </div>
      </Card>

      <Card title="免责声明">
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          本计算器仅供参考，实际预产期可能因个体差异而有所不同。请以医生诊断为准。
        </div>
      </Card>
    </div>
  );
}