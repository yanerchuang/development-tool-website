import { useState, useEffect, useRef } from 'react';
import { Card, Button } from '../components/common';

export default function CountdownTimer() {
  const [targetDate, setTargetDate] = useState('');
  const [targetTime, setTargetTime] = useState('00:00');
  const [eventName, setEventName] = useState('');
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('devtools-countdown');
    if (saved) {
      const data = JSON.parse(saved);
      setTargetDate(data.targetDate);
      setTargetTime(data.targetTime || '00:00');
      setEventName(data.eventName || '');
    }
  }, []);

  useEffect(() => {
    if (targetDate) {
      localStorage.setItem('devtools-countdown', JSON.stringify({
        targetDate,
        targetTime,
        eventName,
      }));
    }
  }, [targetDate, targetTime, eventName]);

  const startCountdown = () => {
    if (!targetDate) return;

    const target = new Date(`${targetDate}T${targetTime}:00`).getTime();

    setIsRunning(true);

    const updateCountdown = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsRunning(false);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds, total: diff });
    };

    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);
  };

  const stopCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  const resetCountdown = () => {
    stopCountdown();
    setCountdown(null);
    setTargetDate('');
    setTargetTime('00:00');
    setEventName('');
    localStorage.removeItem('devtools-countdown');
  };

  const formatNumber = (n: number): string => n.toString().padStart(2, '0');

  const quickSet = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setTargetDate(date.toISOString().split('T')[0]);
    setTargetTime('00:00');
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="倒计时">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Event Name */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>事件名称</div>
            <input
              type="text"
              value={eventName}
              onChange={e => setEventName(e.target.value)}
              placeholder="例如：生日、假期..."
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          {/* Date and Time */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>目标日期</div>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>目标时间</div>
              <input
                type="time"
                value={targetTime}
                onChange={e => setTargetTime(e.target.value)}
                className="input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Quick Set Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="secondary" size="sm" onClick={() => quickSet(1)}>明天</Button>
            <Button variant="secondary" size="sm" onClick={() => quickSet(7)}>一周后</Button>
            <Button variant="secondary" size="sm" onClick={() => quickSet(30)}>一个月后</Button>
            <Button variant="secondary" size="sm" onClick={() => quickSet(100)}>100天后</Button>
            <Button variant="secondary" size="sm" onClick={() => quickSet(365)}>一年后</Button>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isRunning ? (
              <Button variant="primary" onClick={startCountdown} disabled={!targetDate}>
                开始倒计时
              </Button>
            ) : (
              <Button variant="secondary" onClick={stopCountdown}>暂停</Button>
            )}
            <Button variant="secondary" onClick={resetCountdown}>重置</Button>
          </div>

          {/* Countdown Display */}
          {countdown && (
            <div style={{ display: 'grid', gap: '16px' }}>
              {eventName && (
                <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 500 }}>
                  距离 {eventName} 还有
                </div>
              )}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                textAlign: 'center',
              }}>
                <div style={{
                  padding: '16px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--border-radius)',
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {formatNumber(countdown.days)}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>天</div>
                </div>
                <div style={{
                  padding: '16px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--border-radius)',
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 600 }}>
                    {formatNumber(countdown.hours)}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>时</div>
                </div>
                <div style={{
                  padding: '16px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--border-radius)',
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 600 }}>
                    {formatNumber(countdown.minutes)}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>分</div>
                </div>
                <div style={{
                  padding: '16px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--border-radius)',
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 600 }}>
                    {formatNumber(countdown.seconds)}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>秒</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                目标时间: {targetDate} {targetTime}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 设置目标日期和时间，点击开始倒计时</div>
          <div>• 使用快捷按钮快速设置常用日期</div>
          <div>• 倒计时数据会自动保存到浏览器</div>
          <div>• 刷新页面后会自动恢复之前的倒计时</div>
        </div>
      </Card>
    </div>
  );
}