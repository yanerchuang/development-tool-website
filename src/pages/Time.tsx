import { useState, useEffect } from 'react';
import { Card, Button, Input } from '../components/common';
import {
  getCurrentTimestamp,
  timestampToDate,
  dateToTimestamp,
  getTimezones,
  convertTimezone,
} from '../utils/time';

type TabType = 'convert' | 'timer' | 'calc' | 'world';

export default function Time() {
  const [currentTs, setCurrentTs] = useState(getCurrentTimestamp());
  const [activeTab, setActiveTab] = useState<TabType>('convert');

  // 时间戳转换
  const [inputTimestamp, setInputTimestamp] = useState('');
  const [timestampResult, setTimestampResult] = useState('');
  const [inputDate, setInputDate] = useState('');
  const [dateResult, setDateResult] = useState<{ seconds: number; milliseconds: number } | null>(null);
  const [fromTz, setFromTz] = useState('Asia/Shanghai');
  const [toTz, setToTz] = useState('America/New_York');
  const [tzInput, setTzInput] = useState('');
  const [tzResult, setTzResult] = useState('');

  // 计时器
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInput, setTimerInput] = useState({ hours: 0, minutes: 5, seconds: 0 });
  const [countdownMode, setCountdownMode] = useState(true); // true: 倒计时, false: 正计时

  // 日期计算
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [dateDiffResult, setDateDiffResult] = useState<{ days: number; hours: number; weeks: number; months: string } | null>(null);
  const [baseDate, setBaseDate] = useState('');
  const [addDays, setAddDays] = useState(0);
  const [addResult, setAddResult] = useState('');

  // 世界时钟
  const worldClocks = [
    { id: 1, timezone: 'Asia/Shanghai', label: '北京' },
    { id: 2, timezone: 'America/New_York', label: '纽约' },
    { id: 3, timezone: 'Europe/London', label: '伦敦' },
    { id: 4, timezone: 'Asia/Tokyo', label: '东京' },
  ];

  const timezones = getTimezones();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTs(getCurrentTimestamp());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 计时器逻辑
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (countdownMode) {
            if (prev <= 1) {
              setTimerRunning(false);
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, countdownMode]);

  const handleTimestampConvert = () => {
    const ts = parseInt(inputTimestamp, 10);
    if (isNaN(ts)) {
      setTimestampResult('无效的时间戳');
      return;
    }
    setTimestampResult(timestampToDate(ts));
  };

  const handleDateConvert = () => {
    const result = dateToTimestamp(inputDate);
    if (!result) {
      setDateResult(null);
      return;
    }
    setDateResult(result);
  };

  const handleTimezoneConvert = () => {
    const result = convertTimezone(tzInput || new Date(), fromTz, toTz);
    setTzResult(result);
  };

  const setCurrentTime = () => {
    setInputDate(new Date().toISOString().slice(0, 19));
  };

  // 计时器控制
  const startTimer = () => {
    if (countdownMode && timerSeconds === 0) {
      const total = timerInput.hours * 3600 + timerInput.minutes * 60 + timerInput.seconds;
      setTimerSeconds(total);
    }
    setTimerRunning(true);
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 日期计算
  const calculateDateDiff = () => {
    if (!date1 || !date2) return;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffWeeks = Math.floor(diffDays / 7);

    const months = Math.abs(
      (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth())
    );

    setDateDiffResult({
      days: diffDays,
      hours: diffHours,
      weeks: diffWeeks,
      months: `${months} 个月`,
    });
  };

  const calculateDateAdd = () => {
    if (!baseDate) return;
    const d = new Date(baseDate);
    d.setDate(d.getDate() + addDays);
    setAddResult(d.toISOString().slice(0, 19));
  };

  // 世界时钟格式化
  const formatWorldTime = (timezone: string) => {
    try {
      return new Date().toLocaleString('zh-CN', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return '--:--:--';
    }
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'convert', label: '时间戳转换' },
    { key: 'timer', label: '计时器' },
    { key: 'calc', label: '日期计算' },
    { key: 'world', label: '世界时钟' },
  ];

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* 当前时间 */}
      <Card title="当前时间">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>秒级时间戳</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
              {currentTs.seconds}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>毫秒时间戳</div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
              {currentTs.milliseconds}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>当前时间</div>
            <div style={{ fontSize: '16px', fontWeight: 500 }}>
              {timestampToDate(currentTs.milliseconds)}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>ISO 格式</div>
            <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>
              {new Date().toISOString()}
            </div>
          </div>
        </div>
      </Card>

      {/* Tab 切换 */}
      <div className="tabs" style={{ marginBottom: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 时间戳转换 Tab */}
      {activeTab === 'convert' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <Card title="时间戳转日期">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <Input
                  label="时间戳"
                  value={inputTimestamp}
                  onChange={e => setInputTimestamp(e.target.value)}
                  placeholder="输入秒或毫秒时间戳"
                />
              </div>
              <Button variant="primary" onClick={handleTimestampConvert}>转换</Button>
            </div>
            {timestampResult && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', fontFamily: 'monospace' }}>
                {timestampResult}
              </div>
            )}
          </Card>

          <Card title="日期转时间戳">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <Input
                  label="日期时间"
                  value={inputDate}
                  onChange={e => setInputDate(e.target.value)}
                  placeholder="例如：2024-01-01 12:00:00"
                />
              </div>
              <Button variant="secondary" onClick={setCurrentTime}>当前时间</Button>
              <Button variant="primary" onClick={handleDateConvert}>转换</Button>
            </div>
            {dateResult && (
              <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>秒级时间戳</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '18px' }}>{dateResult.seconds}</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>毫秒时间戳</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '18px' }}>{dateResult.milliseconds}</div>
                </div>
              </div>
            )}
          </Card>

          <Card title="时区转换">
            <div style={{ display: 'grid', gap: '12px' }}>
              <Input
                label="时间（可选，默认当前时间）"
                value={tzInput}
                onChange={e => setTzInput(e.target.value)}
                placeholder="留空使用当前时间"
              />
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>源时区</div>
                  <select className="select" value={fromTz} onChange={e => setFromTz(e.target.value)} style={{ minWidth: '180px' }}>
                    {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
                <span style={{ marginTop: '20px' }}>→</span>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>目标时区</div>
                  <select className="select" value={toTz} onChange={e => setToTz(e.target.value)} style={{ minWidth: '180px' }}>
                    {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
                <Button variant="primary" style={{ marginTop: '20px' }} onClick={handleTimezoneConvert}>转换</Button>
              </div>
              {tzResult && (
                <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', fontFamily: 'monospace' }}>
                  {tzResult}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* 计时器 Tab */}
      {activeTab === 'timer' && (
        <Card title={countdownMode ? '倒计时' : '正计时'}>
          <div style={{ display: 'grid', gap: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Button variant={countdownMode ? 'primary' : 'secondary'} size="sm" onClick={() => { setCountdownMode(true); resetTimer(); }}>
                倒计时
              </Button>
              <Button variant={!countdownMode ? 'primary' : 'secondary'} size="sm" onClick={() => { setCountdownMode(false); resetTimer(); }}>
                正计时
              </Button>
            </div>

            <div style={{ textAlign: 'center', fontSize: '64px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-primary)' }}>
              {formatTime(timerSeconds)}
            </div>

            {countdownMode && !timerRunning && timerSeconds === 0 && (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
                <Input
                  type="number"
                  value={timerInput.hours}
                  onChange={e => setTimerInput(prev => ({ ...prev, hours: Math.max(0, parseInt(e.target.value) || 0) }))}
                  placeholder="时"
                  style={{ width: '80px' }}
                />
                <span>:</span>
                <Input
                  type="number"
                  value={timerInput.minutes}
                  onChange={e => setTimerInput(prev => ({ ...prev, minutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) }))}
                  placeholder="分"
                  style={{ width: '80px' }}
                />
                <span>:</span>
                <Input
                  type="number"
                  value={timerInput.seconds}
                  onChange={e => setTimerInput(prev => ({ ...prev, seconds: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) }))}
                  placeholder="秒"
                  style={{ width: '80px' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {!timerRunning ? (
                <Button variant="primary" onClick={startTimer}>开始</Button>
              ) : (
                <Button variant="secondary" onClick={pauseTimer}>暂停</Button>
              )}
              <Button variant="secondary" onClick={resetTimer}>重置</Button>
            </div>
          </div>
        </Card>
      )}

      {/* 日期计算 Tab */}
      {activeTab === 'calc' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <Card title="日期间隔计算">
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input
                  label="日期 1"
                  type="datetime-local"
                  value={date1}
                  onChange={e => setDate1(e.target.value)}
                />
                <Input
                  label="日期 2"
                  type="datetime-local"
                  value={date2}
                  onChange={e => setDate2(e.target.value)}
                />
              </div>
              <Button variant="primary" onClick={calculateDateDiff} style={{ width: 'fit-content' }}>计算间隔</Button>
              {dateDiffResult && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {[
                    { label: '天数', value: dateDiffResult.days },
                    { label: '小时', value: dateDiffResult.hours },
                    { label: '周数', value: dateDiffResult.weeks },
                    { label: '月数', value: dateDiffResult.months },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent-primary)' }}>{item.value}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card title="日期加减">
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                <Input
                  label="基准日期"
                  type="datetime-local"
                  value={baseDate}
                  onChange={e => setBaseDate(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Input
                    type="number"
                    value={addDays}
                    onChange={e => setAddDays(parseInt(e.target.value) || 0)}
                    style={{ width: '100px' }}
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>天</span>
                </div>
              </div>
              <Button variant="primary" onClick={calculateDateAdd} style={{ width: 'fit-content' }}>计算</Button>
              {addResult && (
                <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', fontFamily: 'monospace' }}>
                  {addResult}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* 世界时钟 Tab */}
      {activeTab === 'world' && (
        <Card title="世界时钟">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {worldClocks.map(clock => (
              <div key={clock.id} style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>{clock.label}</div>
                <div style={{ fontSize: '32px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatWorldTime(clock.timezone)}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>{clock.timezone}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}