import { useState, useRef, useCallback } from 'react';
import { Card, Button } from '../components/common';

export default function Pomodoro() {
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [settings, setSettings] = useState({
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalTime = (m: 'work' | 'shortBreak' | 'longBreak'): number => {
    switch (m) {
      case 'work': return settings.work * 60;
      case 'shortBreak': return settings.shortBreak * 60;
      case 'longBreak': return settings.longBreak * 60;
    }
  };

  const handleComplete = useCallback(() => {
    // Play notification sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleA4EJI7L5fSfHwY2c8Tl/+GPPwg7a8ru//yrTwQ');
    audio.play().catch(() => {});

    setSessions(prev => {
      const newSessions = prev + 1;
      return newSessions;
    });
    setMode(prevMode => {
      if (prevMode === 'work') {
        return 'shortBreak';
      }
      return 'work';
    });
    setTimeLeft(prev => {
      // We'll handle this based on sessions count
      return prev;
    });
  }, []);

  const start = useCallback(() => {
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setRunning(false);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [handleComplete]);

  const stop = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = () => {
    stop();
    setTimeLeft(getTotalTime(mode));
  };

  const switchMode = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
    stop();
    setMode(newMode);
    setTimeLeft(getTotalTime(newMode));
  };

  const progress = ((getTotalTime(mode) - timeLeft) / getTotalTime(mode)) * 100;

  const modeLabels = {
    work: '工作时间',
    shortBreak: '短休息',
    longBreak: '长休息',
  };

  const modeColors = {
    work: '#ef4444',
    shortBreak: '#22c55e',
    longBreak: '#3b82f6',
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="番茄钟">
        <div style={{ display: 'grid', gap: '24px', textAlign: 'center' }}>
          {/* Mode Tabs */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {(['work', 'shortBreak', 'longBreak'] as const).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: mode === m ? modeColors[m] : 'var(--bg-tertiary)',
                  color: mode === m ? 'white' : 'var(--text-primary)',
                  borderRadius: 'var(--border-radius)',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                {m === 'work' ? '工作' : m === 'shortBreak' ? '短休息' : '长休息'}
              </button>
            ))}
          </div>

          {/* Timer Display */}
          <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto' }}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="var(--bg-tertiary)"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={modeColors[mode]}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dashoffset 0.5s' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'grid',
              gap: '4px',
            }}>
              <div style={{
                fontSize: '36px',
                fontFamily: 'monospace',
                fontWeight: 600,
              }}>
                {formatTime(timeLeft)}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {modeLabels[mode]}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {!running ? (
              <Button variant="primary" onClick={start}>开始</Button>
            ) : (
              <Button variant="secondary" onClick={stop}>暂停</Button>
            )}
            <Button variant="secondary" onClick={reset}>重置</Button>
          </div>

          {/* Sessions Counter */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>已完成番茄:</span>
            <span style={{ fontWeight: 600, color: modeColors.work }}>{sessions}</span>
          </div>
        </div>
      </Card>

      {/* Settings */}
      <Card title="设置">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
              工作时长: {settings.work}分钟
            </div>
            <input
              type="range"
              min="1"
              max="60"
              value={settings.work}
              onChange={e => setSettings(prev => ({ ...prev, work: parseInt(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
              短休息: {settings.shortBreak}分钟
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={settings.shortBreak}
              onChange={e => setSettings(prev => ({ ...prev, shortBreak: parseInt(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
              长休息: {settings.longBreak}分钟
            </div>
            <input
              type="range"
              min="5"
              max="30"
              value={settings.longBreak}
              onChange={e => setSettings(prev => ({ ...prev, longBreak: parseInt(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
              长休息间隔: {settings.longBreakInterval}个番茄
            </div>
            <input
              type="range"
              min="2"
              max="8"
              value={settings.longBreakInterval}
              onChange={e => setSettings(prev => ({ ...prev, longBreakInterval: parseInt(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Card>

      <Card title="番茄工作法">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 1. 选择一个要完成的任务</div>
          <div>• 2. 设定25分钟工作时间（一个番茄）</div>
          <div>• 3. 专注工作直到计时器响起</div>
          <div>• 4. 短休息5分钟</div>
          <div>• 5. 每4个番茄后，长休息15-30分钟</div>
        </div>
      </Card>
    </div>
  );
}