import { useState } from 'react';
import { Card } from '../components/common';

interface ScheduleItem {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface EarlyPayment {
  month: number;
  amount: number;
}

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [result, setResult] = useState<{
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
    schedule: ScheduleItem[];
  } | null>(null);

  // Early repayment state
  const [earlyPayments, setEarlyPayments] = useState<EarlyPayment[]>([]);
  const [earlyMonth, setEarlyMonth] = useState('');
  const [earlyAmount, setEarlyAmount] = useState('');
  const [earlyRepaymentType, setEarlyRepaymentType] = useState<'reduceTerm' | 'reducePayment'>('reduceTerm');
  const [earlyResult, setEarlyResult] = useState<{
    savedInterest: number;
    newTotalPayment: number;
    newTotalInterest: number;
    newMonthlyPayment?: number;
    newTerm?: number;
    originalTerm: number;
    originalInterest: number;
  } | null>(null);

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12; // Monthly interest rate
    const n = parseInt(years) * 12; // Total months

    if (isNaN(p) || isNaN(r) || isNaN(n) || p <= 0 || r <= 0 || n <= 0) {
      return;
    }

    // Monthly payment formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyPayment = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - p;

    // Generate amortization schedule
    const schedule: ScheduleItem[] = [];
    let balance = p;
    for (let month = 1; month <= n; month++) {
      const interest = balance * r;
      const principalPart = monthlyPayment - interest;
      balance -= principalPart;
      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPart,
        interest,
        balance: Math.max(0, balance),
      });
    }

    setResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
      schedule,
    });

    // Reset early repayment results
    setEarlyResult(null);
  };

  const addEarlyPayment = () => {
    const month = parseInt(earlyMonth);
    const amount = parseFloat(earlyAmount);

    if (isNaN(month) || isNaN(amount) || month <= 0 || amount <= 0) {
      return;
    }

    setEarlyPayments(prev => [...prev, { month, amount }].sort((a, b) => a.month - b.month));
    setEarlyMonth('');
    setEarlyAmount('');
  };

  const removeEarlyPayment = (index: number) => {
    setEarlyPayments(prev => prev.filter((_, i) => i !== index));
  };

  const calculateEarlyRepayment = () => {
    if (!result || earlyPayments.length === 0) return;

    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12;
    const originalN = parseInt(years) * 12;

    // Sort early payments by month
    const sortedEarlyPayments = [...earlyPayments].sort((a, b) => a.month - b.month);

    // Calculate loan with early repayments
    let balance = p;
    let totalInterestPaid = 0;
    let month = 1;
    const earlyPaymentLookup = new Map(sortedEarlyPayments.map(ep => [ep.month, ep.amount]));

    while (balance > 0 && month <= originalN) {
      const interest = balance * r;
      let principalPart = result.monthlyPayment - interest;

      balance -= principalPart;
      totalInterestPaid += interest;

      // Apply early payment
      const earlyAmountThisMonth = earlyPaymentLookup.get(month);
      if (earlyAmountThisMonth && balance > 0) {
        const extraPrincipal = Math.min(earlyAmountThisMonth, balance);
        balance -= extraPrincipal;
      }

      month++;
    }

    const newTotalInterest = totalInterestPaid;
    const savedInterest = result.totalInterest - newTotalInterest;
    const actualTerm = month - 1;

    setEarlyResult({
      savedInterest,
      newTotalPayment: p + newTotalInterest,
      newTotalInterest,
      newTerm: actualTerm,
      originalTerm: originalN,
      originalInterest: result.totalInterest,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatMonthsToYears = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years > 0 && remainingMonths > 0) {
      return `${years}年${remainingMonths}个月`;
    } else if (years > 0) {
      return `${years}年`;
    } else {
      return `${remainingMonths}个月`;
    }
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="贷款计算器">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>贷款金额 (元)</div>
              <input
                type="number"
                value={principal}
                onChange={e => setPrincipal(e.target.value)}
                placeholder="例如: 1000000"
                className="input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>年利率 (%)</div>
              <input
                type="number"
                value={rate}
                onChange={e => setRate(e.target.value)}
                placeholder="例如: 4.9"
                step="0.01"
                className="input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>贷款期限 (年)</div>
              <input
                type="number"
                value={years}
                onChange={e => setYears(e.target.value)}
                placeholder="例如: 30"
                className="input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <button className="btn btn-primary" onClick={calculate}>计算</button>

          {result && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>月供</div>
                  <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {formatCurrency(result.monthlyPayment)}
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>还款总额</div>
                  <div style={{ fontSize: '24px', fontWeight: 600 }}>
                    {formatCurrency(result.totalPayment)}
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>利息总额</div>
                  <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--error)' }}>
                    {formatCurrency(result.totalInterest)}
                  </div>
                </div>
              </div>

              {/* Visual breakdown */}
              <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>本金 vs 利息</div>
                <div style={{ height: '20px', background: 'var(--bg-secondary)', borderRadius: '10px', overflow: 'hidden', display: 'flex' }}>
                  <div
                    style={{
                      width: `${(parseFloat(principal) / result.totalPayment) * 100}%`,
                      background: 'var(--accent-primary)',
                      height: '100%',
                    }}
                    title={`本金: ${formatCurrency(parseFloat(principal))}`}
                  />
                  <div
                    style={{
                      width: `${(result.totalInterest / result.totalPayment) * 100}%`,
                      background: 'var(--error)',
                      height: '100%',
                    }}
                    title={`利息: ${formatCurrency(result.totalInterest)}`}
                  />
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '12px', height: '12px', background: 'var(--accent-primary)', borderRadius: '2px' }} />
                    <span>本金 {((parseFloat(principal) / result.totalPayment) * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '12px', height: '12px', background: 'var(--error)', borderRadius: '2px' }} />
                    <span>利息 {((result.totalInterest / result.totalPayment) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Amortization Schedule */}
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>还款计划表 (前12个月)</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>期数</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>月供</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>本金</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>利息</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>剩余本金</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.schedule.slice(0, 12).map((row) => (
                        <tr key={row.month} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px' }}>{row.month}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace' }}>{formatCurrency(row.payment)}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace' }}>{formatCurrency(row.principal)}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace' }}>{formatCurrency(row.interest)}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace' }}>{formatCurrency(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Early Repayment Section */}
      {result && (
        <Card title="提前还款计算">
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>提前还款月份</div>
                <input
                  type="number"
                  value={earlyMonth}
                  onChange={e => setEarlyMonth(e.target.value)}
                  placeholder="例如: 12"
                  min="1"
                  max={parseInt(years) * 12}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>提前还款金额 (元)</div>
                <input
                  type="number"
                  value={earlyAmount}
                  onChange={e => setEarlyAmount(e.target.value)}
                  placeholder="例如: 50000"
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>还款方式</div>
                <select
                  value={earlyRepaymentType}
                  onChange={e => setEarlyRepaymentType(e.target.value as 'reduceTerm' | 'reducePayment')}
                  className="input"
                  style={{ width: '100%' }}
                >
                  <option value="reduceTerm">缩短年限 (推荐)</option>
                  <option value="reducePayment">减少月供</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={addEarlyPayment}>添加提前还款</button>
              <button className="btn btn-secondary" onClick={calculateEarlyRepayment} disabled={earlyPayments.length === 0}>
                计算节省
              </button>
            </div>

            {/* Early Payment List */}
            {earlyPayments.length > 0 && (
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>已添加的提前还款：</div>
                {earlyPayments.map((ep, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--border-radius)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>
                      第 <strong>{ep.month}</strong> 期，提前还款 <strong>{formatCurrency(ep.amount)}</strong>
                    </span>
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                      onClick={() => removeEarlyPayment(index)}
                    >
                      删除
                    </button>
                  </div>
                ))}
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', width: 'fit-content' }}
                  onClick={() => setEarlyPayments([])}
                >
                  清空全部
                </button>
              </div>
            )}

            {/* Early Repayment Results */}
            {earlyResult && (
              <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600 }}>
                  提前还款效果分析
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {/* Saved Interest */}
                  <div style={{
                    padding: '16px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: 'var(--border-radius)',
                    textAlign: 'center',
                  }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>节省利息</div>
                    <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--success)' }}>
                      {formatCurrency(earlyResult.savedInterest)}
                    </div>
                  </div>

                  {/* Comparison */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
                      <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '12px' }}>原还款期限</div>
                      <div style={{ fontSize: '16px', fontWeight: 500 }}>
                        {formatMonthsToYears(earlyResult.originalTerm)}
                      </div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
                      <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '12px' }}>新还款期限</div>
                      <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--accent-primary)' }}>
                        {formatMonthsToYears(earlyResult.newTerm || earlyResult.originalTerm)}
                      </div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
                      <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '12px' }}>原利息总额</div>
                      <div style={{ fontSize: '16px', fontWeight: 500 }}>
                        {formatCurrency(earlyResult.originalInterest)}
                      </div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
                      <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '12px' }}>新利息总额</div>
                      <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--accent-primary)' }}>
                        {formatCurrency(earlyResult.newTotalInterest)}
                      </div>
                    </div>
                  </div>

                  {/* Term Reduction */}
                  {earlyResult.newTerm && (
                    <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>提前还款可缩短还款期限 </span>
                      <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                        {formatMonthsToYears(earlyResult.originalTerm - earlyResult.newTerm)}
                      </span>
                    </div>
                  )}

                  {/* Visual comparison */}
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '12px' }}>利息对比</div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>原利息</span>
                          <span>{formatCurrency(earlyResult.originalInterest)}</span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--error)', borderRadius: '4px' }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>新利息</span>
                          <span>{formatCurrency(earlyResult.newTotalInterest)}</span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--success)', borderRadius: '4px', width: `${(earlyResult.newTotalInterest / earlyResult.originalInterest) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card title="提前还款说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• <strong>缩短年限</strong>：月供不变，减少还款期数，节省利息更多（推荐）</div>
          <div>• <strong>减少月供</strong>：期限不变，降低每月还款额，减轻还款压力</div>
          <div>• 提前还款越早，节省的利息越多</div>
          <div>• 部分银行可能收取提前还款违约金，请咨询银行</div>
          <div>• 建议在还款前期（前1/3期限内）提前还款效果最明显</div>
        </div>
      </Card>

      <Card title="计算公式">
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: '8px' }}>
            <strong>等额本息月供公式：</strong>
          </p>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', fontFamily: 'monospace' }}>
            M = P × [r(1+r)^n] / [(1+r)^n - 1]
          </div>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li>M = 月供</li>
            <li>P = 贷款本金</li>
            <li>r = 月利率 (年利率 / 12)</li>
            <li>n = 还款期数 (年 × 12)</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}