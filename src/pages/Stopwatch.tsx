import { useState } from 'react';
import { Card, Button } from '../components/common';

export default function Stopwatch() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}.${pad(milliseconds)}`;
  };

  const start = () => {
    setRunning(true);
    const startTime = Date.now() - time;
    const interval = setInterval(() => {
      setTime(Date.now() - startTime);
    }, 10);

    // Store interval ID to clear later
    (window as unknown as {stopwatchInterval?: ReturnType<typeof setInterval>}).stopwatchInterval = interval;
  };

  const stop = () => {
    setRunning(false);
    const interval = (window as unknown as {stopwatchInterval?: ReturnType<typeof setInterval>}).stopwatchInterval;
    if (interval) {
      clearInterval(interval);
    }
  };

  const reset = () => {
    stop();
    setTime(0);
    setLaps([]);
  };

  const lap = () => {
    setLaps(prev => [...prev, time]);
  };

  const maxLap = laps.length > 0 ? Math.max(...laps) : 0;
  const minLap = laps.length > 0 ? Math.min(...laps) : 0;

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="秒表">
        <div style={{ display: 'grid', gap: '24px', textAlign: 'center' }}>
          {/* Time Display */}
          <div style={{
            fontSize: '48px',
            fontFamily: 'monospace',
            fontWeight: 600,
            color: running ? 'var(--accent-primary)' : 'var(--text-primary)',
          }}>
            {formatTime(time)}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {!running ? (
              <Button variant="primary" onClick={start}>
                {time > 0 ? '继续' : '开始'}
              </Button>
            ) : (
              <Button variant="secondary" onClick={stop}>
                暂停
              </Button>
            )}
            {time > 0 && (
              <Button variant="secondary" onClick={reset}>重置</Button>
            )}
            {running && (
              <Button variant="secondary" onClick={lap}>计次</Button>
            )}
          </div>
        </div>
      </Card>

      {/* Laps */}
      {laps.length > 0 && (
        <Card title={`计次 (${laps.length})`}>
          <div style={{ display: 'grid', gap: '8px', maxHeight: '300px', overflow: 'auto' }}>
            {[...laps].reverse().map((lapTime, i) => {
              const index = laps.length - i;
              const isMax = lapTime === maxLap && laps.length > 1;
              const isMin = lapTime === minLap && laps.length > 1;

              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius)',
                    opacity: isMax ? 0.6 : isMin ? 1 : 0.85,
                  }}
                >
                  <span style={{ color: isMax ? '#ef4444' : isMin ? '#22c55e' : 'inherit' }}>
                    计次 {index}
                    {isMax && ' (最慢)'}
                    {isMin && ' (最快)'}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                    {formatTime(lapTime)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 点击"开始"启动秒表</div>
          <div>• 点击"暂停"停止计时</div>
          <div>• 点击"计次"记录当前时间</div>
          <div>• 点击"重置"清零并清除计次</div>
        </div>
      </Card>
    </div>
  );
}