import { useState } from 'react';
import { Card, Button, Input, TextArea } from '../components/common';

type CalcType = 'basic' | 'scientific' | 'programmer' | 'percentage' | 'date' | 'finance';

interface CalcButtonProps {
  value: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  wide?: boolean;
}

function CalcButton({ value, onClick, variant = 'default', wide = false }: CalcButtonProps) {
  return (
    <button
      className={`calc-btn ${variant}`}
      onClick={onClick}
      style={{ gridColumn: wide ? 'span 2' : undefined }}
    >
      {value}
    </button>
  );
}

export default function Calculator() {
  const [activeTab, setActiveTab] = useState<CalcType>('basic');
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState(0);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [operator, setOperator] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);

  // Percentage calculator
  const [percentValue1, setPercentValue1] = useState('');
  const [percentValue2, setPercentValue2] = useState('');
  const [percentResult, setPercentResult] = useState('');

  // Programmer calc
  const [progValue, setProgValue] = useState('');
  const [progBase, setProgBase] = useState(10);
  const [progResults, setProgResults] = useState<{ bin: string; oct: string; dec: string; hex: string } | null>(null);

  // Date calc
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [dateDiff, setDateDiff] = useState('');

  // Finance calc
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [financeResult, setFinanceResult] = useState('');

  // Basic calculator functions
  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setOperator(null);
    setPreviousValue(null);
    setWaitingForOperand(false);
  };

  const toggleSign = () => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  };

  const inputPercent = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const currentValue = previousValue || 0;
      let result: number;

      switch (operator) {
        case '+': result = currentValue + inputValue; break;
        case '-': result = currentValue - inputValue; break;
        case '×': result = currentValue * inputValue; break;
        case '÷': result = inputValue !== 0 ? currentValue / inputValue : 0; break;
        default: result = inputValue;
      }

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const calculate = () => {
    if (operator && previousValue !== null) {
      const inputValue = parseFloat(display);
      let result: number;

      switch (operator) {
        case '+': result = previousValue + inputValue; break;
        case '-': result = previousValue - inputValue; break;
        case '×': result = previousValue * inputValue; break;
        case '÷': result = inputValue !== 0 ? previousValue / inputValue : 0; break;
        default: result = inputValue;
      }

      setDisplay(String(result));
      setOperator(null);
      setPreviousValue(null);
      setWaitingForOperand(true);
    }
  };

  // Memory functions
  const memoryAdd = () => setMemory(memory + parseFloat(display));
  const memorySubtract = () => setMemory(memory - parseFloat(display));
  const memoryRecall = () => { setDisplay(String(memory)); setWaitingForOperand(true); };
  const memoryClear = () => setMemory(0);

  // Scientific functions
  const scientificFunc = (func: string) => {
    const value = parseFloat(display);
    let result: number;

    switch (func) {
      case 'sin': result = Math.sin(value * Math.PI / 180); break;
      case 'cos': result = Math.cos(value * Math.PI / 180); break;
      case 'tan': result = Math.tan(value * Math.PI / 180); break;
      case 'sqrt': result = Math.sqrt(value); break;
      case 'log': result = Math.log10(value); break;
      case 'ln': result = Math.log(value); break;
      case 'exp': result = Math.exp(value); break;
      case 'pow2': result = Math.pow(value, 2); break;
      case 'pow3': result = Math.pow(value, 3); break;
      case 'inv': result = value !== 0 ? 1 / value : 0; break;
      case 'abs': result = Math.abs(value); break;
      case 'floor': result = Math.floor(value); break;
      case 'ceil': result = Math.ceil(value); break;
      case 'round': result = Math.round(value); break;
      case 'pi': result = Math.PI; break;
      case 'e': result = Math.E; break;
      default: result = value;
    }

    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  // Percentage calculations
  const calculatePercentage = (type: string) => {
    const v1 = parseFloat(percentValue1) || 0;
    const v2 = parseFloat(percentValue2) || 0;

    switch (type) {
      case 'percentOf':
        setPercentResult(`${v1}% 的 ${v2} = ${(v1 / 100 * v2).toFixed(4)}`);
        break;
      case 'whatPercent':
        setPercentResult(`${v1} 是 ${v2} 的 ${(v1 / v2 * 100).toFixed(4)}%`);
        break;
      case 'increase':
        setPercentResult(`${v2} 增加 ${v1}% = ${(v2 * (1 + v1 / 100)).toFixed(4)}`);
        break;
      case 'decrease':
        setPercentResult(`${v2} 减少 ${v1}% = ${(v2 * (1 - v1 / 100)).toFixed(4)}`);
        break;
    }
  };

  // Programmer calculator
  const convertBases = () => {
    const value = parseInt(progValue, progBase);
    if (isNaN(value)) {
      setProgResults(null);
      return;
    }
    setProgResults({
      bin: value.toString(2),
      oct: value.toString(8),
      dec: value.toString(10),
      hex: value.toString(16).toUpperCase(),
    });
  };

  // Date calculations
  const calculateDateDiff = () => {
    if (!date1 || !date2) return;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.abs((d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()));
    setDateDiff(`相差: ${days} 天 / ${weeks} 周 / 约 ${months} 个月`);
  };

  // Finance calculations
  const calculateCompoundInterest = () => {
    const p = parseFloat(principal) || 0;
    const r = parseFloat(rate) || 0;
    const n = parseFloat(years) || 0;

    // Compound interest: A = P(1 + r/100)^n
    const amount = p * Math.pow(1 + r / 100, n);
    const interest = amount - p;

    setFinanceResult(
      `本金: ${p.toLocaleString()}\n` +
      `利率: ${r}%\n` +
      `期限: ${n} 年\n\n` +
      `到期金额: ${amount.toFixed(2).toLocaleString()}\n` +
      `利息总额: ${interest.toFixed(2).toLocaleString()}`
    );
  };

  const tabs: { key: CalcType; label: string }[] = [
    { key: 'basic', label: '基础计算' },
    { key: 'scientific', label: '科学计算' },
    { key: 'programmer', label: '程序员' },
    { key: 'percentage', label: '百分比' },
    { key: 'date', label: '日期计算' },
    { key: 'finance', label: '金融计算' },
  ];

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <div className="tabs" style={{ marginBottom: 0 }}>
        {tabs.map(tab => (
          <button key={tab.key} className={`tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      <style>{`
        .calc-btn {
          padding: 16px;
          font-size: 18px;
          border: none;
          border-radius: var(--border-radius);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.15s;
        }
        .calc-btn:hover {
          background: var(--bg-secondary);
        }
        .calc-btn.primary {
          background: var(--accent-primary);
          color: white;
        }
        .calc-btn.secondary {
          background: var(--bg-secondary);
        }
        .calc-btn.accent {
          background: var(--accent-warning);
          color: white;
        }
      `}</style>

      {activeTab === 'basic' && (
        <Card title="基础计算器">
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', textAlign: 'right' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', minHeight: '20px' }}>
                {previousValue !== null ? `${previousValue} ${operator}` : ''}
              </div>
              <div style={{ fontSize: '36px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                {display}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              <CalcButton value="C" onClick={clear} variant="accent" />
              <CalcButton value="±" onClick={toggleSign} />
              <CalcButton value="%" onClick={inputPercent} />
              <CalcButton value="÷" onClick={() => performOperation('÷')} variant="primary" />

              <CalcButton value="7" onClick={() => inputDigit('7')} />
              <CalcButton value="8" onClick={() => inputDigit('8')} />
              <CalcButton value="9" onClick={() => inputDigit('9')} />
              <CalcButton value="×" onClick={() => performOperation('×')} variant="primary" />

              <CalcButton value="4" onClick={() => inputDigit('4')} />
              <CalcButton value="5" onClick={() => inputDigit('5')} />
              <CalcButton value="6" onClick={() => inputDigit('6')} />
              <CalcButton value="-" onClick={() => performOperation('-')} variant="primary" />

              <CalcButton value="1" onClick={() => inputDigit('1')} />
              <CalcButton value="2" onClick={() => inputDigit('2')} />
              <CalcButton value="3" onClick={() => inputDigit('3')} />
              <CalcButton value="+" onClick={() => performOperation('+')} variant="primary" />

              <CalcButton value="0" onClick={() => inputDigit('0')} wide />
              <CalcButton value="." onClick={inputDot} />
              <CalcButton value="=" onClick={calculate} variant="primary" />
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button variant="secondary" size="sm" onClick={memoryClear}>MC</Button>
              <Button variant="secondary" size="sm" onClick={memoryRecall}>MR</Button>
              <Button variant="secondary" size="sm" onClick={memoryAdd}>M+</Button>
              <Button variant="secondary" size="sm" onClick={memorySubtract}>M-</Button>
              <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>内存: {memory}</span>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'scientific' && (
        <Card title="科学计算器">
          <div style={{ display: 'grid', gap: '16px' }}>
            <Input
              value={display}
              onChange={e => setDisplay(e.target.value)}
              style={{ fontSize: '24px', fontFamily: 'monospace', textAlign: 'right' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              <CalcButton value="sin" onClick={() => scientificFunc('sin')} variant="secondary" />
              <CalcButton value="cos" onClick={() => scientificFunc('cos')} variant="secondary" />
              <CalcButton value="tan" onClick={() => scientificFunc('tan')} variant="secondary" />
              <CalcButton value="π" onClick={() => scientificFunc('pi')} variant="secondary" />

              <CalcButton value="log" onClick={() => scientificFunc('log')} variant="secondary" />
              <CalcButton value="ln" onClick={() => scientificFunc('ln')} variant="secondary" />
              <CalcButton value="eˣ" onClick={() => scientificFunc('exp')} variant="secondary" />
              <CalcButton value="e" onClick={() => scientificFunc('e')} variant="secondary" />

              <CalcButton value="√" onClick={() => scientificFunc('sqrt')} variant="secondary" />
              <CalcButton value="x²" onClick={() => scientificFunc('pow2')} variant="secondary" />
              <CalcButton value="x³" onClick={() => scientificFunc('pow3')} variant="secondary" />
              <CalcButton value="1/x" onClick={() => scientificFunc('inv')} variant="secondary" />

              <CalcButton value="|x|" onClick={() => scientificFunc('abs')} variant="secondary" />
              <CalcButton value="⌊x⌋" onClick={() => scientificFunc('floor')} variant="secondary" />
              <CalcButton value="⌈x⌉" onClick={() => scientificFunc('ceil')} variant="secondary" />
              <CalcButton value="round" onClick={() => scientificFunc('round')} variant="secondary" />
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'programmer' && (
        <Card title="进制转换计算器">
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>输入进制</div>
                <select className="select" value={progBase} onChange={e => setProgBase(parseInt(e.target.value))} style={{ width: '120px' }}>
                  <option value={2}>二进制</option>
                  <option value={8}>八进制</option>
                  <option value={10}>十进制</option>
                  <option value={16}>十六进制</option>
                </select>
              </div>
              <Input value={progValue} onChange={e => setProgValue(e.target.value)} placeholder="输入数值" style={{ flex: 1 }} />
              <Button variant="primary" onClick={convertBases}>转换</Button>
            </div>

            {progResults && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {[
                  { label: '二进制', value: progResults.bin },
                  { label: '八进制', value: progResults.oct },
                  { label: '十进制', value: progResults.dec },
                  { label: '十六进制', value: progResults.hex },
                ].map(item => (
                  <div key={item.label} style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{item.label}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '16px', wordBreak: 'break-all' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'percentage' && (
        <Card title="百分比计算器">
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input label="数值 1" value={percentValue1} onChange={e => setPercentValue1(e.target.value)} placeholder="百分比" />
              <Input label="数值 2" value={percentValue2} onChange={e => setPercentValue2(e.target.value)} placeholder="基数" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <Button variant="primary" onClick={() => calculatePercentage('percentOf')}>X% 的 Y = ?</Button>
              <Button variant="primary" onClick={() => calculatePercentage('whatPercent')}>X 是 Y 的 ?%</Button>
              <Button variant="secondary" onClick={() => calculatePercentage('increase')}>Y 增加 X%</Button>
              <Button variant="secondary" onClick={() => calculatePercentage('decrease')}>Y 减少 X%</Button>
            </div>

            {percentResult && (
              <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', textAlign: 'center', fontSize: '18px' }}>
                {percentResult}
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'date' && (
        <Card title="日期计算器">
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input label="日期 1" type="date" value={date1} onChange={e => setDate1(e.target.value)} />
              <Input label="日期 2" type="date" value={date2} onChange={e => setDate2(e.target.value)} />
            </div>
            <Button variant="primary" onClick={calculateDateDiff} style={{ width: 'fit-content' }}>计算间隔</Button>
            {dateDiff && (
              <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                {dateDiff}
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'finance' && (
        <Card title="复利计算器">
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <Input label="本金" type="number" value={principal} onChange={e => setPrincipal(e.target.value)} placeholder="10000" />
              <Input label="年利率 (%)" type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="5" />
              <Input label="期限 (年)" type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="10" />
            </div>
            <Button variant="primary" onClick={calculateCompoundInterest} style={{ width: 'fit-content' }}>计算复利</Button>
            {financeResult && (
              <TextArea value={financeResult} readOnly style={{ minHeight: '120px' }} />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}